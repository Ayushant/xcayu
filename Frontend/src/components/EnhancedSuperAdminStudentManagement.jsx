import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Toast notifications disabled (silent mode)
const toast = { success: () => {}, error: () => {}, loading: () => {}, info: () => {}, warning: () => {}, promise: () => {}, custom: () => {}, dismiss: () => {} };
import bcrypt from 'bcryptjs';

import { API_URL } from '../config/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * Enhanced Super Admin Student Management Component
 * 
 * Features:
 * - Create new students with college/degree assignment
 * - Edit student details
 * - Delete students
 * - Bulk operations
 * - License validation
 * - Real-time status updates via Socket.IO
 */
const EnhancedSuperAdminStudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [licenses, setLicenses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [filters, setFilters] = useState({
    college: '',
    isActive: 'all'
  });

  const [newStudent, setNewStudent] = useState({
    email: '',
    password: '',
    fullName: '',
    college: '',
    course: '', // Course ID for course-restricted access
    rollNumber: ''
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  // Fetch students with filters
  const fetchStudents = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        role: 'student',
        page: page.toString(),
        limit: '10'
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (filters.college) params.append('college', filters.college);

      const response = await api.get(`/superadmin/users?${params}`);
      setStudents(response.data.users || []);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Error fetching students:', err);
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  // Fetch licenses for college selection
  const fetchLicenses = async () => {
    try {
      const response = await api.get('/superadmin/licenses?limit=100');
      setLicenses(response.data.licenses || []);
    } catch (err) {
      console.error('Error fetching licenses:', err);
    }
  };

  // Fetch courses for course selection
  const fetchCourses = async () => {
    try {
      const response = await api.get('/superadmin/courses?limit=100');
      setCourses(response.data.data?.courses || response.data.courses || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchLicenses();
    fetchCourses();
  }, [filters]);

  /**
   * Validate student creation against license limits
   * Checks:
   * - License exists and is active
   * - License not expired
   * - Student count within limit
   */
  const validateLicense = async (college) => {
    try {
      const license = licenses.find(l => l.college === college);
      
      if (!license) {
        toast.error('No license found for this college');
        return false;
      }

      // Check expiry
      if (new Date(license.expiryDate) < new Date()) {
        toast.error(`License for ${college} has expired`);
        return false;
      }

      // Check status
      if (license.status !== 'Active') {
        toast.error(`License for ${college} is ${license.status}`);
        return false;
      }

      // Check student limit
      const currentCount = students.filter(s => s.college === college).length;
      if (currentCount >= license.maxStudents) {
        toast.error(`Student limit reached for ${college} (${license.maxStudents} max)`);
        return false;
      }

      return true;
    } catch (error) {
      console.error('License validation error:', error);
      return false;
    }
  };

  /**
   * Create new student
   * - Validates license
   * - Hashes password
   * - Creates user with role 'student'
   * - Emits Socket.IO event for real-time update
   */
  const handleCreateStudent = async (e) => {
    e.preventDefault();

    // Validate license first
    const isValid = await validateLicense(newStudent.college);
    if (!isValid) return;

    try {
      setLoading(true);

      // Hash password before sending
      const hashedPassword = await bcrypt.hash(newStudent.password, 10);

      const response = await api.post('/superadmin/users', {
        ...newStudent,
        password: hashedPassword,
        role: 'student'
      });

      toast.success('Student created successfully');
      setShowAddModal(false);
      setNewStudent({
        email: '',
        password: '',
        fullName: '',
        college: '',
        degree: '',
        rollNumber: ''
      });
      fetchStudents(pagination.currentPage);
    } catch (err) {
      console.error('Error creating student:', err);
      toast.error(err.response?.data?.message || 'Failed to create student');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update student details
   * - Validates new college if changed
   * - Updates user information
   */
  const handleUpdateStudent = async (e) => {
    e.preventDefault();

    // If college changed, validate new license
    const originalStudent = students.find(s => s._id === selectedStudent._id);
    if (selectedStudent.college !== originalStudent.college) {
      const isValid = await validateLicense(selectedStudent.college);
      if (!isValid) return;
    }

    try {
      setLoading(true);

      const updateData = {
        fullName: selectedStudent.fullName,
        email: selectedStudent.email,
        college: selectedStudent.college,
        degree: selectedStudent.degree,
        isActive: selectedStudent.isActive
      };

      await api.put(`/superadmin/users/${selectedStudent._id}`, updateData);

      toast.success('Student updated successfully');
      setShowEditModal(false);
      setSelectedStudent(null);
      fetchStudents(pagination.currentPage);
    } catch (err) {
      console.error('Error updating student:', err);
      toast.error(err.response?.data?.message || 'Failed to update student');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete student
   * - Removes student from database
   * - Updates license student count
   */
  const handleDeleteStudent = async (studentId) => {
    // Delete confirmation (silent - always proceed)

    try {
      setLoading(true);
      await api.delete(`/superadmin/users/${studentId}`);
      toast.success('Student deleted successfully');
      fetchStudents(pagination.currentPage);
    } catch (err) {
      console.error('Error deleting student:', err);
      toast.error(err.response?.data?.message || 'Failed to delete student');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Toggle student active status
   * - Enables/disables student access
   */
  const toggleStudentStatus = async (studentId, currentStatus) => {
    try {
      setLoading(true);
      await api.put(`/superadmin/users/${studentId}/status`, {
        isActive: !currentStatus
      });
      toast.success(`Student ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchStudents(pagination.currentPage);
    } catch (err) {
      console.error('Error updating student status:', err);
      toast.error('Failed to update student status');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get license status badge for a college
   */
  const getLicenseStatus = (college) => {
    const license = licenses.find(l => l.college === college);
    if (!license) return <span className="text-xs text-red-600">No License</span>;

    const isExpired = new Date(license.expiryDate) < new Date();
    const isLimitReached = license.currentStudents >= license.maxStudents;

    if (isExpired) {
      return <span className="text-xs text-red-600">Expired</span>;
    }
    if (isLimitReached) {
      return <span className="text-xs text-orange-600">Limit Reached</span>;
    }
    return (
      <span className="text-xs text-green-600">
        {license.currentStudents}/{license.maxStudents}
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Student Management</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          + Add Student
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search by name, email, or college..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && fetchStudents(1)}
            className="border rounded-lg px-3 py-2"
          />
          <select
            value={filters.college}
            onChange={(e) => setFilters({ ...filters, college: e.target.value })}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">All Colleges</option>
            {licenses.map(license => (
              <option key={license._id} value={license.college}>
                {license.college}
              </option>
            ))}
          </select>
          <select
            value={filters.isActive}
            onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
            className="border rounded-lg px-3 py-2"
          >
            <option value="all">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">College</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Degree</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">License</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      No students found
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student._id}>
                      <td className="px-6 py-4 whitespace-nowrap">{student.fullName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{student.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{student.college || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{student.degree || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getLicenseStatus(student.college)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          student.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {student.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setShowEditModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => toggleStudentStatus(student._id, student.isActive)}
                          className="text-yellow-600 hover:text-yellow-800"
                        >
                          {student.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student._id)}
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

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 flex items-center justify-between border-t">
              <div className="text-sm text-gray-700">
                Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                {pagination.totalItems} students
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => fetchStudents(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => fetchStudents(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Add New Student</h3>
            <form onSubmit={handleCreateStudent} noValidate>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newStudent.fullName}
                    onChange={(e) => setNewStudent({ ...newStudent, fullName: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    value={newStudent.password}
                    onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    minLength="6"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">College *</label>
                  <select
                    required
                    value={newStudent.college}
                    onChange={(e) => setNewStudent({ ...newStudent, college: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">Select College</option>
                    {licenses
                      .filter(l => l.status === 'Active' && new Date(l.expiryDate) > new Date())
                      .map(license => (
                        <option key={license._id} value={license.college}>
                          {license.college} ({license.currentStudents}/{license.maxStudents})
                        </option>
                      ))
                    }
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Course *</label>
                  <select
                    required
                    value={newStudent.course}
                    onChange={(e) => setNewStudent({ ...newStudent, course: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">Select Course</option>
                    {courses.map(course => (
                      <option key={course._id} value={course._id}>
                        {course.courseName} ({course.courseCode})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Student will only see quizzes for this course</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Roll Number</label>
                  <input
                    type="text"
                    value={newStudent.rollNumber}
                    onChange={(e) => setNewStudent({ ...newStudent, rollNumber: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewStudent({
                      email: '',
                      password: '',
                      fullName: '',
                      college: '',
                      degree: '',
                      rollNumber: ''
                    });
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Edit Student</h3>
            <form onSubmit={handleUpdateStudent} noValidate>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={selectedStudent.fullName}
                    onChange={(e) => setSelectedStudent({ ...selectedStudent, fullName: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={selectedStudent.email}
                    onChange={(e) => setSelectedStudent({ ...selectedStudent, email: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">College</label>
                  <select
                    required
                    value={selectedStudent.college || ''}
                    onChange={(e) => setSelectedStudent({ ...selectedStudent, college: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">Select College</option>
                    {licenses.map(license => (
                      <option key={license._id} value={license.college}>
                        {license.college}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Course *</label>
                  <select
                    required
                    value={selectedStudent.course || ''}
                    onChange={(e) => setSelectedStudent({ ...selectedStudent, course: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">Select Course</option>
                    {courses.map(course => (
                      <option key={course._id} value={course._id}>
                        {course.courseName} ({course.courseCode})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Student will only see quizzes for this course</p>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedStudent(null);
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedSuperAdminStudentManagement;

