import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Toast notifications disabled (silent mode)
const toast = { success: () => {}, error: () => {}, loading: () => {}, info: () => {}, warning: () => {}, promise: () => {}, custom: () => {}, dismiss: () => {} };
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

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

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [licenseReport, setLicenseReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    college: '',
    degree: '',
    startDate: '',
    endDate: ''
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.college) params.append('college', filters.college);
      if (filters.degree) params.append('degree', filters.degree);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const [analyticsRes, licenseRes] = await Promise.all([
        api.get(`/superadmin/analytics?${params.toString()}`),
        api.get('/superadmin/analytics/license-expiry?days=30')
      ]);

      if (analyticsRes.data.success) {
        setAnalytics(analyticsRes.data.data);
      }

      if (licenseRes.data.success) {
        setLicenseReport(licenseRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [filters]);

  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => row[header]).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Analytics & Reports</h2>
        <button
          onClick={() => exportToCSV(analytics?.collegePerformance || [], 'college_performance')}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
        >
          📊 Export to CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-3">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="College"
            value={filters.college}
            onChange={(e) => setFilters({ ...filters, college: e.target.value })}
            className="border rounded-lg px-3 py-2"
          />
          <input
            type="text"
            placeholder="Degree"
            value={filters.degree}
            onChange={(e) => setFilters({ ...filters, degree: e.target.value })}
            className="border rounded-lg px-3 py-2"
          />
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="border rounded-lg px-3 py-2"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="border rounded-lg px-3 py-2"
          />
        </div>
      </div>

      {/* License Expiry Alert */}
      {licenseReport && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">
              ⚠️ Licenses Expiring Soon ({licenseReport.summary.daysThreshold} days)
            </h3>
            <p className="text-2xl font-bold text-yellow-900">
              {licenseReport.summary.expiringSoon}
            </p>
          </div>
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">
              ❌ Expired Licenses
            </h3>
            <p className="text-2xl font-bold text-red-900">
              {licenseReport.summary.expired}
            </p>
          </div>
        </div>
      )}

      {/* College Performance Chart */}
      {analytics?.collegePerformance && analytics.collegePerformance.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">College Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.collegePerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="averageScore" fill="#8884d8" name="Average Score" />
              <Bar dataKey="totalAttempts" fill="#82ca9d" name="Total Attempts" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Degree Performance Chart */}
      {analytics?.degreePerformance && analytics.degreePerformance.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">Performance by Degree</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.degreePerformance}
                dataKey="averageScore"
                nameKey="_id"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry._id}: ${entry.averageScore.toFixed(1)}%`}
              >
                {analytics.degreePerformance.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Course Performance */}
      {analytics?.coursePerformance && analytics.coursePerformance.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">Course Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.coursePerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="courseName" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="averageScore"
                stroke="#8884d8"
                strokeWidth={2}
                name="Average Score"
              />
              <Line
                type="monotone"
                dataKey="totalAttempts"
                stroke="#82ca9d"
                strokeWidth={2}
                name="Total Attempts"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Performers */}
      {analytics?.topPerformers && analytics.topPerformers.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">🏆 Top Performers</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">College</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.topPerformers.map((performer, index) => (
                  <tr key={performer._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-2xl">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {performer.student?.fullName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {performer.student?.college || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-bold text-green-600">
                        {Math.round(performer.totalScore)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Performance by Type */}
      {analytics?.performanceByType && analytics.performanceByType.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">Performance by Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analytics.performanceByType.map((type) => (
              <div key={type._id} className="border rounded-lg p-4">
                <h4 className="font-semibold text-lg mb-2">
                  {type._id === 'quiz' ? '📝 Quiz' : '🎯 Simulation'}
                </h4>
                <div className="space-y-2">
                  <p className="text-gray-600">
                    Average Score: <span className="font-bold text-blue-600">{type.averageScore.toFixed(1)}%</span>
                  </p>
                  <p className="text-gray-600">
                    Total Attempts: <span className="font-bold text-green-600">{type.totalAttempts}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expiring Licenses Table */}
      {licenseReport?.expiringLicenses && licenseReport.expiringLicenses.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">⏰ Licenses Expiring Soon</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">College</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Left</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {licenseReport.expiringLicenses.map((license) => {
                  const daysLeft = Math.ceil((new Date(license.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                  return (
                    <tr key={license._id}>
                      <td className="px-6 py-4 whitespace-nowrap">{license.college}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{license.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(license.expiryDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          daysLeft < 7 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {daysLeft} days
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;

