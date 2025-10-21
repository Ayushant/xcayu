import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

const LicenseManagement = () => {
  const navigate = useNavigate();
  const [licenses, setLicenses] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState(null);
  const [showLimitError, setShowLimitError] = useState(false);
  const [newLicense, setNewLicense] = useState({
    college: '',
    email: '',
    password: '',
    maxStudents: '',
    expiryDate: '',
  });

  // Check authentication and fetch licenses
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (!token) {
      // Authentication required (silent redirect)
      navigate('/login');
      return;
    }
    
    if (userRole !== 'superadmin') {
      // Access denied (silent redirect)
      navigate('/');
      return;
    }
    
    fetchLicenses();
  }, [navigate]);

  const fetchLicenses = async () => {
    try {
      const response = await api.get('/superadmin/licenses');
      console.log('Fetched licenses:', response.data);
      setLicenses(response.data.licenses || []);
    } catch (error) {
      console.error('Error fetching licenses:', error);
    }
  };

  const updateStudentCounts = async () => {
    try {
      await api.post('/superadmin/update-student-counts');
      // Student counts updated successfully (silent)
      fetchLicenses(); // Refresh the licenses to show updated counts
    } catch (error) {
      // Error handled silently
    }
  };

  const handleAddLicense = async (e) => {
    e.preventDefault();
    try {
      // Check license limit
      if (licenses.length >= 12) {
        setShowLimitError(true);
        return;
      }
      
      // Validate form data before sending (silent validation)
      if (!newLicense.college || !newLicense.email || !newLicense.password || !newLicense.maxStudents || !newLicense.expiryDate) {
        // Validation failed silently
        return;
      }

      // Convert maxStudents to number
      const maxStudentsNum = parseInt(newLicense.maxStudents);
      if (isNaN(maxStudentsNum)) {
        // Invalid number (silent)
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newLicense.email)) {
        // Invalid email (silent)
        return;
      }

      // Validate college name (should not be an email)
      if (emailRegex.test(newLicense.college)) {
        // Invalid college name (silent)
        return;
      }

      // Validate maxStudents
      if (maxStudentsNum <= 0) {
        // Invalid max students (silent)
        return;
      }

      // Validate expiry date
      const expiryDate = new Date(newLicense.expiryDate);
      if (expiryDate <= new Date()) {
        // Invalid expiry date (silent)
        return;
      }
      
      // Prepare data to send
      const licenseData = {
        ...newLicense,
        maxStudents: maxStudentsNum
      };
      
      // Debug: Log the data being sent
      console.log('Sending license data:', licenseData);
      
      const response = await api.post('/superadmin/licenses', licenseData);
      // License created successfully (silent)
      setShowAddForm(false);
      fetchLicenses();
      setNewLicense({
        college: '',
        email: '',
        password: '',
        maxStudents: '',
        expiryDate: ''
      });
      // License added successfully (silent)
    } catch (error) {
      // Error handled silently
    }
  };

  const handleEditLicense = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        ...selectedLicense,
        password: selectedLicense.password || undefined // only include if changed
      };
      
      const response = await api.put(`/superadmin/licenses/${selectedLicense._id}`, updateData);
      // License updated successfully (silent)
      setShowEditForm(false);
      setSelectedLicense(null);
      fetchLicenses();
      // License updated successfully (silent)
    } catch (error) {
      // Error handled silently
    }
  };

  const handleDeleteLicense = async () => {
    try {
      const response = await api.delete(`/superadmin/licenses/${selectedLicense._id}`);
      // License deleted successfully (silent)
      setShowDeleteConfirm(false);
      setSelectedLicense(null);
      fetchLicenses();
      // License deleted successfully (silent)
    } catch (error) {
      // Error handled silently
    }
  };

  const getStatusColor = (status) => {
    return status === 'Active' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">License Management</h2>
        <div className="flex gap-3">
          <button
            onClick={updateStudentCounts}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            Update Counts
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 flex items-center"
          >
            <span className="text-xl mr-1">+</span> Add License
          </button>
        </div>
      </div>

      {/* Add License Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-bold mb-4">Add New License</h3>
            <form onSubmit={handleAddLicense} className="space-y-4" noValidate>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">College/University Name</label>
                <input
                  type="text"
                  placeholder="Enter college/university name"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={newLicense.college}
                  onChange={(e) => setNewLicense({...newLicense, college: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={newLicense.email}
                  onChange={(e) => setNewLicense({...newLicense, email: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  placeholder="Enter password"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={newLicense.password}
                  onChange={(e) => setNewLicense({...newLicense, password: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Licenses/Students</label>
                <input
                  type="number"
                  placeholder="Enter total number of licenses"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={newLicense.maxStudents}
                  onChange={(e) => setNewLicense({...newLicense, maxStudents: e.target.value})}
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input
                  type="date"
                  placeholder="Pick an expiry date"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={newLicense.expiryDate}
                  onChange={(e) => setNewLicense({...newLicense, expiryDate: e.target.value})}
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add License
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* License Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-white">
            <tr className="border-b">
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">COLLEGE</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">STUDENTS</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">EXPIRES</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">STATUS</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {licenses.map((license) => (
              <tr key={license._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 flex items-center">
                  <span className="text-gray-400 mr-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 5H3v14h18V5zm-2 2v10H5V7h14z" />
                    </svg>
                  </span>
                  {license.college}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <span className="mr-2">{license.currentStudents} / {license.maxStudents}</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full" 
                        style={{ 
                          width: `${(license.currentStudents / license.maxStudents) * 100}%`,
                          backgroundColor: license.currentStudents === license.maxStudents ? '#ef4444' : '#f97316'
                        }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">{new Date(license.expiryDate).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    license.status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {license.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => {
                        setSelectedLicense(license);
                        setShowEditForm(true);
                      }}
                      className="text-orange-500 hover:text-orange-600"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedLicense(license);
                        setShowDeleteConfirm(true);
                      }}
                      className="text-orange-500 hover:text-orange-600"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                    <button
                      className="text-orange-500 hover:text-orange-600"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                    <button
                      className="text-orange-500 hover:text-orange-600"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 7h-3V4c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v3H4c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-8 0H9V4h6v3h-3z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit License Modal */}
      {showEditForm && selectedLicense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-bold mb-4">Edit License</h3>
            <form onSubmit={handleEditLicense} className="space-y-4" noValidate>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">College/University Name</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={selectedLicense.college}
                  onChange={(e) => setSelectedLicense({...selectedLicense, college: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full p-2 border rounded"
                  value={selectedLicense.email}
                  onChange={(e) => setSelectedLicense({...selectedLicense, email: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password (leave blank to keep same)</label>
                <input
                  type="password"
                  placeholder="Enter new password (optional)"
                  className="w-full p-2 border rounded"
                  value={selectedLicense.password || ''}
                  onChange={(e) => setSelectedLicense({...selectedLicense, password: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Licenses/Students</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={selectedLicense.maxStudents}
                  onChange={(e) => setSelectedLicense({...selectedLicense, maxStudents: parseInt(e.target.value)})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input
                  type="date"
                  className="w-full p-2 border rounded"
                  value={selectedLicense.expiryDate.split('T')[0]}
                  onChange={(e) => setSelectedLicense({...selectedLicense, expiryDate: e.target.value})}
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false);
                    setSelectedLicense(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedLicense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-bold mb-4">Are you sure?</h3>
            <p className="mb-6 text-gray-600">This will permanently delete the license.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedLicense(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteLicense}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md shadow-sm hover:bg-red-700"
              >
                Yes, delete it!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* License Limit Error Modal */}
      {showLimitError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-bold mb-4">License Limit Reached</h3>
            <p className="mb-6 text-gray-600">You have already used {licenses.length}/12 licenses.</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowLimitError(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LicenseManagement;
