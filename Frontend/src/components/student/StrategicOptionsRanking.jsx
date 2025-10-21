import React, { useState, useEffect } from 'react';
import { useQuiz } from '../../context/QuizContext';
import Timer from '../Timer';

const StrategicOptionsRanking = ({ onBack }) => {
  const { 
    question, 
    submitAnswer, 
    submitQuiz,
    currentQuestion, 
    totalQuestions, 
    timeLeft, 
    isTimerActive, 
    handleTimeUp,
    setTimeLeft 
  } = useQuiz();
  const [options, setOptions] = useState([]);

  useEffect(() => {
    // Initialize options from the current question
    setOptions(question.options.map((opt, index) => ({
      ...opt,
      order: index + 1
    })));
  }, [question]);

  const [reasoning, setReasoning] = useState('');
  
  // Helper function to count words
  const countWords = (text) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const moveOption = (id, direction) => {
    const newOptions = [...options];
    const index = newOptions.findIndex(opt => opt.id === id);
    if (direction === 'up' && index > 0) {
      const temp = newOptions[index].order;
      newOptions[index].order = newOptions[index - 1].order;
      newOptions[index - 1].order = temp;
    } else if (direction === 'down' && index < newOptions.length - 1) {
      const temp = newOptions[index].order;
      newOptions[index].order = newOptions[index + 1].order;
      newOptions[index + 1].order = temp;
    }
    setOptions(newOptions.sort((a, b) => a.order - b.order));
  };

  const handleSubmit = () => {
    // Validate word count if reasoning is provided
    if (reasoning) {
      const wordCount = countWords(reasoning);
      if (wordCount < 20) {
        alert(`Reasoning must be at least 20 words (current: ${wordCount} words)`);
        return;
      }
      if (wordCount > 100) {
        alert(`Reasoning must not exceed 100 words (current: ${wordCount} words)`);
        return;
      }
    }
    submitAnswer(question.id, options, reasoning);
  };

  const handleFinalSubmit = () => {
    // Validate word count if reasoning is provided
    if (reasoning) {
      const wordCount = countWords(reasoning);
      if (wordCount < 20) {
        alert(`Reasoning must be at least 20 words (current: ${wordCount} words)`);
        return;
      }
      if (wordCount > 100) {
        alert(`Reasoning must not exceed 100 words (current: ${wordCount} words)`);
        return;
      }
    }
    // Submit current answer first
    submitAnswer(question.id, options, reasoning);
    // Then submit the entire quiz
    setTimeout(() => {
      submitQuiz();
    }, 100);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Decision Challenge {currentQuestion + 1} of {totalQuestions}</h2>
            <p className="text-gray-600">Day {currentQuestion + 1}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-blue-600">Strategic Decision</p>
            <p className="text-sm text-gray-500">Mission Progress: {currentQuestion + 1}/{totalQuestions} challenges</p>
          </div>
        </div>
        
        {/* Timer */}
        <div className="mb-4">
          <Timer 
            timeLimit={question.timeLimit} 
            onTimeUp={handleTimeUp}
            isActive={isTimerActive}
          />
        </div>
        
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
        >
          <span className="mr-2">←</span>
          Back to Strategic Business Decision
        </button>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Strategic Options</h3>
          <p className="text-gray-600">Use the ↑ ↓ arrows to arrange by priority.</p>
        </div>

        {/* Ranking Options */}
        <div className="space-y-4 mb-8">
          {options.map((option) => (
            <div key={option.id} className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                {option.id}
              </div>
              <p className="flex-grow text-gray-800">{option.text}</p>
              <div className="flex flex-col space-y-1">
                <button
                  onClick={() => moveOption(option.id, 'up')}
                  className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={option.order === 1}
                >
                  ↑
                </button>
                <button
                  onClick={() => moveOption(option.id, 'down')}
                  className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={option.order === options.length}
                >
                  ↓
                </button>
              </div>
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                {option.order}
              </div>
            </div>
          ))}
        </div>

        {/* Current Ranking */}
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <h4 className="font-semibold text-gray-900 mb-4">Your Strategic Ranking:</h4>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            {options.sort((a, b) => a.order - b.order).map((option) => (
              <li key={option.id} className="pl-2">{option.text}</li>
            ))}
          </ol>
        </div>

        {/* Strategic Reasoning */}
        <div className="mb-8">
          <h4 className="font-semibold text-gray-900 mb-2">Strategic Reasoning (Optional - min: 20 words, max: 100 words)</h4>
          <textarea
            value={reasoning}
            onChange={(e) => setReasoning(e.target.value)}
            placeholder="Explain your strategic thinking, decision rationale, and why you arranged the options in this order (minimum 20 words, maximum 100 words)..."
            className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            maxLength={500}
          />
          <div className="flex justify-between text-sm mt-1">
            {reasoning.length > 0 && (
              <p className={`${countWords(reasoning) < 20 ? 'text-red-500' : countWords(reasoning) > 100 ? 'text-red-500' : 'text-green-600'}`}>
                Word count: {countWords(reasoning)} (min: 20, max: 100)
              </p>
            )}
            <p className="text-gray-500 ml-auto">
              {reasoning.length}/500 characters
            </p>
          </div>
        </div>

        {/* Execute Button */}
        {currentQuestion === totalQuestions - 1 ? (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-yellow-800 text-sm font-medium">
                🎯 This is your final decision! Once you submit, you cannot retake the simulation.
              </p>
            </div>
            <button
              onClick={handleFinalSubmit}
              className="w-full bg-red-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors text-lg"
            >
              🚀 Submit Final Decision & Complete Simulation
            </button>
          </div>
        ) : (
          <button
            onClick={handleSubmit}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Execute Decision & Continue
          </button>
        )}
      </div>
    </div>
  );
};

export default StrategicOptionsRanking;
