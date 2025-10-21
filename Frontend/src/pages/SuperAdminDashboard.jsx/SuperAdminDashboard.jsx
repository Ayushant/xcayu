import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardNavbar from "../../components/DashboardNavbar.jsx";
import LicenseManagement from "../../components/LicenseManagement.jsx";
import SuperAdminStudentManagement from "../../components/SuperAdminStudentManagement.jsx";
import CourseManagement from "../../components/CourseManagement.jsx";
import SimulationManagement from "../../components/SimulationManagement.jsx";
import Analytics from "../../components/Analytics.jsx";
import LicenseAlertBanner from "../../components/LicenseAlertBanner.jsx";
import EnhancedQuizBuilder from "../../components/EnhancedQuizBuilder.jsx";
import AdminScoreEditModal from "../../components/AdminScoreEditModal.jsx";
import { io } from 'socket.io-client';
import { API_BASE_URL, API_URL } from '../../config/api';

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

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [overview, setOverview] = useState({});
  const [activity, setActivity] = useState([]);
  const [users, setUsers] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [licenses, setLicenses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [results, setResults] = useState([]);
  const [collegeStats, setCollegeStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [showEditLicenseModal, setShowEditLicenseModal] = useState(false);
  const [showDeleteLicenseModal, setShowDeleteLicenseModal] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState(null);
  const [editLicenseData, setEditLicenseData] = useState({
    college: '',
    email: '',
    password: '',
    maxStudents: 0,
    expiryDate: ''
  });
  
  // Score editing state
  const [selectedScoreId, setSelectedScoreId] = useState(null);

  // Fetch overview data
  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/superadmin/overview");
      setOverview(response.data);
    } catch (err) {
      console.error('Error fetching overview:', err);
      setError(err.response?.data?.message || 'Failed to fetch overview data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch activity data
  const fetchActivity = async () => {
    try {
      const response = await api.get("/superadmin/activity");
      setActivity(response.data);
    } catch (err) {
      console.error('Error fetching activity:', err);
      setError(err.response?.data?.message || 'Failed to fetch activity data');
    }
  };

  // Fetch users data
  const fetchUsers = async (role = '') => {
    try {
      setLoading(true);
      setError(null);
      const url = role ? `/superadmin/users?role=${role}` : '/superadmin/users';
      const response = await api.get(url);
      setUsers(response.data.users);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Failed to fetch users data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch admin users data (using license data as college admins)
  const fetchAdminUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get license data and treat it as college admin data
      const licensesResponse = await api.get('/superadmin/licenses');
      const licenses = licensesResponse.data.licenses || [];
      
      // Convert license data to admin user format
      const collegeAdmins = licenses.map(license => ({
        _id: license._id,
        name: `Admin of ${license.college}`,
        email: license.email,
        college: license.college,
        role: 'collegeAdmin',
        status: license.status,
        joined: license.createdAt,
        maxStudents: license.maxStudents,
        currentStudents: license.currentStudents,
        expiry: license.expiry
      }));
      
      setAdminUsers(collegeAdmins);
    } catch (err) {
      console.error('Error fetching college admins:', err);
      setError(err.response?.data?.message || 'Failed to fetch college admins data');
    } finally {
      setLoading(false);
    }
  };


  // Fetch licenses data
  const fetchLicenses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/superadmin/licenses");
      setLicenses(response.data.licenses);
    } catch (err) {
      console.error('Error fetching licenses:', err);
      setError(err.response?.data?.message || 'Failed to fetch licenses data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch quizzes data
  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/superadmin/quizzes");
      setQuizzes(response.data.quizzes);
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setError(err.response?.data?.message || 'Failed to fetch quizzes data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch results data
  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/superadmin/results");
      setResults(response.data.results);
    } catch (err) {
      console.error('Error fetching results:', err);
      setError(err.response?.data?.message || 'Failed to fetch results data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch college statistics
  const fetchCollegeStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/superadmin/college-stats");
      setCollegeStats(response.data);
    } catch (err) {
      console.error('Error fetching college stats:', err);
      setError(err.response?.data?.message || 'Failed to fetch college statistics');
    } finally {
      setLoading(false);
    }
  };

  // Refresh all data
  const refreshData = async () => {
    setLastRefresh(new Date());
    setError(null);
    
    // Always refresh overview and activity
    await fetchOverview();
    await fetchActivity();
    
    // Refresh current tab data
    switch (activeTab) {
      case 'students':
        await fetchUsers('student');
        break;
      case 'admins':
        await fetchAdminUsers();
        break;
      case 'licenses':
        await fetchLicenses();
        break;
      case 'quizzes':
        await fetchQuizzes();
        break;
      case 'results':
        await fetchResults();
        break;
      case 'college-stats':
        await fetchCollegeStats();
        break;
      default:
        break;
    }
  };

  // Load data based on active tab
  useEffect(() => {
    fetchOverview();
    fetchActivity();

    // Initialize Socket.IO connection
    const socket = io(API_BASE_URL);

    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
      socket.emit('join-admin-room');
    });

    socket.on('new-score', (data) => {
      console.log('New score received:', data);
      fetchOverview(); // Refresh overview stats
      fetchActivity(); // Refresh activity feed
    });

    socket.on('license-updated', () => {
      console.log('License updated');
      if (activeTab === 'licenses') {
        fetchLicenses();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    switch (activeTab) {
      case 'students':
        fetchUsers('student');
        break;
      case 'admins':
        fetchAdminUsers();
        break;
      case 'licenses':
        fetchLicenses();
        break;
      case 'quizzes':
        fetchQuizzes();
        break;
      case 'results':
        fetchResults();
        break;
      case 'college-stats':
        fetchCollegeStats();
        break;
      default:
        break;
    }
  }, [activeTab]);

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter data based on search term
  const filterData = (data, searchTerm) => {
    if (!searchTerm) return data;
    
    return data.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      return (
        item.fullName?.toLowerCase().includes(searchLower) ||
        item.email?.toLowerCase().includes(searchLower) ||
        item.college?.toLowerCase().includes(searchLower) ||
        item.title?.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower)
      );
    });
  };

  // Render overview tab
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Licenses</p>
              <p className="text-2xl font-bold text-gray-900">{overview.totalLicenses || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{overview.totalStudents || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Admins</p>
              <p className="text-2xl font-bold text-gray-900">{overview.totalAdmins || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Quizzes</p>
              <p className="text-2xl font-bold text-gray-900">{overview.totalQuizzes || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-sm font-medium text-gray-600">Total Results</p>
          <p className="text-2xl font-bold text-gray-900">{overview.totalResults || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-sm font-medium text-gray-600">Average Score</p>
          <p className="text-2xl font-bold text-gray-900">{overview.averageScore || 0}%</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-sm font-medium text-gray-600">System Uptime</p>
          <p className="text-2xl font-bold text-gray-900">{overview.uptime || "N/A"}</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {activity.length > 0 ? (
            activity.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-900">{item.message}</span>
                </div>
                <span className="text-xs text-gray-500">{formatDate(item.submittedAt)}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );

  // Delete user function
  const deleteUser = async (userId) => {
    try {
      setLoading(true);
      setError(null);
      await api.delete(`/superadmin/users/${userId}`);
      
      // Refresh the users list based on current tab
      if (activeTab === 'students') {
        await fetchUsers('student');
      } else if (activeTab === 'admins') {
        await fetchAdminUsers();
      }
      // User deleted successfully (silent)
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  // Toggle user status
  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      setLoading(true);
      setError(null);
      await api.put(`/superadmin/users/${userId}/status`, {
        isActive: !currentStatus
      });
      
      // Refresh the users list based on current tab
      if (activeTab === 'students') {
        await fetchUsers('student');
      } else if (activeTab === 'admins') {
        await fetchAdminUsers();
      }
      // User status updated successfully (silent)
    } catch (err) {
      console.error('Error updating user status:', err);
      setError(err.response?.data?.message || 'Failed to update user status');
    } finally {
      setLoading(false);
    }
  };

  // License management functions
  const handleEditLicense = (license) => {
    setSelectedLicense(license);
    setEditLicenseData({
      college: license.college,
      email: license.email,
      password: '', // Don't pre-fill password for security
      maxStudents: license.maxStudents,
      expiryDate: license.expiryDate.split('T')[0] // Format date for input
    });
    setShowEditLicenseModal(true);
  };

  const handleUpdateLicense = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      const updateData = {
        ...editLicenseData,
        password: editLicenseData.password || undefined // Only include if changed
      };
      
      await api.put(`/superadmin/licenses/${selectedLicense._id}`, updateData);
      setShowEditLicenseModal(false);
      setSelectedLicense(null);
      await fetchLicenses();
      // License updated successfully (silent)
    } catch (err) {
      console.error('Error updating license:', err);
      setError(err.response?.data?.message || 'Failed to update license');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLicense = (license) => {
    setSelectedLicense(license);
    setShowDeleteLicenseModal(true);
  };

  const confirmDeleteLicense = async () => {
    try {
      setLoading(true);
      setError(null);
      await api.delete(`/superadmin/licenses/${selectedLicense._id}`);
      setShowDeleteLicenseModal(false);
      setSelectedLicense(null);
      await fetchLicenses();
      // License deleted successfully (silent)
    } catch (err) {
      console.error('Error deleting license:', err);
      setError(err.response?.data?.message || 'Failed to delete license');
    } finally {
      setLoading(false);
    }
  };

  const toggleLicenseStatus = async (license) => {
    try {
      setLoading(true);
      setError(null);
      const newStatus = license.status === 'Active' ? 'Inactive' : 'Active';
      await api.put(`/superadmin/licenses/${license._id}`, {
        status: newStatus
      });
      await fetchLicenses();
      // License status updated successfully (silent)
    } catch (err) {
      console.error('Error updating license status:', err);
      setError(err.response?.data?.message || 'Failed to update license status');
    } finally {
      setLoading(false);
    }
  };

  // Render users tab (College Admin Users)
  const renderUsers = () => (
    <div className="space-y-6">
      {/* Search and Actions */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">College Admins</h3>
            <p className="text-gray-600">Manage college admin accounts from license database</p>
          </div>
          
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search college admins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button 
              onClick={() => setSearchTerm('')}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Admin Users Table */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">College</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Students</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filterData(adminUsers, searchTerm).length > 0 ? (
                filterData(adminUsers, searchTerm).map((admin) => (
                  <tr key={admin._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {admin.college}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {admin.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {admin.maxStudents}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {admin.currentStudents} / {admin.maxStudents}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(admin.expiry).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        admin.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {admin.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => toggleLicenseStatus(admin._id, admin.status)}
                          className={`px-3 py-1 text-xs rounded-full ${
                            admin.status === 'active' 
                              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          {admin.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleEditLicense(admin)}
                          className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            // Delete confirmation (silent - always proceed)
                            handleDeleteLicense(admin._id, admin.college);
                          }}
                          className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-800 hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    {searchTerm ? `No college admins found matching "${searchTerm}"` : 'No college admins found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Render licenses tab
  const renderLicenses = () => (
    <div className="space-y-6">
      {/* License Management Header */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">License Management</h3>
            <p className="text-gray-600">Manage college licenses and student limits - connected to Admin Management</p>
          </div>
          
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search licenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button 
              onClick={() => setSearchTerm('')}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* License Table */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">College</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Students</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filterData(licenses, searchTerm).length > 0 ? (
                filterData(licenses, searchTerm).map((license) => (
                  <tr key={license._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {license.college}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {license.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {license.maxStudents}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <span className="mr-2">{license.currentStudents} / {license.maxStudents}</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ 
                              width: `${(license.currentStudents / license.maxStudents) * 100}%`,
                              backgroundColor: license.currentStudents === license.maxStudents ? '#ef4444' : '#3b82f6'
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(license.expiryDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        license.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {license.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => toggleLicenseStatus(license)}
                          className={`px-3 py-1 text-xs rounded-full ${
                            license.status === 'Active' 
                              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          {license.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleEditLicense(license)}
                          className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteLicense(license)}
                          className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-800 hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    {searchTerm ? `No licenses found matching "${searchTerm}"` : 'No licenses found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* License Management Component for creating new licenses */}
      <LicenseManagement />
    </div>
  );

  // Render quizzes tab
  const renderQuizzes = () => (
    <div className="bg-white rounded-lg shadow-md">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Quiz Management</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Questions</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {quizzes.length > 0 ? (
              quizzes.map((quiz) => (
                <tr key={quiz._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {quiz.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {quiz.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {quiz.duration} min
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {quiz.questions?.length || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      quiz.status === 'Active' ? 'bg-green-100 text-green-800' : 
                      quiz.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {quiz.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(quiz.createdAt)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                  No quizzes found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Render results tab
  const renderResults = () => (
    <div className="bg-white rounded-lg shadow-md">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Quiz Results & Score Management</h3>
        <p className="text-sm text-gray-600">View, edit scores and student instructions</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quiz</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
              {/* Percentage column removed */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Spent</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.length > 0 ? (
              results.map((result) => (
                <tr key={result._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {result.student?.fullName || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {result.quiz?.title || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {result.score}/{result.totalQuestions}
                  </td>
                  {/* Percentage cell removed */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {Math.floor(result.timeSpent / 60)}m {result.timeSpent % 60}s
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(result.submittedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedScoreId(result._id)}
                      className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      View & Edit
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                  No quiz results found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Score Edit Modal */}
      {selectedScoreId && (
        <AdminScoreEditModal
          scoreId={selectedScoreId}
          isCollegeAdmin={false}
          onClose={() => setSelectedScoreId(null)}
          onSave={() => {
            fetchResults();
            setSelectedScoreId(null);
          }}
        />
      )}
    </div>
  );

  // Render college statistics tab
  const renderCollegeStats = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">College Statistics</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-md font-semibold text-gray-700 mb-4">Student Distribution by College</h4>
              <div className="space-y-3">
                {collegeStats.collegeStats?.map((stat, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{stat._id || 'Unknown'}</span>
                    <span className="text-blue-600 font-semibold">{stat.studentCount} students</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-md font-semibold text-gray-700 mb-4">Quiz Completion by College</h4>
              <div className="space-y-3">
                {collegeStats.quizStats?.map((stat, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{stat._id || 'Unknown'}</span>
                    <div className="text-right">
                      <div className="text-blue-600 font-semibold">{stat.totalQuizzes} quizzes</div>
                      <div className="text-sm text-gray-500">Avg: {Math.round(stat.avgScore)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* License Alert Banner - Real-time notifications */}
      <LicenseAlertBanner />
      
      {/* Dashboard Navbar */}
      <DashboardNavbar />

      <div className="p-6">
        <div className="mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
              <p className="text-gray-600">Manage your quiz platform from here</p>
              <p className="text-sm text-gray-500 mt-1">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={refreshData}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <svg 
                  className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'students', label: 'Students' },
              { id: 'admins', label: 'College Admins' },
              { id: 'licenses', label: 'Licenses' },
              { id: 'courses', label: 'Courses' },
              { id: 'simulations', label: 'Simulations' },
              { id: 'quizzes', label: 'Quizzes' },
              { id: 'results', label: 'Results' },
              { id: 'analytics', label: 'Analytics' },
              { id: 'college-stats', label: 'College Stats' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading...</span>
          </div>
        )}

        {/* Tab Content */}
        {!loading && (
          <>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'students' && <SuperAdminStudentManagement />}
            {activeTab === 'admins' && renderUsers()}
            {activeTab === 'licenses' && renderLicenses()}
            {activeTab === 'courses' && <CourseManagement />}
            {activeTab === 'simulations' && <SimulationManagement />}
            {activeTab === 'quizzes' && <EnhancedQuizBuilder />}
            {activeTab === 'results' && renderResults()}
            {activeTab === 'analytics' && <Analytics />}
            {activeTab === 'college-stats' && renderCollegeStats()}
          </>
        )}

        {/* Edit License Modal */}
        {showEditLicenseModal && selectedLicense && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96 max-w-full mx-4">
              <h3 className="text-xl font-bold mb-4">Edit License</h3>
              <form onSubmit={handleUpdateLicense} className="space-y-4" noValidate>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">College/University Name</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={editLicenseData.college}
                    onChange={(e) => setEditLicenseData({...editLicenseData, college: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={editLicenseData.email}
                    onChange={(e) => setEditLicenseData({...editLicenseData, email: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password (leave blank to keep same)</label>
                  <input
                    type="password"
                    placeholder="Enter new password (optional)"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={editLicenseData.password}
                    onChange={(e) => setEditLicenseData({...editLicenseData, password: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Students</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={editLicenseData.maxStudents}
                    onChange={(e) => setEditLicenseData({...editLicenseData, maxStudents: parseInt(e.target.value)})}
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={editLicenseData.expiryDate}
                    onChange={(e) => setEditLicenseData({...editLicenseData, expiryDate: e.target.value})}
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditLicenseModal(false);
                      setSelectedLicense(null);
                      setEditLicenseData({
                        college: '',
                        email: '',
                        password: '',
                        maxStudents: 0,
                        expiryDate: ''
                      });
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Update License'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete License Confirmation Modal */}
        {showDeleteLicenseModal && selectedLicense && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96 max-w-full mx-4">
              <h3 className="text-xl font-bold mb-4 text-red-600">Delete License</h3>
              <p className="mb-6 text-gray-600">
                Are you sure you want to delete the license for <strong>{selectedLicense.college}</strong>? 
                This action cannot be undone and will remove all associated data.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteLicenseModal(false);
                    setSelectedLicense(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteLicense}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md shadow-sm hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? 'Deleting...' : 'Yes, Delete License'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
