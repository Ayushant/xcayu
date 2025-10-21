import React, { useState } from 'react';
import StudentQuizList from './StudentQuizList';
import SimulationQuiz from './SimulationQuiz';
import { QuizProvider } from '../../context/QuizContext';
import SimulationLockModal from '../SimulationLockModal';

const EnhancedStudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('quizzes'); // 'quizzes' or 'simulation'
  const [simulationStarted, setSimulationStarted] = useState(false);
  const [isQuizActive, setIsQuizActive] = useState(false);
  
  const studentInfo = {
    name: localStorage.getItem('fullName') || 'Student',
    college: localStorage.getItem('college') || localStorage.getItem('userCollege') || 'College',
    email: localStorage.getItem('userEmail') || localStorage.getItem('email') || ''
  };
  
  const userCollege = localStorage.getItem('userCollege') || localStorage.getItem('college');

  const handleStartSimulation = () => {
    setSimulationStarted(true);
  };

  const handleQuizStateChange = (isActive) => {
    setIsQuizActive(isActive);
  };

  return (
    <div className="min-h-screen premium-dashboard-bg smooth-scroll">
      {/* Simulation Lock Modal */}
      <SimulationLockModal userCollege={userCollege} />
      
      {/* Header - Hidden when quiz is active */}
      {!isQuizActive && (
        <div className="glass-header">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--dark-charcoal)' }}>
                  Student Dashboard
                </h1>
                <p className="mt-1" style={{ color: 'var(--medium-gray)', fontSize: 'var(--text-body-lg)' }}>
                  Hello, <span style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--dark-charcoal)' }}>{studentInfo.name}</span>
                </p>
                <p className="text-sm" style={{ color: 'var(--medium-gray)' }}>{studentInfo.college}</p>
              </div>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/login';
                }}
                className="btn-secondary"
                style={{ 
                  background: 'rgba(255, 82, 82, 0.1)',
                  color: 'var(--error)',
                  borderColor: 'var(--error)'
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${!isQuizActive ? 'py-8' : ''}`}>
        <div className={`${!isQuizActive ? '' : ''}`}>
          {/* Tab Navigation - Hidden when quiz is active */}
          {!isQuizActive && (
            <div className="mb-6"></div>
          )}

          <div>
            <StudentQuizList onQuizStateChange={handleQuizStateChange} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedStudentDashboard;

