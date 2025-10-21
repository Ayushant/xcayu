import User from '../models/userModel.js';
import License from '../models/licenseModel.js';
import Quiz from '../models/quizModel.js';
import Score from '../models/scoreModel.js';
import Result from '../models/resultModel.js';
import Simulation from '../models/simulationModel.js';
import Course from '../models/courseModel.js';
import bcrypt from 'bcryptjs';
import { successResponse, errorResponse } from '../utils/errorHandler.js';

// Get overview statistics
export const getOverview = async (req, res) => {
  try {
    const startTime = process.uptime();
    
    // Get counts for all collections
    const [
      totalLicenses,
      totalStudents,
      totalAdmins,
      totalQuizzes,
      totalScores,
      averageScore
    ] = await Promise.all([
      License.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: { $in: ['admin', 'collegeAdmin'] } }),
      Quiz.countDocuments(),
      Score.countDocuments({ status: 'completed' }),
      Score.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, avgScore: { $avg: '$totalScore' } } }
      ])
    ]);

    // Calculate uptime
    const uptime = process.uptime();
    const uptimeFormatted = formatUptime(uptime);

    // Get average score
    const avgScore = averageScore.length > 0 ? Math.round(averageScore[0].avgScore * 100) / 100 : 0;

    res.json({
      totalLicenses,
      totalStudents,
      totalAdmins,
      totalQuizzes,
      totalResults: totalScores, // Use totalScores as totalResults
      averageScore: avgScore,
      uptime: uptimeFormatted,
      serverStartTime: new Date(Date.now() - uptime * 1000).toISOString()
    });
  } catch (error) {
    console.error('Error fetching overview:', error);
    res.status(500).json({ message: 'Error fetching overview data', error: error.message });
  }
};

// Get all licenses with pagination
export const getLicenses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const licenses = await License.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Update each license with real-time student counts
    const licensesWithRealCounts = await Promise.all(
      licenses.map(async (license) => {
        const actualStudentCount = await User.countDocuments({ 
          role: 'student', 
          college: license.college 
        });
        
        // Update the license in database with real count
        await License.findByIdAndUpdate(license._id, {
          currentStudents: actualStudentCount
        });
        
        // Return license with updated count
        return {
          ...license.toObject(),
          currentStudents: actualStudentCount
        };
      })
    );

    const total = await License.countDocuments();

    res.json({
      licenses: licensesWithRealCounts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Error fetching licenses:', error);
    res.status(500).json({ message: 'Error fetching licenses', error: error.message });
  }
};

// Get all users with filtering and pagination
export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const role = req.query.role;
    const college = req.query.college;
    const search = req.query.search;

    // Build filter object
    const filter = {};
    if (role) {
      // Support multiple roles separated by comma
      if (role.includes(',')) {
        const roles = role.split(',').map(r => r.trim());
        filter.role = { $in: roles };
      } else {
        filter.role = role;
      }
    }
    if (college) filter.college = new RegExp(college, 'i');
    
    // Add search functionality
    if (search) {
      filter.$or = [
        { fullName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { college: new RegExp(search, 'i') }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Get all quizzes with pagination
export const getQuizzes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const quizzes = await Quiz.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Quiz.countDocuments();

    res.json({
      quizzes,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ message: 'Error fetching quizzes', error: error.message });
  }
};

// Get all results with student and quiz details
export const getResults = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Fetch from Score model instead of Result model
    const scores = await Score.find({ status: 'completed' })
      .populate('student', 'fullName email college')
      .populate('quiz', 'title description')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Score.countDocuments({ status: 'completed' });

    // Transform Score data to match Result format for frontend compatibility
    const results = scores.map(score => ({
      _id: score._id,
      student: score.student,
      quiz: score.quiz,
      score: Math.round((score.totalScore / 100) * (score.totalQuestions || score.answers?.length || 1)),
      totalQuestions: score.totalQuestions || score.answers?.length || 1,
      correctAnswers: Math.round((score.totalScore / 100) * (score.totalQuestions || score.answers?.length || 1)),
      percentage: Math.round(score.totalScore),
      timeSpent: score.answers?.reduce((total, answer) => total + (answer.timeSpent || 0), 0) || 0,
      submittedAt: score.submittedAt,
      status: score.status
    }));

    res.json({
      results,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ message: 'Error fetching results', error: error.message });
  }
};

