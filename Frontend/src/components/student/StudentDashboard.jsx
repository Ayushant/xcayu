import React, { useState } from 'react';
import SimulationQuiz from './SimulationQuiz';
import { QuizProvider } from '../../context/QuizContext';
import SimulationLockModal from '../SimulationLockModal';

const StudentDashboard = () => {
  const [simulationStarted, setSimulationStarted] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const studentInfo = {
    name: localStorage.getItem('fullName') || 'Student',
    college: localStorage.getItem('college') || localStorage.getItem('userCollege') || 'ABC College'
  };
  
  // Get user college for license checking
  const userCollege = localStorage.getItem('userCollege') || localStorage.getItem('college');

  const handleStartQuiz = () => {
    setShowQuiz(true);
  };

  const handleStartSimulation = () => {
    setSimulationStarted(true);
  };

  const handleQuizClose = () => {
    // Reset both states to go back to main simulations page
    setShowQuiz(false);
    setSimulationStarted(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Simulation Lock Modal - Shows if license is invalid */}
      <SimulationLockModal userCollege={userCollege} />
      
      {/* Hide everything when quiz is active */}
      {!showQuiz && (
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            {!simulationStarted ? (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Area Manager Simulation</h1>
                  <h2 className="text-xl text-gray-600">Area Manager Training Program</h2>
                </div>

                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">Welcome back,</h3>
                  <p className="text-lg text-gray-800 mb-2">{studentInfo.name}</p>
                  <p className="text-gray-600">{studentInfo.college}</p>
                </div>

              <div className="prose max-w-none mb-8">
                <h3 className="text-2xl font-bold mb-4">Welcome to the Chocolate Company!</h3>
                <p className="text-gray-700 mb-4">
                  You have joined as the Area Manager of a Chocolate company. The company is famous for making world's best chocolate brands like Gickers, Falaxy, Pluto, M&Gs, Founty, and Bwix.
                </p>
                <p className="text-gray-700 mb-4">
                  It did not enter the India market for long because it was not sure about the retail infrastructure which would enable the chocolates to be served to customers in right quality. This reluctance of Pluto enabled Chocolate to monopolize the chocolate market in India.
                </p>
                <p className="text-gray-700 mb-4">
                  However, the company now feels that the time has arrived and therefore is building a team to carry out sales & distribution while the chocolates would get imported from across their factories in different parts of the world.
                </p>
                <p className="text-gray-700 mb-4">
                  The territory assigned to you is North India with Delhi NCR being the largest market for the category across India.
                </p>
                <p className="text-gray-700 mb-4">
                  Your first task is to build a team for NCR to set up the building blocks for distribution.
                </p>
              </div>

              <button
                onClick={handleStartSimulation}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Start New Simulation
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Area Manager Simulation</h1>
                <h2 className="text-xl text-gray-600">Area Manager Training Program</h2>
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800">Simulation in progress...</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Current Task</h3>
                  <p className="text-gray-600 mb-4">Build a team for NCR region</p>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    View Task Details
                  </button>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">My Progress</h3>
                  <p className="text-gray-600 mb-4">Track your simulation progress</p>
                  <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                    View Progress
                  </button>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Resources</h3>
                  <p className="text-gray-600 mb-4">Access simulation materials</p>
                  <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
                    View Resources
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Simulation Progress</h2>
                <div className="text-gray-600">
                  <p>Simulation started. Complete your first task to see progress.</p>
                </div>
                <div className="mt-8">
                  <button
                    onClick={handleStartQuiz}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Start First Challenge
                  </button>
                </div>
              </div>
            </div>
            )}
          </div>
        </div>
      )}
      
      {/* Show quiz in full screen when active */}
      {showQuiz && (
        <SimulationQuiz onClose={handleQuizClose} />
      )}
    </div>
  );
};

export default StudentDashboard;
