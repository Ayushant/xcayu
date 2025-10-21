import React, { useEffect, useState } from 'react';

/**
 * Premium Gaming Mission Accomplished Component
 * Celebration screen with particles, animations, and detailed results
 * NO TIME STATS - Focus on strategic achievement
 */

const QuizResults = ({ result, results, onBack, onReturnToDashboard, onRetakeQuiz }) => {
  const data = result || results;
  const [showCelebration, setShowCelebration] = useState(true);
  const [particles, setParticles] = useState([]);
  
  useEffect(() => {
    // Generate celebration particles
    const newParticles = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: i * 0.02,
      color: ['#fbbf24', '#f59e0b', '#06b6d4', '#8b5cf6', '#ec4899'][Math.floor(Math.random() * 5)]
    }));
    setParticles(newParticles);

    // Hide celebration after animation
    setTimeout(() => setShowCelebration(false), 3000);
  }, []);
  
    if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'linear-gradient(135deg, #581c87 0%, #7c3aed 50%, #a855f7 100%)'
      }}>
        <div className="bg-white rounded-xl shadow-lg p-8 text-center border-2 border-gray-200">
          <p className="text-gray-700 text-xl">No results available.</p>
          {onBack && (
            <button
              onClick={onBack}
              className="mt-6 px-8 py-3 text-gray-800 hover:text-black font-semibold"
            >
              ← Back to Mission Select
            </button>
          )}
        </div>
      </div>
    );
  }
  
  const scoreData = data.score || data;
  const {
    totalScore = 0,
    percentage = data.percentage || 0,
    answers = [],
    quiz = data.quiz || {},
    completedAt = new Date(),
    displayScore,
    displayMaxMarks
  } = scoreData;

  const getPerformance = (percentage) => {
    if (percentage >= 90) return { 
      level: 'LEGENDARY', 
      description: 'Perfect Strategic Execution',
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/20',
      icon: '🏆'
    };
    if (percentage >= 75) return { 
      level: 'EXCELLENT', 
      description: 'Outstanding Performance',
      color: 'text-green-400',
      bg: 'bg-green-500/20',
      icon: '⭐'
    };
    if (percentage >= 60) return { 
      level: 'GOOD', 
      description: 'Solid Strategic Thinking',
      color: 'text-blue-400',
      bg: 'bg-blue-500/20',
      icon: '👍'
    };
    return { 
      level: 'COMPLETE', 
      description: 'Mission Finished',
      color: 'text-purple-400',
      bg: 'bg-purple-500/20',
      icon: '✓'
    };
  };

  const performance = getPerformance(percentage);
  // Prefer backend-provided displayMaxMarks (Super Admin total), then maxMarks
  const derivedMaxMarks = (typeof displayMaxMarks === 'number' && displayMaxMarks > 0)
    ? displayMaxMarks
    : (typeof scoreData.maxMarks === 'number' && scoreData.maxMarks > 0)
      ? scoreData.maxMarks
      : (typeof quiz.maxMarks === 'number' && quiz.maxMarks > 0)
        ? quiz.maxMarks
        : 0; // show 0 if missing to surface config issue

  // Numerator: prefer displayScore if present, else totalScore
  const totalScoreDisplay = (typeof displayScore === 'number') ? displayScore : totalScore;

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

      {/* Celebration Particles */}
      {showCelebration && (
        <div className="absolute inset-0 pointer-events-none z-20">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute celebration-particle"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                backgroundColor: particle.color,
                animationDelay: `${particle.delay}s`,
                '--tx': `${(Math.random() - 0.5) * 200}vw`,
                '--ty': `${(Math.random() - 0.5) * 200}vh`
              }}
            />
          ))}
        </div>
      )}


      <div className="relative z-10 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Trophy Header */}
          <div className="text-center mb-12">
            <div className="w-40 h-40 mx-auto mb-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
              <svg className="w-20 h-20 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            
            <h1 className="text-6xl font-black text-gray-800 mb-4 tracking-wider">
              MISSION ACCOMPLISHED!
            </h1>
            <p className="text-2xl text-gray-600">
              Strategic Simulation Complete
            </p>
          </div>

          {/* Score Display */}
          <div className="bg-white rounded-xl shadow-lg p-8 text-center mb-12 border-2 border-gray-200">
            <div className="text-7xl font-black text-transparent bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text mb-6">
              {Number(totalScoreDisplay).toFixed(0)} / {derivedMaxMarks}
            </div>
            <div className="text-2xl text-gray-600 mb-8">
              Final Score: <span className="text-gray-800 font-bold">{Number(totalScoreDisplay).toFixed(0)} / {derivedMaxMarks}</span>
            </div>
            {/* Performance Badge */}
            <div className={`inline-flex items-center gap-6 px-12 py-6 rounded-2xl ${performance.bg} ${performance.color} font-black text-2xl border-2 border-current shadow-lg`}>
              <span className="text-5xl">{performance.icon}</span>
              <div className="text-left">
                <div className="text-4xl mb-1">{performance.level}</div>
                <div className="text-lg opacity-90 font-normal">{performance.description}</div>
              </div>
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" clipRule="evenodd"/>
              </svg>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Your Score */}
            <div className="bg-white rounded-xl shadow-lg p-6 text-center border-2 border-gray-200">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 mb-4 inline-block">
                <svg className="w-10 h-10 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
                            <div className="text-5xl font-black text-transparent bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text mb-3">
                {Math.round(totalScore)}
              </div>
              <div className="text-blue-600 font-bold text-xl mb-2">Your Score</div>
                            <div className="text-gray-600">{Math.round(percentage)}% ranking accuracy</div>
            </div>

            {/* Missions Completed */}
            <div className="bg-white rounded-xl shadow-lg p-6 text-center border-2 border-gray-200">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 mb-4 inline-block">
                <svg className="w-10 h-10 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                </svg>
              </div>
              <div className="text-5xl font-black text-transparent bg-gradient-to-br from-purple-600 to-pink-600 bg-clip-text mb-3">
                {answers.length}
              </div>
              <div className="text-purple-600 font-bold text-xl mb-2">Missions Completed</div>
              <div className="text-gray-600">Strategic decisions executed</div>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="mb-12 animate-slideInBottom" style={{ animationDelay: '0.7s' }}>
            <h2 style={{
              fontSize: 'var(--text-h1)',
              fontWeight: 'var(--weight-black)',
              color: 'var(--dark-charcoal)',
              marginBottom: 'var(--space-xl)',
              display: 'flex',
              alignItems: 'center'
            }}>
              <svg style={{ width: '32px', height: '32px', color: 'var(--purple-primary)', marginRight: 'var(--space-md)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Mission Analysis & Results
            </h2>
            <div className="space-y-6">
              {answers.map((answer, index) => {
                const isRankingQuestion = answer.questionType === 'ranking' && answer.selectedRanking && answer.correctRanking;
                const score = answer.rankingScore || answer.points || 0;
                
                return (
                  <div key={index} className="premium-card border-2 border-purple-400/30 hover:border-purple-400/60 transition-all">
                    {/* Question Header */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="neon-badge">
                          {index + 1}
                        </div>
                        <h3 className="font-black text-2xl text-white">
                          Mission {index + 1}
                        </h3>
                      </div>
                    </div>

                    {/* Question Text */}
                    <div className="glass-panel p-6 mb-6">
                      <p className="text-white font-semibold text-lg">{answer.questionText}</p>
                    </div>

                    {isRankingQuestion ? (
                      <>
                        {/* Your Ranking */}
                        <div className="glass-panel p-6 border-2 border-cyan-400/30 mb-6">
                          <h4 className="font-black text-cyan-300 mb-4 flex items-center text-xl">
                            <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                            </svg>
                            Your Strategic Ranking
                          </h4>
                          <div className="space-y-3">
                            {answer.selectedRanking
                              .sort((a, b) => a.rank - b.rank)
                              .map((option, idx) => (
                                <div key={idx} className="flex items-center bg-white/10 rounded-lg p-4 border border-cyan-400/20">
                                  <div className="neon-badge" style={{ width: '2.5rem', height: '2.5rem', fontSize: '1rem' }}>
                                    {option.rank}
                                  </div>
                                  <span className="text-white ml-4 text-lg">{option.text}</span>
                                </div>
                              ))}
                          </div>
                        </div>

                        {/* Your Instruction */}
                        <div className="glass-panel p-6 border-2 border-purple-400/30">
                          <h4 className="font-black text-purple-300 mb-3 flex items-center text-xl">
                            <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            Your Strategic Explanation
                          </h4>
                          <p className="text-white/90 leading-relaxed text-lg italic">{answer.instruction}</p>
                        </div>
                        
                        {/* Option Points Overview - Only show top choice */}
                        {answer.options && answer.options.length > 0 && answer.selectedRanking && answer.selectedRanking.length > 0 && (
                          <div className="glass-panel p-6 border-2 border-cyan-400/30 bg-cyan-500/10 mt-4">
                            <h4 className="font-black text-cyan-300 mb-3 flex items-center text-xl">
                              <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 2a8 8 0 100 16 8 8 0 000-16z"/>
                              </svg>
                              Option Points (Your Top Choice)
                            </h4>
                            <div className="space-y-2">
                              {(() => {
                                // Find the student's top choice (rank 1)
                                const topChoice = answer.selectedRanking.find(r => r.rank === 1);
                                if (!topChoice) return null;
                                
                                // Find the corresponding option with points
                                const topOption = answer.options.find(opt => opt.text === topChoice.text);
                                if (!topOption) return null;
                                
                                const earnedPoints = typeof topOption.points === 'number' ? topOption.points : 0;
                                const maxPoints = typeof topOption.maxPoints === 'number' ? topOption.maxPoints : earnedPoints;
                                const correctRankInfo = answer.correctRanking?.find(r => r.text === topOption.text);
                                const correctRank = correctRankInfo?.rank;
                                const isCorrectPosition = correctRank === 1;
                                const hasPoints = earnedPoints > 0;
                                
                                return (
                                  <div className={`flex items-center justify-between p-3 rounded border ${
                                    isCorrectPosition ? 'bg-green-500/20 border-green-400/40 text-green-200' : 
                                    hasPoints ? 'bg-yellow-500/20 border-yellow-400/40 text-yellow-200' :
                                    'bg-white/10 border-white/20 text-white'
                                  }`}>
                                    <div className="flex-1">
                                      <span className="text-base block">{topOption.text}</span>
                                      <span className="text-xs opacity-70">
                                        Your rank: #1 {correctRank && `• Correct: #${correctRank}`}
                                      </span>
                                    </div>
                                    <span className="font-bold ml-3">
                                      {Math.round(earnedPoints)} pts
                                    </span>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        )}

                        {/* Option Impact */}
                        <div className="glass-panel p-6 border-2 border-indigo-400/30 bg-indigo-500/10 mt-4">
                          <h4 className="font-black text-indigo-300 mb-3 flex items-center text-xl">
                            <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            Choice Impact & Feedback
                          </h4>
                          <p className="text-white/90 leading-relaxed text-lg">
                            {answer.selectedOptionImpact && answer.selectedOptionImpact.trim().length > 0
                              ? answer.selectedOptionImpact
                              : 'No impact explanation provided for this option.'}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="glass-panel p-6">
                          <p className="text-sm text-white/60 mb-2">Your Answer:</p>
                          <p className="text-white font-semibold text-lg">{answer.selectedAnswer || answer.selectedOption}</p>
                        </div>
                        
                        {/* Option Points Overview - Only show selected option */}
                        {answer.options && answer.options.length > 0 && answer.selectedOption && (
                          <div className="glass-panel p-6 mt-4 border-2 border-cyan-400/30 bg-cyan-500/10">
                            <p className="text-xs text-cyan-300 font-semibold mb-2 flex items-center">
                              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 2a8 8 0 100 16 8 8 0 000-16z"/>
                              </svg>
                              Option Points (Your Choice)
                            </p>
                            <div className="space-y-2">
                              {(() => {
                                // Only show the option that the student selected
                                const selectedOpt = answer.options.find(opt => opt.text === answer.selectedOption);
                                if (!selectedOpt) return null;
                                
                                return (
                                  <div className="flex items-center justify-between p-3 rounded border bg-green-500/20 border-green-400/40 text-green-200">
                                    <span className="text-base">{selectedOpt.text}</span>
                                    <span className="font-bold">{Math.round(typeof selectedOpt.points === 'number' ? selectedOpt.points : 0)} pts</span>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        )}

                        {/* Option Impact */}
                        <div className="glass-panel p-6 mt-4 border-2 border-purple-400/30 bg-purple-500/10">
                          <p className="text-xs text-purple-300 font-semibold mb-2 flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            Option Impact & Feedback:
                          </p>
                          <p className="text-white/90 leading-relaxed text-base italic">
                            {answer.selectedOptionImpact && answer.selectedOptionImpact.trim().length > 0
                              ? answer.selectedOptionImpact
                              : 'No impact explanation provided for this option.'}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Performance Insights */}
          <div className="premium-card border-2 border-blue-400/50 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 mb-12 animate-fadeIn" style={{ animationDelay: '0.8s' }}>
            <h3 className="text-2xl font-black text-blue-300 mb-6 flex items-center">
              <svg className="w-8 h-8 mr-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
              </svg>
              Performance Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              <div className="glass-panel p-6 border border-green-400/30">
                <p className="text-green-300 font-black mb-4 flex items-center text-xl">
                  <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  Strengths
                </p>
                <ul className="text-white/80 space-y-2 text-lg">
                  {percentage >= 90 && <li className="flex items-start"><span className="text-green-400 mr-2">▸</span>Exceptional ranking accuracy!</li>}
                  {percentage >= 75 && percentage < 90 && <li className="flex items-start"><span className="text-green-400 mr-2">▸</span>Strong overall performance</li>}
                  {answers.filter(a => a.instruction && a.instruction.length > 50).length > 0 && (
                    <li className="flex items-start"><span className="text-green-400 mr-2">▸</span>Detailed strategic explanations</li>
                  )}
                  {answers.filter(a => (a.rankingScore || a.points || 0) >= 90).length > 0 && (
                    <li className="flex items-start"><span className="text-green-400 mr-2">▸</span>Perfect scores on {answers.filter(a => (a.rankingScore || a.points || 0) >= 90).length} mission(s)</li>
                  )}
                  {answers.every(a => a.instruction) && <li className="flex items-start"><span className="text-green-400 mr-2">▸</span>All instructions completed</li>}
                </ul>
              </div>

              {/* Growth Areas */}
              <div className="glass-panel p-6 border border-orange-400/30">
                <p className="text-orange-300 font-black mb-4 flex items-center text-xl">
                  <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  Growth Opportunities
                </p>
                <ul className="text-white/80 space-y-2 text-lg">
                  {percentage < 75 && <li className="flex items-start"><span className="text-orange-400 mr-2">▸</span>Review ranking criteria and practice</li>}
                  {answers.filter(a => (a.rankingScore || a.points || 0) < 60).length > 0 && (
                    <li className="flex items-start"><span className="text-orange-400 mr-2">▸</span>{answers.filter(a => (a.rankingScore || a.points || 0) < 60).length} mission(s) need attention</li>
                  )}
                  {answers.filter(a => !a.instruction || a.instruction.length < 30).length > 0 && (
                    <li className="flex items-start"><span className="text-orange-400 mr-2">▸</span>Provide more detailed explanations</li>
                  )}
                  {percentage < 60 && <li className="flex items-start"><span className="text-orange-400 mr-2">▸</span>Focus on strategic thinking patterns</li>}
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button
              onClick={onBack || onReturnToDashboard}
              className="px-12 py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <span className="flex items-center justify-center">
                <svg className="w-7 h-7 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Return to Command Center
              </span>
            </button>
            {onRetakeQuiz && (
              <button
                onClick={onRetakeQuiz}
                className="px-12 py-5 rounded-xl font-bold text-xl text-white bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 transition-all border border-white/20 hover:scale-105 flex items-center justify-center gap-3"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retry Mission
              </button>
            )}
          </div>

          {/* Completion Details */}
          <div className="mt-12 text-center text-gray-500 text-sm">
            <p>Mission completed on {new Date(completedAt).toLocaleString()}</p>
            <p className="mt-2">All data has been securely transmitted to command</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;