// Get a single result by ID with full details for editing
export const getResultById = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch from Score model
    const score = await Score.findById(id)
      .populate('student', 'fullName email college')
      .populate('quiz', 'title description');

    if (!score) {
      return res.status(404).json({ message: 'Result not found' });
    }

    res.json({
      score: {
        _id: score._id,
        student: score.student,
        quiz: score.quiz,
        totalScore: score.totalScore,
        totalQuestions: score.totalQuestions || score.answers?.length || 0,
        answers: score.answers || [],
        submittedAt: score.submittedAt,
        status: score.status,
        scoreEdits: score.scoreEdits || []
      }
    });
  } catch (error) {
    console.error('Error fetching result:', error);
    res.status(500).json({ message: 'Error fetching result', error: error.message });
  }
};

// Get recent activity (quiz submissions and scores)
export const getActivity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    // Get recent scores (both quiz and simulation results)
    const recentScores = await Score.find({ status: 'completed' })
      .populate('student', 'fullName email college')
      .populate('quiz', 'title')
      .sort({ submittedAt: -1 })
      .limit(limit);

    // Transform scores to activity format
    const allActivity = recentScores.map(score => {
      const isSimulation = score.simulationType === 'strategic-simulation' || score.simulationName;
      const quizTitle = isSimulation ? (score.simulationName || 'Simulation') : (score.quiz?.title || 'Quiz');
      const percentage = isSimulation ? (score.accuracy || score.totalScore) : score.totalScore;
      
      return {
        type: isSimulation ? 'simulation' : 'quiz',
        id: score._id,
        student: score.student,
        quiz: { title: quizTitle },
        score: score.totalScore,
        percentage: Math.round(percentage),
        submittedAt: score.submittedAt,
        message: `${score.student.fullName} completed ${quizTitle} with ${Math.round(percentage)}%`
      };
    });

    res.json(allActivity);
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ message: 'Error fetching activity', error: error.message });
  }
};

// Get college statistics
export const getCollegeStats = async (req, res) => {
  try {
    // Get user distribution by college
    const collegeStats = await User.aggregate([
      { $match: { role: 'student' } },
      { $group: {
        _id: '$college',
        studentCount: { $sum: 1 },
        avgScore: { $avg: '$avgScore' }
      }},
      { $sort: { studentCount: -1 } }
    ]);

    // Get quiz completion stats by college
    const quizStats = await Score.aggregate([
      { $match: { status: 'completed' } },
      { $lookup: {
        from: 'users',
        localField: 'student',
        foreignField: '_id',
        as: 'student'
      }},
      { $unwind: '$student' },
      { $group: {
        _id: '$student.college',
        totalQuizzes: { $sum: 1 },
        avgScore: { $avg: '$totalScore' }
      }},
      { $sort: { totalQuizzes: -1 } }
    ]);

    res.json({
      collegeStats,
      quizStats
    });
  } catch (error) {
    console.error('Error fetching college stats:', error);
    res.status(500).json({ message: 'Error fetching college statistics', error: error.message });
  }
};

