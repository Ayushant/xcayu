import express from 'express';
import {
  addStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  startQuizForAll,
  stopQuizForAll,
  controlStudentQuiz,
  getQuizStats,
  getDetailedStudentData,
  getStudentDetailedScores
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { checkLicenseValidity } from '../middleware/licenseMiddleware.js';
import User from '../models/userModel.js';
import Score from '../models/scoreModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import '../models/simulationModel.js';
import mongoose from 'mongoose';

const router = express.Router();
const Simulation = mongoose.model('Simulation');

// Admin login route
router.post('/login', checkLicenseValidity, async (req, res) => {
  try {
    console.log('Admin login attempt:', req.body);
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      console.log('Missing credentials:', { email: !!email, password: !!password });
      return res.status(400).json({ 
        message: 'Please provide both email and password',
        details: !email ? 'Email is required' : 'Password is required'
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ 
        message: 'Invalid credentials',
        details: 'No account found with this email. Please check your email address or register.'
      });
    }

    console.log('User found:', { email: user.email, role: user.role });

    // Check role
    if (user.role !== 'admin') {
      console.log('Invalid role:', user.role);
      return res.status(403).json({ 
        message: 'Access denied',
        details: 'This account does not have admin privileges. Please use the correct role when logging in.'
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Invalid password for:', email);
      return res.status(401).json({ 
        message: 'Invalid credentials',
        details: 'Incorrect password. Please try again.'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    console.log('Login successful:', { email: user.email, role: user.role });

    // Send response
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.fullName || user.name,
        email: user.email,
        role: user.role,
        college: user.college
      },
      license: {
        maxStudents: req.license.maxStudents,
        currentStudents: req.license.currentStudents,
        expiryDate: req.license.expiryDate,
        status: req.license.status
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove duplicate POST route - will be handled by controller below

router.get('/dashboard-stats', protect, adminOnly, async (req, res) => {
  try {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    // Get admin's college for filtering
    const adminCollege = req.user.college;
    if (!adminCollege) {
      return res.status(400).json({
        message: 'College not assigned',
        details: 'Admin user must have a college assigned to view dashboard stats'
      });
    }

    console.log('Admin Dashboard Stats for college', adminCollege + ':');

    // Get all students for this college
    const allStudents = await User.find({ 
      role: 'student',
      college: adminCollege
    });
    
    const totalStudents = allStudents.length;
    
    // Get students created in the last month
    const lastMonthStudents = await User.countDocuments({
      role: 'student',
      college: adminCollege,
      createdAt: { $gte: lastMonth }
    });

    // Get scores for students from this college only
    const studentIds = allStudents.map(s => s._id);
    
    // Active sessions (scores with status 'in-progress')
    const activeSessions = await Score.countDocuments({
      student: { $in: studentIds },
      status: 'in-progress'
    });
    
    // Completed sessions today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const completedToday = await Score.countDocuments({
      student: { $in: studentIds },
      status: 'completed',
      submittedAt: { $gte: today }
    });
    
    // Completed sessions last week for comparison
    const completedLastWeek = await Score.countDocuments({
      student: { $in: studentIds },
      status: 'completed',
      submittedAt: { $gte: lastWeek }
    });

    // Calculate average score for completed quizzes
    const completedScores = await Score.find({
      student: { $in: studentIds },
      status: 'completed',
      totalScore: { $exists: true, $ne: null }
    }, 'totalScore');
    
    const averageScore = completedScores.length > 0 
      ? (completedScores.reduce((sum, score) => sum + score.totalScore, 0) / completedScores.length).toFixed(1)
      : '0.0';

    // Calculate changes
    const totalStudentsChange = lastMonthStudents === 0 ? 0 : 
      (((totalStudents - lastMonthStudents) / lastMonthStudents) * 100).toFixed(1);

    const completedChange = completedLastWeek === 0 ? 0 :
      (((completedToday - completedLastWeek) / completedLastWeek) * 100).toFixed(1);

    const stats = {
      totalStudents: {
        value: totalStudents,
        change: totalStudentsChange
      },
      activeSessions: {
        value: activeSessions,
        change: '0.0' // Can be enhanced later
      },
      completedSessions: {
        value: completedToday,
        change: completedChange
      },
      averageScore: {
        value: averageScore,
        change: '0.0' // Can be enhanced later
      }
    };

    console.log('Admin Dashboard Stats for college', adminCollege + ':', stats);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ 
      message: 'Error fetching dashboard stats',
      details: error.message
    });
  }
});

// Apply authentication middleware to all routes below
router.use(protect);
router.use(adminOnly);

// Student management routes
router.route('/students')
  .get(getStudents)
  .post(addStudent);

router.route('/students/:id')
  .get(getStudentById)
  .put(updateStudent)
  .delete(deleteStudent);

// Quiz control routes
router.post('/quiz/start-all', startQuizForAll);
router.post('/quiz/stop-all', stopQuizForAll);
router.post('/control/student/:studentId/:action', controlStudentQuiz);

// Quiz status route
router.get('/quiz-status', protect, adminOnly, async (req, res) => {
  try {
    const anyRunning = await User.exists({ 
      role: 'student',
      quizStatus: 'running'
    });
    
    res.json({ status: anyRunning ? 'running' : 'stopped' });
  } catch (error) {
    console.error('Error checking quiz status:', error);
    res.status(500).json({ 
      message: 'Error checking quiz status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

// Stats route (deprecated)
router.get('/stats', getQuizStats);

// Detailed student data routes
router.get('/detailed-students', getDetailedStudentData);
router.get('/students/:studentId/detailed-scores', getStudentDetailedScores);

export default router;
