/**
 * Quiz Submission Controller
 * 
 * Handles ranking-based quiz submissions with instruction validation
 */

import Score from '../models/scoreModel.js';
import Quiz from '../models/quizModel.js';
import { calculateTotalRankingScore, isValidRanking } from '../utils/rankingScore.js';
import { successResponse, errorResponse } from '../utils/errorHandler.js';

/**
 * Submit quiz with ranking answers and instructions
 * @route POST /api/scores/submit
 */
export const submitQuiz = async (req, res) => {
  try {
    const { quizId, answers } = req.body;
    
    console.log('=== QUIZ SUBMISSION DEBUG ===');
    console.log('Quiz ID:', quizId);
    console.log('Number of answers:', answers?.length);
    console.log('First answer structure:', JSON.stringify(answers?.[0], null, 2));
    
    if (!quizId || !answers || !Array.isArray(answers)) {
      return errorResponse(res, 400, 'Quiz ID and answers are required');
    }
    
    // Fetch quiz details
    const quiz = await Quiz.findById(quizId).populate('course', 'courseName courseCode');
    
    if (!quiz) {
      return errorResponse(res, 404, 'Quiz not found');
    }
    
    // Validate that student is enrolled in the quiz's course
    if (req.user.role === 'student') {
      if (!req.user.course || req.user.course.toString() !== quiz.course._id.toString()) {
        return errorResponse(res, 403, 'You are not enrolled in this course');
      }
    }
    
    // Validate answers
    if (answers.length !== quiz.questions.length) {
      return errorResponse(res, 400, 'All questions must be answered');
    }
    
  // Process each answer
  const processedAnswers = [];
  let sumPointsEarned = 0; // sum of marks earned across questions
    
    for (let i = 0; i < answers.length; i++) {
      const answer = answers[i];
      const question = quiz.questions[i];
      // Validate instruction is provided (mandatory)
      if (!answer.instruction || answer.instruction.trim().length === 0) {
        return errorResponse(res, 400, `Instruction is required for question ${i + 1}`);
      }
      let selectedOptionText = '';
      let selectedOptionImpact = '';
  let points = 0;
  // ✅ FIX: Each question is worth 10 marks maximum (not sum of all options)
  let maxPoints = 10;
      let questionType = question.questionType || 'ranking';
      if (questionType === 'ranking' && answer.selectedRanking && Array.isArray(answer.selectedRanking)) {
        // Validate ranking
        if (!isValidRanking(answer.selectedRanking)) {
          return errorResponse(res, 400, `Invalid ranking for question ${i + 1}`);
        }
        // Build correct ranking from question
        const correctRanking = question.options.map(opt => ({
          text: opt.text,
          rank: opt.correctRank
        })).sort((a, b) => a.rank - b.rank);
        
        // 🎯 FIX: Award marks based ONLY on which option student ranks at top (Rank 1)
        // Find what student ranked at position 1 (top choice)
        const studentTopChoice = answer.selectedRanking.find(opt => opt.rank === 1);
        
        // Find the option data for the student's top choice
        const selectedOption = question.options.find(opt => opt.text === studentTopChoice?.text);
        
        // Award the marks/points assigned to that specific option
        points = selectedOption?.points || selectedOption?.marks || 0;
        sumPointsEarned += points;
        
        // ✅ FIX: Each question max is 10 marks (not the sum of all options)
        const maxPossiblePoints = 10;
        
        // Calculate ranking score as percentage (for display purposes)
        const rankingScore = maxPossiblePoints > 0 ? (points / maxPossiblePoints) * 100 : 0;
        
        // Console log for debugging
        console.log(`📊 Question ${i + 1} Scoring:`, {
          studentTopChoice: studentTopChoice?.text,
          pointsAwarded: points,
          maxPossible: maxPossiblePoints,
          percentage: rankingScore.toFixed(1) + '%'
        });
        
        // Find the top-ranked option to get its impact
        const topRankedOption = answer.selectedRanking.find(opt => opt.rank === 1);
        const selectedOptionData = question.options.find(opt => opt.text === topRankedOption?.text);
        selectedOptionText = topRankedOption?.text || '';
        selectedOptionImpact = selectedOptionData?.impact || '';
        
        // Update maxPoints to use the calculated max for this question
        maxPoints = maxPossiblePoints;
        
        processedAnswers.push({
          question: question._id,
          questionText: question.text,
          questionType: 'ranking',
          selectedRanking: answer.selectedRanking,
          correctRanking,
          rankingScore,
          instruction: answer.instruction,
          options: question.options,
          points,
          maxPoints: maxPossiblePoints,
          selectedOption: selectedOptionText,
          selectedOptionImpact
        });
      } else {
        // For MCQ or other types
        selectedOptionText = answer.selectedOption || answer.selectedAnswer || '';
        const selectedOptionData = question.options.find(opt => opt.text === selectedOptionText);
        selectedOptionImpact = selectedOptionData?.impact || '';
  points = selectedOptionData?.points || 0;
  sumPointsEarned += points;
        processedAnswers.push({
          question: question._id,
          questionText: question.text,
          questionType: questionType,
          instruction: answer.instruction,
          options: question.options,
          points,
          maxPoints,
          selectedOption: selectedOptionText,
          selectedOptionImpact
        });
      }
    }
    // ✅ FIX: Calculate total marks correctly - Number of questions × 10
    const quizTotalMax = quiz.questions.length * 10;
    
    // Use the raw points earned (no scaling needed)
    const scaledTotalMarks = sumPointsEarned;
    const percentageScore = quizTotalMax > 0
      ? Math.round(((scaledTotalMarks / quizTotalMax) * 100) * 100) / 100
      : 0;
    
    console.log('\n=== 🎯 QUIZ SCORING SUMMARY (FIXED) ===');
    console.log('Points Earned:', sumPointsEarned);
    console.log('Questions Count:', quiz.questions.length);
    console.log('Quiz Total Max (Questions × 10):', quizTotalMax);
    console.log('Final Display:', `${scaledTotalMarks} / ${quizTotalMax}`);
    console.log('Percentage:', percentageScore + '%');
    console.log('=== PROCESSED ANSWERS ===');
    console.log('Processed answers count:', processedAnswers.length);
    console.log('First processed answer:', JSON.stringify(processedAnswers[0], null, 2));
    
    // Create score document
    const scoreDoc = new Score({
      student: req.user._id,
      quiz: quizId,
      course: quiz.course._id,
      college: req.user.college || '',
      maxMarks: quizTotalMax,
      totalScore: scaledTotalMarks,
      totalQuestions: quiz.questions.length,
      answers: processedAnswers,
      status: 'completed',
      submittedAt: new Date(),
      simulationType: 'quiz'
    });
    
    console.log('=== ATTEMPTING TO SAVE SCORE ===');
    console.log('Score document structure:', JSON.stringify(scoreDoc.toObject(), null, 2));
    
    await scoreDoc.save();
    console.log('✅ Score saved successfully!');
    
    // Populate student and quiz details
    await scoreDoc.populate('student', 'fullName email college');
  await scoreDoc.populate('quiz', 'title description maxMarks questions');
    await scoreDoc.populate('course', 'courseName courseCode');
    
    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to('admin-room').emit('new-score', {
        student: scoreDoc.student,
        quiz: scoreDoc.quiz,
        score: scoreDoc.totalScore,
        submittedAt: scoreDoc.submittedAt
      });
    }
    
    return successResponse(res, 201, 'Quiz submitted successfully', {
      score: scoreDoc,
      totalScore: scaledTotalMarks,
      percentage: percentageScore,
      maxMarks: quizTotalMax,
      displayScore: scaledTotalMarks,
      displayMaxMarks: quizTotalMax,
      passed: percentageScore >= (quiz.passingScore || 0),
      quiz: scoreDoc.quiz
    });
  } catch (error) {
    console.error('❌ ERROR SUBMITTING QUIZ ❌');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));
      console.error('Validation errors:', validationErrors);
      return errorResponse(res, 400, 'Validation failed', validationErrors);
    }
    
    return errorResponse(res, 500, 'Error submitting quiz', error.message);
  }
};

/**
 * Get quiz by ID with preface
 * @route GET /api/quizzes/:id
 */
export const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const quiz = await Quiz.findById(id)
      .populate('course', 'courseName courseCode department')
      .select('-__v');
    
    if (!quiz) {
      return errorResponse(res, 404, 'Quiz not found');
    }
    
    // Check course access for students
    if (req.user.role === 'student') {
      if (!req.user.course || req.user.course.toString() !== quiz.course._id.toString()) {
        return errorResponse(res, 403, 'You are not enrolled in this course');
      }
    }
    
    return successResponse(res, 200, 'Quiz retrieved successfully', {
      quiz
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return errorResponse(res, 500, 'Error fetching quiz', error.message);
  }
};

export default {
  submitQuiz,
  getQuizById
};

