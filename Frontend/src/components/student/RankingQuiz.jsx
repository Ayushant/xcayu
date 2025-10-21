import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { API_URL } from '../../config/api';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import axios from 'axios';

/**
 * Premium Gaming Ranking Quiz Component
 * NO TIMER - Strategic thinking focused
 * Features: Drag-and-drop ranking, futuristic UI, particle effects
 */

// Sortable Item Component with Premium Gaming UI
function SortableItem({ id, rank, text }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center p-3 sm:p-5 bg-white/90 backdrop-blur-sm border-2 rounded-lg sm:rounded-xl cursor-move group transition-all shadow-md ${
        isDragging
          ? 'scale-105 z-50 border-blue-500 shadow-lg'
          : 'border-purple-200 hover:border-purple-300 hover:shadow-lg'
      }`}
      {...attributes}
      {...listeners}
    >
      {/* Rank Badge - Mobile Responsive */}
      <div className={`w-10 sm:w-12 h-10 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center font-black text-lg sm:text-xl transition-all flex-shrink-0 ${
        isDragging 
          ? 'bg-blue-600 text-white shadow-md' 
          : 'bg-blue-500 text-white'
      }`}>
        <span className="font-black">{rank}</span>
      </div>

      {/* Option Text - Mobile Responsive */}
      <div className="flex-1 ml-2 sm:ml-4">
        <p className="text-gray-800 font-semibold text-sm sm:text-lg">{text}</p>
      </div>

      {/* Drag Handle Icon - Mobile Responsive */}
      <svg className="w-5 sm:w-7 h-5 sm:h-7 text-blue-500 group-hover:scale-110 transition-transform flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </div>
  );
}

const RankingQuiz = ({ quiz, onComplete, onBack }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [rankedOptions, setRankedOptions] = useState([]);
  const [instruction, setInstruction] = useState('');
  const [allAnswers, setAllAnswers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showStrategicOptions, setShowStrategicOptions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Helper function to count words
  const countWords = (text) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const progressPercentage = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  // Initialize ranked options for current question
  useEffect(() => {
    if (currentQuestion) {
      const options = currentQuestion.options.map((opt, index) => ({
        id: `option-${index}`,
        text: opt.text,
        rank: index + 1
      }));
      setRankedOptions(options);
      setInstruction('');
      setShowStrategicOptions(false);
    }
  }, [currentQuestionIndex, currentQuestion]);

  // ✅ LOAD PREVIOUS PROGRESS ON MOUNT (Using localStorage)
  useEffect(() => {
    if (quiz && quiz._id) {
      loadPreviousProgress();
    }
  }, [quiz?._id]);

  /**
   * ✅ RESUME FROM LAST QUESTION
   * Uses localStorage to save and restore progress (no API calls needed)
   */
  const loadPreviousProgress = () => {
    try {
      // Safety check: ensure quiz is defined
      if (!quiz || !quiz._id || !quiz.questions) {
        console.log('⚠️  Quiz data not ready yet');
        setCurrentQuestionIndex(0);
        setLoading(false);
        return;
      }

      setLoading(true);
      const quizProgressKey = `quiz-progress-${quiz._id}`;
      const savedProgress = localStorage.getItem(quizProgressKey);
      
      console.log('🚀 Loading quiz progress from browser storage...');
      
      if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        console.log(`✅ RESUMING QUIZ: Total answered: ${progress.answeredQuestions.length}`);
        
        // Restore all answers
        const restoredAnswers = {};
        progress.answeredQuestions.forEach(answer => {
          restoredAnswers[answer.questionIndex] = {
            selectedRanking: answer.selectedRanking,
            instruction: answer.instruction
          };
        });
        
        setAllAnswers(Object.keys(restoredAnswers).map((index) => ({
          questionIndex: parseInt(index),
          selectedRanking: restoredAnswers[index].selectedRanking,
          instruction: restoredAnswers[index].instruction
        })));

        // Calculate next question = max(answered) + 1
        const answeredIndices = Object.keys(restoredAnswers).map(Number);
        console.log('🔢 Answered indices:', answeredIndices);
        
        const nextQuestion = Math.max(...answeredIndices) + 1;
        const questionToStart = Math.min(nextQuestion, quiz.questions.length - 1);
        
        console.log(`🎯 Resuming from question index ${questionToStart} (Q${questionToStart + 1})`);
        setCurrentQuestionIndex(questionToStart);
      } else {
        console.log('🆕 Starting NEW quiz session (no previous answers)');
        setCurrentQuestionIndex(0);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('❌ Error loading progress:', err);
      setCurrentQuestionIndex(0);
      setLoading(false);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setRankedOptions((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        
        return newItems.map((item, index) => ({
          ...item,
          rank: index + 1
        }));
      });
    }
  };

  const handleViewStrategicOptions = () => {
    setShowStrategicOptions(true);
  };

  /**
   * ✅ SAVE PROGRESS WHEN STUDENT ABANDONS QUIZ
   * Called when user leaves quiz without completing
   */
  const handleAbandonQuiz = () => {
    try {
      const quizProgressKey = `quiz-progress-${quiz._id}`;
      const existingProgress = localStorage.getItem(quizProgressKey);
      
      if (existingProgress) {
        const progress = JSON.parse(existingProgress);
        progress.abandonedAt = new Date().toISOString();
        progress.abandoned = true;
        localStorage.setItem(quizProgressKey, JSON.stringify(progress));
        
        console.log('💾 Quiz progress saved before abandonment');
      }
    } catch (err) {
      console.error('Error saving abandoned progress:', err);
    }
    
    if (onBack) {
      onBack();
    }
  };

  const handleNext = () => {
    if (!instruction || instruction.trim().length === 0) {
  alert('⚠️ Please provide your strategic reason before proceeding');
      return;
    }

    const wordCount = countWords(instruction);
    if (wordCount < 20) {
      alert(`⚠️ Instruction must be at least 20 words (current: ${wordCount} words)`);
      return;
    }

    if (wordCount > 100) {
      alert(`⚠️ Instruction must not exceed 100 words (current: ${wordCount} words)`);
      return;
    }

    const cleanedRanking = rankedOptions.map(option => ({
      text: option.text,
      rank: option.rank
    }));
    
    const answer = {
      questionId: currentQuestion._id,
      questionText: currentQuestion.text,
      selectedRanking: cleanedRanking,
      instruction: instruction.trim()
    };

    const updatedAnswers = [...allAnswers];
    updatedAnswers[currentQuestionIndex] = answer;
    setAllAnswers(updatedAnswers);

    // ✅ SAVE ANSWER TO DATABASE
    saveAnswerToDatabase(currentQuestionIndex, cleanedRanking, instruction.trim());

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmit(updatedAnswers);
    }
  };

  /**
   * ✅ SAVE EACH ANSWER TO BROWSER STORAGE (localStorage)
   */
  const saveAnswerToDatabase = async (questionIndex, selectedRanking, instruction) => {
    try {
      const quizProgressKey = `quiz-progress-${quiz._id}`;
      
      // Get existing progress or create new
      const existingProgress = localStorage.getItem(quizProgressKey);
      let progress = existingProgress ? JSON.parse(existingProgress) : {
        quizId: quiz._id,
        answeredQuestions: [],
        startedAt: new Date().toISOString()
      };
      
      // Add or update this answer
      progress.answeredQuestions = progress.answeredQuestions.filter(a => a.questionIndex !== questionIndex);
      progress.answeredQuestions.push({
        questionIndex,
        selectedRanking,
        instruction,
        answeredAt: new Date().toISOString()
      });
      
      // Sort by question index for easy retrieval
      progress.answeredQuestions.sort((a, b) => a.questionIndex - b.questionIndex);
      
      // Save to localStorage
      localStorage.setItem(quizProgressKey, JSON.stringify(progress));
      
      console.log(`💾 Answer saved for question ${questionIndex} (saved ${progress.answeredQuestions.length} total)`);
    } catch (err) {
      console.error(`❌ Error saving answer for question ${questionIndex}:`, err);
    }
  };

  const handleSubmit = async (answers) => {
    setIsSubmitting(true);
    
    const cleanedAnswers = answers.map(answer => ({
      questionId: answer.questionId,
      questionText: answer.questionText,
      selectedRanking: answer.selectedRanking.map(option => ({
        text: option.text,
        rank: option.rank
      })),
      instruction: answer.instruction
    }));
    
    try {
      const token = localStorage.getItem('token');
      
      const payload = {
        quizId: quiz._id,
        answers: cleanedAnswers
      };
      
      const response = await axios.post(
        `${API_URL}/scores/submit`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (onComplete) {
        onComplete(response.data.data);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit quiz';
      alert(`❌ ${errorMessage}`);
      setIsSubmitting(false);
    }
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)'
      }}>
        <div className="gaming-spinner"></div>
      </div>
    );
  }

  return (
    <div className="premium-dashboard-bg" style={{
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Circles */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '15%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(123, 123, 232, 0.15), transparent)',
          borderRadius: '50%',
          filter: 'blur(60px)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '20%',
          right: '15%',
          width: '350px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(255, 155, 113, 0.15), transparent)',
          borderRadius: '50%',
          filter: 'blur(60px)'
        }} />
      </div>

      <div style={{
        position: 'relative',
        zIndex: 10,
        padding: 'var(--space-xl) var(--space-md)'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* Back Button */}
          {onBack && (
            <button
              onClick={handleAbandonQuiz}
              className="btn-secondary"
              style={{ marginBottom: 'var(--space-xl)' }}
            >
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Mission Select</span>
            </button>
          )}

          {/* Progress Section */}
          <div style={{ marginBottom: 'var(--space-2xl)' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-md)'
            }}>
              <span style={{
                fontSize: 'var(--text-body-lg)',
                fontWeight: 'var(--weight-bold)',
                color: 'var(--dark-charcoal)'
              }}>
                Mission Progress
              </span>
              <span style={{
                fontSize: 'var(--text-body-lg)',
                fontWeight: 'var(--weight-black)',
                color: 'var(--purple-primary)'
              }}>
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className="progress-container">
              <div 
                className="progress-bar"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 'var(--space-md)',
              gap: 'var(--space-xs)'
            }}>
              {Array.from({ length: totalQuestions }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: '8px',
                    borderRadius: 'var(--radius-sm)',
                    background: i < currentQuestionIndex 
                      ? 'var(--success)'
                      : i === currentQuestionIndex
                      ? 'var(--purple-primary)'
                      : 'var(--light-gray)',
                    transition: 'all var(--transition-normal)',
                    animation: i === currentQuestionIndex ? 'pulse 2s infinite' : 'none'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Mission Header - Mobile Responsive */}
          <div className="bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 border-2 border-purple-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
              <div className="w-16 sm:w-24 h-16 sm:h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                <div className="text-center">
                  <div className="text-2xl sm:text-4xl font-black text-white mb-1">
                    {currentQuestionIndex + 1}
                  </div>
                  <div className="text-xs sm:text-sm text-white/90">of {totalQuestions}</div>
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 sm:w-8 h-5 sm:h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <h1 className="text-lg sm:text-3xl font-black text-gray-800">
                    <span style={{ fontFamily: 'var(--font-heading)' }}>
                      MISSION {currentQuestionIndex + 1}
                    </span>
                  </h1>
                </div>
                <div className="flex flex-col gap-1 sm:gap-3 text-xs sm:text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 sm:w-5 h-4 sm:h-5 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                    </svg>
                    <span className="font-semibold">Strategic Decision</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 sm:w-5 h-4 sm:h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                    </svg>
                    <span className="font-semibold text-green-600">No Time Limit</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Question Text */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              <span style={{ fontFamily: 'var(--font-heading)' }}>
                {currentQuestion.text}
              </span>
            </h2>
          </div>

          {/* Points Section */}
          {currentQuestion.points && currentQuestion.points.length > 0 && (
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8 border-2 border-purple-200">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-2xl font-black text-purple-700">Constraints</h3>
                  <h3 className="text-lg sm:text-2xl font-black text-purple-700" style={{ fontFamily: 'var(--font-heading)' }}>Constraints</h3>
                  <p className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'var(--font-heading)' }}>Critical information points (read-only)</p>
                </div>
                <div className="px-3 sm:px-4 py-1 sm:py-2 bg-purple-100 rounded-full border border-purple-300">
                  <span className="text-purple-700 font-bold text-xs sm:text-sm">IMPORTANT</span>
                </div>
              </div>
              <div className="space-y-2 sm:space-y-3">
                {currentQuestion.points.map((point, index) => (
                  <div key={index} className="bg-gray-50/80 backdrop-blur-sm border border-purple-200 rounded-lg p-2 sm:p-4 flex items-start gap-2 sm:gap-4 hover:border-purple-300 transition-all">
                    <div className="w-8 sm:w-10 h-8 sm:h-10 bg-purple-500 text-white rounded-lg flex items-center justify-center font-bold text-xs sm:text-base flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-gray-900 leading-relaxed flex-1 font-bold" style={{ fontSize: '18px' }}>
                      <span style={{ fontFamily: 'var(--font-heading)' }}>{point.text}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* View Strategic Options Button - Mobile Responsive */}
          {!showStrategicOptions && (
            <div className="flex justify-center mb-6 sm:mb-8">
              <button
                onClick={handleViewStrategicOptions}
                className="px-4 sm:px-12 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm sm:text-xl font-bold rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <span className="flex items-center gap-2 sm:gap-3">
                  <svg className="w-5 sm:w-7 h-5 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="hidden sm:inline">VIEW STRATEGIC OPTIONS</span>
                  <span className="sm:hidden">OPTIONS</span>
                </span>
              </button>
            </div>
          )}

          {/* Strategic Options Section */}
          {showStrategicOptions && (
            <div>
              {/* Ranking Instructions - Mobile Responsive */}
              <div className="bg-blue-50/80 backdrop-blur-sm border-2 border-blue-300 rounded-lg sm:rounded-xl p-3 sm:p-6 mb-6 sm:mb-8">
                <div className="flex items-start gap-2 sm:gap-4">
                  <svg className="w-6 sm:w-8 h-6 sm:h-8 text-blue-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-base sm:text-xl font-black text-blue-800 mb-1 sm:mb-2">RANKING PROTOCOL</p>
                    <p className="text-gray-700 text-xs sm:text-lg leading-relaxed">
                      Drag and drop options to rank them from <strong className="text-green-600">highest priority (1st)</strong> to <strong className="text-orange-600">lowest priority (last)</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Drag and Drop Ranking */}
              <div className="mb-6 sm:mb-8">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={rankedOptions.map(opt => opt.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2 sm:space-y-4">
                      {rankedOptions.map((option) => (
                        <SortableItem
                          key={option.id}
                          id={option.id}
                          rank={option.rank}
                          text={option.text}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>

              {/* Instruction Field */}
              <div className="bg-yellow-50/80 backdrop-blur-sm border-2 border-yellow-300 rounded-xl p-6 mb-8">
                <label className="block">
                  <div className="flex items-center gap-3 mb-4">
                    <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <span className="text-lg sm:text-2xl font-black text-yellow-800">
                        Your Strategic Reason <span className="text-red-600">*</span>
                      </span>
                      <p className="text-gray-700 text-xs sm:text-sm mt-1">
                        Explain your ranking choice (20-100 words required)
                      </p>
                    </div>
                  </div>
                  <textarea
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    placeholder="Provide your strategic reasoning for this ranking decision..."
                    className="w-full px-3 sm:px-6 py-3 sm:py-4 bg-white/90 backdrop-blur-sm border-2 border-purple-200 rounded-lg sm:rounded-xl text-sm sm:text-lg text-gray-800 placeholder-gray-400 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all min-h-32 sm:min-h-40 resize-y"
                    required
                  />
                </label>
                <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:justify-between gap-2 text-xs sm:text-base">
                  <p className={`font-bold ${
                    countWords(instruction) < 20 ? 'text-red-600' : 
                    countWords(instruction) > 100 ? 'text-red-600' : 
                    'text-green-600'
                  }`}>
                    Words: {countWords(instruction)}/20-100
                  </p>
                  <p className="text-gray-600">
                    {instruction.length} chars
                  </p>
                </div>
              </div>

              {/* Navigation Buttons - Mobile Responsive - NO PREVIOUS BUTTON */}
              <div className={`flex items-center gap-2 sm:gap-4 justify-end`}>
                <button
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-initial px-4 sm:px-12 py-3 sm:py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white text-sm sm:text-xl font-bold rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed sm:max-w-md"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 sm:w-6 h-4 sm:h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="hidden sm:inline">Submitting...</span>
                    </span>
                  ) : currentQuestionIndex === totalQuestions - 1 ? (
                    <span className="flex items-center justify-center gap-1 sm:gap-3">
                      <span className="hidden sm:inline">COMPLETE</span>
                      <span className="sm:hidden">Done</span>
                      <svg className="w-5 sm:w-7 h-5 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1 sm:gap-3">
                      <span className="hidden sm:inline">Next Challenge</span>
                      <span className="sm:hidden">Next</span>
                      <svg className="w-5 sm:w-7 h-5 sm:h-7 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RankingQuiz;