// Create new license
export const createLicense = async (req, res) => {
  try {
    const { college, email, password, maxStudents, expiryDate } = req.body;

    // Validate required fields
    if (!college || !email || !password || !maxStudents || !expiryDate) {
      return res.status(400).json({ 
        message: 'All fields are required',
        details: 'Please provide college, email, password, maxStudents, and expiryDate'
      });
    }

    // Check if email already exists
    const existingLicense = await License.findOne({ email });
    if (existingLicense) {
      return res.status(400).json({ 
        message: 'Email already registered',
        details: 'A license with this email already exists'
      });
    }

    // Check if college already has a license
    const existingCollegeLicense = await License.findOne({ college });
    if (existingCollegeLicense) {
      return res.status(400).json({ 
        message: 'College already has a license',
        details: 'This college already has an active license'
      });
    }

    // Validate expiry date
    const expiryDateObj = new Date(expiryDate);
    if (isNaN(expiryDateObj.getTime())) {
      return res.status(400).json({ 
        message: 'Invalid expiry date',
        details: 'Please provide a valid date for expiry'
      });
    }

    // Validate maxStudents
    if (maxStudents <= 0) {
      return res.status(400).json({ 
        message: 'Invalid max students',
        details: 'Maximum students must be greater than 0'
      });
    }

    const license = new License({
      college,
      email,
      password, // Store password as plain text for now (should be hashed in production)
      maxStudents: parseInt(maxStudents),
      currentStudents: 0,
      expiryDate: expiryDateObj,
      status: 'Active'
    });

    await license.save();

    res.status(201).json({
      message: 'License created successfully',
      license: {
        _id: license._id,
        college: license.college,
        email: license.email,
        maxStudents: license.maxStudents,
        currentStudents: license.currentStudents,
        expiryDate: license.expiryDate,
        status: license.status
      }
    });
  } catch (error) {
    console.error('Error creating license:', error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      // Check which field caused the duplicate error
      if (error.keyPattern && error.keyPattern.email) {
        return res.status(400).json({ 
          message: 'Email already exists',
          details: 'A license with this email address already exists. Please use a different email.'
        });
      } else if (error.keyPattern && error.keyPattern.college) {
        return res.status(400).json({ 
          message: 'College already has a license',
          details: 'This college already has an active license. Please use a different college name.'
        });
      } else {
        return res.status(400).json({ 
          message: 'Duplicate entry',
          details: 'A license with this information already exists'
        });
      }
    }
    
    res.status(500).json({ 
      message: 'Error creating license', 
      error: error.message,
      details: 'An unexpected error occurred while creating the license'
    });
  }
};

// Update license
export const updateLicense = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const license = await License.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!license) {
      return res.status(404).json({ message: 'License not found' });
    }

    res.json({
      message: 'License updated successfully',
      license
    });
  } catch (error) {
    console.error('Error updating license:', error);
    res.status(500).json({ message: 'Error updating license', error: error.message });
  }
};

// Delete license
export const deleteLicense = async (req, res) => {
  try {
    const { id } = req.params;

    const license = await License.findByIdAndDelete(id);

    if (!license) {
      return res.status(404).json({ message: 'License not found' });
    }

    res.json({ message: 'License deleted successfully' });
  } catch (error) {
    console.error('Error deleting license:', error);
    res.status(500).json({ message: 'Error deleting license', error: error.message });
  }
};

