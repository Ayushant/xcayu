import License from '../models/licenseModel.js';
import User from '../models/userModel.js';

// Check if college has valid license
export const checkLicenseValidity = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // For superadmin, skip license check
    if (req.body.role === 'superadmin') {
      return next();
    }

    // For college admin, find license by email and password
    if (req.body.role === 'admin' || req.body.role === 'collegeAdmin') {
      const license = await License.findOne({ 
        email: email,
        password: password // Direct password comparison for license
      });

      if (!license) {
        return res.status(403).json({
          message: 'Invalid license credentials',
          details: 'No license found with this email and password. Please check your credentials.'
        });
      }

      // Check if license is expired
      const now = new Date();
      if (license.expiryDate < now) {
        return res.status(403).json({
          message: 'License expired',
          details: `Your license expired on ${license.expiryDate.toLocaleDateString()}. Please contact the super admin to renew.`
        });
      }

      // Check if license is active
      if (license.status !== 'Active') {
        return res.status(403).json({
          message: 'License inactive',
          details: 'Your license is currently inactive. Please contact the super admin.'
        });
      }

      // Add license info to request for further use
      req.license = license;
      next();
      return;
    }

    // For students, find by college
    const user = await User.findOne({ email, role: 'student' });
    if (!user) {
      return res.status(404).json({
        message: 'Student not found',
        details: 'No student account found with this email.'
      });
    }

    // Find the license for this college
    const license = await License.findOne({ 
      college: user.college
    });

    if (!license) {
      return res.status(403).json({
        message: 'No license found',
        details: 'Your college does not have a valid license. Please contact your college admin.'
      });
    }

    // Check if license is expired
    const now = new Date();
    if (license.expiryDate < now) {
      return res.status(403).json({
        message: 'License expired',
        details: `Your college's license expired on ${license.expiryDate.toLocaleDateString()}. Please contact your college admin.`
      });
    }

    // Check if license is active
    if (license.status !== 'Active') {
      return res.status(403).json({
        message: 'License inactive',
        details: 'Your college\'s license is currently inactive. Please contact your college admin.'
      });
    }

    // Add license info to request for further use
    req.license = license;
    next();
  } catch (error) {
    console.error('License validation error:', error);
    res.status(500).json({
      message: 'Server error',
      details: 'An error occurred while validating your license.'
    });
  }
};

// Check student count limit for college admin
export const checkStudentLimit = async (req, res, next) => {
  try {
    console.log('🔍 Checking student limit...');
    
    // Get college from the authenticated user (college admin)
    const college = req.user.college;
    
    if (!college) {
      console.log('❌ No college found for user');
      return res.status(403).json({
        message: 'No college found',
        details: 'College admin must be associated with a college.'
      });
    }
    
    console.log(`📋 Checking limits for college: ${college}`);
    
    // Find the license for this college
    const license = await License.findOne({ college });
    
    if (!license) {
      console.log('❌ No license found for college');
      return res.status(403).json({
        message: 'No license found',
        details: 'This college does not have a valid license.'
      });
    }

    console.log(`📊 License found - Max students: ${license.maxStudents}`);

    // Count current students for this college
    const currentStudentCount = await User.countDocuments({ 
      role: 'student', 
      college: college 
    });

    console.log(`👥 Current student count: ${currentStudentCount}`);

    // Update current student count in license
    await License.findByIdAndUpdate(license._id, {
      currentStudents: currentStudentCount
    });

    // Check if student limit is reached
    if (currentStudentCount >= license.maxStudents) {
      console.log(`🚫 STUDENT LIMIT REACHED! ${currentStudentCount}/${license.maxStudents}`);
      return res.status(403).json({
        message: 'Student limit reached',
        details: `You have reached the maximum student limit (${license.maxStudents}) for your college. Please contact the super admin to increase your license limit.`
      });
    }

    console.log(`✅ Student limit check passed - ${currentStudentCount}/${license.maxStudents}`);
    req.license = license;
    next();
  } catch (error) {
    console.error('Student limit check error:', error);
    res.status(500).json({
      message: 'Server error',
      details: 'An error occurred while checking student limits.'
    });
  }
};

// Check if student can login (college has valid license and within limits)
export const checkStudentLogin = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    // Find the student
    const student = await User.findOne({ email, role: 'student' });
    if (!student) {
      return res.status(404).json({
        message: 'Student not found',
        details: 'No student account found with this email.'
      });
    }

    // Find the license for this college
    const license = await License.findOne({ college: student.college });
    
    if (!license) {
      return res.status(403).json({
        message: 'No license found',
        details: 'Your college does not have a valid license. Please contact your college admin.'
      });
    }

    // Check if license is expired
    const now = new Date();
    if (license.expiryDate < now) {
      return res.status(403).json({
        message: 'License expired',
        details: `Your college's license expired on ${license.expiryDate.toLocaleDateString()}. Please contact your college admin.`
      });
    }

    // Check if license is active
    if (license.status !== 'Active') {
      return res.status(403).json({
        message: 'License inactive',
        details: 'Your college\'s license is currently inactive. Please contact your college admin.'
      });
    }

    // Count current students for this college
    const currentStudentCount = await User.countDocuments({ 
      role: 'student', 
      college: student.college 
    });

    // Update current student count in license
    await License.findByIdAndUpdate(license._id, {
      currentStudents: currentStudentCount
    });

    // Check if student count is within limits
    if (currentStudentCount > license.maxStudents) {
      return res.status(403).json({
        message: 'Student limit exceeded',
        details: `Your college has exceeded the maximum student limit (${license.maxStudents}). Please contact your college admin.`
      });
    }

    req.license = license;
    req.student = student;
    next();
  } catch (error) {
    console.error('Student login check error:', error);
    res.status(500).json({
      message: 'Server error',
      details: 'An error occurred while validating student access.'
    });
  }
};
