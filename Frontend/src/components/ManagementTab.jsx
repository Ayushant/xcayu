import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Toast notifications disabled (silent mode)
const toast = { success: () => {}, error: () => {}, loading: () => {}, info: () => {}, warning: () => {}, promise: () => {}, custom: () => {}, dismiss: () => {} };
import { useNavigate } from 'react-router-dom';

import { API_URL } from '../config/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add interceptor to add token to all requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const ManagementTab = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleLogout = () => {
    console.log('ManagementTab logout clicked');
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    console.log('Redirecting to /simulation');
    navigate('/simulation');
    toast.success('Logged out successfully');
  };
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login first');
      navigate('/login');
      return;
    }
    
    // Check user role
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'admin' && userRole !== 'superadmin') {
      toast.error('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }
    
    fetchStudents();
    checkQuizStatus();
  }, [navigate]);

  const checkQuizStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await api.get('/admin/quiz-status');
      setQuizStatus(data.status);
    } catch (error) {
      console.error('Quiz status check error:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        navigate('/login');
        return;
      }

      console.log('Fetching students...');
      const { data } = await api.get('/admin/students');
      console.log('Received students data:', data);
      
      // Validate response data
      if (!Array.isArray(data)) {
        console.error('Invalid response data:', data);
        toast.error('Received invalid data from server');
        setStudents([]);
        return;
      }

      // Format and validate each student record
      const formattedStudents = data.map(student => ({
        _id: student._id || '',
        fullName: student.fullName || 'No Name',
        email: student.email || 'No Email',
        college: student.college || 'No College ID',
        isActive: Boolean(student.isActive),
        quizStatus: student.quizStatus || 'stopped'
      }));

      console.log('Formatted students:', formattedStudents);
      setStudents(formattedStudents);
      toast.success(`Loaded ${formattedStudents.length} students`);
    } catch (error) {
      console.error('Fetch students error:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again');
        navigate('/login');
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.details || error.response.data.message || 'Bad request');
      } else if (error.response?.status === 403) {
        toast.error('Access denied. Admin privileges required.');
        navigate('/');
      } else if (error.response?.status === 404) {
        toast.error('Students data not found');
        setStudents([]);
      } else if (error.response?.status === 500) {
        toast.error('Server error. Please try again later');
        setStudents([]);
      } else {
        toast.error(error.response?.data?.message || 'Error fetching students');
      }
      setStudents([]); // Reset students on error
    } finally {
      setLoading(false);
    }
  };

  const handleManageStudent = async (studentId) => {
    try {
      const { data } = await api.get(`/admin/students/${studentId}`);
      // Student details fetched (silent)
      // Show student management modal or navigate to student management page
      // Student details available in data object but not shown to user
    } catch (error) {
      console.error('Error fetching student details:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || 'Error fetching student details');
      }
    }
  };

  const handleStudentQuizControl = async (studentId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        navigate('/login');
        return;
      }

      const action = currentStatus === 'running' ? 'stop' : 'start';
      const response = await api.post(
        `/admin/control/student/${studentId}/${action}`
      );

      if (response.data) {
        toast.success(response.data.message);
        await fetchStudents(); // Refresh student list
        await checkQuizStatus(); // Update overall quiz status
      }
    } catch (error) {
      console.error('Student quiz control error:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || 'Error controlling student quiz');
      }
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      // Check for token
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        navigate('/login');
        return;
      }

      // Validate required fields
      if (!newStudent.name || !newStudent.email || !newStudent.password) {
        toast.error('All fields are required');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newStudent.email)) {
        toast.error('Please enter a valid email address');
        return;
      }

      // Validate password length
      if (newStudent.password.length < 6) {
        toast.error('Password must be at least 6 characters long');
        return;
      }

      const response = await api.post('/admin/students', {
        name: newStudent.name,
        email: newStudent.email,
        password: newStudent.password
      });

      if (response.data) {
        toast.success('Student added successfully');
        setShowAddStudent(false);
        setNewStudent({
          name: '',
          email: '',
          password: ''
        });
        await fetchStudents(); // Refresh student list
      }
    } catch (error) {
      console.error('Add student error:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again');
        navigate('/login');
      } else if (error.response?.data?.details) {
        toast.error(error.response.data.details);
      } else {
        toast.error(error.response?.data?.message || 'Error adding student');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6">
      {/* Students List */}
      {/* Header with Actions */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-semibold">Student Management</h3>
              {loading && (
                <div className="flex items-center text-gray-500">
                  <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
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
                onClick={handleLogout}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Student List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Students ({students.length})
            </h3>
          </div>
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    Initial
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Name
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Email
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    College ID
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Quiz Control
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {students.map((student) => (
                  <tr key={student._id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                      <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                        <span className="text-orange-700 font-medium">
                          {(student.fullName || '?').charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                      {student.fullName}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {student.email}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {student.college}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        student.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {student.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <button
                        onClick={() => handleStudentQuizControl(student._id, student.quizStatus)}
                        className={`px-3 py-1 rounded-md text-white text-sm ${
                          student.quizStatus === 'running'
                            ? 'bg-red-500 hover:bg-red-600'
                            : 'bg-green-500 hover:bg-green-600'
                        }`}
                      >
                        {student.quizStatus === 'running' ? 'Stop Quiz' : 'Start Quiz'}
                      </button>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <button
                        onClick={() => handleManageStudent(student._id)}
                        className="text-orange-500 hover:text-orange-600"
                      >
                        Manage<span className="sr-only">, {student.fullName}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

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
            <form onSubmit={handleAddStudent} className="space-y-4" noValidate>
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  value={newStudent.password}
                  onChange={(e) => setNewStudent({...newStudent, password: e.target.value})}
                  minLength="6"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">Password must be at least 6 characters long</p>
                <p className="mt-1 text-sm text-gray-400">Student will be automatically assigned to your college</p>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddStudent(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                >
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagementTab;
