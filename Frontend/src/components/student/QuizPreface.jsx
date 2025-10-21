import React, { useEffect, useState } from 'react';

/**
 * Mission Briefing Component - Premium Gaming UI
 * Shows before quiz starts with futuristic briefing interface
 */

const QuizPreface = ({ quiz, onNext, onBack }) => {
  const [particlesReady, setParticlesReady] = useState(false);

  useEffect(() => {
    setParticlesReady(true);
  }, []);

  return (
    <div className="min-h-screen premium-dashboard-bg relative overflow-hidden smooth-scroll">
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

      <div className="relative z-10 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          {onBack && (
            <button
              onClick={onBack}
              className="btn-secondary mb-8 group"
              style={{ minWidth: 'auto' }}
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Mission Select
            </button>
          )}

          {/* Mission Briefing Header */}
          <div className="text-center mb-12 animate-fadeIn">
            {/* Mission Icon */}
            <div 
              className="w-32 h-32 mx-auto mb-8 rounded-full flex items-center justify-center animate-scaleUp"
              style={{
                background: 'var(--gradient-purple)',
                boxShadow: '0 12px 48px rgba(123, 123, 232, 0.4)'
              }}
            >
              <svg className="w-16 h-16" style={{ color: 'var(--pure-white)' }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>

            {/* Title */}
            <h1 
              className="text-gradient-purple tracking-wider mb-6"
              style={{ 
                fontSize: 'var(--text-display)',
                fontWeight: 'var(--weight-black)',
                fontFamily: 'var(--font-heading)',
                textTransform: 'uppercase',
                letterSpacing: '2px'
              }}
            >
              Mission Briefing
            </h1>

            <h2 style={{
              fontSize: 'var(--text-h1)',
              fontWeight: 'var(--weight-bold)',
              fontFamily: 'var(--font-heading)',
              color: 'var(--purple-primary)',
              marginBottom: 'var(--space-md)'
            }}>
              {quiz.title}
            </h2>
            <p style={{
              fontSize: 'var(--text-body-lg)',
              color: 'var(--medium-gray)',
              maxWidth: '800px',
              margin: '0 auto',
              lineHeight: 'var(--line-height-relaxed)'
            }}>
              {quiz.description}
            </p>
          </div>

          {/* Course Badge */}
          {quiz.course && (
            <div className="premium-card-base mb-8 animate-slideUp" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center">
                <div 
                  className="stat-card-icon blue"
                  style={{ 
                    width: '56px',
                    height: '56px',
                    marginRight: 'var(--space-md)',
                    flexShrink: 0
                  }}
                >
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div style={{ width: '100%' }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%'
                  }}>
                    <p style={{
                      fontSize: 'var(--text-caption)',
                      color: 'var(--medium-gray)',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      fontWeight: 'var(--weight-semibold)',
                      marginBottom: 'var(--space-xxs)'
                    }}>
                      Course Module
                    </p>
                    <p style={{
                      fontSize: 'var(--text-h3)',
                      fontWeight: 'var(--weight-bold)',
                      color: 'var(--dark-charcoal)',
                      textAlign: 'center'
                    }}>
                      {quiz.course.courseName} <span style={{ color: 'var(--soft-blue)' }}>({quiz.course.courseCode})</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mission Intelligence Section */}
          {quiz.preface && quiz.preface.trim() !== '' && (
            <div className="premium-card-base premium-card-lg animate-slideUp" style={{ 
              animationDelay: '0.3s',
              marginBottom: 'var(--space-2xl)'
            }}>
              <div style={{ 
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: 'var(--space-xl)'
              }}>
                <div 
                  className="stat-card-icon orange"
                  style={{ 
                    width: '64px', 
                    height: '64px', 
                    marginRight: 'var(--space-lg)', 
                    flexShrink: 0 
                  }}
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 style={{
                    fontSize: 'var(--text-h2)',
                    fontWeight: 'var(--weight-black)',
                    fontFamily: 'var(--font-heading)',
                    color: 'var(--dark-charcoal)',
                    marginBottom: 'var(--space-xs)'
                  }}>
                    Mission Intelligence
                  </h2>
                  <p style={{ 
                    color: 'var(--medium-gray)', 
                    fontSize: 'var(--text-body)' 
                  }}>
                    Critical information for mission success
                  </p>
                </div>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, rgba(255, 183, 77, 0.1), rgba(255, 155, 113, 0.1))',
                border: '2px solid var(--coral-orange)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--card-padding)'
              }}>
                <p style={{
                  color: 'var(--dark-charcoal)',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 'var(--line-height-relaxed)',
                  fontSize: 'var(--text-body-lg)'
                }}>
                  {quiz.preface}
                </p>
              </div>
            </div>
          )}

          {/* Mission Parameters Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 'var(--space-xl)',
            marginBottom: 'var(--space-2xl)'
          }}>
            {/* Challenges */}
            <div className="stat-card hover-lift animate-scaleUp" style={{ animationDelay: '0.4s' }}>
              <div className="stat-card-icon purple" style={{ width: '72px', height: '72px' }}>
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="stat-card-value text-gradient-purple" style={{ marginTop: 'var(--space-md)' }}>
                {quiz.questions?.length || 0}
              </div>
              <div className="stat-card-label">Mission Challenges</div>
              <p style={{ 
                color: 'var(--medium-gray)', 
                fontSize: 'var(--text-body-sm)', 
                marginTop: 'var(--space-xs)',
                lineHeight: 'var(--line-height-normal)'
              }}>
                Strategic decisions to make
              </p>
            </div>

            {/* Success Threshold */}
            <div className="stat-card hover-lift animate-scaleUp" style={{ animationDelay: '0.5s' }}>
              <div className="stat-card-icon" style={{ 
                width: '72px', 
                height: '72px',
                background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(76, 175, 80, 0.3))',
                color: 'var(--success)'
              }}>
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div style={{
                fontSize: 'var(--text-stat-lg)',
                fontWeight: 'var(--weight-black)',
                color: 'var(--success)',
                marginTop: 'var(--space-md)',
                lineHeight: 1
              }}>
                {quiz.passingScore || 60}%
              </div>
              <div className="stat-card-label">Success Threshold</div>
              <p style={{ 
                color: 'var(--medium-gray)', 
                fontSize: 'var(--text-body-sm)', 
                marginTop: 'var(--space-xs)',
                lineHeight: 'var(--line-height-normal)'
              }}>
                Minimum score required
              </p>
            </div>

            {/* Difficulty Level */}
            <div className="stat-card hover-lift animate-scaleUp" style={{ animationDelay: '0.6s' }}>
              <div className="stat-card-icon orange" style={{ width: '72px', height: '72px' }}>
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="text-gradient-orange" style={{
                fontSize: 'var(--text-stat-lg)',
                fontWeight: 'var(--weight-black)',
                marginTop: 'var(--space-md)',
                lineHeight: 1
              }}>
                {quiz.difficulty || 'MED'}
              </div>
              <div className="stat-card-label">Difficulty Level</div>
              <p style={{ 
                color: 'var(--medium-gray)', 
                fontSize: 'var(--text-body-sm)', 
                marginTop: 'var(--space-xs)',
                lineHeight: 'var(--line-height-normal)'
              }}>
                Mission complexity rating
              </p>
            </div>
          </div>

          {/* Mission Protocols */}
          <div className="premium-card-base premium-card-lg animate-slideUp" style={{ 
            animationDelay: '0.7s',
            marginBottom: 'var(--space-2xl)',
            background: 'linear-gradient(135deg, rgba(255, 217, 61, 0.1), rgba(255, 183, 77, 0.1))',
            border: '2px solid var(--sunny-yellow)'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              <svg style={{ 
                width: '36px',
                height: '36px',
                color: 'var(--sunny-yellow)',
                marginRight: 'var(--space-lg)',
                marginTop: 'var(--space-xs)',
                flexShrink: 0
              }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 style={{
                  fontSize: 'var(--text-h2)',
                  fontWeight: 'var(--weight-black)',
                  fontFamily: 'var(--font-heading)',
                  color: 'var(--dark-charcoal)',
                  marginBottom: 'var(--space-xl)'
                }}>
                  Mission Protocols
                </h3>
                <ul style={{ 
                  listStyle: 'none',
                  padding: 0,
                  margin: 0 
                }}>
                  <li style={{ 
                    display: 'flex',
                    alignItems: 'flex-start',
                    marginBottom: 'var(--space-md)',
                    fontSize: 'var(--text-body-lg)',
                    color: 'var(--dark-charcoal)',
                    lineHeight: 'var(--line-height-relaxed)'
                  }}>
                    <span style={{ color: 'var(--purple-primary)', marginRight: 'var(--space-md)', fontSize: '24px' }}>1.</span>
                    <span>Back Navigation through browser not allowed. Your score may be reset to Zero.</span>
                  </li>
                  <li style={{ 
                    display: 'flex',
                    alignItems: 'flex-start',
                    marginBottom: 'var(--space-md)',
                    fontSize: 'var(--text-body-lg)',
                    color: 'var(--dark-charcoal)',
                    lineHeight: 'var(--line-height-relaxed)'
                  }}>
                    <span style={{ color: 'var(--purple-primary)', marginRight: 'var(--space-md)', fontSize: '24px' }}>2.</span>
                    <span>To choose your Decision, you need to drag and drop options, and the top-most being your most prominent choice for the Challenge.</span>
                  </li>
                  <li style={{ 
                    display: 'flex',
                    alignItems: 'flex-start',
                    marginBottom: 'var(--space-md)',
                    fontSize: 'var(--text-body-lg)',
                    color: 'var(--dark-charcoal)',
                    lineHeight: 'var(--line-height-relaxed)'
                  }}>
                    <span style={{ color: 'var(--purple-primary)', marginRight: 'var(--space-md)', fontSize: '24px' }}>3.</span>
                    <span>After every decision, you must fill in the reasoning block in 100 words, which is compulsory.</span>
                  </li>
                  <li style={{ 
                    display: 'flex',
                    alignItems: 'flex-start',
                    marginBottom: 'var(--space-md)',
                    fontSize: 'var(--text-body-lg)',
                    color: 'var(--dark-charcoal)',
                    lineHeight: 'var(--line-height-relaxed)'
                  }}>
                    <span style={{ color: 'var(--purple-primary)', marginRight: 'var(--space-md)', fontSize: '24px' }}>4.</span>
                    <span>Open login ID only on 1 PC/Laptop at a time.</span>
                  </li>
                  <li style={{ 
                    display: 'flex',
                    alignItems: 'flex-start',
                    fontSize: 'var(--text-body-lg)',
                    color: 'var(--dark-charcoal)',
                    lineHeight: 'var(--line-height-relaxed)'
                  }}>
                    <span style={{ color: 'var(--purple-primary)', marginRight: 'var(--space-md)', fontSize: '24px' }}>5.</span>
                    <span>There is no time limit for any Decision until the time instructed by your Institute.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 'var(--space-xl)',
            flexWrap: 'wrap'
          }}>
            {onBack && (
              <button
                onClick={onBack}
                className="btn-secondary"
                style={{ minWidth: '180px' }}
              >
                <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Abort Mission</span>
              </button>
            )}
            <button
              onClick={onNext}
              className="btn-accent btn-large"
              style={{ minWidth: '240px' }}
            >
              <span style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-sm)'
              }}>
                <svg style={{ width: '28px', height: '28px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Initiate Mission</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPreface;
