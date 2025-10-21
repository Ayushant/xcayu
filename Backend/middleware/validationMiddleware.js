import { body, param, query, validationResult } from 'express-validator';
import { errorResponse } from '../utils/errorHandler.js';

// Middleware to check validation results
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('Validation errors:', JSON.stringify(errors.array(), null, 2));
    console.error('Request body:', JSON.stringify(req.body, null, 2));
    return errorResponse(res, 400, 'Validation Error', errors.array());
  }
  next();
};

// License validation rules
export const validateLicense = [
  body('college')
    .trim()
    .notEmpty().withMessage('College name is required')
    .isLength({ min: 3, max: 100 }).withMessage('College name must be between 3 and 100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('maxStudents')
    .notEmpty().withMessage('Max students is required')
    .isInt({ min: 1 }).withMessage('Max students must be at least 1')
    .toInt(),
  body('expiryDate')
    .notEmpty().withMessage('Expiry date is required')
    .isISO8601().withMessage('Invalid date format')
    .toDate(),
  validate
];

// Course validation rules
export const validateCourse = [
  body('courseName')
    .trim()
    .notEmpty().withMessage('Course name is required')
    .isLength({ min: 3, max: 100 }).withMessage('Course name must be between 3 and 100 characters'),
  body('courseCode')
    .trim()
    .notEmpty().withMessage('Course code is required')
    .isLength({ min: 2, max: 20 }).withMessage('Course code must be between 2 and 20 characters'),
  body('department')
    .trim()
    .notEmpty().withMessage('Department is required'),
  validate
];

// Quiz validation rules
export const validateQuiz = [
  body('title')
    .trim()
    .notEmpty().withMessage('Quiz title is required')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required'),
  body('duration')
    .optional()
    .isInt({ min: 1, max: 180 }).withMessage('Duration must be between 1 and 180 minutes'),
  body('questions')
    .optional()
    .isArray().withMessage('Questions must be an array'),
  validate
];

// Simulation validation rules
export const validateSimulation = [
  body('simulationName')
    .trim()
    .notEmpty().withMessage('Simulation name is required')
    .isLength({ min: 3, max: 100 }).withMessage('Simulation name must be between 3 and 100 characters'),
  body('college')
    .optional()
    .trim(),
  body('course')
    .optional()
    .isMongoId().withMessage('Invalid course ID'),
  body('degree')
    .optional()
    .isIn(['MBA', 'BE', 'BTech', 'Law', 'BBA', 'BCA', 'MCA', 'MSc', 'BSc', 'MTech', 'BA', 'MA', 'PhD', 'Other', ''])
    .withMessage('Invalid degree'),
  validate
];

// User validation rules
export const validateUser = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters'),
  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['student', 'admin', 'superadmin', 'collegeAdmin']).withMessage('Invalid role'),
  validate
];

// Pagination validation
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  validate
];

// MongoDB ID validation
export const validateMongoId = [
  param('id')
    .isMongoId().withMessage('Invalid ID format'),
  validate
];

