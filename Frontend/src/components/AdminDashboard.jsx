import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';
// Toast notifications disabled (silent mode)
const toast = { success: () => {}, error: () => {}, loading: () => {}, info: () => {}, warning: () => {}, promise: () => {}, custom: () => {}, dismiss: () => {} };
import { useSocket } from '../context/SocketContext';
import AdminNav from './AdminNav';
import ManagementTab from './ManagementTab';
import StudentScoresPage from './StudentScoresPage';

const AdminDashboard = ({ activeTab = 'overview' }) => {
  const { socket, isConnected } = useSocket();
  const [stats, setStats] = useState({
    totalStudents: { value: 4, change: 12 },
    activeSessions: { value: 4, change: 8 },
    completedSessions: { value: 7, change: 15 },
    averageScore: { value: 19.5, change: 3.2 }
  });

  const [user, setUser] = useState({
    college: 'gtu',
    role: 'admin'
  });

  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  
  // Quiz Score Management States
  const [quizScores, setQuizScores] = useState([]);
  const [selectedScore, setSelectedScore] = useState(null);
  const [showScoreDetails, setShowScoreDetails] = useState(false);
  const [editingTotalScore, setEditingTotalScore] = useState(false);
  const [editingInstruction, setEditingInstruction] = useState(null);
  const [newTotalScore, setNewTotalScore] = useState('');
  const [newInstructionScore, setNewInstructionScore] = useState('');
  const [editReason, setEditReason] = useState('');
  const [instructorScore, setInstructorScore] = useState('');

  const validateForm = () => {
    const newErrors = {};
    if (!newStudent.name.trim()) newErrors.name = 'Name is required';
    if (!newStudent.email.trim()) newErrors.email = 'Email is required';
    if (!newStudent.password) newErrors.password = 'Password is required';
    if (!newStudent.confirmPassword) newErrors.confirmPassword = 'Confirm password is required';
    if (newStudent.password !== newStudent.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setErrors({ submit: 'Please login first' });
          return;
        }

        await axios.post(`${API_URL}/admin/students`, {
          name: newStudent.name,
          email: newStudent.email,
          password: newStudent.password,
          collegeId: user.college
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setShowAddStudent(false);
        setNewStudent({ name: '', email: '', password: '', confirmPassword: '' });
        fetchDashboardData(); // Refresh stats
      } catch (error) {
        setErrors({ submit: error.response?.data?.message || 'Error adding student' });
      }
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchQuizScores();
  }, []);

  // Socket.IO real-time updates
  useEffect(() => {
    if (!socket || !isConnected) return;

    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const college = userData.college || user.college;

    if (college) {
      console.log('🔌 Admin joining college room:', college);
      socket.emit('join-college-room', college);
    }

    // Listen for new score submissions
    socket.on('score-submitted', (data) => {
      console.log('📡 New score submitted:', data);
      toast.success(`New quiz submission from ${data.studentName}!`, {
        duration: 4000,
        icon: '📝'
      });
      fetchQuizScores(); // Refresh scores list
      fetchDashboardData(); // Refresh stats
    });

    // Listen for score edits
    socket.on('score-edited', (data) => {
      console.log('📡 Score edited:', data);
      toast.info(`Score updated for ${data.studentName}`, {
        duration: 3000,
        icon: '✏️'
      });
      fetchQuizScores(); // Refresh scores list
      
      // If we're viewing this score, refresh the details
      if (selectedScore && selectedScore._id === data.scoreId) {
        fetchScoreDetails(data.scoreId);
      }
    });

    return () => {
      socket.off('score-submitted');
      socket.off('score-edited');
    };
  }, [socket, isConnected, selectedScore, user.college]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, skipping dashboard data fetch');
        return;
      }

      const response = await axios.get(`${API_URL}/admin/dashboard-stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchQuizScores = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_URL}/scores`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Quiz scores fetched:', response.data);
      console.log('First score:', response.data.scores?.[0]);
      setQuizScores(response.data.scores || []);
    } catch (error) {
      console.error('Error fetching quiz scores:', error);
    }
  };

  const fetchScoreDetails = async (scoreId) => {
    if (!scoreId) {
      console.error('Score ID is undefined or null');
      toast.error('Invalid score ID');
      return;
    }
    
    console.log('Fetching score details for ID:', scoreId);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/scores/${scoreId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Score details received:', response.data);
      setSelectedScore(response.data);
      setShowScoreDetails(true);
    } catch (error) {
      console.error('Error fetching score details:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to fetch score details');
    }
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
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/scores/${selectedScore._id}/edit`, {
        newScore: scoreValue,
        reason: editReason
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success('Total score updated successfully');
      setEditingTotalScore(false);
      setNewTotalScore('');
      setEditReason('');
      fetchScoreDetails(selectedScore._id);
      fetchQuizScores();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update total score');
    }
  };

  const handleEditInstructionScore = async (questionIndex) => {
    if (!editReason.trim()) {
      toast.error('Please provide a reason for editing the score');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/scores/${selectedScore._id}/edit`, {
        questionIndex,
        newInstructionScore: parseFloat(newInstructionScore),
        reason: editReason
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success('Instruction score updated successfully');
      setEditingInstruction(null);
      setNewInstructionScore('');
      setEditReason('');
      fetchScoreDetails(selectedScore._id);
      fetchQuizScores();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update instruction score');
    }
  };

  const handleExportData = () => {
    try {
      // Prepare data for export
      const exportData = quizScores.map((score) => {
        const submittedDate = score.submittedAt 
          ? new Date(score.submittedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            })
          : 'N/A';
        
        return {
          'Student Name': score.studentName || score.student?.fullName || 'N/A',
          'Email': score.studentEmail || score.student?.email || 'N/A',
          'Quiz': score.quizTitle || score.quiz?.title || 'N/A',
          'Score': `${Math.round(score.totalScore || 0)} / ${score.quiz?.maxMarks || score.maxMarks || 100}`,
          'Submitted Date': submittedDate
        };
      });

      // Create CSV content
      const headers = ['Student Name', 'Email', 'Quiz', 'Score', 'Submitted Date'];
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => {
            const value = row[header] || '';
            // Escape commas and quotes in values
            return `"${String(value).replace(/"/g, '""')}"`;
          }).join(',')
        )
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `quiz_submissions_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Real-time Status */}
              <div className={`flex items-center px-3 py-1 rounded-lg ${
                isConnected ? 'bg-green-100 border border-green-300' : 'bg-gray-100 border border-gray-300'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                }`}></div>
                <span className={`text-xs font-medium ${
                  isConnected ? 'text-green-800' : 'text-gray-600'
                }`}>
                  {isConnected ? 'Live' : 'Offline'}
                </span>
              </div>
              <button
                onClick={() => {
                  console.log('AdminDashboard logout clicked');
                  localStorage.removeItem('token');
                  localStorage.removeItem('userRole');
                  console.log('Redirecting to /simulation');
                  window.location.href = '/simulation';
                }}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
          <AdminNav />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === 'overview' && (
          <>
            {/* Title and Actions */}
            <div className="mb-8 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Area Manager Simulation Analytics</h2>
              <div className="flex space-x-4">
                <button 
                  onClick={() => setShowAddStudent(true)}
                  className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Student
                </button>
                <button 
                  onClick={handleExportData}
                  className="bg-white text-gray-700 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Export Data
                </button>
              </div>
            </div>
          </>
        )}
        
        {activeTab === 'management' && <ManagementTab />}
        {activeTab === 'scores' && <StudentScoresPage />}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Students */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Students</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stats.totalStudents.value}</div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        ↑ {stats.totalStudents.change}% from last month
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Active Sessions */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Sessions</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stats.activeSessions.value}</div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        ↑ {stats.activeSessions.change}% from yesterday
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Completed */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stats.completedSessions.value}</div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        ↑ {stats.completedSessions.change}% this week
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Average Score */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Average Score</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stats.averageScore.value}</div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        ↑ {stats.averageScore.change} points
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quiz Submissions Section */}
        {activeTab === 'overview' && quizScores.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Quiz Submissions - Score Management</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quiz</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Final Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {quizScores.slice(0, 10).map((score) => (
                    <tr key={score._id || score.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{score.studentName || score.student?.fullName || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{score.studentEmail || score.student?.email || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {score.quizTitle || score.quiz?.title || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-purple-600">
                          {Math.round(score.totalScore || 0)} / {score.quiz?.maxMarks || score.maxMarks || 100}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {score.submittedAt ? new Date(score.submittedAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => fetchScoreDetails(score._id || score.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit Score
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Student Modal */}
        {showAddStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Add Student</h3>
                <button 
                  onClick={() => setShowAddStudent(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleAddStudent} className="space-y-6" noValidate>
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    placeholder="Enter name"
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User ID / Email</label>
                  <input
                    type="email"
                    placeholder="Enter email address"
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    placeholder="Enter password"
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={newStudent.password}
                    onChange={(e) => setNewStudent({...newStudent, password: e.target.value})}
                  />
                  {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    placeholder="Confirm password"
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={newStudent.confirmPassword}
                    onChange={(e) => setNewStudent({...newStudent, confirmPassword: e.target.value})}
                  />
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                </div>

                {/* Error Message */}
                {errors.submit && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{errors.submit}</p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddStudent(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  >
                    Add Student
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Score Edit Modal */}
        {showScoreDetails && selectedScore && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Edit Quiz Score</h3>
                <button
                  onClick={() => {
                    setShowScoreDetails(false);
                    setSelectedScore(null);
                    setEditingTotalScore(false);
                    setEditingInstruction(null);
                    setNewTotalScore('');
                    setNewInstructionScore('');
                    setEditReason('');
                    setInstructorScore('');
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {/* Final Score Display */}
              <div className="mb-4 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-300">
                <div className="text-center">
                  <p className="text-lg text-gray-700 font-medium mb-2">Final Total Score</p>
                  <p className="text-5xl font-bold text-purple-600">
                    {Math.round(selectedScore.totalScore)} / {selectedScore.quiz?.maxMarks || selectedScore.maxMarks || 100}
                  </p>
                </div>
              </div>

              {/* Student & Quiz Info */}
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Student</p>
                    <p className="font-semibold">{selectedScore.student?.fullName || 'N/A'}</p>
                    <p className="text-sm text-gray-500">{selectedScore.student?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Quiz</p>
                    <p className="font-semibold">{selectedScore.quiz?.title || 'N/A'}</p>
                    <p className="text-sm text-gray-500">
                      Submitted: {new Date(selectedScore.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="text-center bg-white rounded-lg p-3 border-2 border-blue-300">
                      <p className="text-xs text-gray-600 font-medium">Instructor Edit</p>
                      <p className="text-2xl font-bold text-blue-600">{Math.round(selectedScore.totalScore)}</p>
                      <button
                        onClick={() => {
                          setEditingTotalScore(true);
                          setNewTotalScore(selectedScore.totalScore);
                        }}
                        className="mt-2 px-2 py-1 bg-orange-600 text-white text-xs rounded-lg hover:bg-orange-700"
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
                  <h4 className="font-semibold text-gray-800 mb-3">Edit Total Score</h4>
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
                        className="w-32 px-3 py-2 border-2 border-orange-300 rounded-lg"
                      />
                    </div>
                    <div className="flex items-start space-x-2">
                      <label className="text-sm font-medium text-gray-700 w-32 pt-2">Reason:</label>
                      <textarea
                        value={editReason}
                        onChange={(e) => setEditReason(e.target.value)}
                        placeholder="Explain why you're changing the score..."
                        className="flex-1 px-3 py-2 border-2 border-orange-300 rounded-lg"
                        rows="2"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleEditTotalScore}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        ✓ Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingTotalScore(false);
                          setNewTotalScore('');
                          setEditReason('');
                        }}
                        className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                      >
                        ✗ Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Questions & Answers */}
              {selectedScore.answers && selectedScore.answers.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Questions & Answers:</h4>
                  {selectedScore.answers.map((answer, index) => (
                    <div key={index} className="border-2 border-gray-200 rounded-lg p-5 bg-white">
                      <div className="mb-3">
                        <p className="font-bold text-gray-800">Q{index + 1}: {answer.questionText}</p>
                      </div>

                      {/* Ranking or MCQ Answer */}
                      {answer.selectedRanking && answer.selectedRanking.length > 0 ? (
                        <>
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-700 mb-2">Student's Ranking:</p>
                            <div className="space-y-1">
                              {answer.selectedRanking.map((option, idx) => (
                                <div key={idx} className="flex items-center text-sm bg-blue-50 p-2 rounded">
                                  <span className="font-semibold mr-2">{option.rank}.</span>
                                  <span>{option.text}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Option Marks Breakdown - Show only selected option for College Admin */}
                          {answer.options && answer.options.length > 0 && (
                            <div className="mt-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 rounded-lg shadow-sm">
                              <p className="text-sm font-bold text-green-800 mb-3 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                                </svg>
                                📊 Student's Selected Option & Marks:
                              </p>
                              <div className="space-y-2">
                                {answer.options
                                  .filter((opt) => {
                                    // Show only the student's top choice (selected option)
                                    const topChoiceText = answer.selectedRanking?.[0]?.text;
                                    return opt.text === topChoiceText;
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
                                  Result: Student selected this option and earned <span className="text-green-700 text-lg ml-1">{answer.points || 0} / 10 marks</span> for this question
                                </p>
                                <p className="text-xs text-green-700 mt-1 ml-7">
                                  (Marks set by Super Admin)
                                </p>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="mb-3">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Student Answer:</p>
                            <p className={`text-sm p-2 rounded ${answer.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {answer.selectedOption || 'No answer'}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Instruction */}
                      {answer.instruction && (
                        <div className="mb-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-sm font-bold text-purple-900">Student's Reasoning:</p>
                            <span className="text-sm font-bold text-purple-600">
                              Score: {answer.instructionScore || 0}/100
                            </span>
                          </div>
                          <p className="text-sm text-gray-800 mb-3">{answer.instruction}</p>
                          
                          {editingInstruction === index ? (
                            <div className="space-y-2 pt-2 border-t border-purple-200">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={newInstructionScore}
                                  onChange={(e) => setNewInstructionScore(e.target.value)}
                                  className="w-24 px-2 py-1 border-2 border-purple-300 rounded"
                                  placeholder="Score"
                                />
                                <input
                                  type="text"
                                  value={editReason}
                                  onChange={(e) => setEditReason(e.target.value)}
                                  className="flex-1 px-2 py-1 border-2 border-purple-300 rounded"
                                  placeholder="Reason..."
                                />
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditInstructionScore(index)}
                                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                                >
                                  ✓ Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingInstruction(null);
                                    setNewInstructionScore('');
                                    setEditReason('');
                                  }}
                                  className="px-3 py-1 bg-gray-400 text-white rounded text-sm hover:bg-gray-500"
                                >
                                  ✗ Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingInstruction(index);
                                setNewInstructionScore(answer.instructionScore || 0);
                              }}
                              className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                            >
                              📝 Grade Reasoning
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
