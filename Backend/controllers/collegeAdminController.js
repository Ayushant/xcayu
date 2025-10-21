import User from '../models/userModel.js';
import License from '../models/licenseModel.js';
import Score from '../models/scoreModel.js';
import bcrypt from 'bcryptjs';

// Get all students for a specific college
export const getCollegeStudents = async (req, res) => {
  try {
    const { college } = req.user; // College admin's college
    const students = await User.find({ 
      college, 
      role: 'student' 
    }).select('-password');
    
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a new student
export const addStudent = async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    const { college } = req.user; // College admin's college

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Find the license for this college
    const license = await License.findOne({ college });
    if (!license) {
      return res.status(403).json({
        message: 'No license found',
        details: 'This college does not have a valid license.'
      });
    }

    // Count current students for this college
    const currentStudentCount = await User.countDocuments({ 
      role: 'student', 
      college: college 
    });

    // Check if student limit is reached
    if (currentStudentCount >= license.maxStudents) {
      console.log(`🚫 STUDENT LIMIT REACHED! ${currentStudentCount}/${license.maxStudents}`);
      return res.status(403).json({
        message: 'Student limit reached',
        details: `You have reached the maximum student limit (${license.maxStudents}) for your college. Please contact the super admin to increase your license limit.`
      });
    }
    
    console.log(`✅ Student limit check passed: ${currentStudentCount}/${license.maxStudents}`);

    // Create the student
    const hashedPassword = await bcrypt.hash(password, 10);
    const student = await User.create({
      email,
      password: hashedPassword,
      fullName,
      role: 'student',
      college
    });

    // Update license with new student count
    const newStudentCount = await User.countDocuments({ 
      role: 'student', 
      college: college 
    });
    
    await License.findByIdAndUpdate(license._id, {
      currentStudents: newStudentCount
    });

    if (student) {
      res.status(201).json({
        _id: student._id,
        email: student.email,
        fullName: student.fullName,
        role: student.role,
        college: student.college
      });
    }
  } catch (error) {
    console.error('Error adding student:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get student scores for a specific college
export const getCollegeScores = async (req, res) => {
  try {
    const { college } = req.user;
    
    // Get all students from this college
    const students = await User.find({ college, role: 'student' });
    const studentIds = students.map(student => student._id);

    // Get all scores for these students with double-layer security
    // Filter by BOTH studentIds AND college field to prevent any data leakage
    const scores = await Score.find({
      $and: [
        { student: { $in: studentIds } },
        { $or: [{ college: college }, { college: '' }] } // Include scores without college field (legacy data)
      ]
    })
    .populate('student', 'fullName email college')
    .populate('quiz', 'title')
    .sort('-submittedAt');

    // Additional security: Filter out any scores where student's college doesn't match
    const filteredScores = scores.filter(score => 
      score.student && score.student.college === college
    );

    console.log(`✅ College Admin (${college}): Retrieved ${filteredScores.length} scores`);
    res.json(filteredScores);
  } catch (error) {
    console.error('Error fetching college scores:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get detailed score for a specific student
export const getStudentScore = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { college } = req.user;

    // Verify student belongs to college
    const student = await User.findOne({ _id: studentId, college, role: 'student' });
    if (!student) {
      console.warn(`🚫 Unauthorized access: College ${college} tried to access student ${studentId} who doesn't belong to them`);
      return res.status(404).json({ 
        message: 'Student not found',
        details: 'Student does not belong to your college'
      });
    }

    // Get scores for this student with additional college filtering
    const scores = await Score.find({ 
      student: studentId,
      $or: [{ college: college }, { college: '' }] // Include legacy data without college field
    })
      .populate('student', 'fullName email college')
      .populate('quiz', 'title')
      .sort('-submittedAt');

    // Additional security filter
    const filteredScores = scores.filter(score => 
      !score.student || score.student.college === college
    );

    console.log(`✅ College Admin (${college}): Retrieved ${filteredScores.length} scores for student ${student.fullName}`);
    res.json(filteredScores);
  } catch (error) {
    console.error('Error fetching student scores:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get detailed score with questions and answers
export const getScoreDetails = async (req, res) => {
  try {
    const { scoreId } = req.params;
    const { college } = req.user;

    const score = await Score.findById(scoreId)
      .populate('student', 'fullName email college')
      .populate('quiz', 'title description questions');

    if (!score) {
      return res.status(404).json({ message: 'Score not found' });
    }

    // Double-layer security: Verify student belongs to college
    if (!score.student || score.student.college !== college) {
      console.warn(`🚫 Unauthorized access attempt: College ${college} tried to access score for student from ${score.student?.college || 'unknown college'}`);
      return res.status(403).json({ 
        message: 'Unauthorized access',
        details: 'You can only view scores from students in your college'
      });
    }

    // Additional check: Verify score's college field matches (if populated)
    if (score.college && score.college !== '' && score.college !== college) {
      console.warn(`🚫 College mismatch: Score has college ${score.college}, admin has college ${college}`);
      return res.status(403).json({ 
        message: 'Unauthorized access',
        details: 'Score does not belong to your college'
      });
    }

    console.log(`✅ College Admin (${college}): Retrieved score details for ${score.student.fullName}`);
    res.json(score);
  } catch (error) {
    console.error('Error fetching score details:', error);
    res.status(500).json({ message: error.message });
  }
};

// Edit student score
export const editScore = async (req, res) => {
  try {
    const { scoreId } = req.params;
    const { newScore, reason, questionIndex, newQuestionScore, newInstructionScore } = req.body;
    const { college, _id: adminId } = req.user;

    const score = await Score.findById(scoreId)
      .populate('student', 'fullName email college');

    if (!score) {
      return res.status(404).json({ message: 'Score not found' });
    }

    // Double-layer security: Verify student belongs to college
    if (!score.student || score.student.college !== college) {
      console.warn(`🚫 Unauthorized edit attempt: College ${college} tried to edit score for student from ${score.student?.college || 'unknown college'}`);
      return res.status(403).json({ 
        message: 'Unauthorized access',
        details: 'You can only edit scores from students in your college'
      });
    }

    // Additional check: Verify score's college field matches (if populated)
    if (score.college && score.college !== '' && score.college !== college) {
      console.warn(`🚫 College mismatch on edit: Score has college ${score.college}, admin has college ${college}`);
      return res.status(403).json({ 
        message: 'Unauthorized access',
        details: 'Score does not belong to your college'
      });
    }

    const oldScore = score.totalScore;

    // If editing instruction score
    if (questionIndex !== undefined && newInstructionScore !== undefined) {
      const oldInstructionScore = score.answers[questionIndex].instructionScore || 0;
      score.answers[questionIndex].instructionScore = newInstructionScore;
      
      // Recalculate total score (ranking score + instruction score)
      const totalPoints = score.answers.reduce((sum, answer) => 
        sum + (answer.rankingScore || 0) + (answer.instructionScore || 0), 0
      );
      const maxPoints = score.answers.length * 200; // 100 for ranking + 100 for instruction per question
      score.totalScore = (totalPoints / maxPoints) * 100;

      score.scoreEdits.push({
        editedBy: adminId,
        editedAt: new Date(),
        oldScore,
        newScore: score.totalScore,
        reason,
        questionIndex,
        oldQuestionScore: oldInstructionScore,
        newQuestionScore: newInstructionScore,
        editType: 'instruction'
      });
    }
    // If editing a specific question's ranking score
    else if (questionIndex !== undefined && newQuestionScore !== undefined) {
      const oldQuestionScore = score.answers[questionIndex].points || score.answers[questionIndex].rankingScore || 0;
      
      // Update the ranking score
      if (score.answers[questionIndex].rankingScore !== undefined) {
        score.answers[questionIndex].rankingScore = newQuestionScore;
      } else {
        score.answers[questionIndex].points = newQuestionScore;
      }
      
      // Recalculate total score
      const totalPoints = score.answers.reduce((sum, answer) => 
        sum + (answer.rankingScore || answer.points || 0) + (answer.instructionScore || 0), 0
      );
      const maxPoints = score.answers.length * 200; // 100 for ranking + 100 for instruction per question
      score.totalScore = (totalPoints / maxPoints) * 100;

      score.scoreEdits.push({
        editedBy: adminId,
        editedAt: new Date(),
        oldScore,
        newScore: score.totalScore,
        reason,
        questionIndex,
        oldQuestionScore,
        newQuestionScore,
        editType: 'ranking'
      });
    } else if (newScore !== undefined) {
      // Edit total score
      score.totalScore = newScore;
      score.scoreEdits.push({
        editedBy: adminId,
        editedAt: new Date(),
        oldScore,
        newScore,
        reason,
        editType: 'total'
      });
    }

    await score.save();
    
    // Populate data for socket event
    await score.populate('student', 'fullName email college');
    await score.populate('quiz', 'title');
    
    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io && college) {
      console.log(`📡 Emitting score-edited event to college: ${college}`);
      io.to(`college-${college}`).emit('score-edited', {
        scoreId: score._id,
        studentName: score.student.fullName,
        quizTitle: score.quiz?.title,
        totalScore: score.totalScore,
        editType: questionIndex !== undefined 
          ? (newInstructionScore !== undefined ? 'instruction' : 'ranking')
          : 'total'
      });
    }

    res.json({
      message: 'Score updated successfully',
      score
    });
  } catch (error) {
    console.error('Error editing score:', error);
    res.status(500).json({ message: error.message });
  }
};