// Delete user (student/admin)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the user first to get their role
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deletion of superadmin
    if (user.role === 'superadmin') {
      return res.status(403).json({ message: 'Cannot delete super admin' });
    }

    // Delete related data first
    await Promise.all([
      Score.deleteMany({ student: id }),
      Result.deleteMany({ student: id }),
      Simulation.deleteMany({ student: id })
    ]);

    // Delete the user
    await User.findByIdAndDelete(id);

    res.json({ 
      message: `${user.role} deleted successfully`,
      deletedUser: {
        id: user._id,
        name: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

// Get user details by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's quiz results and scores
    const [results, scores] = await Promise.all([
      Result.find({ student: id }).populate('quiz', 'title description').sort({ submittedAt: -1 }),
      Score.find({ student: id }).sort({ submittedAt: -1 })
    ]);

    res.json({
      user,
      results,
      scores
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Error fetching user details', error: error.message });
  }
};

// Update user status (activate/deactivate)
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { isActive, updatedAt: new Date() },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Error updating user status', error: error.message });
  }
};

// Helper function to format uptime
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

// Update student count for all licenses
export const updateStudentCounts = async () => {
  try {
    const licenses = await License.find();
    
    for (const license of licenses) {
      const studentCount = await User.countDocuments({ 
        role: 'student', 
        college: license.college 
      });
      
      await License.findByIdAndUpdate(license._id, {
        currentStudents: studentCount
      });
    }
    
    console.log('Student counts updated for all licenses');
  } catch (error) {
    console.error('Error updating student counts:', error);
  }
};

// ============================================
// USER MANAGEMENT (STUDENTS & ADMINS)
// ============================================

/**
 * Create new user (student or admin)
 * Validates license limits for students
 */
export const createUser = async (req, res) => {
  try {
    const { email, password, fullName, role, college, course } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 400, 'User already exists', 'A user with this email already exists');
    }

    // If creating a student, validate license and course
    if (role === 'student') {
      if (!college) {
        return errorResponse(res, 400, 'College required', 'Students must be assigned to a college');
      }

      if (!course) {
        return errorResponse(res, 400, 'Course required', 'Students must be assigned to a course for quiz access');
      }

      // Find license
      const license = await License.findOne({ college });
      if (!license) {
        return errorResponse(res, 403, 'No license found', `No license found for ${college}`);
      }

      // Check expiry
      if (license.expiryDate < new Date()) {
        return errorResponse(res, 403, 'License expired', 'Cannot add students to college with expired license');
      }

      // Check student limit
      const currentCount = await User.countDocuments({ role: 'student', college });
      if (currentCount >= license.maxStudents) {
        return errorResponse(res, 403, 'Student limit reached', `Maximum student limit (${license.maxStudents}) reached for this college`);
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      fullName,
      role,
      college,
      course, // Course ID for course-restricted quiz access
      isActive: true
    });

    await user.save();

    // Update license count if student
    if (role === 'student') {
      await updateStudentCounts();
    }

    // Emit Socket.IO event
    const io = req.app.get('io');
    if (io) {
      io.to('admin-room').emit('student-created', {
        student: {
          id: user._id,
          name: user.fullName,
          email: user.email,
          college: user.college,
          course: user.course
        }
      });
    }

    return successResponse(res, 201, 'User created successfully', {
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        college: user.college,
        course: user.course
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return errorResponse(res, 500, 'Error creating user', error.message);
  }
};

/**
 * Update user details
 */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow password updates through this endpoint
    delete updates.password;
    delete updates.role; // Prevent role changes

    // If updating college, validate license
    if (updates.college) {
      const user = await User.findById(id);
      if (user.role === 'student' && user.college !== updates.college) {
        const license = await License.findOne({ college: updates.college });
        if (!license || license.expiryDate < new Date()) {
          return errorResponse(res, 403, 'Invalid college', 'Cannot transfer to college with invalid license');
        }

        const currentCount = await User.countDocuments({ role: 'student', college: updates.college });
        if (currentCount >= license.maxStudents) {
          return errorResponse(res, 403, 'Student limit reached', 'Target college has reached student limit');
        }
      }
    }

    const user = await User.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    // Update license counts
    await updateStudentCounts();

    return successResponse(res, 200, 'User updated successfully', user);
  } catch (error) {
    console.error('Error updating user:', error);
    return errorResponse(res, 500, 'Error updating user', error.message);
  }
};

// ============================================
// COURSE MANAGEMENT
// ============================================

