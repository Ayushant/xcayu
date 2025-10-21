import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Toast notifications disabled (silent mode)
const toast = { success: () => {}, error: () => {}, loading: () => {}, info: () => {}, warning: () => {}, promise: () => {}, custom: () => {}, dismiss: () => {} };

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

const SimulationManagement = () => {
  const [simulations, setSimulations] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedSimulation, setSelectedSimulation] = useState(null);
  const [filters, setFilters] = useState({
    college: '',
    degree: '',
    course: ''
  });

  const [newSimulation, setNewSimulation] = useState({
    simulationName: '',
    college: '',
    course: '',
    degree: '',
    description: ''
  });

  const degrees = ['MBA', 'BE', 'BTech', 'Law', 'BBA', 'BCA', 'MCA', 'MSc', 'BSc', 'MTech', 'BA', 'MA', 'PhD', 'Other'];

  // Fetch simulations
  const fetchSimulations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.college) params.append('college', filters.college);
      if (filters.degree) params.append('degree', filters.degree);
      if (filters.course) params.append('course', filters.course);

      const response = await api.get(`/superadmin/simulations?${params.toString()}`);
      
      if (response.data.success) {
        setSimulations(response.data.data.simulations || []);
      } else {
        setSimulations(response.data.simulations || []);
      }
    } catch (error) {
      console.error('Error fetching simulations:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch simulations');
    } finally {
      setLoading(false);
    }
  };

  // Fetch courses
  const fetchCourses = async () => {
    try {
      const response = await api.get('/superadmin/courses?limit=100');
      if (response.data.success) {
        setCourses(response.data.data.courses || []);
      } else {
        setCourses(response.data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  useEffect(() => {
    fetchSimulations();
    fetchCourses();
  }, [filters]);

  // Handle create simulation
  const handleCreateSimulation = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/superadmin/simulations', newSimulation);
      
      // Show success with credentials
      const { studentCredentials, adminCredentials } = response.data.data || {};
      
      if (studentCredentials && adminCredentials) {
        const credentialsMessage = `
Simulation created successfully!

Student Login:
Email: ${studentCredentials.email}
Password: ${studentCredentials.password}

Admin Login:
Email: ${adminCredentials.email}
Password: ${adminCredentials.password}

Please save these credentials!
        `;
        
        // Credentials message prepared (silent - no alert shown)
      }
      
      // Simulation template created successfully (silent)
      setShowAddForm(false);
      setNewSimulation({
        simulationName: '',
        college: '',
        course: '',
        degree: '',
        description: ''
      });
      fetchSimulations();
    } catch (error) {
      console.error('Error creating simulation:', error);
      toast.error(error.response?.data?.message || 'Failed to create simulation');
    }
  };

  // Handle update simulation
  const handleUpdateSimulation = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/superadmin/simulations/${selectedSimulation._id}`, selectedSimulation);
      toast.success(response.data.message || 'Simulation updated successfully');
      setShowEditForm(false);
      setSelectedSimulation(null);
      fetchSimulations();
    } catch (error) {
      console.error('Error updating simulation:', error);
      toast.error(error.response?.data?.message || 'Failed to update simulation');
    }
  };

  // Handle delete simulation
  const handleDeleteSimulation = async (id) => {
    // Delete confirmation (silent - always proceed)

    try {
      const response = await api.delete(`/superadmin/simulations/${id}`);
      toast.success(response.data.message || 'Simulation deleted successfully');
      fetchSimulations();
    } catch (error) {
      console.error('Error deleting simulation:', error);
      toast.error(error.response?.data?.message || 'Failed to delete simulation');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Simulation Management</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          + Create Simulation Template
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Filter by college"
            value={filters.college}
            onChange={(e) => setFilters({ ...filters, college: e.target.value })}
            className="border rounded-lg px-3 py-2"
          />
          <select
            value={filters.degree}
            onChange={(e) => setFilters({ ...filters, degree: e.target.value })}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">All Degrees</option>
            {degrees.map(degree => (
              <option key={degree} value={degree}>{degree}</option>
            ))}
          </select>
          <select
            value={filters.course}
            onChange={(e) => setFilters({ ...filters, course: e.target.value })}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">All Courses</option>
            {courses.map(course => (
              <option key={course._id} value={course._id}>
                {course.courseName} ({course.courseCode})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Simulations List */}
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">College</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Degree</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {simulations.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No simulations found
                  </td>
                </tr>
              ) : (
                simulations.map((simulation) => (
                  <tr key={simulation._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium">{simulation.simulationName}</div>
                        {simulation.isTemplate && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Template</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{simulation.college || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{simulation.degree || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {simulation.course?.courseName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        simulation.isActive && simulation.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {simulation.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => {
                          // Show credentials
                          if (simulation.studentCredentials && simulation.adminCredentials) {
                            const credMsg = `
Student Login:
Email: ${simulation.studentCredentials.email}
Password: ${simulation.studentCredentials.password}

Admin Login:
Email: ${simulation.adminCredentials.email}
Password: ${simulation.adminCredentials.password}
                            `;
                            // Credentials message prepared (silent - no alert shown)
                          }
                        }}
                        className="text-green-600 hover:text-green-800 mr-3"
                        title="View Credentials"
                      >
                        🔑 Login
                      </button>
                      <button
                        onClick={() => {
                          setSelectedSimulation(simulation);
                          setShowEditForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSimulation(simulation._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Simulation Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Create Simulation Template</h3>
            <form onSubmit={handleCreateSimulation} noValidate>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Simulation Name *</label>
                  <input
                    type="text"
                    required
                    value={newSimulation.simulationName}
                    onChange={(e) => setNewSimulation({ ...newSimulation, simulationName: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">College</label>
                  <input
                    type="text"
                    value={newSimulation.college}
                    onChange={(e) => setNewSimulation({ ...newSimulation, college: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Degree</label>
                  <select
                    value={newSimulation.degree}
                    onChange={(e) => setNewSimulation({ ...newSimulation, degree: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">Select Degree</option>
                    {degrees.map(degree => (
                      <option key={degree} value={degree}>{degree}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Course</label>
                  <select
                    value={newSimulation.course}
                    onChange={(e) => setNewSimulation({ ...newSimulation, course: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">Select Course</option>
                    {courses.map(course => (
                      <option key={course._id} value={course._id}>
                        {course.courseName} ({course.courseCode})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={newSimulation.description}
                    onChange={(e) => setNewSimulation({ ...newSimulation, description: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    rows="3"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Simulation Modal */}
      {showEditForm && selectedSimulation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Edit Simulation</h3>
            <form onSubmit={handleUpdateSimulation} noValidate>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Simulation Name</label>
                  <input
                    type="text"
                    required
                    value={selectedSimulation.simulationName}
                    onChange={(e) => setSelectedSimulation({ ...selectedSimulation, simulationName: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">College</label>
                  <input
                    type="text"
                    value={selectedSimulation.college || ''}
                    onChange={(e) => setSelectedSimulation({ ...selectedSimulation, college: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Degree</label>
                  <select
                    value={selectedSimulation.degree || ''}
                    onChange={(e) => setSelectedSimulation({ ...selectedSimulation, degree: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">Select Degree</option>
                    {degrees.map(degree => (
                      <option key={degree} value={degree}>{degree}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false);
                    setSelectedSimulation(null);
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulationManagement;

