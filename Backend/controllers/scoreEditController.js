/**
 * Score Editing Controller
 * 
 * Allows admins to view student answers, instructions, and edit scores
 */

import Score from '../models/scoreModel.js';
import User from '../models/userModel.js';
import { successResponse, errorResponse } from '../utils/errorHandler.js';

/**
 * Get detailed score with all answers and instructions
 * @route GET /api/scores/:scoreId/details
 */
export const getScoreDetails = async (req, res) => {
  try {
    const { scoreId } = req.params;
    
    const score = await Score.findById(scoreId)
      .populate('student', 'fullName email college course')
      .populate('quiz', 'title description preface course')
      .populate('course', 'courseName courseCode')
      .populate({
        path: 'scoreEdits.editedBy',
        select: 'fullName email role'
      });
    
    if (!score) {
      return errorResponse(res, 404, 'Score not found');
    }
    
    // Check if admin has access to this score
    const userRole = req.user.role;
    const userCollege = req.user.college;
    
    if (userRole === 'collegeAdmin' || userRole === 'admin') {
      if (score.college !== userCollege) {
        return errorResponse(res, 403, 'Access denied', 'You can only view scores from your college');
      }
    }
    
    return successResponse(res, 200, 'Score details retrieved successfully', {
      score
    });
  } catch (error) {
    console.error('Error fetching score details:', error);
    return errorResponse(res, 500, 'Error fetching score details', error.message);
  }
};

/**
 * Get all scores for a quiz (with filtering)
 * @route GET /api/scores/quiz/:quizId
 */
export const getQuizScores = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { college } = req.query;
    
    const filter = { quiz: quizId };
    
    // Filter by college for college admins
    if (req.user.role === 'collegeAdmin' || req.user.role === 'admin') {
      filter.college = req.user.college;
    } else if (college) {
      filter.college = college;
    }
    
    const scores = await Score.find(filter)
      .populate('student', 'fullName email college')
      .populate('quiz', 'title')
      .sort({ submittedAt: -1 });
    
    return successResponse(res, 200, 'Quiz scores retrieved successfully', {
      scores,
      total: scores.length
    });
  } catch (error) {
    console.error('Error fetching quiz scores:', error);
    return errorResponse(res, 500, 'Error fetching quiz scores', error.message);
  }
};

/**
 * Edit total score
 * @route PUT /api/scores/:scoreId/edit-total
 */
export const editTotalScore = async (req, res) => {
  try {
    const { scoreId } = req.params;
    const { newScore, reason } = req.body;
    
    if (newScore === undefined || !reason) {
      return errorResponse(res, 400, 'New score and reason are required');
    }
    
    if (newScore < 0 || newScore > 100) {
      return errorResponse(res, 400, 'Score must be between 0 and 100');
    }
    
    const score = await Score.findById(scoreId);
    
    if (!score) {
      return errorResponse(res, 404, 'Score not found');
    }
    
    // Check access permissions
    if (req.user.role === 'collegeAdmin' || req.user.role === 'admin') {
      if (score.college !== req.user.college) {
        return errorResponse(res, 403, 'Access denied');
      }
    }
    
    const oldScore = score.totalScore;
    
    // Add edit to history
    score.scoreEdits.push({
      editedBy: req.user.id,
      editedAt: new Date(),
      oldScore,
      newScore,
      reason
    });
    
    // Update total score
    score.totalScore = newScore;
    
    await score.save();
    
    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.to('admin-room').emit('score-edited', {
        scoreId: score._id,
        studentId: score.student,
        oldScore,
        newScore,
        editedBy: req.user.fullName
      });
    }
    
    return successResponse(res, 200, 'Score updated successfully', {
      score: {
        _id: score._id,
        oldScore,
        newScore,
        editedBy: req.user.fullName,
        reason
      }
    });
  } catch (error) {
    console.error('Error editing total score:', error);
    return errorResponse(res, 500, 'Error editing score', error.message);
  }
};

/**
 * Edit per-question score
 * @route PUT /api/scores/:scoreId/edit-question/:questionIndex
 */
export const editQuestionScore = async (req, res) => {
  try {
    const { scoreId, questionIndex } = req.params;
    const { newScore, reason } = req.body;
    
    if (newScore === undefined || !reason) {
      return errorResponse(res, 400, 'New score and reason are required');
    }
    
    const score = await Score.findById(scoreId);
    
    if (!score) {
      return errorResponse(res, 404, 'Score not found');
    }
    
    const qIndex = parseInt(questionIndex);
    
    if (qIndex < 0 || qIndex >= score.answers.length) {
      return errorResponse(res, 400, 'Invalid question index');
    }
    
    // Check access permissions
    if (req.user.role === 'collegeAdmin' || req.user.role === 'admin') {
      if (score.college !== req.user.college) {
        return errorResponse(res, 403, 'Access denied');
      }
    }
    
    const oldQuestionScore = score.answers[qIndex].points || score.answers[qIndex].rankingScore || 0;
    
    // Add edit to history
    score.scoreEdits.push({
      editedBy: req.user.id,
      editedAt: new Date(),
      oldScore: score.totalScore,
      newScore: score.totalScore - oldQuestionScore + newScore,
      reason,
      questionIndex: qIndex,
      oldQuestionScore,
      newQuestionScore: newScore
    });
    
    // Update question score
    if (score.answers[qIndex].rankingScore !== undefined) {
      score.answers[qIndex].rankingScore = newScore;
    } else {
      score.answers[qIndex].points = newScore;
    }
    
    // Recalculate total score
    let totalScore = 0;
    score.answers.forEach(answer => {
      totalScore += answer.rankingScore || answer.points || 0;
    });
    
    score.totalScore = totalScore;
    
    await score.save();
    
    return successResponse(res, 200, 'Question score updated successfully', {
      questionIndex: qIndex,
      oldScore: oldQuestionScore,
      newScore,
      totalScore
    });
  } catch (error) {
    console.error('Error editing question score:', error);
    return errorResponse(res, 500, 'Error editing question score', error.message);
  }
};

/**
 * Get score edit history
 * @route GET /api/scores/:scoreId/edit-history
 */
export const getScoreEditHistory = async (req, res) => {
  try {
    const { scoreId } = req.params;
    
    const score = await Score.findById(scoreId)
      .populate({
        path: 'scoreEdits.editedBy',
        select: 'fullName email role'
      })
      .select('scoreEdits student quiz totalScore');
    
    if (!score) {
      return errorResponse(res, 404, 'Score not found');
    }
    
    return successResponse(res, 200, 'Edit history retrieved successfully', {
      scoreId: score._id,
      currentScore: score.totalScore,
      editHistory: score.scoreEdits.sort((a, b) => b.editedAt - a.editedAt)
    });
  } catch (error) {
    console.error('Error fetching edit history:', error);
    return errorResponse(res, 500, 'Error fetching edit history', error.message);
  }
};

export default {
  getScoreDetails,
  getQuizScores,
  editTotalScore,
  editQuestionScore,
  getScoreEditHistory
};