// Get all courses
export const getCourses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const department = req.query.department;
    const search = req.query.search;

    // Build filter
    const filter = {};
    if (department) filter.department = new RegExp(department, 'i');
    if (search) {
      filter.$or = [
        { courseName: new RegExp(search, 'i') },
        { courseCode: new RegExp(search, 'i') }
      ];
    }

    const courses = await Course.find(filter)
      .populate('createdBy', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Course.countDocuments(filter);

    return successResponse(res, 200, 'Courses fetched successfully', {
      courses,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return errorResponse(res, 500, 'Error fetching courses', error.message);
  }
};

// Create course
export const createCourse = async (req, res) => {
  try {
    const { courseName, courseCode, department, description, duration } = req.body;

    // Check if course code already exists
    const existingCourse = await Course.findOne({ courseCode: courseCode.toUpperCase() });
    if (existingCourse) {
      return errorResponse(res, 400, 'Course code already exists');
    }

    const course = new Course({
      courseName,
      courseCode: courseCode.toUpperCase(),
      department,
      description,
      duration,
      createdBy: req.user.id
    });

    await course.save();

    return successResponse(res, 201, 'Course created successfully', course);
  } catch (error) {
    console.error('Error creating course:', error);
    return errorResponse(res, 500, 'Error creating course', error.message);
  }
};

// Update course
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const course = await Course.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!course) {
      return errorResponse(res, 404, 'Course not found');
    }

    return successResponse(res, 200, 'Course updated successfully', course);
  } catch (error) {
    console.error('Error updating course:', error);
    return errorResponse(res, 500, 'Error updating course', error.message);
  }
};

// Delete course
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findByIdAndDelete(id);

    if (!course) {
      return errorResponse(res, 404, 'Course not found');
    }

    return successResponse(res, 200, 'Course deleted successfully');
  } catch (error) {
    console.error('Error deleting course:', error);
    return errorResponse(res, 500, 'Error deleting course', error.message);
  }
};

// ============================================
// SIMULATION MANAGEMENT
// ============================================

// Get all simulations with filters
export const getSimulations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100; // Increased default limit
    const skip = (page - 1) * limit;
    const college = req.query.college;
    const degree = req.query.degree;
    const course = req.query.course;

    // Build filter - prioritize templates
    const filter = { isTemplate: true }; // Only show templates in admin panel
    if (college) filter.college = new RegExp(college, 'i');
    if (degree) filter.degree = degree;
    if (course) filter.course = course;

    const simulations = await Simulation.find(filter)
      .populate('userId', 'fullName email college')
      .populate('course', 'courseName courseCode')
      .populate('createdBy', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Simulation.countDocuments(filter);

    return successResponse(res, 200, 'Simulations fetched successfully', {
      simulations,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Error fetching simulations:', error);
    return errorResponse(res, 500, 'Error fetching simulations', error.message);
  }
};

// Create simulation template
export const createSimulationTemplate = async (req, res) => {
  try {
    const { simulationName, college, course, degree, description, instructions } = req.body;

    console.log('Creating simulation with data:', { simulationName, college, course, degree });

    // Validate required fields
    if (!simulationName) {
      return errorResponse(res, 400, 'Simulation name is required');
    }

    // Generate unique credentials for student and admin access
    const generateCredentials = (type) => {
      const slug = simulationName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .substring(0, 20);
      
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      
      const email = type === 'student' 
        ? `student-${slug}-${randomSuffix}@sim.edu`
        : `admin-${slug}-${randomSuffix}@sim.edu`;
      
      // Use degree or 'SIM' if degree is not provided
      const password = degree ? `${degree}${randomSuffix}` : `SIM${randomSuffix}`;
      
      return { email, password };
    };

    const studentCreds = generateCredentials('student');
    const adminCreds = generateCredentials('admin');

    // This creates a template/configuration for simulations
    const simulationData = {
      simulationName,
      college: college || '',
      degree: degree || '',
      description: description || (degree ? `Comprehensive ${degree} simulation with real-world scenarios` : 'Comprehensive simulation with real-world scenarios'),
      instructions: instructions || (degree ? `Complete the simulation to test your knowledge in ${degree}` : 'Complete the simulation to test your knowledge'),
      createdBy: req.user.id,
      userId: req.user.id, // Placeholder, actual simulations will have student IDs
      score: 0,
      accuracy: 0,
      totalQuestions: 0,
      answers: [],
      isCompleted: false,
      isTemplate: true,
      isActive: true,
      status: 'Active',
      templateType: 'Strategic Simulation',
      studentCredentials: studentCreds,
      adminCredentials: adminCreds
    };

    // Only add course if provided and valid
    if (course && course.trim() !== '') {
      simulationData.course = course;
    }

    console.log('Simulation data to save:', simulationData);

    const simulation = new Simulation(simulationData);
    await simulation.save();

    // Populate the course details for response if course exists
    if (simulation.course) {
      await simulation.populate('course', 'courseName courseCode');
    }

    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('simulation:created', {
        id: simulation._id,
        simulationName: simulation.simulationName,
        degree: simulation.degree,
        college: simulation.college
      });
    }

    return successResponse(res, 201, 'Simulation template created successfully', {
      simulation,
      studentCredentials: studentCreds,
      adminCredentials: adminCreds
    });
  } catch (error) {
    console.error('Error creating simulation:', error);
    console.error('Error stack:', error.stack);
    return errorResponse(res, 500, 'Error creating simulation', error.message);
  }
};

