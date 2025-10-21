import React, { useState, useEffect } from 'react';
import api from '../utils/axios';
// Toast notifications disabled (silent mode)
const toast = { success: () => {}, error: () => {}, loading: () => {}, info: () => {}, warning: () => {}, promise: () => {}, custom: () => {}, dismiss: () => {} };
import { useSocket } from '../context/SocketContext';
import AdminScoreEditModal from './AdminScoreEditModal';

const CollegeAdminDashboard = () => {
  const { socket, isConnected } = useSocket();
  const [students, setStudents] = useState([]);
  const [scores, setScores] = useState([]);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [selectedScore, setSelectedScore] = useState(null);
  const [showScoreDetails, setShowScoreDetails] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editingInstruction, setEditingInstruction] = useState(null);
  const [editingTotalScore, setEditingTotalScore] = useState(false);
  const [newQuestionScore, setNewQuestionScore] = useState('');
  const [newInstructionScore, setNewInstructionScore] = useState('');
  const [newTotalScore, setNewTotalScore] = useState('');
  const [editReason, setEditReason] = useState('');
  const [licenseInfo, setLicenseInfo] = useState(null);
  const [newStudent, setNewStudent] = useState({
    email: '',
    password: '',
    fullName: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
    fetchScores();
    fetchLicenseInfo();
  }, []);

  // Socket.IO real-time updates
  useEffect(() => {
    if (!socket || !isConnected) return;

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const college = user.college;

    if (college) {
      console.log('🔌 Joining college room:', college);
      socket.emit('join-college-room', college);
    }

    // Listen for new score submissions
    socket.on('score-submitted', (data) => {
      console.log('📡 New score submitted:', data);
      toast.success(`New quiz submission from ${data.studentName}!`, { duration: 4000 });
      fetchScores(); // Refresh scores list
    });

    // Listen for score edits
    socket.on('score-edited', (data) => {
      console.log('📡 Score edited:', data);
      toast.info(`Score updated for ${data.studentName} - ${data.quizTitle}`, { duration: 3000 });
      fetchScores(); // Refresh scores list
      
      // If we're viewing this score, refresh the details
      if (selectedScore && selectedScore._id === data.scoreId) {
        fetchScoreDetails(data.scoreId);
      }
    });

    return () => {
      socket.off('score-submitted');
      socket.off('score-edited');
    };
  }, [socket, isConnected, selectedScore]);

  const fetchLicenseInfo = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setLicenseInfo(user.license);
  };

  const fetchStudents = async () => {
    try {
      const { data } = await api.get('/college-admin/students');
      setStudents(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const fetchScores = async () => {
    try {
      const { data } = await api.get('/college-admin/scores');
      setScores(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch scores');
    }
  };

  const fetchScoreDetails = async (scoreId) => {
    console.log('🔍 Fetching score details for ID:', scoreId);
    try {
      const { data } = await api.get(`/college-admin/score-details/${scoreId}`);
      console.log('✅ Score details fetched:', data);
      setSelectedScore(data);
      setShowScoreDetails(true);
      console.log('✅ Modal should now be visible');
    } catch (error) {
      console.error('❌ Error fetching score details:', error);
      console.error('❌ Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to fetch score details');
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    
    // Check license limit
    if (licenseInfo && students.length >= licenseInfo.maxStudents) {
      toast.error(`Student limit reached! Maximum: ${licenseInfo.maxStudents} students`);
      return;
    }

    try {
      await api.post('/college-admin/students/add', newStudent);
      toast.success('Student added successfully');
      setNewStudent({ email: '', password: '', fullName: '' });
      setShowAddStudent(false);
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add student');
    }
  };

  const handleEditQuestionScore = async (questionIndex) => {
    if (!editReason.trim()) {
      toast.error('Please provide a reason for editing the score');
      return;
    }

    try {
      await api.put(`/college-admin/score-edit/${selectedScore._id}`, {
        questionIndex,
        newQuestionScore: parseFloat(newQuestionScore),
        reason: editReason
      });
      toast.success('Score updated successfully');
      setEditingQuestion(null);
      setNewQuestionScore('');
      setEditReason('');
      fetchScoreDetails(selectedScore._id);
      fetchScores();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update score');
    }
  };

  const handleEditInstructionScore = async (questionIndex) => {
    if (!editReason.trim()) {
      toast.error('Please provide a reason for editing the score');
      return;
    }

    try {
      await api.put(`/college-admin/score-edit/${selectedScore._id}`, {
        questionIndex,
        newInstructionScore: parseFloat(newInstructionScore),
        reason: editReason
      });
      toast.success('Instruction score updated successfully');
      setEditingInstruction(null);
      setNewInstructionScore('');
      setEditReason('');
      fetchScoreDetails(selectedScore._id);
      fetchScores();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update instruction score');
    }
  };

  const handleEditTotalScore = async () => {
    if (!editReason.trim()) {
      toast.error('Please provide a reason for editing the total score');
      return;
    }

    const scoreValue = parseFloat(newTotalScore);
    if (isNaN(scoreValue) || scoreValue < 0 || scoreValue > 100) {
      toast.error('Score must be between 0 and 100');
      return;
    }

    try {
      await api.put(`/college-admin/score-edit/${selectedScore._id}`, {
        newScore: scoreValue,
        reason: editReason
      });
      toast.success('Total score updated successfully');
      setEditingTotalScore(false);
      setNewTotalScore('');
      setEditReason('');
      fetchScoreDetails(selectedScore._id);
      fetchScores();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update total score');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">College Admin Dashboard</h1>
              {licenseInfo && (
                <div className="mt-2 text-sm text-gray-600">
                  Students: {students.length} / {licenseInfo.maxStudents} 
                  <span className={`ml-2 px-2 py-1 rounded ${
                    students.length >= licenseInfo.maxStudents ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {students.length >= licenseInfo.maxStudents ? 'Limit Reached' : `${licenseInfo.maxStudents - students.length} slots available`}
                  </span>
                </div>
              )}
            </div>
            {/* Real-time Connection Status */}
            <div className={`flex items-center px-3 py-2 rounded-lg ${
              isConnected ? 'bg-green-100 border border-green-300' : 'bg-gray-100 border border-gray-300'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${
                isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              }`}></div>
              <span className={`text-xs font-medium ${
                isConnected ? 'text-green-800' : 'text-gray-600'
              }`}>
                {isConnected ? '🔴 Live Updates Active' : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>

        {/* Add Student Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Manage Students</h2>
            <button
              onClick={() => setShowAddStudent(!showAddStudent)}
              className={`px-4 py-2 rounded ${
                licenseInfo && students.length >= licenseInfo.maxStudents
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
              disabled={licenseInfo && students.length >= licenseInfo.maxStudents}
            >
              {showAddStudent ? 'Cancel' : 'Add New Student'}
            </button>
          </div>

          {showAddStudent && (
            <form onSubmit={handleAddStudent} className="space-y-4 mb-6" noValidate>
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  value={newStudent.fullName}
                  onChange={(e) => setNewStudent({ ...newStudent, fullName: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  value={newStudent.password}
                  onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Add Student
              </button>
            </form>
          )}

          {/* Students List */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Latest Score
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => {
                  const latestScore = scores.find(score => score.student._id === student._id);
                  return (
                    <tr key={student._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{student.fullName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {latestScore ? (
                            <span>
                              <span className="font-semibold">{Math.round(latestScore.totalScore * 10) / 10}</span>
                              <span className="text-gray-400"> / </span>
                              <span>{latestScore.quiz?.maxMarks || latestScore.maxMarks || 100}</span>
                              <span className="text-xs text-gray-400 ml-1">
                                {(() => {
                                  const maxMarks = latestScore.quiz?.maxMarks || latestScore.maxMarks || 100;
                                  return `(${maxMarks > 0 ? Math.round((latestScore.totalScore / maxMarks) * 100) : 0}%)`;
                                })()}
                              </span>
                            </span>
                          ) : 'No attempts yet'}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Scores Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Quiz Submissions</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quiz
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {scores.map((score) => (
                  <tr key={score._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {score.student.fullName}
                      </div>
                      <div className="text-sm text-gray-500">{score.student.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{score.quiz?.title || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-semibold">
                        {Math.round(score.totalScore * 10) / 10} / {score.quiz?.maxMarks || score.maxMarks || 100}
                      </div>
                      <div className="text-xs text-gray-500">
                        {(() => {
                          const maxMarks = score.quiz?.maxMarks || score.maxMarks || 100;
                          return maxMarks > 0 ? Math.round((score.totalScore / maxMarks) * 100) : 0;
                        })()}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(score.submittedAt).toLocaleDateString()}
                      </div>
                    </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <button
                         onClick={() => {
                           console.log('🖱️ Edit Score button clicked for score ID:', score._id);
                           fetchScoreDetails(score._id);
                         }}
                         className="text-blue-600 hover:text-blue-800 text-sm font-medium"
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

        {/* Score Details Modal */}
        {showScoreDetails && selectedScore && (
          <AdminScoreEditModal
            score={selectedScore}
            isCollegeAdmin={true}
            onClose={() => {
                    setShowScoreDetails(false);
                    setSelectedScore(null);
                    setEditingQuestion(null);
                    setEditingInstruction(null);
                    setEditingTotalScore(false);
                    setNewQuestionScore('');
                    setNewInstructionScore('');
                    setNewTotalScore('');
                    setEditReason('');
                  }}
            onSave={() => {
              fetchScoreDetails(selectedScore._id);
              fetchScores();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default CollegeAdminDashboard;
