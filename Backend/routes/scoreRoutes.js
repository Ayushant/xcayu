import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import {
  getAllScores,
  getRealStudentScores,
  getScoresByQuiz,
  getScoresByStudent,
  updateScore,
  submitSimulation,
  getMyScores,
  getScoreById,
  editScoreByAdmin
} from '../controllers/scoreController.js';
import { submitQuiz } from '../controllers/quizSubmissionController.js';

const router = express.Router();

// Protected routes (require authentication)
router.post('/submit', protect, submitQuiz);
router.post('/submit-simulation', protect, submitSimulation);
router.get('/my-scores', protect, getMyScores);
router.get('/student/:studentId', protect, getScoresByStudent);

// Admin routes
router.get('/', protect, adminOnly, getAllScores);
router.get('/real-students', protect, adminOnly, getRealStudentScores);
router.get('/quiz/:quizId', protect, adminOnly, getScoresByQuiz);
router.get('/:id', protect, adminOnly, getScoreById);
router.put('/:id', protect, adminOnly, updateScore);
router.put('/:id/edit', protect, adminOnly, editScoreByAdmin);

export default router;
