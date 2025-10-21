import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';
import api from '../utils/axios';
// Toast notifications disabled (silent mode)
const toast = { success: () => {}, error: () => {}, info: () => {}, warning: () => {}, dismiss: () => {} };

/**
 * Reusable Score Edit Modal Component
 * Works for both Admin and College Admin
 * Accepts either: score object OR scoreId (will fetch score automatically)
 */
const AdminScoreEditModal = ({ 
  score: propScore,
  scoreId,
  onClose, 
  onSave,
  isCollegeAdmin = false 
}) => {
  const [score, setScore] = useState(propScore || null);
  const [loading, setLoading] = useState(!propScore && scoreId ? true : false);
  const [editingTotalScore, setEditingTotalScore] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editingInstruction, setEditingInstruction] = useState(null);
  const [newTotalScore, setNewTotalScore] = useState('');
  const [newQuestionScore, setNewQuestionScore] = useState('');
  const [newInstructionScore, setNewInstructionScore] = useState('');
  const [editReason, setEditReason] = useState('');
  const [instructorScore, setInstructorScore] = useState('');
  const [instructorFeedback, setInstructorFeedback] = useState('');

  // Fetch score details if scoreId is provided instead of score object
  useEffect(() => {
    if (scoreId && !propScore) {
      fetchScoreDetails();
    }
  }, [scoreId, propScore]);

  const fetchScoreDetails = async () => {
    try {
      setLoading(true);
      let endpoint;
      if (isCollegeAdmin) {
        endpoint = `/college-admin/score-details/${scoreId}`;
      } else {
        endpoint = `/scores/${scoreId}`;
      }
      
      const { data } = await api.get(endpoint);
      setScore(data);
    } catch (error) {
      console.error('Error fetching score details:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch score details');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  // Determine API endpoints based on user role
  const getEndpoint = (scoreId, action) => {
    if (isCollegeAdmin) {
      return `/college-admin/score-edit/${scoreId}`;
    }
    return `/scores/${scoreId}/edit`;
  };

  const handleEditTotalScore = async () => {
    if (!editReason.trim()) {
      toast.error('Please provide a reason for editing the score');
      return;
    }

    const scoreValue = parseFloat(newTotalScore);
    if (isNaN(scoreValue) || scoreValue < 0 || scoreValue > 100) {
      toast.error('Score must be between 0 and 100');
      return;
    }

    try {
      await api.put(getEndpoint(score._id), {
        newScore: scoreValue,
        reason: editReason
      });
      
      toast.success('Total score updated successfully!');
      setEditingTotalScore(false);
      setNewTotalScore('');
      setEditReason('');
      
      if (onSave) onSave();
    } catch (error) {
      console.error('Error updating score:', error);
      toast.error(error.response?.data?.message || 'Failed to update total score');
    }
  };

  const handleEditQuestionScore = async (questionIndex) => {
    if (!editReason.trim()) {
      toast.error('Please provide a reason for editing the score');
      return;
    }

    try {
      await api.put(getEndpoint(score._id), {
        questionIndex,
        newQuestionScore: parseFloat(newQuestionScore),
        reason: editReason
      });
      
      toast.success('Question score updated successfully!');
      setEditingQuestion(null);
      setNewQuestionScore('');
      setEditReason('');
      
      if (onSave) onSave();
    } catch (error) {
      console.error('Error updating question score:', error);
      toast.error(error.response?.data?.message || 'Failed to update question score');
    }
  };

  const handleEditInstructionScore = async (questionIndex) => {
    if (!editReason.trim()) {
      toast.error('Please provide a reason for editing the score');
      return;
    }

    try {
      await api.put(getEndpoint(score._id), {
        questionIndex,
        newInstructionScore: parseFloat(newInstructionScore),
        reason: editReason
      });
      
      toast.success('Instruction score updated successfully!');
      setEditingInstruction(null);
      setNewInstructionScore('');
      setEditReason('');
      
      if (onSave) onSave();
    } catch (error) {
      console.error('Error updating instruction score:', error);
      toast.error(error.response?.data?.message || 'Failed to update instruction score');
    }
  };

  const handleAddInstructorScore = async () => {
    const scoreValue = parseFloat(instructorScore);
    const maxInstructor = score.maxInstructorScore || 50;
    
    if (isNaN(scoreValue) || scoreValue < 0 || scoreValue > maxInstructor) {
      toast.error(`Please enter a valid score between 0 and ${maxInstructor}`);
      return;
    }

    try {
      await api.put(`/scores/${score._id}`, {
        instructorScore: scoreValue,
        feedback: instructorFeedback || ''
      });
      
      toast.success('Instructor score added successfully!');
      setInstructorScore('');
      setInstructorFeedback('');
      
      // Refresh score data
      if (scoreId) {
        await fetchScoreDetails();
      }
      if (onSave) onSave();
    } catch (error) {
      console.error('Error adding instructor score:', error);
      toast.error(error.response?.data?.message || 'Failed to add instructor score');
    }
  };

  // Show loading state while fetching score
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading score details...</p>
        </div>
      </div>
    );
  }

  if (!score) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Edit Quiz Score</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-3xl font-bold leading-none"
            title="Close"
          >
            ×
          </button>
        </div>

        {/* Final Score Display */}
        <div className="mb-4 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-300">
          <div className="text-center">
            <p className="text-lg text-gray-700 font-medium mb-2">Final Total Score</p>
            <p className="text-5xl font-bold text-purple-600">
              {Math.round(score.totalScore)} / {score.quiz?.maxMarks || score.maxMarks || 100}
            </p>
          </div>
        </div>

        {/* Student & Quiz Info */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 font-medium">Student</p>
                <p className="font-semibold text-gray-900">{score.student?.fullName || 'N/A'}</p>
                <p className="text-sm text-gray-500">{score.student?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Quiz</p>
                <p className="font-semibold text-gray-900">{score.quiz?.title || 'N/A'}</p>
                <p className="text-sm text-gray-500">
                  Submitted: {score.submittedAt ? new Date(score.submittedAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <div className="text-center bg-white rounded-lg p-3 border-2 border-blue-300">
                <p className="text-xs text-gray-600 font-medium">Instructor Edit</p>
                <p className="text-2xl font-bold text-blue-600">{Math.round(score.totalScore)}</p>
                <button
                  onClick={() => {
                    setEditingTotalScore(true);
                    setNewTotalScore(score.totalScore);
                  }}
                  className="mt-2 px-2 py-1 bg-orange-600 text-white text-xs rounded-lg hover:bg-orange-700 transition-colors"
                >
                  ✏️ Edit
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Total Score Form */}
        {editingTotalScore && (
          <div className="mb-6 p-4 bg-orange-50 border-2 border-orange-300 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <span className="text-orange-600 mr-2">📝</span>
              Edit Total Score
            </h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700 w-32">New Score (%):</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={newTotalScore}
                  onChange={(e) => setNewTotalScore(e.target.value)}
                  placeholder="e.g., 85"
                  className="w-32 px-3 py-2 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="flex items-start space-x-2">
                <label className="text-sm font-medium text-gray-700 w-32 pt-2">Reason:</label>
                <textarea
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  placeholder="Explain why you're changing the score..."
                  className="flex-1 px-3 py-2 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  rows="2"
                  required
                />
              </div>
              <div className="flex space-x-2 pt-2">
                <button
                  onClick={handleEditTotalScore}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors"
                >
                  ✓ Save Total Score
                </button>
                <button
                  onClick={() => {
                    setEditingTotalScore(false);
                    setNewTotalScore('');
                    setEditReason('');
                  }}
                  className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 font-semibold transition-colors"
                >
                  ✗ Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Questions & Answers */}
        {score.answers && score.answers.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-lg text-gray-800">Questions & Answers:</h4>
            {score.answers.map((answer, index) => (
              <div key={index} className="border-2 border-gray-200 rounded-lg p-5 bg-gray-50 hover:bg-gray-100 transition-colors">
                {/* Debug: Log answer data and role */}
                {console.log(`Answer ${index}:`, { 
                  isCollegeAdmin: isCollegeAdmin,
                  hasOptions: !!(answer.options && answer.options.length > 0),
                  optionsCount: answer.options?.length || 0,
                  hasRanking: !!(answer.selectedRanking && answer.selectedRanking.length > 0),
                  topChoice: answer.selectedRanking?.[0]?.text
                })}
                
                <div className="mb-3 flex justify-between items-start">
                  <p className="font-bold text-gray-800 text-lg">Q{index + 1}: {answer.questionText}</p>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-purple-600">
                      Points: {answer.points || 0}
                    </span>
                  </div>
                </div>

                {/* Ranking Answer */}
                {((answer.selectedRanking && answer.selectedRanking.length > 0) || (answer.options && answer.options.length > 0)) && (
                  <div className="mb-3">
                    {answer.selectedRanking && answer.selectedRanking.length > 0 && (
                      <>
                        <p className="text-sm font-medium text-gray-700 mb-2">Student's Ranking:</p>
                        <div className="space-y-1">
                          {answer.selectedRanking.map((option, idx) => (
                            <div key={idx} className="flex items-center text-sm bg-blue-50 p-2 rounded">
                              <span className="font-semibold mr-2 text-blue-600">{option.rank}.</span>
                              <span>{option.text}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    
                    {/* Option Marks Breakdown - Different display for College Admin vs Admin */}
                    {answer.options && answer.options.length > 0 ? (
                      <div className="mt-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 rounded-lg shadow-sm">
                        <p className="text-sm font-bold text-green-800 mb-3 flex items-center">
                          <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                          </svg>
                          {isCollegeAdmin 
                            ? "📊 Student's Selected Option & Marks:" 
                            : "📊 Super Admin's Marks Breakdown (All Options):"}
                        </p>
                        <div className="space-y-2">
                          {answer.options
                            .filter((opt) => {
                              // For College Admin: Show only the top choice
                              // For Admin/Super Admin: Show all options
                              console.log('Filtering options - isCollegeAdmin:', isCollegeAdmin);
                              if (isCollegeAdmin === true) {
                                const topChoiceText = answer.selectedRanking?.[0]?.text;
                                const shouldShow = opt.text === topChoiceText;
                                console.log(`Option "${opt.text}" - TopChoice: "${topChoiceText}" - Show: ${shouldShow}`);
                                return shouldShow;
                              }
                              return true; // Admin sees all options
                            })
                            .map((opt, optIdx) => {
                            const isTopChoice = answer.selectedRanking && answer.selectedRanking[0]?.text === opt.text;
                            const optionMarks = opt.points || opt.marks || 0;
                            return (
                              <div 
                                key={optIdx} 
                                className={`flex justify-between items-center text-sm p-3 rounded-lg transition-all ${
                                  isTopChoice 
                                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-600 font-bold shadow-md transform scale-105' 
                                    : 'bg-white border border-gray-300 opacity-75'
                                }`}
                              >
                                <span className="flex items-center flex-1">
                                  {isTopChoice && (
                                    <svg className="w-5 h-5 mr-2 text-green-600 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                    </svg>
                                  )}
                                  <span className={`${isTopChoice ? 'text-green-900 text-base' : 'text-gray-600'}`}>
                                    {opt.text}
                                  </span>
                                </span>
                                <span className={`font-bold text-base ml-3 px-3 py-1 rounded ${
                                  isTopChoice 
                                    ? 'bg-green-600 text-white' 
                                    : 'bg-gray-200 text-gray-600'
                                }`}>
                                  {isTopChoice 
                                    ? `✓ ${optionMarks} marks earned` 
                                    : `${optionMarks} marks`
                                  }
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-3 pt-3 border-t-2 border-green-300 bg-green-100 rounded p-3">
                          <p className="text-sm text-green-900 font-semibold flex items-center">
                            <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                            </svg>
                            Result: Student {isCollegeAdmin ? 'selected this option and' : 'ranked top choice and'} earned <span className="text-green-700 text-lg ml-1">{answer.points || 0} / 10 marks</span> for this question
                          </p>
                          <p className="text-xs text-green-700 mt-1 ml-7">
                            (Marks set by Super Admin)
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          ⚠️ Option marks data not available. This may be from an older quiz submission.
                        </p>
                      </div>
                    )}
                    
                    {answer.rankingScore !== undefined && (
                      <p className="mt-2 text-sm">
                        <span className="font-medium">Ranking Score: </span>
                        <span className={`font-bold ${answer.rankingScore >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                          {answer.rankingScore}%
                        </span>
                      </p>
                    )}
                    
                    {/* Show top choice impact */}
                    {answer.selectedOptionImpact && (
                      <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded">
                        <p className="text-xs font-semibold text-purple-600 mb-1 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          Top Choice Impact:
                        </p>
                        <p className="text-sm text-gray-700 italic">{answer.selectedOptionImpact}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Instruction/Reasoning */}
                {answer.instruction && (
                  <div className="mb-3 p-3 bg-blue-50 rounded border border-blue-200">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-medium text-gray-700">Student's Instruction/Reasoning:</p>
                      <div className="flex items-center">
                        <span className="text-xs text-gray-600 mr-2">Instruction Score:</span>
                        <span className="text-sm font-semibold text-blue-600">
                          {answer.instructionScore || 0} / 100
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-800 mt-1 italic">{answer.instruction}</p>
                    
                    {/* Edit Instruction Score */}
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      {editingInstruction === index ? (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="1"
                              value={newInstructionScore}
                              onChange={(e) => setNewInstructionScore(e.target.value)}
                              placeholder="Score (0-100)"
                              className="w-32 px-2 py-1 border rounded text-sm"
                            />
                            <input
                              type="text"
                              value={editReason}
                              onChange={(e) => setEditReason(e.target.value)}
                              placeholder="Reason for edit"
                              className="flex-1 px-2 py-1 border rounded text-sm"
                            />
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditInstructionScore(index)}
                              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingInstruction(null);
                                setNewInstructionScore('');
                                setEditReason('');
                              }}
                              className="px-3 py-1 bg-gray-400 text-white rounded text-sm hover:bg-gray-500"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingInstruction(index);
                            setNewInstructionScore(answer.instructionScore || 0);
                          }}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                          Edit Instruction Score
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Question Score Edit */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-300">
                  <div>
                    <span className="text-sm font-medium">Points: </span>
                    <span className="text-sm font-semibold text-blue-600">
                      {answer.rankingScore || answer.points || 0}
                    </span>
                  </div>
                  {editingQuestion === index ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={newQuestionScore}
                        onChange={(e) => setNewQuestionScore(e.target.value)}
                        placeholder="New score"
                        className="w-20 px-2 py-1 border rounded text-sm"
                      />
                      <input
                        type="text"
                        value={editReason}
                        onChange={(e) => setEditReason(e.target.value)}
                        placeholder="Reason"
                        className="w-48 px-2 py-1 border rounded text-sm"
                      />
                      <button
                        onClick={() => handleEditQuestionScore(index)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingQuestion(null);
                          setNewQuestionScore('');
                          setEditReason('');
                        }}
                        className="px-3 py-1 bg-gray-400 text-white rounded text-sm hover:bg-gray-500"
                      >
                        Cancel
                        </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingQuestion(index);
                        setNewQuestionScore(answer.rankingScore || answer.points || 0);
                      }}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Edit Score
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Score Edit History */}
        {score.scoreEdits && score.scoreEdits.length > 0 && (
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-lg mb-3 text-gray-800">Score Edit History:</h4>
            <div className="space-y-2">
              {score.scoreEdits.map((edit, idx) => (
                <div key={idx} className="text-sm border-b border-yellow-200 pb-2 last:border-0">
                  <p className="font-medium">
                    {edit.questionIndex !== undefined 
                      ? `Q${edit.questionIndex + 1} ${edit.editType === 'instruction' ? '(Instruction)' : '(Ranking)'}` 
                      : 'Total Score'}: 
                    {' '}
                    <span className="text-red-600">{edit.oldScore || edit.oldQuestionScore || 0}</span>
                    {' → '}
                    <span className="text-green-600">{edit.newScore || edit.newQuestionScore || 0}</span>
                  </p>
                  <p className="text-gray-600 italic">{edit.reason}</p>
                  <p className="text-xs text-gray-500">
                    {edit.editedAt ? new Date(edit.editedAt).toLocaleString() : 'Unknown date'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminScoreEditModal;
