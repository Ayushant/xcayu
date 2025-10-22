import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/api';
import QuizPreface from './QuizPreface';
import RankingQuiz from './RankingQuiz';
import DecisionChallenge from './DecisionChallenge';
import QuizResults from './QuizResults';

/**
 * Premium Gaming Mission Select Component
 * Displays available and completed missions with futuristic UI
 */

const StudentQuizList = ({ onQuizStateChange }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [myScores, setMyScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showPreface, setShowPreface] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [completedQuizResult, setCompletedQuizResult] = useState(null);
  const [activeTab, setActiveTab] = useState('available');

  const api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  useEffect(() => {
    fetchQuizzes();
    fetchMyScores();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/quizzes');
      const allQuizzes = response.data.quizzes || response.data.data?.quizzes || [];
      
      const activeQuizzes = allQuizzes.filter(q => 
        q.questions && 
        q.questions.length > 0
      );
      
      setQuizzes(activeQuizzes);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyScores = async () => {
    try {
      const response = await api.get('/scores/my-scores');
      console.log('DEBUG: Received scores from backend:', response.data.scores);
      if (Array.isArray(response.data.scores)) {
        response.data.scores.forEach((score, idx) => {
          console.log(`Score[${idx}]: totalScore=${score.totalScore}, maxMarks=${score.maxMarks}, quiz.maxMarks=${score.quiz?.maxMarks}`);
        });
      }
      setMyScores(response.data.scores || response.data || []);
    } catch (error) {
      console.error('Error fetching scores:', error);
    }
  };

  const handleStartQuiz = (quiz) => {
    const alreadyCompleted = myScores.some(score => 
      score.quiz?._id === quiz._id || score.quiz === quiz._id
    );

    if (alreadyCompleted) {
      setActiveTab('completed');
      return;
    }

    setSelectedQuiz(quiz);
    setShowPreface(true);
    setShowQuiz(false);
    setShowResults(false);
    setCompletedQuizResult(null);
    
    // Notify parent that quiz is active (hide header)
    if (onQuizStateChange) {
      onQuizStateChange(true);
    }
  };

  const handlePrefaceNext = () => {
    setShowPreface(false);
    setShowQuiz(true);
    
    // Quiz is still active (header stays hidden)
    if (onQuizStateChange) {
      onQuizStateChange(true);
    }
  };

  const handleQuizComplete = (result) => {
    setCompletedQuizResult(result);
    setShowResults(true);
    setShowQuiz(false);
    setShowPreface(false);
    setSelectedQuiz(null);
    fetchMyScores();
    
    // Results screen - keep header hidden
    if (onQuizStateChange) {
      onQuizStateChange(true);
    }
  };

  const handleBackToList = () => {
    setShowPreface(false);
    setShowQuiz(false);
    setShowResults(false);
    setSelectedQuiz(null);
    setCompletedQuizResult(null);
    if (onQuizStateChange) {
      onQuizStateChange(false);
    }
    fetchQuizzes();
    fetchMyScores();
  };

  const handleViewCompletedMission = async (score) => {
    try {
      // Fetch full score details with answers
      const response = await api.get(`/scores/${score._id}`);
      const fullScoreData = response.data.score || response.data.data?.score || response.data;
      
      setCompletedQuizResult(fullScoreData);
      setShowResults(true);
      
      if (onQuizStateChange) {
        onQuizStateChange(true);
      }
    } catch (error) {
      console.error('Error fetching score details:', error);
      alert('Unable to load mission results. Please try again.');
    }
  };

  const isQuizCompleted = (quizId) => {
    return myScores.some(score => 
      score.quiz?._id === quizId || score.quiz === quizId
    );
  };

  const getQuizScore = (quizId) => {
    const score = myScores.find(s => 
      s.quiz?._id === quizId || s.quiz === quizId
    );
    return score;
  };

  if (selectedQuiz && showPreface) {
    return (
      <QuizPreface 
        quiz={selectedQuiz} 
        onNext={handlePrefaceNext}
        onBack={handleBackToList}
      />
    );
  }

  if (selectedQuiz && showQuiz) {
    const isDecisionChallenge = selectedQuiz.title?.toLowerCase().includes('decision') || 
                               selectedQuiz.title?.toLowerCase().includes('challenge') ||
                               selectedQuiz.description?.toLowerCase().includes('decision');
    
    if (isDecisionChallenge) {
      return (
        <DecisionChallenge 
          quiz={selectedQuiz} 
          onComplete={handleQuizComplete}
          onBack={handleBackToList}
        />
      );
    } else {
      return (
        <RankingQuiz 
          quiz={selectedQuiz} 
          onComplete={handleQuizComplete}
          onBack={handleBackToList}
        />
      );
    }
  }

  if (showResults && completedQuizResult) {
    return (
      <QuizResults 
        result={completedQuizResult}
        results={completedQuizResult}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <div className="min-h-screen premium-dashboard-bg relative overflow-hidden">
      {/* Animated Background Circles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute rounded-full blur-3xl opacity-20"
          style={{
            top: '20%',
            left: '15%',
            width: '500px',
            height: '500px',
            background: 'var(--gradient-purple)'
          }}
        ></div>
        <div 
          className="absolute rounded-full blur-3xl opacity-20"
          style={{
            bottom: '10%',
            right: '10%',
            width: '450px',
            height: '450px',
            background: 'var(--gradient-orange)'
          }}
        ></div>
      </div>

      <div className="relative z-10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="premium-card-base premium-card-lg stagger-animation">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 
                  className="text-gradient-purple mb-2" 
                  style={{ 
                    fontSize: 'var(--text-display)',
                    fontWeight: 'var(--weight-black)',
                    fontFamily: 'var(--font-heading)'
                  }}
                >
                  Mission Control Center
                </h2>
                <p style={{ 
                  fontSize: 'var(--text-body-lg)',
                  color: 'var(--medium-gray)' 
                }}>
                  Select and execute your strategic missions
                </p>
              </div>
              <div className="stat-card-base text-center px-8 py-4" style={{
                background: 'var(--gradient-purple)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 8px 24px rgba(123, 123, 232, 0.25)'
              }}>
                <p style={{ 
                  fontSize: 'var(--text-caption)',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontWeight: 'var(--weight-semibold)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '8px'
                }}>
                  Completed Missions
                </p>
                <p style={{ 
                  fontSize: 'var(--text-stat-lg)',
                  fontWeight: 'var(--weight-black)',
                  color: 'var(--pure-white)',
                  lineHeight: '1'
                }}>
                  {myScores.length}
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="premium-card-base" style={{ padding: '0', overflow: 'hidden' }}>
            <nav className="flex">
              <button
                onClick={() => setActiveTab('available')}
                className={`relative flex-1 py-5 px-8 font-bold text-lg transition-all ${
                  activeTab === 'available'
                    ? ''
                    : ''
                }`}
                style={{
                  fontFamily: 'var(--font-heading)',
                  color: activeTab === 'available' ? 'var(--purple-primary)' : 'var(--medium-gray)',
                  background: activeTab === 'available' ? 'rgba(123, 123, 232, 0.05)' : 'transparent',
                  borderBottom: activeTab === 'available' ? '3px solid var(--purple-primary)' : '3px solid transparent'
                }}
              >
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`relative flex-1 py-5 px-8 font-bold text-lg transition-all ${
                  activeTab === 'completed'
                    ? ''
                    : ''
                }`}
                style={{
                  fontFamily: 'var(--font-heading)',
                  color: activeTab === 'completed' ? 'var(--success)' : 'var(--medium-gray)',
                  background: activeTab === 'completed' ? 'rgba(76, 175, 80, 0.05)' : 'transparent',
                  borderBottom: activeTab === 'completed' ? '3px solid var(--success)' : '3px solid transparent'
                }}
              >
                <span className="flex items-center justify-center gap-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Completed ({myScores.length})
                </span>
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="animate-slideInBottom" style={{ animationDelay: '0.2s' }}>
            {loading ? (
              <div className="flex flex-col justify-center items-center py-20">
                <div className="spinner mb-6"></div>
                <span style={{ 
                  color: 'var(--dark-charcoal)', 
                  fontSize: 'var(--text-h3)',
                  fontWeight: 'var(--weight-semibold)'
                }}>
                  Loading missions...
                </span>
              </div>
            ) : activeTab === 'available' ? (
              // Available Missions
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizzes.filter(q => !isQuizCompleted(q._id)).length === 0 ? (
                  <div className="col-span-full">
                    <div className="premium-card-base text-center py-20">
                      <svg 
                        className="w-24 h-24 mx-auto mb-6" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        style={{ color: 'var(--light-gray)' }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p style={{ 
                        color: 'var(--dark-charcoal)',
                        fontSize: 'var(--text-h2)',
                        fontWeight: 'var(--weight-bold)',
                        marginBottom: 'var(--space-sm)'
                      }}>
                        No available missions
                      </p>
                      <p style={{ color: 'var(--medium-gray)', fontSize: 'var(--text-body)' }}>
                        Check back later for new strategic challenges
                      </p>
                    </div>
                  </div>
                ) : (
                  quizzes
                    .filter(q => !isQuizCompleted(q._id))
                    .map((quiz, index) => (
                      <div
                        key={quiz._id}
                        className="quiz-card hover-lift stagger-animation"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        {/* Mission Badge */}
                        <div className="flex items-center gap-4 mb-6">
                          <div 
                            className="stat-card-icon purple"
                            style={{
                              width: '72px',
                              height: '72px'
                            }}
                          >
                            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h3 style={{
                              fontSize: 'var(--text-h2)',
                              fontWeight: 'var(--weight-bold)',
                              fontFamily: 'var(--font-heading)',
                              color: 'var(--dark-charcoal)',
                              lineHeight: 'var(--line-height-tight)',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              {quiz.title}
                            </h3>
                          </div>
                        </div>

                        {/* Description */}
                        <p style={{
                          color: 'var(--medium-gray)',
                          fontSize: 'var(--text-body-sm)',
                          lineHeight: 'var(--line-height-relaxed)',
                          marginBottom: 'var(--space-lg)',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {quiz.description}
                        </p>

                        {/* Mission Stats */}
                        <div className="space-y-3 mb-6">
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: 'var(--text-body-sm)',
                            background: '#F8F9FA',
                            border: '1px solid var(--light-gray)',
                            padding: '12px 16px',
                            borderRadius: 'var(--radius-sm)'
                          }}>
                            <span style={{ color: 'var(--medium-gray)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <svg style={{ width: '16px', height: '16px', color: 'var(--purple-primary)' }} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                              </svg>
                              Challenges
                            </span>
                            <span style={{ fontWeight: 'var(--weight-bold)', color: 'var(--dark-charcoal)' }}>
                              {quiz.questions?.length || 0}
                            </span>
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: 'var(--text-body-sm)',
                            background: '#F8F9FA',
                            border: '1px solid var(--light-gray)',
                            padding: '12px 16px',
                            borderRadius: 'var(--radius-sm)'
                          }}>
                            <span style={{ color: 'var(--medium-gray)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <svg style={{ width: '16px', height: '16px', color: 'var(--success)' }} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                              </svg>
                              Time Limit
                            </span>
                            <span style={{ fontWeight: 'var(--weight-bold)', color: 'var(--success)' }}>
                              Strategic
                            </span>
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: 'var(--text-body-sm)',
                            background: '#F8F9FA',
                            border: '1px solid var(--light-gray)',
                            padding: '12px 16px',
                            borderRadius: 'var(--radius-sm)'
                          }}>
                            <span style={{ color: 'var(--medium-gray)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <svg style={{ width: '16px', height: '16px', color: 'var(--coral-orange)' }} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd"/>
                              </svg>
                              Difficulty
                            </span>
                            <span className={`badge ${
                              quiz.difficulty === 'Easy' ? 'difficulty-easy' :
                              quiz.difficulty === 'Hard' ? 'difficulty-hard' :
                              'difficulty-medium'
                            }`}>
                              {quiz.difficulty || 'Medium'}
                            </span>
                          </div>
                        </div>

                        {/* Launch Button */}
                        <button
                          onClick={() => handleStartQuiz(quiz)}
                          className="btn-accent btn-large"
                          style={{ width: '100%' }}
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Launch Mission
                        </button>
                      </div>
                    ))
                )}
              </div>
            ) : (
              // Completed Missions
              <div className="space-y-6">
                {myScores.length === 0 ? (
                  <div className="premium-card-base text-center py-20">
                    <svg 
                      className="w-24 h-24 mx-auto mb-6" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      style={{ color: 'var(--light-gray)' }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p style={{ 
                      color: 'var(--dark-charcoal)',
                      fontSize: 'var(--text-h2)',
                      fontWeight: 'var(--weight-bold)',
                      marginBottom: 'var(--space-md)'
                    }}>
                      No completed missions yet
                    </p>
                    <button
                      onClick={() => setActiveTab('available')}
                      className="btn-accent btn-large"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      Start Your First Mission
                    </button>
                  </div>
                ) : (
                  myScores.map((score, index) => {
                    const quiz = quizzes.find(q => q._id === (score.quiz?._id || score.quiz));
                    // Use dynamic values from backend (Super Admin controlled)
                    const derivedMaxMarks = (typeof score.displayMaxMarks === 'number' && score.displayMaxMarks > 0)
                      ? score.displayMaxMarks
                      : (typeof quiz?.maxMarks === 'number' ? quiz.maxMarks : 100);
                    const numerator = (typeof score.displayScore === 'number')
                      ? score.displayScore
                      : (typeof score.totalScore === 'number' ? score.totalScore : 0);
                    const derivedPercentage = derivedMaxMarks > 0 ? Math.round((Number(numerator) / derivedMaxMarks) * 100) : 0;
                    const performance = derivedPercentage >= 80 ? 'Excellent' :
                                      derivedPercentage >= 60 ? 'Good' : 'Complete';
                    
                    return (
                      <div
                        key={score._id}
                        className="premium-card-base"
                        style={{ cursor: 'default' }}
                      >
                        <div className="flex flex-col md:flex-row gap-6">
                          {/* Score Badge */}
                          <div className="flex-shrink-0 self-center md:self-start">
                            <div style={{
                              width: '140px',
                              height: '140px',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              borderRadius: 'var(--radius-lg)',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
                              border: '3px solid rgba(255, 255, 255, 0.2)'
                            }}>
                              <div style={{
                                fontSize: '42px',
                                fontWeight: 'var(--weight-black)',
                                color: 'white',
                                marginBottom: '4px',
                                lineHeight: '1'
                              }}>
                                {Math.round(Number(numerator || 0))}
                              </div>
                              <div style={{
                                fontSize: '14px',
                                color: 'rgba(255, 255, 255, 0.9)',
                                fontWeight: 'var(--weight-bold)',
                                marginBottom: '2px'
                              }}>
                                out of
                              </div>
                              <div style={{
                                fontSize: '28px',
                                fontWeight: 'var(--weight-black)',
                                color: 'white',
                                lineHeight: '1'
                              }}>
                                {derivedMaxMarks}
                              </div>
                            </div>
                          </div>

                          {/* Mission Details */}
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
                              <div>
                                <h3 style={{
                                  fontSize: 'var(--text-h2)',
                                  fontWeight: 'var(--weight-black)',
                                  fontFamily: 'var(--font-heading)',
                                  color: 'var(--dark-charcoal)',
                                  marginBottom: 'var(--space-sm)'
                                }}>
                                  {score.simulationName || quiz?.title || 'Mission'}
                                </h3>
                                <span className={`badge ${
                                  derivedPercentage >= 80 ? 'difficulty-easy' :
                                  derivedPercentage >= 60 ? '' :
                                  ''
                                }`} style={{
                                  background: derivedPercentage >= 80 ? 'rgba(76, 175, 80, 0.1)' :
                                             derivedPercentage >= 60 ? 'rgba(123, 123, 232, 0.1)' :
                                             'rgba(255, 155, 113, 0.1)',
                                  color: derivedPercentage >= 80 ? 'var(--success)' :
                                         derivedPercentage >= 60 ? 'var(--purple-primary)' :
                                         'var(--coral-orange)',
                                  border: `2px solid ${derivedPercentage >= 80 ? 'var(--success)' :
                                         derivedPercentage >= 60 ? 'var(--purple-primary)' :
                                         'var(--coral-orange)'}`,
                                  padding: '8px 16px',
                                  fontSize: 'var(--text-body-sm)'
                                }}>
                                  {performance}
                                </span>
                              </div>
                              <div className="stat-card-icon orange" style={{ width: '56px', height: '56px', flexShrink: 0 }}>
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                              </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div style={{
                                background: '#F8F9FA',
                                border: '1px solid var(--light-gray)',
                                padding: 'var(--space-md)',
                                borderRadius: 'var(--radius-sm)'
                              }}>
                                <p style={{
                                  color: 'var(--medium-gray)',
                                  fontSize: 'var(--text-caption)',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px',
                                  fontWeight: 'var(--weight-bold)',
                                  marginBottom: 'var(--space-xs)'
                                }}>
                                  Challenges
                                </p>
                                <p style={{
                                  fontSize: '28px',
                                  fontWeight: 'var(--weight-black)',
                                  color: 'var(--dark-charcoal)'
                                }}>
                                  {score.answers?.length || score.totalQuestions || 0}
                                </p>
                              </div>
                              {score.accuracy && (
                                <div style={{
                                  background: '#F8F9FA',
                                  border: '1px solid var(--light-gray)',
                                  padding: 'var(--space-md)',
                                  borderRadius: 'var(--radius-sm)'
                                }}>
                                  <p style={{
                                    color: 'var(--medium-gray)',
                                    fontSize: 'var(--text-caption)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    fontWeight: 'var(--weight-bold)',
                                    marginBottom: 'var(--space-xs)'
                                  }}>
                                    Accuracy
                                  </p>
                                  <p style={{
                                    fontSize: '28px',
                                    fontWeight: 'var(--weight-black)',
                                    color: 'var(--soft-blue)'
                                  }}>
                                    {Math.round(score.accuracy)}%
                                  </p>
                                </div>
                              )}
                              <div style={{
                                background: '#F8F9FA',
                                border: '1px solid var(--light-gray)',
                                padding: 'var(--space-md)',
                                borderRadius: 'var(--radius-sm)'
                              }}>
                                <p style={{
                                  color: 'var(--medium-gray)',
                                  fontSize: 'var(--text-caption)',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px',
                                  fontWeight: 'var(--weight-bold)',
                                  marginBottom: 'var(--space-xs)'
                                }}>
                                  Status
                                </p>
                                <p style={{
                                  fontSize: '18px',
                                  fontWeight: 'var(--weight-black)',
                                  color: 'var(--success)'
                                }}>
                                  COMPLETE
                                </p>
                              </div>
                              <div style={{
                                background: '#F8F9FA',
                                border: '1px solid var(--light-gray)',
                                padding: 'var(--space-md)',
                                borderRadius: 'var(--radius-sm)'
                              }}>
                                <p style={{
                                  color: 'var(--medium-gray)',
                                  fontSize: 'var(--text-caption)',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px',
                                  fontWeight: 'var(--weight-bold)',
                                  marginBottom: 'var(--space-xs)'
                                }}>
                                  Date
                                </p>
                                <p style={{
                                  fontSize: '14px',
                                  fontWeight: 'var(--weight-bold)',
                                  color: 'var(--dark-charcoal)'
                                }}>
                                  {new Date(score.submittedAt || score.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentQuizList;
