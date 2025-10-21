import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

// Protect routes middleware
export const protect = async (req, res, next) => {
  try {
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return next();
    }

    // Check for authorization header
    if (!req.headers.authorization) {
      return res.status(401).json({
        message: 'Not authorized - No token',
        details: 'Please login to access this resource.'
      });
    }

    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

    if (!token) {
      return res.status(401).json({
        message: 'Not authorized - No token',
        details: 'Please login to access this resource.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      
      if (!decoded || !decoded.id) {
        return res.status(401).json({
          message: 'Not authorized - Invalid token',
          details: 'Your session has expired or is invalid. Please login again.'
        });
      }

      // Get user from token
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({
          message: 'Not authorized - User not found',
          details: 'The user associated with this token no longer exists.'
        });
      }

      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({
        message: 'Not authorized - Invalid token',
        details: 'Your session has expired or is invalid. Please login again.'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      message: 'Server error',
      details: 'An unexpected error occurred while processing your request.'
    });
  }
};

// Admin only middleware
export const adminOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin' || req.user.role === 'collegeAdmin')) {
    next();
  } else {
    res.status(403).json({ 
      message: 'Access denied. Admin privileges required.' 
    });
  }
};

// College Admin only middleware
export const isCollegeAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'collegeAdmin') {
    next();
  } else {
    res.status(403).json({ 
      message: 'Access denied. College Admin privileges required.' 
    });
  }
};