// Update simulation
export const updateSimulation = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const simulation = await Simulation.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!simulation) {
      return errorResponse(res, 404, 'Simulation not found');
    }

    return successResponse(res, 200, 'Simulation updated successfully', simulation);
  } catch (error) {
    console.error('Error updating simulation:', error);
    return errorResponse(res, 500, 'Error updating simulation', error.message);
  }
};

// Delete simulation
export const deleteSimulation = async (req, res) => {
  try {
    const { id } = req.params;

    const simulation = await Simulation.findByIdAndDelete(id);

    if (!simulation) {
      return errorResponse(res, 404, 'Simulation not found');
    }

    return successResponse(res, 200, 'Simulation deleted successfully');
  } catch (error) {
    console.error('Error deleting simulation:', error);
    return errorResponse(res, 500, 'Error deleting simulation', error.message);
  }
};

// ============================================
// ENHANCED QUIZ MANAGEMENT
// ============================================

// Create quiz
export const createQuiz = async (req, res) => {
  try {
    const { title, description, duration, questions, course, degree, college, difficulty, passingScore, tags } = req.body;

    // Validate required fields
    if (!title || !description) {
      return errorResponse(res, 400, 'Title and description are required');
    }

    const quiz = new Quiz({
      title,
      description,
      duration: duration || 20,
      questions: questions || [],
      course,
      degree,
      college,
      difficulty: difficulty || 'Medium',
      passingScore: passingScore || 60,
      tags: tags || [],
      createdBy: req.user.id,
      status: 'Active',
      isActive: true
    });

    await quiz.save();

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.emit('quiz:created', {
        id: quiz._id,
        title: quiz.title,
        degree: quiz.degree
      });
    }

    return successResponse(res, 201, 'Quiz created successfully', { quiz });
  } catch (error) {
    console.error('Error creating quiz:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));
      return errorResponse(res, 400, 'Validation failed', errors);
    }
    
    return errorResponse(res, 500, 'Error creating quiz', error.message);
  }
};

// Update quiz
export const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const quiz = await Quiz.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!quiz) {
      return errorResponse(res, 404, 'Quiz not found');
    }

    return successResponse(res, 200, 'Quiz updated successfully', quiz);
  } catch (error) {
    console.error('Error updating quiz:', error);
    return errorResponse(res, 500, 'Error updating quiz', error.message);
  }
};

