import express from "express";
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import { getLicenseWatcher } from '../utils/licenseWatcher.js';
import {
  getOverview,
  getLicenses,
  getUsers,
  getQuizzes,
  getResults,
  getResultById,
  getActivity,
  getCollegeStats,
  createLicense,
  updateLicense,
  deleteLicense,
  deleteUser,
  getUserById,
  updateUserStatus,
  updateStudentCounts,
  createUser,
  updateUser,
  // Course management
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  // Simulation management
  getSimulations,
  createSimulationTemplate,
  updateSimulation,
  deleteSimulation,
  // Enhanced quiz management
  createQuiz,
  updateQuiz,
  deleteQuiz,
  // Enhanced analytics
  getDetailedAnalytics,
  getLicenseExpiryReport,
  getStudentPerformance
} from '../controllers/superAdminController.js';
import {
  getDegreePerformanceBreakdown,
  getStudentTrendLine,
  getComparativeCollegeAnalytics,
  getTimeBasedAnalysis,
  getImprovementRankings
} from '../controllers/enhancedAnalyticsController.js';
import { 
  validateLicense, 
  validateCourse, 
  validateQuiz,
  validateSimulation,
  validateMongoId,
  validatePagination 
} from '../middleware/validationMiddleware.js';

const router = express.Router();

// Authentication routes
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, role: "superadmin" });
    if (!user) return res.status(400).json({ message: "User not found or not superadmin" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        fullName: user.fullName
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Dashboard overview
router.get("/overview", protect, adminOnly, getOverview);

// User management
router.get("/users", protect, adminOnly, getUsers);
router.post("/users", protect, adminOnly, createUser);
router.get("/users/:id", protect, adminOnly, getUserById);
router.put("/users/:id", protect, adminOnly, updateUser);
router.delete("/users/:id", protect, adminOnly, deleteUser);
router.put("/users/:id/status", protect, adminOnly, updateUserStatus);

// License management
router.get("/licenses", protect, adminOnly, validatePagination, getLicenses);
router.post("/licenses", protect, adminOnly, validateLicense, createLicense);
router.put("/licenses/:id", protect, adminOnly, validateMongoId, updateLicense);
router.delete("/licenses/:id", protect, adminOnly, validateMongoId, deleteLicense);

// Course management
router.get("/courses", protect, adminOnly, validatePagination, getCourses);
router.post("/courses", protect, adminOnly, validateCourse, createCourse);
router.put("/courses/:id", protect, adminOnly, validateMongoId, updateCourse);
router.delete("/courses/:id", protect, adminOnly, validateMongoId, deleteCourse);

// Simulation management
router.get("/simulations", protect, adminOnly, validatePagination, getSimulations);
router.post("/simulations", protect, adminOnly, validateSimulation, createSimulationTemplate);
router.put("/simulations/:id", protect, adminOnly, validateMongoId, updateSimulation);
router.delete("/simulations/:id", protect, adminOnly, validateMongoId, deleteSimulation);

// Quiz management
router.get("/quizzes", protect, adminOnly, validatePagination, getQuizzes);
router.post("/quizzes", protect, adminOnly, validateQuiz, createQuiz);
router.put("/quizzes/:id", protect, adminOnly, validateMongoId, updateQuiz);
router.delete("/quizzes/:id", protect, adminOnly, validateMongoId, deleteQuiz);

// Results management
router.get("/results", protect, adminOnly, validatePagination, getResults);
router.get("/results/:id", protect, adminOnly, validateMongoId, getResultById);

// Activity feed
router.get("/activity", protect, adminOnly, getActivity);

// College statistics
router.get("/college-stats", protect, adminOnly, getCollegeStats);

// Enhanced analytics
router.get("/analytics", protect, adminOnly, getDetailedAnalytics);
router.get("/analytics/license-expiry", protect, adminOnly, getLicenseExpiryReport);
router.get("/analytics/student-performance", protect, adminOnly, getStudentPerformance);

// Advanced analytics
router.get("/analytics/degree-breakdown", protect, adminOnly, getDegreePerformanceBreakdown);
router.get("/analytics/student-trend/:studentId", protect, adminOnly, getStudentTrendLine);
router.get("/analytics/comparative-colleges", protect, adminOnly, getComparativeCollegeAnalytics);
router.get("/analytics/time-based", protect, adminOnly, getTimeBasedAnalysis);
router.get("/analytics/improvement-rankings", protect, adminOnly, getImprovementRankings);

// Update student counts for all licenses
router.post("/update-student-counts", protect, adminOnly, async (req, res) => {
  try {
    await updateStudentCounts();
    res.json({ message: 'Student counts updated successfully' });
  } catch (error) {
    console.error('Error updating student counts:', error);
    res.status(500).json({ message: 'Error updating student counts', error: error.message });
  }
});

// License Control Routes (Real-time lock/unlock)
/**
 * Manually disable a license
 * Triggers real-time Socket.IO events to all affected users
 */
router.post("/licenses/:id/disable", protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const licenseWatcher = getLicenseWatcher();
    
    const license = await licenseWatcher.handleManualDisable(id, req.user.email);
    
    res.json({
      success: true,
      message: 'License disabled successfully',
      license: {
        id: license._id,
        college: license.college,
        status: license.status
      }
    });
  } catch (error) {
    console.error('Error disabling license:', error);
    res.status(500).json({
      success: false,
      message: 'Error disabling license',
      error: error.message
    });
  }
});

/**
 * Manually reactivate a license
 * Triggers real-time Socket.IO events to all affected users
 */
router.post("/licenses/:id/reactivate", protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const licenseWatcher = getLicenseWatcher();
    
    const license = await licenseWatcher.handleManualReactivate(id, req.user.email);
    
    res.json({
      success: true,
      message: 'License reactivated successfully',
      license: {
        id: license._id,
        college: license.college,
        status: license.status
      }
    });
  } catch (error) {
    console.error('Error reactivating license:', error);
    res.status(500).json({
      success: false,
      message: 'Error reactivating license',
      error: error.message
    });
  }
});

/**
 * Get real-time license status
 * Returns current status including expiry and limit information
 */
router.get("/licenses/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const License = (await import('../models/licenseModel.js')).default;
    const license = await License.findById(id);
    
    if (!license) {
      return res.status(404).json({
        success: false,
        message: 'License not found'
      });
    }

    const licenseWatcher = getLicenseWatcher();
    const status = await licenseWatcher.getLicenseStatus(license.college);
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error getting license status:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting license status',
      error: error.message
    });
  }
});

/**
 * Force check a specific license
 * Useful for immediate validation after updates
 */
router.post("/licenses/:id/check", protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const licenseWatcher = getLicenseWatcher();
    
    const status = await licenseWatcher.checkLicense(id);
    
    res.json({
      success: true,
      message: 'License checked successfully',
      status
    });
  } catch (error) {
    console.error('Error checking license:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking license',
      error: error.message
    });
  }
});

export default router;
