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
 * Premium Gaming Decision Challenge Component
 * NO TIMER - Strategic decision making focused
 * Features: Expandable sections, drag-and-drop, futuristic UI
 */

// Sortable Item Component with Premium Gaming Styling
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
      className={`flex items-center premium-card cursor-move group ${
        isDragging
          ? 'scale-105 z-50 border-cyan-400 neon-glow-active'
          : 'hover:border-cyan-400/50'
      }`}
      {...attributes}
      {...listeners}
    >
      <div className={`neon-badge ${isDragging ? 'neon-glow-active' : ''}`}>
        <span className="font-black">{rank}</span>
      </div>

      <div className="flex-1 ml-4">
        <p className="text-white font-semibold text-lg">{text}</p>
      </div>

      <svg className="w-7 h-7 text-cyan-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </div>
  );
}

const DecisionChallenge = ({ quiz, onComplete, onBack }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [rankedOptions, setRankedOptions] = useState([]);
  const [instruction, setInstruction] = useState('');
  const [allAnswers, setAllAnswers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showStrategicOptions, setShowStrategicOptions] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    constraints: true,
    intelligence: true
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const countWords = (text) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const progressPercentage = ((currentQuestionIndex + 1) / totalQuestions) * 100;

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

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleViewStrategicOptions = () => {
    setShowStrategicOptions(true);
  };

  const handleNext = () => {
    if (!instruction || instruction.trim().length === 0) {
      alert('⚠️ Please provide your strategic instruction before proceeding');
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

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmit(updatedAnswers);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      
      const prevAnswer = allAnswers[currentQuestionIndex - 1];
      if (prevAnswer) {
        setInstruction(prevAnswer.instruction);
        setShowStrategicOptions(true);
      }
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
        <div className="text-center">
          <div className="gaming-spinner mx-auto mb-4"></div>
          <p className="text-white/80 text-xl">Loading mission parameters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)'
    }}>
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Scan Line */}
      <div className="scan-line"></div>

      <div className="relative z-10 p-6">
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          {onBack && (
            <button
              onClick={onBack}
              className="mb-6 px-4 py-2 text-gray-800 hover:text-black flex items-center transition-all group"
            >
              <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Mission Select
            </button>
          )}

          {/* Progress Bar */}
          <div className="mb-8 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-bold text-white">Mission Progress</span>
              <span className="text-lg font-bold text-cyan-400">
                Challenge {currentQuestionIndex + 1}/{totalQuestions}
              </span>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
            </div>
          </div>

          {/* Header Section */}
          <div className="premium-card mb-8 animate-scaleUp">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center neon-glow">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              
              <div className="flex-1">
                <h1 className="text-4xl font-black text-white mb-3">
                  Decision Challenge {currentQuestionIndex + 1}
                </h1>
                <div className="flex items-center gap-6 text-white/70">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                    </svg>
                    <span className="font-semibold">Day {currentQuestionIndex + 1}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span className="font-semibold text-green-400">Untimed - Strategic Focus</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Strategic Business Decision */}
          <div className="premium-card border-2 border-blue-400/50 mb-8 animate-slideInBottom">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center neon-glow">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-black text-blue-300 mb-2">Strategic Business Decision</h2>
                <p className="text-white/80 text-lg">Review the decision scenario below</p>
              </div>
            </div>
          </div>

          {/* Property Shortlisting / Question Description */}
          <div className="premium-card mb-8">
            <h2 className="text-3xl font-black text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text mb-4">
              Property Shortlisting
            </h2>
            <p className="text-white/90 text-lg leading-relaxed">
              Select properties for new store openings considering rent levels and potential footfall. 
              Cover the top confectionary, bakery, supermarkets across NCR numbering 1500 in 3 to 6 months. 
              These outlets are key stores for Tedbury's and are very snooty by nature, spread across North, 
              East, West, South Delhi, Gurgaon, Faridabad, Noida, Greater Noida & Ghaziabad (radius of 50 km 
              from the centre of Delhi). Their popularity and the importance of availability & display of the 
              products and capturing the cash counters as chocolate is an impulse category.
            </p>
          </div>

          {/* Mission Constraints Section */}
          <div className="premium-card border-2 border-red-400/50 bg-gradient-to-br from-red-500/10 to-orange-500/10 mb-8">
            <div 
              className="flex items-center justify-between cursor-pointer group"
              onClick={() => toggleSection('constraints')}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center neon-glow">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-red-300 mb-1">Mission Constraints</h2>
                  <p className="text-white/70">Critical operational parameters</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-red-500/20 rounded-full backdrop-blur-sm border border-red-400/30">
                  <span className="text-red-300 text-sm font-bold">CRITICAL</span>
                </div>
                <svg 
                  className={`w-7 h-7 text-red-400 transition-transform ${expandedSections.constraints ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {expandedSections.constraints && (
              <div className="mt-6 animate-fadeIn">
                <div className="glass-panel p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-10 h-10 bg-purple-500/30 rounded-xl flex items-center justify-center">
                      <span className="text-white font-black text-lg">G</span>
                    </div>
                    <h3 className="text-2xl font-black text-purple-300 mt-1">General Mission Parameters</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-4 p-4 bg-purple-900/30 border border-purple-400/30 rounded-lg hover:border-purple-400/50 transition-all">
                      <div className="neon-badge" style={{ width: '2.5rem', height: '2.5rem', fontSize: '1rem' }}>
                        1
                      </div>
                      <p className="text-white/90 leading-relaxed flex-1 text-lg">
                        Each Salesman can cover maximum of 8-10 outlets per day considering the distances
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mission-Specific Intelligence */}
          {currentQuestion.points && currentQuestion.points.length > 0 && (
            <div className="premium-card border-2 border-orange-400/50 bg-gradient-to-br from-orange-500/10 to-yellow-500/10 mb-8">
              <div 
                className="flex items-center justify-between cursor-pointer group"
                onClick={() => toggleSection('intelligence')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-yellow-600 rounded-xl flex items-center justify-center neon-glow">
                    <span className="text-white font-black text-2xl">2</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-orange-300 mb-1">Mission-Specific Intelligence</h2>
                    <p className="text-white/70">Additional strategic information</p>
                  </div>
                </div>
                <svg 
                  className={`w-7 h-7 text-orange-400 transition-transform ${expandedSections.intelligence ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {expandedSections.intelligence && (
                <div className="mt-6 glass-panel p-6 animate-fadeIn">
                  <div className="space-y-3">
                    {currentQuestion.points.map((point, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 bg-orange-900/30 border border-orange-400/30 rounded-lg hover:border-orange-400/50 transition-all">
                        <div className="neon-badge" style={{ width: '2.5rem', height: '2.5rem', fontSize: '1rem', background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                          {index + 1}
                        </div>
                        <p className="text-white/90 leading-relaxed flex-1 text-lg">{point.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* View Strategic Options Button */}
          {!showStrategicOptions && (
            <div className="flex justify-center mb-8 animate-fadeIn">
              <button
                onClick={handleViewStrategicOptions}
                className="btn-gaming px-12 py-5 text-xl group"
              >
                <span className="relative z-10 flex items-center">
                  <svg className="w-7 h-7 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  VIEW STRATEGIC OPTIONS
                </span>
              </button>
            </div>
          )}

          {/* Strategic Options Section */}
          {showStrategicOptions && (
            <div className="animate-fadeIn">
              <div className="premium-card border-2 border-cyan-400/50 mb-8">
                <h3 className="text-2xl font-black text-cyan-300 mb-4">Rank Your Strategic Options</h3>
                <p className="text-white/80 text-lg mb-6">
                  Drag and drop options to rank from <strong className="text-green-400">highest priority (1st)</strong> to <strong className="text-orange-400">lowest priority (last)</strong>
                </p>
                
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={rankedOptions.map(opt => opt.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4">
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
              <div className="premium-card border-2 border-yellow-400/50 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 mb-8">
                <label className="block">
                  <div className="flex items-center gap-3 mb-4">
                    <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <span className="text-2xl font-black text-yellow-300">
                        Your Strategic Instruction <span className="text-red-400">*</span>
                      </span>
                      <p className="text-white/70 text-sm mt-1">
                        Explain your ranking choice (20-100 words required)
                      </p>
                    </div>
                  </div>
                  <textarea
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    placeholder="Provide your strategic reasoning for this ranking decision..."
                    className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-xl text-white placeholder-white/50 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 transition-all min-h-40 resize-y text-lg"
                    required
                  />
                </label>
                <div className="mt-4 flex justify-between text-base">
                  <p className={`font-bold ${
                    countWords(instruction) < 20 ? 'text-red-400' : 
                    countWords(instruction) > 100 ? 'text-red-400' : 
                    'text-green-400'
                  }`}>
                    Word count: {countWords(instruction)} (min: 20, max: 100)
                  </p>
                  <p className="text-white/60">
                    {instruction.length} characters
                  </p>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className={`flex items-center gap-4 ${currentQuestionIndex === 0 ? 'justify-end' : 'justify-between'}`}>
                {currentQuestionIndex > 0 && (
                  <button
                    onClick={handlePrevious}
                    className="px-8 py-4 rounded-xl font-bold text-lg text-white bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 transition-all border border-white/20 hover:scale-105 flex items-center gap-2"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>
                )}

                <button
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="btn-gaming px-12 py-5 text-xl flex-1 max-w-md"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <div className="gaming-spinner w-6 h-6 mr-3" style={{ width: '1.5rem', height: '1.5rem', borderWidth: '2px' }}></div>
                      Submitting...
                    </span>
                  ) : currentQuestionIndex === totalQuestions - 1 ? (
                    <span className="flex items-center justify-center">
                      Submit Final Decision
                      <svg className="w-7 h-7 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      Next Challenge
                      <svg className="w-7 h-7 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

export default DecisionChallenge;
