import QuizProgress from '../models/quizProgressModel.js';
import Score from '../models/scoreModel.js';
import Quiz from '../models/quizModel.js';
import User from '../models/userModel.js';
import { successResponse, errorResponse } from '../utils/errorHandler.js';

/**
 * Quiz Progress Controller
 * 
 * Manages student quiz progress tracking:
 * - Start/resume quiz sessions
 * - Save answer progress
 * - Fetch current progress
 * - Check for duplicate submissions
 * - Handle session abandonment
 */

/**
 * Start or Resume Quiz
 * @route POST /api/quiz-progress/start
 */
export const startQuiz = async (req, res) => {
  try {
    const { quizId } = req.body;
    const studentId = req.user._id;

    // Validate input
    if (!quizId) {
      return errorResponse(res, 400, 'Quiz ID is required');
    }

    // Check if quiz exists
    const quiz = await Quiz.findById(quizId).populate('course', 'courseName courseCode');
    if (!quiz) {
      return errorResponse(res, 404, 'Quiz not found');
    }

    // Check if student already submitted this quiz
    const submittedScore = await Score.findOne({
      student: studentId,
      quiz: quizId,
      status: 'completed'
    });

    if (submittedScore) {
      return errorResponse(res, 403, 'Quiz already submitted', {
        message: 'You have already submitted this quiz and cannot attempt it again',
        submittedAt: submittedScore.submittedAt,
        score: submittedScore.totalScore
      });
    }

    // Find or create progress record
    let progress = await QuizProgress.findOne({
      student: studentId,
      quiz: quizId,
      status: { $in: ['in-progress', 'abandoned'] }
    });

    if (!progress) {
      // Create new progress session
      console.log(`🆕 Creating NEW progress session for student ${studentId}`);
      progress = new QuizProgress({
        student: studentId,
        quiz: quizId,
        course: quiz.course._id,
        college: req.user.college || '',
        totalQuestions: quiz.questions.length,
        currentQuestion: 0,
        status: 'in-progress',
        sessionId: `${studentId}-${quizId}-${Date.now()}`,
        answeredQuestions: []
      });
    } else {
      // Resume existing session
      console.log(`📝 Resuming existing session: ${progress.answeredQuestions.length} answers, current question: ${progress.currentQuestion}`);
      progress.status = 'in-progress';
      progress.lastAccessedAt = new Date();
    }

    await progress.save();

    console.log(`✅ Quiz started/resumed for student ${studentId}, Quiz: ${quizId}`);

    return successResponse(res, 200, 'Quiz started/resumed successfully', {
      progress: {
        progressId: progress._id,
        sessionId: progress.sessionId,
        currentQuestion: progress.currentQuestion,
        totalQuestions: progress.totalQuestions,
        answeredQuestions: progress.answeredQuestions.length,
        startedAt: progress.startedAt,
        lastAccessedAt: progress.lastAccessedAt,
        quiz: {
          id: quiz._id,
          title: quiz.title,
          description: quiz.description,
          course: quiz.course
        }
      }
    });
  } catch (error) {
    console.error('Error starting quiz:', error);
    return errorResponse(res, 500, 'Error starting quiz', error.message);
  }
};

/**
 * Get Current Quiz Progress
 * @route GET /api/quiz-progress/:quizId
 */
export const getProgress = async (req, res) => {
  try {
    const { quizId } = req.params;
    const studentId = req.user._id;

    console.log(`🔍 Getting progress for student ${studentId}, quiz ${quizId}`);

    const progress = await QuizProgress.findOne({
      student: studentId,
      quiz: quizId,
      status: { $in: ['in-progress', 'abandoned'] }
    }).populate('quiz', 'title totalQuestions questions');

    if (!progress) {
      console.log(`⚠️ No existing progress found for student ${studentId}`);
      return successResponse(res, 200, 'No active progress', {
        progress: null,
        canStart: true
      });
    }

    console.log(`✅ Found existing progress: ${progress.answeredQuestions.length} answered, current: ${progress.currentQuestion}`);

    return successResponse(res, 200, 'Progress retrieved', {
      progress: {
        progressId: progress._id,
        currentQuestion: progress.currentQuestion,
        totalQuestions: progress.totalQuestions,
        answeredQuestions: progress.answeredQuestions,
        totalAnswered: progress.answeredQuestions.length,
        status: progress.status,
        startedAt: progress.startedAt,
        lastAccessedAt: progress.lastAccessedAt
      }
    });
  } catch (error) {
    console.error('❌ Error fetching progress:', error);
    return errorResponse(res, 500, 'Error fetching progress', error.message);
  }
};

