import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/api';

/**
 * Enhanced Quiz Component with Progress Tracking
 * 
 * Features:
 * - Progress tracking (resume from last question)
 * - No Previous button (forward-only navigation)
 * - Prevent re-submission of completed quizzes
 * - Display decimal points for options
 * - Show impact text only after completion
 * - Auto-save progress
 */

const EnhancedQuiz = ({ quizId, onComplete, onBack }) => {
  // State Management
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(null);
  const [canAttempt, setCanAttempt] = useState(true);
  const [showImpact, setShowImpact] = useState(false);

  const token = localStorage.getItem('token');
  const api = axios.create({
    baseURL: API_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  // Initialize: Load quiz and check previous progress
  useEffect(() => {
    loadQuizAndProgress();
  }, [quizId]);

  /**
   * Load quiz details and check for existing progress
   */
  const loadQuizAndProgress = async () => {
    try {
      setLoading(true);
      setError(null);

      // Step 1: Check if quiz already submitted
      console.log('📋 Checking if quiz already submitted...');
      const checkRes = await api.get(`/quiz-progress/${quizId}/check-submission`);
      
      if (checkRes.data.data.isSubmitted) {
        console.log('⚠️ Quiz already submitted');
        setCanAttempt(false);
        setError({
          type: 'submitted',
          message: 'Quiz already submitted',
          details: `You already submitted this quiz on ${new Date(checkRes.data.data.submittedAt).toLocaleString()}`,
          score: checkRes.data.data.score
        });
        setLoading(false);
        return;
      }

      // Step 2: Check for existing in-progress session
      console.log('🔍 Checking for existing progress...');
      const progressRes = await api.get(`/quiz-progress/${quizId}`);
      
      // Step 3: Fetch quiz details
      console.log('📚 Fetching quiz details...');
      const quizRes = await api.get(`/quiz-progress/${quizId}/quiz`);
      setQuiz(quizRes.data.data.quiz);

      // Step 4: Load progress if exists
      if (progressRes.data.data.progress && progressRes.data.data.progress.answeredQuestions.length > 0) {
        const prog = progressRes.data.data.progress;
        
        console.log(`✅ RESUMING QUIZ: Current question: ${prog.currentQuestion}, Total answered: ${prog.answeredQuestions.length}`);
        
        // Restore answers from progress
        const restoredAnswers = {};
        prog.answeredQuestions.forEach(answer => {
          restoredAnswers[answer.questionIndex] = {
            selectedRanking: answer.selectedRanking,
            selectedOption: answer.selectedOption,
            instruction: answer.instruction,
            reasoning: answer.reasoning
          };
        });
        
        setAnswers(restoredAnswers);
        // Resume from the NEXT unanswered question, not the last answered
        const nextQuestion = Math.max(...Object.keys(restoredAnswers).map(Number)) + 1;
        const questionToStart = Math.min(nextQuestion, quizRes.data.data.quiz.questions.length - 1);
        setCurrentQuestion(questionToStart);
        setProgress(prog);

        console.log(`🎯 Resuming from question ${questionToStart}`);
      } else {
        // Step 5: Start new quiz session
        console.log('🆕 Starting NEW quiz session...');
        const startRes = await api.post('/quiz-progress/start', { quizId });
        setProgress(startRes.data.data.progress);
        setCurrentQuestion(0);
        console.log('✅ New quiz session started');
      }

      setLoading(false);
    } catch (err) {
      console.error('❌ Error loading quiz:', err);
      
      if (err.response?.status === 403) {
        setError({
          type: 'access',
          message: err.response.data.data?.message || 'Quiz already submitted',
          details: err.response.data.data?.details
        });
        setCanAttempt(false);
      } else {
        setError({
          type: 'load',
          message: 'Failed to load quiz',
          details: err.response?.data?.message || err.message
        });
      }
      setLoading(false);
    }
  };

  /**
   * Handle answer selection
   */
  const handleAnswerChange = (field, value) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: {
        ...prev[currentQuestion],
        [field]: value
      }
    }));
  };

  /**
   * Save current answer and move to next question
   */
  const handleNext = async () => {
    try {
      const currentAnswer = answers[currentQuestion];

      // Validate instruction is provided
      if (!currentAnswer?.instruction || currentAnswer.instruction.trim().length === 0) {
        setError({
          type: 'validation',
          message: 'Instruction Required',
          details: 'Please provide an instruction/explanation for this question before proceeding.'
        });
        return;
      }

      // Save answer to backend
      await api.post(`/quiz-progress/${quizId}/answer`, {
        questionIndex: currentQuestion,
        selectedRanking: currentAnswer.selectedRanking,
        selectedOption: currentAnswer.selectedOption,
        instruction: currentAnswer.instruction,
        reasoning: currentAnswer.reasoning
      });

      // Move to next question
      if (currentQuestion < quiz.questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setError(null);
      } else {
        // Last question answered - show submit confirmation
        setError(null);
      }
    } catch (err) {
      console.error('Error saving answer:', err);
      setError({
        type: 'save',
        message: 'Failed to save answer',
        details: err.response?.data?.message || err.message
      });
    }
  };

  /**
   * Submit completed quiz
   */
  const handleSubmit = async () => {
    try {
      if (Object.keys(answers).length !== quiz.questions.length) {
        setError({
          type: 'validation',
          message: 'Incomplete Quiz',
          details: 'Please answer all questions before submitting.'
        });
        return;
      }

      setSubmitting(true);

      // Prepare answers for submission
      const submissionAnswers = quiz.questions.map((question, index) => {
        const answer = answers[index] || {};
        return {
          questionId: question._id,
          questionText: question.text,
          selectedRanking: answer.selectedRanking,
          selectedOption: answer.selectedOption,
          instruction: answer.instruction,
          reasoning: answer.reasoning
        };
      });

      // Submit to scores API
      const submitRes = await api.post('/scores/submit', {
        quizId,
        answers: submissionAnswers
      });

      // Mark progress as submitted
      await api.post(`/quiz-progress/${quizId}/complete`, {});

      // Show success
      setShowImpact(true);
      onComplete?.(submitRes.data.data);
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError({
        type: 'submit',
        message: 'Failed to submit quiz',
        details: err.response?.data?.message || err.message
      });
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle quiz abandonment
   */
  const handleAbandon = async () => {
    try {
      if (confirm('Are you sure you want to abandon this quiz? Your progress will be saved.')) {
        await api.post(`/quiz-progress/${quizId}/abandon`, {});
        onBack?.();
      }
    } catch (err) {
      console.error('Error abandoning quiz:', err);
    }
  };

  // ============================================================================
  // RENDERING
  // ============================================================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl font-semibold">Loading Quiz...</p>
        </div>
      </div>
    );
  }

  // Show error states
  if (error?.type === 'submitted' || !canAttempt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900 p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 4v2m-6-4h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{error?.message}</h2>
          <p className="text-gray-600 mb-6">{error?.details}</p>
          {error?.score !== undefined && (
            <p className="text-lg font-semibold text-blue-600 mb-6">Your Score: {error.score}%</p>
          )}
          <button
            onClick={onBack}
            className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Return to Quizzes
          </button>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900">
        <div className="bg-white rounded-xl shadow-2xl p-8 text-center">
          <p className="text-gray-700 text-lg">Quiz not found</p>
          <button
            onClick={onBack}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const currentQ = quiz.questions[currentQuestion];
  const currentAnswer = answers[currentQuestion] || {};
  const progressPercent = ((currentQuestion + 1) / quiz.questions.length) * 100;
  const totalAnswered = Object.keys(answers).length;
  const isLastQuestion = currentQuestion === quiz.questions.length - 1;
  const isAnswered = currentQuestion in answers;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 p-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{quiz.title}</h1>
          <p className="text-purple-200">{quiz.description}</p>
        </div>

        {/* Progress Bar and Stats */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-gray-600 font-semibold">Question {currentQuestion + 1} of {quiz.questions.length}</p>
              <p className="text-sm text-gray-500 mt-1">Progress: {totalAnswered} answered</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">{progressPercent.toFixed(0)}%</div>
              <p className="text-sm text-gray-600">Complete</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <p className="text-red-800 font-semibold">{error.message}</p>
            {error.details && <p className="text-red-700 text-sm mt-1">{error.details}</p>}
          </div>
        )}

        {/* Question Card */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          {/* Question Text */}
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Mission {currentQuestion + 1}: {currentQ.text}
          </h2>

          {/* Options with Points */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Rank the options by priority:</h3>
            <div className="space-y-4">
              {currentQ.options.map((option, idx) => {
                const selectedRank = currentAnswer.selectedRanking?.find(r => r.text === option.text)?.rank;
                
                return (
                  <div
                    key={idx}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                      selectedRank
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                    }`}
                    onClick={() => {
                      // Ranking selection logic
                      const updatedRanking = currentAnswer.selectedRanking?.filter(r => r.text !== option.text) || [];
                      const newRank = selectedRank ? null : (updatedRanking.length + 1);
                      
                      if (newRank) {
                        updatedRanking.push({ text: option.text, rank: newRank });
                      }
                      
                      handleAnswerChange('selectedRanking', updatedRanking);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{option.text}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm text-blue-600 font-bold">
                            Points: {typeof option.points === 'number' ? option.points.toFixed(1) : '0.0'}
                          </span>
                          {selectedRank && (
                            <span className="inline-block px-3 py-1 bg-blue-600 text-white text-sm rounded-full font-semibold">
                              Rank: {selectedRank}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Instruction Input */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-700 mb-3">
              Your Strategic Explanation (Required)
            </label>
            <textarea
              value={currentAnswer.instruction || ''}
              onChange={(e) => handleAnswerChange('instruction', e.target.value)}
              placeholder="Explain your ranking strategy and why you prioritized these options in this order..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
              rows="5"
            />
            <p className="text-sm text-gray-500 mt-2">
              {currentAnswer.instruction?.length || 0} characters (minimum 20 recommended)
            </p>
          </div>

          {/* Optional Reasoning */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-700 mb-3">
              Additional Reasoning (Optional)
            </label>
            <textarea
              value={currentAnswer.reasoning || ''}
              onChange={(e) => handleAnswerChange('reasoning', e.target.value)}
              placeholder="Add any additional insights or reasoning..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
              rows="3"
            />
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center gap-4">
          <button
            onClick={handleAbandon}
            className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition"
          >
            ← Save & Exit
          </button>

          <div className="flex gap-4">
            {/* Only show Next button if not last question */}
            {!isLastQuestion && (
              <button
                onClick={handleNext}
                disabled={!isAnswered}
                className={`px-8 py-3 font-semibold rounded-lg transition ${
                  isAnswered
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }`}
              >
                Next →
              </button>
            )}

            {/* Show Submit on last question */}
            {isLastQuestion && (
              <button
                onClick={handleSubmit}
                disabled={submitting || totalAnswered !== quiz.questions.length}
                className={`px-8 py-3 font-semibold rounded-lg transition ${
                  submitting || totalAnswered !== quiz.questions.length
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {submitting ? 'Submitting...' : '✓ Submit Quiz'}
              </button>
            )}
          </div>
        </div>

        {/* Question Tracker */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Question Progress:</h3>
          <div className="flex flex-wrap gap-2">
            {quiz.questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (idx <= Math.max(...Object.keys(answers).map(Number), currentQuestion)) {
                    setCurrentQuestion(idx);
                  }
                }}
                className={`w-10 h-10 rounded-full font-bold transition ${
                  idx in answers
                    ? 'bg-green-500 text-white'
                    : idx === currentQuestion
                    ? 'bg-blue-600 text-white'
                    : idx < currentQuestion
                    ? 'bg-blue-200 text-gray-700 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 cursor-not-allowed'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedQuiz;
