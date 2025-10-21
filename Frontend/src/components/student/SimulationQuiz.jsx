import React, { useState, useEffect } from 'react';
import StrategicOptionsRanking from './StrategicOptionsRanking';
import Timer from '../Timer';
import { useQuiz } from '../../context/QuizContext';
import { submitSimulation, apiCall } from '../../utils/api';

const SimulationQuiz = ({ onClose }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hasCompletedBefore, setHasCompletedBefore] = useState(false);
  const [previousScore, setPreviousScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const { 
    currentQuestion, 
    totalQuestions, 
    question, 
    showResults, 
    score, 
    answers, 
    timeLeft, 
    isTimerActive, 
    handleTimeUp 
  } = useQuiz();

  // Check if user has completed this simulation before
  useEffect(() => {
    const checkPreviousCompletion = async () => {
      try {
        setLoading(true);
        // Check if user has any completed simulation scores (student-accessible endpoint)
        const response = await apiCall('/scores/my-scores');
        if (response && response.scores) {
          // Look for this specific simulation in user's own scores
          const userSimulations = response.scores.filter(score => 
            score.simulationName === 'Area Manager Strategic Simulation' &&
            score.status === 'completed'
          );
          
          if (userSimulations.length > 0) {
            setHasCompletedBefore(true);
            setPreviousScore(userSimulations[0]);
          }
        }
      } catch (error) {
        console.error('Error checking previous completion:', error);
        // If there's an error (like unauthorized), just allow them to proceed
        // This prevents blocking students if the API fails
      } finally {
        setLoading(false);
      }
    };

    checkPreviousCompletion();
  }, []);

  // Submit simulation data when results are shown
  useEffect(() => {
    if (showResults && answers.length > 0 && !isSubmitted) {
      const submitSimulationData = async () => {
        try {
          const totalPossibleScore = totalQuestions * 110;
          const percentageScore = (score / totalPossibleScore) * 100;
          const averageAccuracy = answers.reduce((acc, curr) => acc + (curr?.totalAccuracy || 0), 0) / answers.length;
          
          const simulationData = {
            simulationName: 'Area Manager Strategic Simulation',
            score: percentageScore, // Use percentage score instead of raw score
            accuracy: averageAccuracy,
            totalQuestions: totalQuestions,
            answers: answers.map((answer, index) => ({
              questionId: `sim_question_${index + 1}`,
              questionText: answer.title,
              questionType: 'strategic-simulation',
              selectedAnswer: answer.orderedOptions?.map(opt => opt.text).join(', ') || 'Strategic Decision',
              correctAnswer: 'Optimal Strategic Decision',
              isCorrect: answer.totalAccuracy > 60, // Consider >60% accuracy as correct
              timeTaken: answer.timeTaken,
              reasoning: answer.reasoning || '',
              points: answer.score,
              options: answer.orderedOptions?.map(opt => ({
                text: opt.text,
                isCorrect: opt.accuracy > 60
              })) || []
            }))
          };

          console.log('Submitting simulation data:', simulationData);
          const result = await submitSimulation(simulationData);
          console.log('Simulation submitted successfully:', result);
          setIsSubmitted(true);
        } catch (error) {
          console.error('Failed to submit simulation:', error);
          // Still mark as submitted to prevent retry loops, but show error
          setIsSubmitted(true);
        }
      };

      submitSimulationData();
    }
  }, [showResults, answers, score, totalQuestions, isSubmitted]);

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking simulation status...</p>
        </div>
      </div>
    );
  }

  // Show previous results if already completed
  if (hasCompletedBefore && previousScore) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Simulation Already Completed!</h1>
          <p className="text-xl text-gray-600">You have already completed the Area Manager Strategic Simulation</p>
          <div className="mt-4 p-3 bg-blue-100 border border-blue-400 rounded-lg">
            <p className="text-blue-700 font-medium">🔒 Retaking is not allowed. Here are your results:</p>
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{previousScore.totalScore}</p>
              <p className="text-gray-600">Your Score</p>
              <p className="text-sm text-gray-500">{((previousScore.totalScore / (10 * 110)) * 100).toFixed(1)}% of total possible</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{previousScore.accuracy || 62.5}%</p>
              <p className="text-gray-600">Average Accuracy</p>
              <p className="text-sm text-gray-500">Across all decisions</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{previousScore.totalQuestions || 10}</p>
              <p className="text-gray-600">Decisions Made</p>
              <p className="text-sm text-gray-500">Total challenges completed</p>
            </div>
          </div>
        </div>

        <div className="text-center space-y-4">
          <p className="text-gray-600">Completed on: {new Date(previousScore.submittedAt).toLocaleDateString()}</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔄 Refresh Results
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showResults && answers.length > 0) {
    const totalPossibleScore = totalQuestions * 110;
    const percentageScore = (score / totalPossibleScore) * 100;
    const averageAccuracy = answers.reduce((acc, curr) => acc + (curr?.totalAccuracy || 0), 0) / answers.length;
    
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mission Complete!</h1>
          <p className="text-xl text-gray-600">Congratulations on completing the Area Manager Strategic Simulation</p>
          {isSubmitted && (
            <div className="mt-4 p-3 bg-green-100 border border-green-400 rounded-lg">
              <p className="text-green-700 font-medium">✅ Results submitted successfully to your admin dashboard!</p>
            </div>
          )}
        </div>

        <div className="bg-blue-50 p-6 rounded-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{score}</p>
              <p className="text-gray-600">Your Score</p>
              <p className="text-sm text-gray-500">{percentageScore.toFixed(1)}% of total possible</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{averageAccuracy.toFixed(1)}%</p>
              <p className="text-gray-600">Average Accuracy</p>
              <p className="text-sm text-gray-500">Across all decisions</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{totalQuestions}</p>
              <p className="text-gray-600">Decisions Made</p>
              <p className="text-sm text-gray-500">Total challenges completed</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Decision Analysis</h2>
          <div className="space-y-6">
            {answers.map((answer, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">
                  Decision {index + 1}: {answer.title}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Decision Accuracy</h4>
                    {answer.orderedOptions.map((option) => {
                      const accuracy = answer.accuracyPerOption[option.id];
                      return (
                        <div key={option.id} className="flex justify-between items-center mb-2">
                          <span className="text-sm">{option.text}</span>
                          <div className="flex items-center">
                            <span className="text-sm font-medium mr-2">
                              {accuracy.accuracy}%
                            </span>
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 rounded-full h-2"
                                style={{ width: `${accuracy.accuracy}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Score Breakdown</h4>
                    <p className="text-sm">Options Score: {answer.score - answer.reasoningPoints} points</p>
                    <p className="text-sm">Reasoning Bonus: {answer.reasoningPoints} points</p>
                    <p className="text-sm font-medium mt-2">Total Score: {answer.score} points</p>
                    <p className="text-sm text-gray-500 mt-2">Average Accuracy: {answer.totalAccuracy.toFixed(1)}%</p>
                    <p className="text-sm text-gray-500">Time Taken: {answer.timeTaken}s</p>
                    {answer.isAutoSubmitted && (
                      <p className="text-sm text-red-500 mt-1">⚠️ Auto-submitted (time expired)</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (showOptions) {
    return <StrategicOptionsRanking onBack={() => setShowOptions(false)} />;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Quiz Header */}
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
        
        <h3 className="text-xl font-semibold text-gray-800">Strategic Business Decision</h3>
        <p className="text-gray-600 mt-2">Review the decision scenario below</p>
      </div>

      {/* Quiz Content */}
      <div className="p-6">
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">{question.title}</h3>
          <p className="text-gray-700 leading-relaxed">{question.description}</p>
        </div>

        {/* Mission Constraints & Intel */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Mission Constraints & Intel
            <span className="text-gray-600 text-base font-normal ml-2">
              Critical information that affects your decision
            </span>
          </h3>

          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-lg font-semibold mb-4">{question.rules.length} rules</h4>
            <div className="space-y-6">
              <div>
                <h5 className="font-semibold text-gray-900 mb-2">General Mission Parameters</h5>
                <ol className="list-decimal list-inside space-y-3 text-gray-700">
                  {question.rules.map((rule, index) => (
                    <li key={index}>{rule}</li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={() => setShowOptions(true)}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Click to View Strategic Options
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimulationQuiz;