/**
 * Save Answer and Update Progress
 * @route POST /api/quiz-progress/:quizId/answer
 */
export const saveAnswer = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { questionIndex, selectedRanking, selectedOption, instruction, reasoning } = req.body;
    const studentId = req.user._id;

    // Validate input
    if (questionIndex === undefined || questionIndex === null) {
      return errorResponse(res, 400, 'Question index is required');
    }

    if (!instruction || instruction.trim().length === 0) {
      return errorResponse(res, 400, 'Instruction is required for all questions');
    }

    // Find progress record
    const progress = await QuizProgress.findOne({
      student: studentId,
      quiz: quizId,
      status: 'in-progress'
    });

    if (!progress) {
      return errorResponse(res, 404, 'Quiz session not found. Please start the quiz again.');
    }

    // Check if already answered
    const existingAnswerIndex = progress.answeredQuestions.findIndex(
      a => a.questionIndex === questionIndex
    );

    const answerData = {
      questionIndex,
      selectedRanking: selectedRanking || null,
      selectedOption: selectedOption || null,
      instruction,
      reasoning: reasoning || '',
      answeredAt: new Date()
    };

    if (existingAnswerIndex >= 0) {
      // Update existing answer
      progress.answeredQuestions[existingAnswerIndex] = answerData;
    } else {
      // Add new answer
      progress.answeredQuestions.push(answerData);
    }

    // Update current question
    progress.currentQuestion = Math.max(questionIndex + 1, progress.currentQuestion);
    progress.lastAccessedAt = new Date();

    await progress.save();

    console.log(`✅ Answer saved for student ${studentId}, Question: ${questionIndex}`);

    return successResponse(res, 200, 'Answer saved successfully', {
      savedQuestion: questionIndex,
      totalAnswered: progress.answeredQuestions.length,
      currentQuestion: progress.currentQuestion
    });
  } catch (error) {
    console.error('Error saving answer:', error);
    return errorResponse(res, 500, 'Error saving answer', error.message);
  }
};

/**
 * Check if Quiz Already Submitted
 * @route GET /api/quiz-progress/:quizId/check-submission
 */
export const checkSubmission = async (req, res) => {
  try {
    const { quizId } = req.params;
    const studentId = req.user._id;

    const submitted = await Score.findOne({
      student: studentId,
      quiz: quizId,
      status: 'completed'
    });

    if (submitted) {
      return successResponse(res, 200, 'Quiz already submitted', {
        isSubmitted: true,
        submittedAt: submitted.submittedAt,
        score: submitted.totalScore,
        scoreId: submitted._id
      });
    }

    const inProgress = await QuizProgress.findOne({
      student: studentId,
      quiz: quizId,
      status: 'in-progress'
    });

    return successResponse(res, 200, 'Quiz not submitted', {
      isSubmitted: false,
      hasProgress: !!inProgress,
      progress: inProgress ? {
        currentQuestion: inProgress.currentQuestion,
        totalAnswered: inProgress.answeredQuestions.length,
        totalQuestions: inProgress.totalQuestions
      } : null
    });
  } catch (error) {
    console.error('Error checking submission:', error);
    return errorResponse(res, 500, 'Error checking submission', error.message);
  }
};

/**
 * Get Quiz with Full Details for Taking
 * @route GET /api/quiz-progress/:quizId/quiz
 */
export const getQuizDetails = async (req, res) => {
  try {
    const { quizId } = req.params;
    const studentId = req.user._id;

    // Check if already submitted
    const submitted = await Score.findOne({
      student: studentId,
      quiz: quizId,
      status: 'completed'
    });

    if (submitted) {
      return errorResponse(res, 403, 'Quiz already submitted', {
        message: 'You have already submitted this quiz',
        submittedAt: submitted.submittedAt,
        score: submitted.totalScore
      });
    }

    // Fetch quiz details
    const quiz = await Quiz.findById(quizId).populate('course', 'courseName courseCode');

    if (!quiz) {
      return errorResponse(res, 404, 'Quiz not found');
    }

    // Check course access
    if (req.user.role === 'student' && req.user.course) {
      if (req.user.course.toString() !== quiz.course._id.toString()) {
        return errorResponse(res, 403, 'You are not enrolled in this course');
      }
    }

    // Get progress
    const progress = await QuizProgress.findOne({
      student: studentId,
      quiz: quizId,
      status: 'in-progress'
    });

    // Map questions to exclude correct answers (security)
    const questions = quiz.questions.map(q => ({
      _id: q._id,
      text: q.text,
      options: q.options.map(opt => ({
        text: opt.text,
        correctRank: opt.correctRank,
        points: opt.points || 0,
        // Don't send impact text yet - only show after submission
        impact: null
      })),
      instructionRequired: q.instructionRequired !== false // default true
    }));

    return successResponse(res, 200, 'Quiz details retrieved', {
      quiz: {
        id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        preface: quiz.preface,
        questions,
        course: quiz.course,
        difficulty: quiz.difficulty,
        passingScore: quiz.passingScore,
        totalQuestions: quiz.questions.length
      },
      progress: progress ? {
        currentQuestion: progress.currentQuestion,
        answeredQuestions: progress.answeredQuestions,
        totalAnswered: progress.answeredQuestions.length
      } : null
    });
  } catch (error) {
    console.error('Error fetching quiz details:', error);
    return errorResponse(res, 500, 'Error fetching quiz details', error.message);
  }
};