// Delete quiz
export const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findByIdAndDelete(id);

    if (!quiz) {
      return errorResponse(res, 404, 'Quiz not found');
    }

    return successResponse(res, 200, 'Quiz deleted successfully');
  } catch (error) {
    console.error('Error deleting quiz:', error);
    return errorResponse(res, 500, 'Error deleting quiz', error.message);
  }
};

// ============================================
// ENHANCED ANALYTICS
// ============================================

// Get detailed analytics
export const getDetailedAnalytics = async (req, res) => {
  try {
    const { college, degree, course, startDate, endDate } = req.query;

    // Build filter
    const filter = {};
    if (college) filter.college = new RegExp(college, 'i');
    if (degree) filter.degree = degree;
    if (course) filter.course = course;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Aggregate scores by college
    const collegePerformance = await Score.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$college',
          averageScore: { $avg: '$totalScore' },
          totalAttempts: { $sum: 1 },
          maxScore: { $max: '$totalScore' },
          minScore: { $min: '$totalScore' }
        }
      },
      { $sort: { averageScore: -1 } }
    ]);

    // Aggregate scores by degree
    const degreePerformance = await Score.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$degree',
          averageScore: { $avg: '$totalScore' },
          totalAttempts: { $sum: 1 }
        }
      },
      { $sort: { averageScore: -1 } }
    ]);

    // Aggregate scores by course
    const coursePerformance = await Score.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'courses',
          localField: 'course',
          foreignField: '_id',
          as: 'courseDetails'
        }
      },
      { $unwind: { path: '$courseDetails', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$course',
          courseName: { $first: '$courseDetails.courseName' },
          averageScore: { $avg: '$totalScore' },
          totalAttempts: { $sum: 1 }
        }
      },
      { $sort: { averageScore: -1 } }
    ]);

    // Get top performers
    const topPerformers = await Score.find(filter)
      .populate('student', 'fullName email college')
      .sort({ totalScore: -1 })
      .limit(10);

    // Simulation vs Quiz performance
    const performanceByType = await Score.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$simulationType',
          averageScore: { $avg: '$totalScore' },
          totalAttempts: { $sum: 1 }
        }
      }
    ]);

    return successResponse(res, 200, 'Analytics fetched successfully', {
      collegePerformance,
      degreePerformance,
      coursePerformance,
      topPerformers,
      performanceByType
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return errorResponse(res, 500, 'Error fetching analytics', error.message);
  }
};

// Get license expiry report
export const getLicenseExpiryReport = async (req, res) => {
  try {
    const daysThreshold = parseInt(req.query.days) || 30;
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    const expiringLicenses = await License.find({
      expiryDate: {
        $gte: new Date(),
        $lte: thresholdDate
      },
      status: 'Active'
    }).sort({ expiryDate: 1 });

    const expiredLicenses = await License.find({
      expiryDate: { $lt: new Date() }
    }).sort({ expiryDate: -1 });

    return successResponse(res, 200, 'License expiry report fetched successfully', {
      expiringLicenses,
      expiredLicenses,
      summary: {
        expiringSoon: expiringLicenses.length,
        expired: expiredLicenses.length,
        daysThreshold
      }
    });
  } catch (error) {
    console.error('Error fetching license expiry report:', error);
    return errorResponse(res, 500, 'Error fetching license expiry report', error.message);
  }
};

// Get student performance by college
export const getStudentPerformance = async (req, res) => {
  try {
    const { college, studentId } = req.query;

    const filter = {};
    if (college) filter.college = new RegExp(college, 'i');
    if (studentId) filter.student = studentId;

    const performance = await Score.find(filter)
      .populate('student', 'fullName email college')
      .populate('quiz', 'title difficulty')
      .populate('course', 'courseName courseCode')
      .sort({ submittedAt: -1 });

    return successResponse(res, 200, 'Student performance fetched successfully', performance);
  } catch (error) {
    console.error('Error fetching student performance:', error);
    return errorResponse(res, 500, 'Error fetching student performance', error.message);
  }
};