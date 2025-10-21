import React, { useState, useEffect } from 'react';
import Timer from '../Timer';
import api from '../../utils/axios';
// Toast notifications disabled (silent mode)
const toast = { success: () => {}, error: () => {}, loading: () => {}, info: () => {}, warning: () => {}, promise: () => {}, custom: () => {}, dismiss: () => {} };

const StudentQuiz = ({ quiz, onQuizComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [reasoning, setReasoning] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (quiz?.questions && quiz.questions.length > 0) {
      const question = quiz.questions[currentQuestion];
      setTimeLeft(question.timeLimit || 60); // Default 60 seconds if no time limit
      setIsTimerActive(true);
      setSelectedAnswer('');
      setReasoning('');
    }
  }, [currentQuestion, quiz]);

  const handleTimeUp = () => {
    // Auto-submit with current selection
    submitAnswer(true);
  };

  // Helper function to count words
  const countWords = (text) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const submitAnswer = async (isAutoSubmit = false) => {
    if (isSubmitting) return;
    
    // Validate word count for text-type questions (not auto-submit)
    if (!isAutoSubmit && question.type === 'text' && selectedAnswer) {
      const wordCount = countWords(selectedAnswer);
      if (wordCount < 20) {
        toast.error(`Answer must be at least 20 words (current: ${wordCount} words)`);
        setIsSubmitting(false);
        return;
      }
      if (wordCount > 100) {
        toast.error(`Answer must not exceed 100 words (current: ${wordCount} words)`);
        setIsSubmitting(false);
        return;
      }
    }
    
    // Validate word count for reasoning if provided (not auto-submit)
    if (!isAutoSubmit && reasoning) {
      const reasoningWordCount = countWords(reasoning);
      if (reasoningWordCount < 20) {
        toast.error(`Reasoning must be at least 20 words (current: ${reasoningWordCount} words)`);
        setIsSubmitting(false);
        return;
      }
      if (reasoningWordCount > 100) {
        toast.error(`Reasoning must not exceed 100 words (current: ${reasoningWordCount} words)`);
        setIsSubmitting(false);
        return;
      }
    }
    
    setIsSubmitting(true);
    setIsTimerActive(false);

    try {
      const question = quiz.questions[currentQuestion];
      const timeTaken = (question.timeLimit || 60) - timeLeft;
      
      const answerData = {
        questionId: question._id,
        selectedAnswer,
        reasoning,
        timeTaken,
        isAutoSubmitted: isAutoSubmit
      };

      // Save answer locally
      const newAnswers = [...answers];
      newAnswers[currentQuestion] = answerData;
      setAnswers(newAnswers);

      // Move to next question or complete quiz
      if (currentQuestion < quiz.questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        // Submit entire quiz
        await submitQuiz(newAnswers);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast.error('Error submitting answer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitQuiz = async (finalAnswers) => {
    try {
      const response = await api.post('/scores/submit', {
        quizId: quiz._id,
        answers: finalAnswers
      });

      if (response.data) {
        toast.success('Quiz completed successfully!');
        onQuizComplete(response.data);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Error submitting quiz');
    }
  };

  if (!quiz?.questions || quiz.questions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <p className="text-gray-600">No questions available for this quiz.</p>
        {onBack && (
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            ← Back to Quiz List
          </button>
        )}
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
  
  // Extract question text - handle both 'text' and 'question' field names
  const questionText = question.text || question.question || '';
  
  // Extract options - handle both array of objects and array of strings
  const questionOptions = question.options || [];
  const optionsArray = questionOptions.map(opt => 
    typeof opt === 'string' ? opt : opt.text
  );

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{quiz.title}</h2>
            <p className="text-gray-600">Question {currentQuestion + 1} of {quiz.questions.length}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-blue-600">Progress: {Math.round(progress)}%</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Timer */}
        <Timer 
          timeLimit={question.timeLimit || 60}
          onTimeUp={handleTimeUp}
          isActive={isTimerActive}
        />
      </div>

      {/* Question Content */}
      <div className="p-6">
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">{questionText}</h3>
          {question.description && (
            <p className="text-gray-700 leading-relaxed mb-4">{question.description}</p>
          )}
          {question.explanation && currentQuestion > 0 && (
            <p className="text-gray-600 text-sm italic mb-4">{question.explanation}</p>
          )}
        </div>

        {/* Multiple Choice Questions (default if no type specified) */}
        {(!question.type || question.type === 'multiple-choice') && optionsArray.length > 0 && (
          <div className="space-y-3 mb-6">
            {optionsArray.map((option, index) => (
              <label
                key={index}
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedAnswer === option
                    ? 'bg-blue-50 border-blue-500'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="answer"
                  value={option}
                  checked={selectedAnswer === option}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  className="mr-3"
                />
                <span className="text-gray-800">{option}</span>
              </label>
            ))}
          </div>
        )}

        {/* Question Type: Text Input */}
        {question.type === 'text' && (
          <div className="mb-6">
            <textarea
              value={selectedAnswer}
              onChange={(e) => setSelectedAnswer(e.target.value)}
              placeholder="Enter your answer (minimum 20 words, maximum 100 words)..."
              className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={500}
            />
            <div className="flex justify-between text-sm mt-1">
              <p className={`${countWords(selectedAnswer) < 20 ? 'text-red-500' : countWords(selectedAnswer) > 100 ? 'text-red-500' : 'text-green-600'}`}>
                Word count: {countWords(selectedAnswer)} (min: 20, max: 100)
              </p>
              <p className="text-gray-500">
                {selectedAnswer.length}/500 characters
              </p>
            </div>
          </div>
        )}

        {/* Reasoning Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Strategic Reasoning (Optional - Bonus Points, min: 20 words, max: 100 words)
          </label>
          <textarea
            value={reasoning}
            onChange={(e) => setReasoning(e.target.value)}
            placeholder="Explain your reasoning for this decision (minimum 20 words, maximum 100 words)..."
            className="w-full h-24 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            maxLength={300}
          />
          <div className="flex justify-between text-sm mt-1">
            {reasoning.length > 0 && (
              <p className={`${countWords(reasoning) < 20 ? 'text-red-500' : countWords(reasoning) > 100 ? 'text-red-500' : 'text-green-600'}`}>
                Word count: {countWords(reasoning)} (min: 20, max: 100)
              </p>
            )}
            <p className="text-gray-500 ml-auto">
              {reasoning.length}/300 characters {reasoning.length > 50 && <span className="text-green-600">(+10 bonus points)</span>}
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={() => submitAnswer(false)}
          disabled={!selectedAnswer || isSubmitting}
          className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
            selectedAnswer && !isSubmitting
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isSubmitting 
            ? 'Submitting...' 
            : currentQuestion === quiz.questions.length - 1 
              ? 'Complete Quiz' 
              : 'Next Question'
          }
        </button>
      </div>
    </div>
  );
};

export default StudentQuiz;
