import License from '../models/licenseModel.js';
import User from '../models/userModel.js';

/**
 * Simulation Guard Middleware
 * 
 * Purpose: Prevent students from accessing simulations when:
 * - College license has expired
 * - College license is inactive/suspended
 * - Student limit has been exceeded
 * - College has no valid license
 * 
 * This middleware runs before simulation/quiz access endpoints
 * and returns meaningful error messages to the frontend.
 */

/**
 * Check if student can access simulation
 * Validates license status and student limits in real-time
 */
export const checkSimulationAccess = async (req, res, next) => {
  try {
    const userId = req.user.id; // From JWT token
    const userRole = req.user.role;

    // Super admins bypass all checks
    if (userRole === 'superadmin') {
      return next();
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        blocked: true
      });
    }

    // Students must have a college assigned
    if (!user.college) {
      return res.status(403).json({
        success: false,
        message: 'No college assigned',
        details: 'Please contact your administrator to assign you to a college.',
        blocked: true
      });
    }

    // Find license for this college
    const license = await License.findOne({ college: user.college });

    if (!license) {
      return res.status(403).json({
        success: false,
        message: 'No active license',
        details: `No license found for ${user.college}. Please contact your college administrator.`,
        blocked: true,
        reason: 'NO_LICENSE'
      });
    }

    // Check if license is expired
    const now = new Date();
    if (license.expiryDate < now) {
      return res.status(403).json({
        success: false,
        message: 'License expired',
        details: `Your college's license expired on ${license.expiryDate.toLocaleDateString()}. Simulations and quizzes are temporarily unavailable.`,
        blocked: true,
        reason: 'LICENSE_EXPIRED',
        expiryDate: license.expiryDate
      });
    }

    // Check if license is active
    if (license.status !== 'Active') {
      return res.status(403).json({
        success: false,
        message: 'License suspended',
        details: `Your college's license is currently ${license.status}. Please contact your college administrator.`,
        blocked: true,
        reason: 'LICENSE_SUSPENDED',
        status: license.status
      });
    }

    // Check student count limit
    const currentStudentCount = await User.countDocuments({
      role: 'student',
      college: user.college
    });

    // Update the license with current count
    await License.findByIdAndUpdate(license._id, {
      currentStudents: currentStudentCount
    });

    if (currentStudentCount > license.maxStudents) {
      return res.status(403).json({
        success: false,
        message: 'Student limit exceeded',
        details: `Your college has exceeded the maximum student limit (${license.maxStudents}). New simulation access is temporarily restricted.`,
        blocked: true,
        reason: 'STUDENT_LIMIT_EXCEEDED',
        currentCount: currentStudentCount,
        maxAllowed: license.maxStudents
      });
    }

    // Check if user's degree matches the simulation they're trying to access
    // This is checked via query params or request body
    const requestedDegree = req.query.degree || req.body.degree || req.params.degree;
    if (requestedDegree && user.degree) {
      if (user.degree !== requestedDegree) {
        return res.status(403).json({
          success: false,
          message: 'Simulation access denied',
          details: `You are enrolled in ${user.degree} and cannot access ${requestedDegree} simulations. Please use the correct simulation for your degree.`,
          blocked: true,
          reason: 'DEGREE_MISMATCH',
          userDegree: user.degree,
          requestedDegree: requestedDegree
        });
      }
    }

    // All checks passed - add license info to request
    req.license = license;
    req.studentCollege = user.college;
    req.userDegree = user.degree;
    
    next();
  } catch (error) {
    console.error('Simulation access check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error validating access',
      details: 'An error occurred while checking your simulation access permissions.'
    });
  }
};

/**
 * Check if admin can create/manage content
 * Validates license for content creation
 */
export const checkContentCreationAccess = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    
    // Super admins bypass all checks
    if (userRole === 'superadmin') {
      return next();
    }

    // Get user details for college admin
    if (userRole === 'admin' || userRole === 'collegeAdmin') {
      const user = await User.findById(req.user.id);
      
      if (!user || !user.college) {
        return res.status(403).json({
          success: false,
          message: 'No college assigned',
          details: 'You must be assigned to a college to create content.'
        });
      }

      // Find license
      const license = await License.findOne({ college: user.college });

      if (!license) {
        return res.status(403).json({
          success: false,
          message: 'No license found',
          details: 'Your college does not have a valid license.'
        });
      }

      // Check expiry
      if (license.expiryDate < new Date()) {
        return res.status(403).json({
          success: false,
          message: 'License expired',
          details: 'Your college license has expired. Content creation is disabled.'
        });
      }

      // Check status
      if (license.status !== 'Active') {
        return res.status(403).json({
          success: false,
          message: 'License inactive',
          details: 'Your college license is currently inactive.'
        });
      }

      req.license = license;
      req.adminCollege = user.college;
    }

    next();
  } catch (error) {
    console.error('Content creation access check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error validating access'
    });
  }
};

/**
 * Real-time license status check
 * Returns current license status without blocking
 * Useful for dashboard widgets
 */
export const getLicenseStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user || !user.college) {
      return res.json({
        success: true,
        status: 'NO_COLLEGE',
        message: 'No college assigned',
        canAccessSimulations: false
      });
    }

    const license = await License.findOne({ college: user.college });

    if (!license) {
      return res.json({
        success: true,
        status: 'NO_LICENSE',
        message: 'No license found',
        canAccessSimulations: false
      });
    }

    const now = new Date();
    const isExpired = license.expiryDate < now;
    const isInactive = license.status !== 'Active';
    
    const currentStudentCount = await User.countDocuments({
      role: 'student',
      college: user.college
    });
    
    const isLimitExceeded = currentStudentCount > license.maxStudents;
    const isLimitWarning = currentStudentCount >= license.maxStudents * 0.9;

    // Calculate days until expiry
    const daysUntilExpiry = Math.ceil((license.expiryDate - now) / (1000 * 60 * 60 * 24));
    const expiryWarning = daysUntilExpiry <= 7 && daysUntilExpiry > 0;

    return res.json({
      success: true,
      status: isExpired ? 'EXPIRED' : isInactive ? 'INACTIVE' : isLimitExceeded ? 'LIMIT_EXCEEDED' : 'ACTIVE',
      canAccessSimulations: !isExpired && !isInactive && !isLimitExceeded,
      license: {
        college: license.college,
        expiryDate: license.expiryDate,
        status: license.status,
        currentStudents: currentStudentCount,
        maxStudents: license.maxStudents,
        daysUntilExpiry,
        expiryWarning,
        limitWarning: isLimitWarning
      },
      warnings: {
        expired: isExpired,
        expiringSoon: expiryWarning,
        limitExceeded: isLimitExceeded,
        limitWarning: isLimitWarning
      }
    });
  } catch (error) {
    console.error('License status check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking license status'
    });
  }
};

export default {
  checkSimulationAccess,
  checkContentCreationAccess,
  getLicenseStatus
};

