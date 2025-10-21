import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// Toast notifications disabled (silent mode)
const toast = { success: () => {}, error: () => {}, loading: () => {}, info: () => {}, warning: () => {}, promise: () => {}, custom: () => {}, dismiss: () => {} };
import { useSocket } from "../context/SocketContext";
import { API_URL } from '../config/api';

/**
 * Dynamic Simulation Selector
 * 
 * Fetches all active simulations from the backend and displays them as cards.
 * Each simulation card links to the appropriate login/dashboard.
 * Automatically disables simulations if license is expired or inactive.
 * 
 * Listens to Socket.IO for real-time simulation updates.
 */
const Simulation = () => {
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdminButton, setShowAdminButton] = useState(false);

  useEffect(() => {
    fetchSimulations();

    // Listen for real-time simulation updates
    if (socket) {
      socket.on('simulation:updated', (data) => {
        console.log('Simulation updated:', data);
        fetchSimulations(); // Refresh list
        toast.success('Simulations updated!');
      });

      socket.on('simulation:created', (data) => {
        console.log('New simulation created:', data);
        fetchSimulations();
        toast.success(`New simulation added: ${data.simulationName}`);
      });
    }

    return () => {
      if (socket) {
        socket.off('simulation:updated');
        socket.off('simulation:created');
      }
    };
  }, [socket]);

  // Keyboard shortcut for admin panel visibility
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Check for Ctrl+Shift+A (Windows/Linux) or Cmd+Shift+A (Mac)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setShowAdminButton(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const fetchSimulations = async () => {
    try {
      setLoading(true);
      // Use public endpoint that doesn't require authentication
      const response = await axios.get(`${API_URL}/simulations/public`);
      
      const activeSimulations = response.data.data?.simulations || [];
      
      setSimulations(activeSimulations);
      setError(null);
    } catch (err) {
      console.error('Error fetching simulations:', err);
      setError(err.response?.data?.message || 'Failed to load simulations');
      
      // Fallback to default simulations if API fails
      setSimulations([
        {
          _id: 'default-1',
          simulationName: 'MBA Business Strategy',
          degree: 'MBA',
          description: 'Strategic management and business decision-making simulation',
          isActive: true
        },
        {
          _id: 'default-2',
          simulationName: 'BE Engineering Project',
          degree: 'BE',
          description: 'Engineering project management and technical problem-solving',
          isActive: true
        },
        {
          _id: 'default-3',
          simulationName: 'Law Case Analysis',
          degree: 'Law',
          description: 'Legal reasoning and case study analysis simulation',
          isActive: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = async (simulation) => {
    try {
      // Fetch credentials for this simulation
      const response = await axios.get(`${API_URL}/simulations/credentials/${simulation._id}`);
      
      const { studentLogin, adminLogin } = response.data.data?.simulation || {};
      
      if (studentLogin && adminLogin) {
        // Show credentials in a nice modal/alert
        const credentialsMessage = `
🎓 ${simulation.simulationName} - Login Credentials

👤 Student Login:
   Email: ${studentLogin.email}
   Password: ${studentLogin.password}

👨‍💼 Admin Login:
   Email: ${adminLogin.email}
   Password: ${adminLogin.password}

Click OK to proceed to the login page.
        `;
        
        // Credentials message prepared (silent - no alert shown)
        
        // Store simulation info in localStorage
        localStorage.setItem('selectedSimulation', JSON.stringify({
          id: simulation._id,
          name: simulation.simulationName,
          degree: simulation.degree,
          course: simulation.course,
          studentLogin,
          adminLogin
        }));
      }

      // Navigate to login page
      navigate(`/login?simulation=${simulation._id}`);
    } catch (error) {
      console.error('Error fetching simulation credentials:', error);
      toast.error('Failed to load simulation details. Please try again.');
    }
  };

  const getCardColors = (degree) => {
    const colorMap = {
      'MBA': { bg: 'bg-purple-50', hover: 'hover:bg-purple-100', border: 'border-purple-300', text: 'text-purple-700', badge: 'bg-purple-200' },
      'BE': { bg: 'bg-blue-50', hover: 'hover:bg-blue-100', border: 'border-blue-300', text: 'text-blue-700', badge: 'bg-blue-200' },
      'BTech': { bg: 'bg-cyan-50', hover: 'hover:bg-cyan-100', border: 'border-cyan-300', text: 'text-cyan-700', badge: 'bg-cyan-200' },
      'Law': { bg: 'bg-amber-50', hover: 'hover:bg-amber-100', border: 'border-amber-300', text: 'text-amber-700', badge: 'bg-amber-200' },
      'BA': { bg: 'bg-green-50', hover: 'hover:bg-green-100', border: 'border-green-300', text: 'text-green-700', badge: 'bg-green-200' },
      'MA': { bg: 'bg-emerald-50', hover: 'hover:bg-emerald-100', border: 'border-emerald-300', text: 'text-emerald-700', badge: 'bg-emerald-200' },
      'BBA': { bg: 'bg-indigo-50', hover: 'hover:bg-indigo-100', border: 'border-indigo-300', text: 'text-indigo-700', badge: 'bg-indigo-200' },
      'MCA': { bg: 'bg-pink-50', hover: 'hover:bg-pink-100', border: 'border-pink-300', text: 'text-pink-700', badge: 'bg-pink-200' },
      'BCA': { bg: 'bg-rose-50', hover: 'hover:bg-rose-100', border: 'border-rose-300', text: 'text-rose-700', badge: 'bg-rose-200' },
      'PhD': { bg: 'bg-gray-50', hover: 'hover:bg-gray-100', border: 'border-gray-300', text: 'text-gray-700', badge: 'bg-gray-200' },
    };
    return colorMap[degree] || colorMap['BE'];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-3 sm:mb-4"></div>
          <p className="text-gray-600 text-base sm:text-lg">Loading simulations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative">
      {/* Admin Panel Button - Fixed in bottom-right corner */}
      {showAdminButton && (
        <div
          onClick={() => navigate('/login?role=admin')}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 cursor-pointer bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-2 border-green-300 transition-all duration-300 p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 w-56 sm:w-64"
          style={{
            animation: 'fadeIn 0.3s ease-in-out'
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="bg-green-200 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
              Admin
            </span>
            <div className="relative group">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {/* Tooltip */}
              <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
                <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                  Admin Panel
                  <div className="absolute top-full right-2 -mt-1">
                    <div className="border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <h2 className="text-base sm:text-lg font-bold text-green-700 mb-2">
            Admin Panel
          </h2>
          
          <p className="text-gray-600 text-xs mb-2 sm:mb-3 line-clamp-2">
            Manage simulations, quizzes, and analytics.
          </p>
          
          <button className="w-full text-green-700 font-semibold py-2 px-3 rounded-lg border-2 border-green-300 hover:bg-green-100 transition-colors text-xs sm:text-sm">
            Admin Login →
          </button>
        </div>
      )}

      <div className="container mx-auto px-3 sm:px-6 py-8 sm:py-10 lg:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
            Choose Your Simulation
          </h1>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto px-2">
            Select a simulation based on your degree and course. Each simulation offers unique challenges and learning opportunities.
          </p>
          
          {/* Real-time indicator */}
          <div className="mt-3 sm:mt-4 flex items-center justify-center space-x-2">
            <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-xs sm:text-sm text-gray-500">
              {isConnected ? 'Live updates enabled' : 'Connecting...'}
            </span>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="max-w-4xl mx-auto mb-4 sm:mb-6 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-center text-xs sm:text-sm">
              ⚠️ {error}. Showing default simulations.
            </p>
          </div>
        )}

        {/* Simulation Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 max-w-7xl mx-auto">
          {simulations.map((simulation) => {
            const colors = getCardColors(simulation.degree);
            
            return (
              <div
                key={simulation._id}
                onClick={() => handleNavigate(simulation)}
                className={`cursor-pointer ${colors.bg} ${colors.hover} border-2 ${colors.border} transition-all duration-300 p-4 sm:p-5 lg:p-6 rounded-lg sm:rounded-xl shadow-md hover:shadow-xl transform hover:-translate-y-1`}
              >
                {/* Degree Badge */}
                <div className="flex justify-between items-start mb-3 sm:mb-4">
                  <span className={`${colors.badge} ${colors.text} px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold`}>
                    {simulation.degree}
                  </span>
                  {simulation.isActive && (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                      Active
                    </span>
                  )}
                </div>

                {/* Simulation Name */}
                <h2 className={`text-lg sm:text-xl lg:text-2xl font-bold ${colors.text} mb-2 sm:mb-3`}>
                  {simulation.simulationName || `${simulation.degree} Simulation`}
                </h2>

                {/* Description */}
                <p className="text-gray-700 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-3">
                  {simulation.description || `Comprehensive ${simulation.degree} simulation with real-world scenarios and assessments.`}
                </p>

                {/* College Info (if available) */}
                {simulation.college && (
                  <div className="flex items-center text-xs text-gray-500 mb-2 sm:mb-3">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    {simulation.college}
                  </div>
                )}

                {/* Course Info (if available) */}
                {simulation.course?.courseName && (
                  <div className="flex items-center text-xs text-gray-500 mb-3 sm:mb-4">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                    </svg>
                    {simulation.course.courseName}
                  </div>
                )}

                {/* Action Button */}
                <button className={`w-full ${colors.text} font-semibold py-2 sm:py-3 px-3 sm:px-4 rounded-lg border-2 ${colors.border} ${colors.hover} transition-colors text-sm sm:text-base`}>
                  Enter Simulation →
                </button>
              </div>
            );
          })}

        </div>

        {/* No simulations message */}
        {simulations.length === 0 && !loading && (
          <div className="text-center py-8 sm:py-12 px-4">
            <svg className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto text-gray-300 mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-600 mb-2">No Simulations Available</h3>
            <p className="text-gray-500 text-sm sm:text-base">Contact your administrator to set up simulations.</p>
          </div>
        )}

        {/* Footer Info */}
        <div className="text-center mt-8 sm:mt-10 lg:mt-12 text-xs sm:text-sm text-gray-500 px-4">
          <p>New to the platform? Contact your college administrator for access.</p>
          <p className="mt-2">
            Need help? <a href="/contact" className="text-blue-600 hover:underline">Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Simulation;