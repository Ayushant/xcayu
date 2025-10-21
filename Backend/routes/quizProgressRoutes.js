import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  startQuiz,
  getProgress,
  saveAnswer,
  checkSubmission,
  getQuizDetails,
  abandonQuiz,
  completeQuizProgress,
  getQuizResults
} from '../controllers/quizProgressController.js';

const router = express.Router();

/**
 * Quiz Progress Routes
 * 
 * Handles student quiz session management and progress tracking
 * All routes require authentication (protect middleware)
 */

// Start or resume a quiz
// POST /api/quiz-progress/start
// Body: { quizId }
router.post('/start', protect, startQuiz);

// Get current progress for a quiz
// GET /api/quiz-progress/:quizId
router.get('/:quizId', protect, getProgress);

// Save answer to current question
// POST /api/quiz-progress/:quizId/answer
// Body: { questionIndex, selectedRanking, selectedOption, instruction, reasoning }
router.post('/:quizId/answer', protect, saveAnswer);

// Check if quiz already submitted
// GET /api/quiz-progress/:quizId/check-submission
router.get('/:quizId/check-submission', protect, checkSubmission);

// Get quiz details for taking
// GET /api/quiz-progress/:quizId/quiz
router.get('/:quizId/quiz', protect, getQuizDetails);

// Mark quiz as abandoned
// POST /api/quiz-progress/:quizId/abandon
router.post('/:quizId/abandon', protect, abandonQuiz);

// Mark progress as complete (before final submission)
// POST /api/quiz-progress/:quizId/complete
router.post('/:quizId/complete', protect, completeQuizProgress);

// Get quiz results with impact text
// GET /api/quiz-progress/:quizId/results/:scoreId
router.get('/:quizId/results/:scoreId', protect, getQuizResults);

export default router;
