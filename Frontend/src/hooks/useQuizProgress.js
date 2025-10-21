import { useState, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';

/**
 * Custom Hook: useQuizProgress
 * 
 * Manages quiz progress operations:
 * - Start/resume quiz
 * - Save answers
 * - Check submission status
 * - Fetch results with impact
 * 
 * Usage:
 * const { progress, loading, error, startQuiz, saveAnswer, checkSubmission } = useQuizProgress(quizId);
 */

export const useQuizProgress = (quizId) => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');
  
  const api = axios.create({
    baseURL: API_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  /**
   * Start or resume a quiz
   */
  const startQuiz = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post('/quiz-progress/start', { quizId });
      setProgress(response.data.data.progress);

      return response.data.data;
    } catch (err) {
      const errorMsg = err.response?.data?.details?.message || err.response?.data?.message || err.message;
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  /**
   * Get current progress
   */
  const getProgress = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/quiz-progress/${quizId}`);
      setProgress(response.data.data.progress);

      return response.data.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  /**
   * Save an answer
   */
  const saveAnswer = useCallback(async (questionIndex, answerData) => {
    try {
      setError(null);

      const response = await api.post(`/quiz-progress/${quizId}/answer`, {
        questionIndex,
        ...answerData
      });

      return response.data.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      throw err;
    }
  }, [quizId]);

  /**
   * Check if quiz already submitted
   */
  const checkSubmission = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/quiz-progress/${quizId}/check-submission`);
      return response.data.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  /**
   * Get quiz details for taking
   */
  const getQuizDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/quiz-progress/${quizId}/quiz`);
      return response.data.data;
    } catch (err) {
      const errorMsg = err.response?.data?.details?.message || err.response?.data?.message || err.message;
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  /**
   * Abandon quiz session
   */
  const abandonQuiz = useCallback(async () => {
    try {
      const response = await api.post(`/quiz-progress/${quizId}/abandon`, {});
      return response.data.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      throw err;
    }
  }, [quizId]);

  /**
   * Mark progress as complete
   */
  const completeQuiz = useCallback(async () => {
    try {
      const response = await api.post(`/quiz-progress/${quizId}/complete`, {});
      return response.data.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      throw err;
    }
  }, [quizId]);

  /**
   * Get results with impact text
   */
  const getResults = useCallback(async (scoreId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/quiz-progress/${quizId}/results/${scoreId}`);
      return response.data.data.score;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  return {
    progress,
    loading,
    error,
    startQuiz,
    getProgress,
    saveAnswer,
    checkSubmission,
    getQuizDetails,
    abandonQuiz,
    completeQuiz,
    getResults,
    clearError: () => setError(null)
  };
};

export default useQuizProgress;
