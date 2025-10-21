import User from "../models/userModel.js";
import { generateToken } from '../utils/generateToken.js';
import bcrypt from 'bcryptjs';
import { logger } from '../utils/logger.js';

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken(user._id, user.role, '30d');

    logger.info(`User logged in: ${email}`);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        college: user.college
      },
      redirect: user.role === 'student' 
        ? '/student/dashboard'
        : user.role === 'admin'
        ? '/admin/dashboard'
        : '/superadmin/dashboard'
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ message: "Server error" });
  }
};
