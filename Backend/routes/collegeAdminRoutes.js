import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { checkLicenseValidity, checkStudentLimit } from '../middleware/licenseMiddleware.js';
import { 
  getCollegeStudents, 
  addStudent, 
  getCollegeScores,
  getStudentScore,
  getScoreDetails,
  editScore
} from '../controllers/collegeAdminController.js';
import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

// College Admin login route - uses license credentials directly
router.post('/login', checkLicenseValidity, async (req, res) => {
  try {
    const { email, password, simulation, degree } = req.body;
    
    // Check if license validation passed
    if (!req.license) {
      return res.status(403).json({
        message: 'License validation failed',
        details: 'No valid license found for these credentials.'
      });
    }
    
    console.log('License validation passed for:', email);
    console.log('License data:', req.license);
    
    // Find existing user or create new one
    let user = await User.findOne({ email: email });
    
    if (!user) {
      // Create a new college admin user for this license
      const hashedPassword = await bcrypt.hash(password, 10);
      
      user = new User({
        email: email,
        password: hashedPassword,
        fullName: `Admin of ${req.license.college}`,
        role: 'collegeAdmin',
        college: req.license.college,
        degree: '',
        isActive: true
      });
      
      await user.save();
      console.log(`Created college admin user for license: ${email}`);
    } else {
      // Update existing user to be college admin
      user.role = 'collegeAdmin';
      user.college = req.license.college;
      user.fullName = `Admin of ${req.license.college}`;
      user.isActive = true;
      
      await user.save();
      console.log(`Updated existing user to college admin: ${email}`);
    }
    
    // SIMULATION ACCESS CONTROL: Check if admin's degree matches the requested simulation
    // For college admins, allow access to all simulations
    // Individual student access control will be handled at the student level

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key';
    const token = jwt.sign(
      { id: user._id, role: user.role },
      jwtSecret,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        college: user.college,
        degree: user.degree
      },
      license: {
        maxStudents: req.license.maxStudents,
        currentStudents: req.license.currentStudents,
        expiryDate: req.license.expiryDate,
        status: req.license.status
      }
    });
  } catch (error) {
    console.error('College admin login error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      message: 'Server error',
      details: `An error occurred during login: ${error.message}`,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Protect all other routes - only college admin can access
router.use(protect);

router.get('/students', getCollegeStudents);
router.post('/students/add', checkStudentLimit, addStudent);
router.get('/scores', getCollegeScores);
router.get('/scores/:studentId', getStudentScore);
router.get('/score-details/:scoreId', getScoreDetails);
router.put('/score-edit/:scoreId', editScore);

// Debug route to test middleware
router.post('/test-limit', checkStudentLimit, (req, res) => {
  res.json({ message: 'Limit check passed', college: req.user.college });
});

export default router;
