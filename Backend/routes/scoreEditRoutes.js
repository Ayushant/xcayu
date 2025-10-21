/**
 * Score Editing Routes
 * 
 * Routes for admin score viewing and editing
 */

import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import {
  getScoreDetails,
  getQuizScores,
  editTotalScore,
  editQuestionScore,
  getScoreEditHistory
} from '../controllers/scoreEditController.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(adminOnly);

// Get detailed score with answers and instructions
router.get('/:scoreId/details', getScoreDetails);

// Get all scores for a quiz
router.get('/quiz/:quizId', getQuizScores);

// Edit total score
router.put('/:scoreId/edit-total', editTotalScore);

// Edit per-question score
router.put('/:scoreId/edit-question/:questionIndex', editQuestionScore);

// Get score edit history
router.get('/:scoreId/edit-history', getScoreEditHistory);

export default router;