/**
 * Mark Quiz Session as Abandoned
 * @route POST /api/quiz-progress/:quizId/abandon
 */
export const abandonQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const studentId = req.user._id;

    const progress = await QuizProgress.findOneAndUpdate(
      {
        student: studentId,
        quiz: quizId,
        status: 'in-progress'
      },
      {
        status: 'abandoned',
        lastAccessedAt: new Date()
      },
      { new: true }
    );

    if (!progress) {
      return errorResponse(res, 404, 'Quiz session not found');
    }

    console.log(`⚠️  Quiz abandoned by student ${studentId}, Quiz: ${quizId}`);

    return successResponse(res, 200, 'Quiz session marked as abandoned', {
      progress: {
        status: progress.status,
        questionsAnswered: progress.answeredQuestions.length,
        currentQuestion: progress.currentQuestion,
        totalQuestions: progress.totalQuestions
      }
    });
  } catch (error) {
    console.error('Error abandoning quiz:', error);
    return errorResponse(res, 500, 'Error abandoning quiz', error.message);
  }
};

/**
 * Complete Quiz (Mark Progress as Completed Before Final Submission)
 * @route POST /api/quiz-progress/:quizId/complete
 */
export const completeQuizProgress = async (req, res) => {
  try {
    const { quizId } = req.params;
    const studentId = req.user._id;

    const progress = await QuizProgress.findOneAndUpdate(
      {
        student: studentId,
        quiz: quizId,
        status: 'in-progress'
      },
      {
        status: 'completed',
        completedAt: new Date(),
        lastAccessedAt: new Date()
      },
      { new: true }
    );

    if (!progress) {
      return errorResponse(res, 404, 'Quiz session not found');
    }

    console.log(`✅ Quiz progress marked as complete for student ${studentId}`);

    return successResponse(res, 200, 'Quiz marked as complete', {
      progress: {
        status: progress.status,
        completedAt: progress.completedAt,
        questionsAnswered: progress.answeredQuestions.length,
        totalQuestions: progress.totalQuestions
      }
    });
  } catch (error) {
    console.error('Error completing quiz:', error);
    return errorResponse(res, 500, 'Error completing quiz', error.message);
  }
};

/**
 * Get Quiz Results with Impact Text
 * @route GET /api/quiz-progress/:quizId/results/:scoreId
 */
export const getQuizResults = async (req, res) => {
  try {
    const { quizId, scoreId } = req.params;
    const studentId = req.user._id;

    // Fetch score document
    const score = await Score.findOne({
      _id: scoreId,
      student: studentId,
      quiz: quizId,
      status: 'completed'
    }).populate('quiz');

    if (!score) {
      return errorResponse(res, 404, 'Quiz results not found');
    }

    // Fetch quiz to get impact text for options
    const quiz = await Quiz.findById(quizId);

    // Enhance answers with impact text
    const enhancedAnswers = score.answers.map((answer, index) => {
      const question = quiz.questions[index];
      
      if (answer.selectedRanking) {
        // For ranking questions, show impact of selected options
        return {
          ...answer.toObject(),
          impacts: answer.selectedRanking.map(selectedOpt => {
            const option = question.options.find(opt => opt.text === selectedOpt.text);
            return {
              text: selectedOpt.text,
              rank: selectedOpt.rank,
              impact: option?.impact || '',
              points: option?.points || 0
            };
          })
        };
      }

      return answer.toObject();
    });

    return successResponse(res, 200, 'Quiz results with impact retrieved', {
      score: {
        ...score.toObject(),
        answers: enhancedAnswers
      }
    });
  } catch (error) {
    console.error('Error fetching results:', error);
    return errorResponse(res, 500, 'Error fetching results', error.message);
  }
};

export default {
  startQuiz,
  getProgress,
  saveAnswer,
  checkSubmission,
  getQuizDetails,
  abandonQuiz,
  completeQuizProgress,
  getQuizResults
};
