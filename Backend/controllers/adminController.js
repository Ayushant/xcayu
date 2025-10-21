import User from '../models/userModel.js';
import Quiz from '../models/quizModel.js';
import Score from '../models/scoreModel.js';
import bcrypt from 'bcryptjs';

// Add new student
export const addStudent = async (req, res) => {
  try {
    const { name, email, collegeId, password } = req.body;
    
    // Use admin's college instead of collegeId from request for security
    const adminCollege = req.user.college;
    if (!adminCollege) {
      return res.status(400).json({
        message: 'Admin college not assigned',
        details: 'Admin user must have a college assigned to add students'
      });
    }
    
    // Validate all required fields
    const missingFields = [];
    if (!name) missingFields.push('name');
    if (!email) missingFields.push('email');
    if (!password) missingFields.push('password');

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: 'Missing required fields',
        details: `Please provide: ${missingFields.join(', ')}`
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: 'Invalid email format',
        details: 'Please provide a valid email address'
      });
    }

    // Check password length
    if (password.length < 6) {
      return res.status(400).json({
        message: 'Invalid password',
        details: 'Password must be at least 6 characters long'
      });
    }
    
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Email already registered',
        details: 'Please use a different email address'
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new student with admin's college (for security)
    const student = await User.create({
      fullName: name,
      email,
      password: hashedPassword,
      college: adminCollege, // Use admin's college automatically
      role: 'student',
      isActive: true,
      quizStatus: 'stopped'
    });

    console.log(`Student added to college ${adminCollege}:`, {
      name: student.fullName,
      email: student.email,
      college: student.college
    });

    res.status(201).json({
      message: 'Student added successfully',
      student: {
        id: student._id,
        name: student.fullName,
        email: student.email,
        college: student.college,
        isActive: student.isActive,
        quizStatus: student.quizStatus
      }
    });
  } catch (error) {
    console.error('Error adding student:', error);
    res.status(500).json({ 
      message: 'Error adding student',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get all students for the admin's college
export const getStudents = async (req, res) => {
  try {
    // Validate admin user has college assigned
    if (!req.user || !req.user.college) {
      return res.status(400).json({
        message: 'College not assigned',
        details: 'Admin user must have a college assigned to manage students'
      });
    }

    const students = await User.find({ 
      college: req.user.college,
      role: 'student'
    }).select('-password').lean();
    
    // Transform data for frontend
    const formattedStudents = students.map(student => ({
      _id: student._id,
      fullName: student.fullName || 'No Name',
      email: student.email || 'No Email',
      college: student.college || 'No College ID',
      isActive: student.isActive || false,
      quizStatus: student.quizStatus || 'stopped'
    }));

    res.json(formattedStudents);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ 
      message: 'Error fetching students',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get student by ID
export const getStudentById = async (req, res) => {
  try {
    const student = await User.findOne({
      _id: req.params.id,
      college: req.user.college,
      role: 'student'
    }).select('-password');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update student
export const updateStudent = async (req, res) => {
  try {
    const { name, email, collegeId, department, isActive } = req.body;
    
    const student = await User.findOne({
      _id: req.params.id,
      college: req.user.college,
      role: 'student'
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    student.name = name || student.name;
    student.email = email || student.email;
    student.collegeId = collegeId || student.collegeId;
    student.department = department || student.department;
    student.isActive = isActive !== undefined ? isActive : student.isActive;

    const updatedStudent = await student.save();

    res.json({
      id: updatedStudent._id,
      name: updatedStudent.name,
      email: updatedStudent.email,
      collegeId: updatedStudent.collegeId,
      department: updatedStudent.department,
      isActive: updatedStudent.isActive
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete student
export const deleteStudent = async (req, res) => {
  try {
    const student = await User.findOne({
      _id: req.params.id,
      college: req.user.college,
      role: 'student'
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await student.remove();
    res.json({ message: 'Student removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Start quiz for all students
export const startQuizForAll = async (req, res) => {
  try {
    // First check if there are any active quizzes
    const activeQuiz = await Quiz.findOne({
      status: 'Active'
    });

    if (!activeQuiz) {
      return res.status(400).json({
        message: 'No active quiz found',
        details: 'Please create and activate a quiz before starting'
      });
    }

    // Update all students' quiz status
    await User.updateMany(
      { college: req.user.college, role: 'student' },
      { 
        quizStatus: 'running',
        currentQuiz: activeQuiz._id
      }
    );

    // Log this action
    const quizSession = {
      title: `${activeQuiz.title} - Session`,
      description: `Group session for ${activeQuiz.title}`,
      startTime: new Date(),
      status: 'Active',
      quiz: activeQuiz._id,
      college: req.user.college,
      initiatedBy: req.user._id
    };

    await Quiz.findByIdAndUpdate(activeQuiz._id, {
      $set: { sessionStartTime: new Date() }
    });

    res.json({ 
      message: 'Quiz started for all students',
      quiz: activeQuiz.title
    });
  } catch (error) {
    console.error('Start quiz error:', error);
    res.status(500).json({ 
      message: 'Failed to start quiz',
      details: error.message
    });
  }
};

// Stop quiz for all students
export const stopQuizForAll = async (req, res) => {
  try {
    // Update all students' quiz status
    await User.updateMany(
      { college: req.user.college, role: 'student' },
      { 
        quizStatus: 'stopped',
        currentQuiz: null
      }
    );

    // Update active quiz sessions
    await Quiz.updateMany(
      { 
        status: 'Active',
        sessionStartTime: { $ne: null },
        sessionEndTime: null
      },
      { 
        $set: { 
          sessionEndTime: new Date(),
          status: 'Completed'
        }
      }
    );

    res.json({ message: 'Quiz stopped for all students' });
  } catch (error) {
    console.error('Stop quiz error:', error);
    res.status(500).json({ 
      message: 'Failed to stop quiz',
      details: error.message
    });
  }
};

// Start quiz for individual student
export const startQuiz = async (req, res) => {
  try {
    const student = await User.findOne({
      _id: req.params.studentId,
      college: req.user.college,
      role: 'student'
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    student.quizStatus = 'running';
    await student.save();

    // Log individual start
    await Quiz.create({
      college: req.user.college,
      student: student._id,
      action: 'start-individual',
      initiatedBy: req.user._id,
      startTime: new Date()
    });

    res.json({ message: 'Quiz started for student', quizStatus: 'running' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Control quiz for individual student
export const controlStudentQuiz = async (req, res) => {
  try {
    const { studentId, action } = req.params;
    
    const student = await User.findOne({
      _id: studentId,
      college: req.user.college,
      role: 'student'
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (!['start', 'stop'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Use start or stop.' });
    }

    // Update quiz status
    const newStatus = action === 'start' ? 'running' : 'stopped';
    student.quizStatus = newStatus;
    await student.save();

    if (action === 'start') {
      // Create new quiz record
      await Quiz.create({
        college: req.user.college,
        student: student._id,
        action: 'start-individual',
        initiatedBy: req.user._id,
        startTime: new Date()
      });
    } else {
      // Update quiz record
      await Quiz.findOneAndUpdate(
        { 
          college: req.user.college,
          student: student._id,
          endTime: null 
        },
        { endTime: new Date() }
      );
    }

    res.json({ 
      success: true,
      message: `Quiz ${action}ed for student ${student.name}`,
      quizStatus: newStatus
    });
  } catch (error) {
    console.error('Control student quiz error:', error);
    res.status(500).json({ message: 'Error controlling student quiz' });
  }
};

// Get detailed student data with scores, questions, and answers
export const getDetailedStudentData = async (req, res) => {
  try {
    // Validate admin user has college assigned
    if (!req.user || !req.user.college) {
      return res.status(400).json({
        message: 'College not assigned',
        details: 'Admin user must have a college assigned to view student data'
      });
    }

    // Get all students from admin's college
    const students = await User.find({ 
      college: req.user.college,
      role: 'student'
    }).select('-password').lean();

    // Get all scores for these students
    const studentIds = students.map(s => s._id);
    const scores = await Score.find({ 
      student: { $in: studentIds } 
    }).sort({ submittedAt: -1 });

    // Format detailed student data
    const detailedStudents = students.map(student => {
      const studentScores = scores.filter(score => 
        score.student.toString() === student._id.toString()
      );

      // Calculate statistics for this student
      const completedScores = studentScores.filter(s => s.status === 'completed');
      const averageScore = completedScores.length > 0 
        ? (completedScores.reduce((sum, s) => sum + s.totalScore, 0) / completedScores.length).toFixed(1)
        : 0;

      const totalQuestions = completedScores.reduce((sum, s) => sum + (s.answers?.length || 0), 0);
      const correctAnswers = completedScores.reduce((sum, s) => 
        sum + (s.answers?.filter(a => a.isCorrect).length || 0), 0
      );

      return {
        _id: student._id,
        fullName: student.fullName || 'No Name',
        email: student.email || 'No Email',
        college: student.college || 'No College',
        isActive: student.isActive || false,
        quizStatus: student.quizStatus || 'stopped',
        totalAttempts: studentScores.length,
        completedAttempts: completedScores.length,
        averageScore: parseFloat(averageScore),
        totalQuestions: totalQuestions,
        correctAnswers: correctAnswers,
        accuracy: totalQuestions > 0 ? ((correctAnswers / totalQuestions) * 100).toFixed(1) : 0,
        lastSubmission: completedScores.length > 0 ? completedScores[0].submittedAt : null,
        scores: completedScores.map(score => ({
          id: score._id,
          totalScore: score.totalScore,
          status: score.status,
          submittedAt: score.submittedAt,
          simulationName: score.simulationName,
          simulationType: score.simulationType,
          totalQuestions: score.totalQuestions || score.answers?.length || 0,
          correctAnswers: score.answers?.filter(a => a.isCorrect).length || 0,
          answers: score.answers || []
        }))
      };
    });

    // Calculate overall statistics
    const totalStudents = detailedStudents.length;
    const studentsWithSubmissions = detailedStudents.filter(s => s.completedAttempts > 0).length;
    const overallAverageScore = studentsWithSubmissions > 0 
      ? (detailedStudents.reduce((sum, s) => sum + s.averageScore, 0) / studentsWithSubmissions).toFixed(1)
      : 0;

    const activeSessions = detailedStudents.filter(s => s.quizStatus === 'running').length;
    const completedToday = detailedStudents.reduce((sum, s) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return sum + s.scores.filter(score => score.submittedAt >= today).length;
    }, 0);

    const statistics = {
      totalStudents,
      studentsWithSubmissions,
      activeSessions,
      completedSessions: completedToday,
      averageScore: parseFloat(overallAverageScore)
    };

    res.json({
      students: detailedStudents,
      statistics
    });
  } catch (error) {
    console.error('Error fetching detailed student data:', error);
    res.status(500).json({ 
      message: 'Error fetching detailed student data',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get detailed score data for a specific student
export const getStudentDetailedScores = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Verify student belongs to admin's college
    const student = await User.findOne({
      _id: studentId,
      college: req.user.college,
      role: 'student'
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get all scores for this student
    const scores = await Score.find({ student: studentId })
      .sort({ submittedAt: -1 });

    // Format detailed score data
    const detailedScores = scores.map(score => ({
      id: score._id,
      totalScore: score.totalScore,
      instructorScore: score.instructorScore,
      status: score.status,
      submittedAt: score.submittedAt,
      simulationName: score.simulationName,
      simulationType: score.simulationType,
      accuracy: score.accuracy,
      totalQuestions: score.totalQuestions || score.answers?.length || 0,
      correctAnswers: score.answers?.filter(a => a.isCorrect).length || 0,
      answers: score.answers?.map(answer => ({
        questionText: answer.questionText,
        questionType: answer.questionType,
        selectedOption: answer.selectedOption,
        correctAnswer: answer.correctAnswer,
        isCorrect: answer.isCorrect,
        timeSpent: answer.timeSpent,
        reasoning: answer.reasoning,
        points: answer.points,
        options: answer.options
      })) || []
    }));

    res.json({
      student: {
        _id: student._id,
        fullName: student.fullName,
        email: student.email,
        college: student.college
      },
      scores: detailedScores
    });
  } catch (error) {
    console.error('Error fetching student detailed scores:', error);
    res.status(500).json({ 
      message: 'Error fetching student detailed scores',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get quiz statistics for super admin
export const getQuizStats = async (req, res) => {
  try {
    const stats = await Score.aggregate([
      {
        $match: { college: req.user.college }
      },
      {
        $group: {
          _id: null,
          totalStudents: { $addToSet: '$student' },
          averageScore: { $avg: '$totalScore' },
          completedSessions: { $sum: 1 },
          averageTime: { $avg: '$timeTaken' }
        }
      }
    ]);

    // Get active sessions
    const activeSessions = await User.countDocuments({
      college: req.user.college,
      role: 'student',
      quizStatus: 'running'
    });

    const response = stats[0] ? {
      totalStudents: stats[0].totalStudents.length,
      averageScore: Math.round(stats[0].averageScore * 10) / 10,
      completedSessions: stats[0].completedSessions,
      activeSessions,
      averageTime: Math.round(stats[0].averageTime)
    } : {
      totalStudents: 0,
      averageScore: 0,
      completedSessions: 0,
      activeSessions: 0,
      averageTime: 0
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
