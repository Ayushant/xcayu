import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Toast notifications disabled (silent mode)
const toast = { success: () => {}, error: () => {}, loading: () => {}, info: () => {}, warning: () => {}, promise: () => {}, custom: () => {}, dismiss: () => {} };
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
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

/**
 * Enhanced Analytics Component
 * 
 * Features:
 * - Degree performance breakdown
 * - Student trend lines (individual improvement tracking)
 * - Comparative college analytics
 * - Time-based performance analysis
 * - Improvement rankings
 */
const EnhancedAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState('degree'); // degree, trend, comparative, timeline, improvement
  
  // Degree breakdown data
  const [degreeData, setDegreeData] = useState([]);
  
  // Student trend data
  const [trendData, setTrendData] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [students, setStudents] = useState([]);
  
  // Comparative data
  const [comparativeData, setComparativeData] = useState([]);
  
  // Timeline data
  const [timelineData, setTimelineData] = useState([]);
  const [timeInterval, setTimeInterval] = useState('daily');
  
  // Improvement rankings
  const [improvementRankings, setImprovementRankings] = useState([]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B9D'];

  // Fetch degree breakdown
  const fetchDegreeBreakdown = async () => {
    try {
      setLoading(true);
      const response = await api.get('/superadmin/analytics/degree-breakdown');
      if (response.data.success) {
        setDegreeData(response.data.data.degreeStats || []);
      }
    } catch (error) {
      console.error('Error fetching degree breakdown:', error);
      toast.error('Failed to fetch degree breakdown');
    } finally {
      setLoading(false);
    }
  };

  // Fetch students for trend selector
  const fetchStudents = async () => {
    try {
      const response = await api.get('/superadmin/users?role=student&limit=100');
      setStudents(response.data.users || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  // Fetch student trend
  const fetchStudentTrend = async (studentId) => {
    if (!studentId) return;
    
    try {
      setLoading(true);
      const response = await api.get(`/superadmin/analytics/student-trend/${studentId}?timeFrame=30days`);
      if (response.data.success) {
        setTrendData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching student trend:', error);
      toast.error('Failed to fetch student trend');
    } finally {
      setLoading(false);
    }
  };

  // Fetch comparative data
  const fetchComparativeData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/superadmin/analytics/comparative-colleges');
      if (response.data.success) {
        setComparativeData(response.data.data.comparativeData || []);
      }
    } catch (error) {
      console.error('Error fetching comparative data:', error);
      toast.error('Failed to fetch comparative data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch timeline data
  const fetchTimelineData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/superadmin/analytics/time-based?interval=${timeInterval}`);
      if (response.data.success) {
        setTimelineData(response.data.data.timeBasedData || []);
      }
    } catch (error) {
      console.error('Error fetching timeline data:', error);
      toast.error('Failed to fetch timeline data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch improvement rankings
  const fetchImprovementRankings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/superadmin/analytics/improvement-rankings?limit=10');
      if (response.data.success) {
        setImprovementRankings(response.data.data.rankings || []);
      }
    } catch (error) {
      console.error('Error fetching improvement rankings:', error);
      toast.error('Failed to fetch improvement rankings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchDegreeBreakdown();
  }, []);

  useEffect(() => {
    if (selectedStudentId) {
      fetchStudentTrend(selectedStudentId);
    }
  }, [selectedStudentId]);

  useEffect(() => {
    if (activeView === 'comparative') {
      fetchComparativeData();
    } else if (activeView === 'timeline') {
      fetchTimelineData();
    } else if (activeView === 'improvement') {
      fetchImprovementRankings();
    }
  }, [activeView, timeInterval]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Enhanced Analytics</h2>
      </div>

      {/* View Selector */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex space-x-2 overflow-x-auto">
          {[
            { id: 'degree', label: '📊 Degree Breakdown' },
            { id: 'trend', label: '📈 Student Trends' },
            { id: 'comparative', label: '🏢 College Comparison' },
            { id: 'timeline', label: '⏰ Time Analysis' },
            { id: 'improvement', label: '🏆 Improvement Rankings' }
          ].map((view) => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                activeView === view.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {view.label}
            </button>
          ))}
        </div>
      </div>

      {/* Degree Breakdown View */}
      {activeView === 'degree' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4">Performance by Degree</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={degreeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="degree" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="averageScore" fill="#8884d8" name="Avg Score" />
                <Bar dataKey="totalAttempts" fill="#82ca9d" name="Attempts" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {degreeData.map((degree, index) => (
              <div key={degree.degree} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold">{degree.degree}</h4>
                  <span className="text-2xl">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📊'}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Avg Score</p>
                    <p className="text-2xl font-bold text-blue-600">{degree.averageScore}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Max Score</p>
                    <p className="text-2xl font-bold text-green-600">{degree.maxScore}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Students</p>
                    <p className="text-xl font-bold">{degree.uniqueStudents}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Attempts</p>
                    <p className="text-xl font-bold">{degree.totalAttempts}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Student Trend View */}
      {activeView === 'trend' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-4">
            <label className="block text-sm font-medium mb-2">Select Student</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Choose a student...</option>
              {students.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.fullName} - {student.email} ({student.college})
                </option>
              ))}
            </select>
          </div>

          {trendData && (
            <>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold mb-2">
                  {trendData.student.name}'s Performance Trend
                </h3>
                <p className="text-gray-600 mb-4">
                  {trendData.student.college} - {trendData.student.degree}
                </p>

                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={trendData.trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => new Date(date).toLocaleDateString()}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.3}
                      name="Score"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="movingAverage" 
                      stroke="#82ca9d" 
                      strokeWidth={2}
                      name="Moving Average"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-sm text-gray-600">Total Attempts</p>
                  <p className="text-2xl font-bold">{trendData.statistics.totalAttempts}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-sm text-gray-600">Average Score</p>
                  <p className="text-2xl font-bold text-blue-600">{trendData.statistics.averageScore}%</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-sm text-gray-600">Improvement</p>
                  <p className={`text-2xl font-bold ${
                    trendData.statistics.improvement > 0 ? 'text-green-600' : 
                    trendData.statistics.improvement < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {trendData.statistics.improvement > 0 ? '+' : ''}
                    {trendData.statistics.improvement}%
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-sm text-gray-600">Trend</p>
                  <p className="text-xl font-bold">
                    {trendData.statistics.trend === 'improving' ? '📈 Improving' :
                     trendData.statistics.trend === 'declining' ? '📉 Declining' : '➡️ Stable'}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h4 className="font-semibold mb-3">Recent Quiz/Simulation Attempts</h4>
                <div className="space-y-2">
                  {trendData.trendData.slice(-5).reverse().map((attempt, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{attempt.quizTitle}</p>
                        <p className="text-sm text-gray-600">
                          {attempt.courseName} • {attempt.difficulty} • {new Date(attempt.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">{attempt.score}%</p>
                        <p className="text-xs text-gray-500">Attempt #{attempt.attemptNumber}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Comparative View */}
      {activeView === 'comparative' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4">College Comparison</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">College</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attempts</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Students</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">License</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {comparativeData.map((college) => (
                    <tr key={college.college}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{college.college}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-lg font-bold text-blue-600">
                          {college.performance.averageScore}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{college.performance.totalAttempts}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {college.license.currentStudents}/{college.license.maxStudents}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          college.license.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {college.license.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Timeline View */}
      {activeView === 'timeline' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-4">
            <label className="block text-sm font-medium mb-2">Time Interval</label>
            <select
              value={timeInterval}
              onChange={(e) => setTimeInterval(e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4">Performance Over Time</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="averageScore" stroke="#8884d8" name="Avg Score" />
                <Line type="monotone" dataKey="totalAttempts" stroke="#82ca9d" name="Attempts" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Improvement Rankings View */}
      {activeView === 'improvement' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4">🏆 Most Improved Students</h3>
            <div className="space-y-3">
              {improvementRankings.map((ranking, index) => (
                <div key={ranking.student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </span>
                    <div>
                      <p className="font-semibold">{ranking.student.name}</p>
                      <p className="text-sm text-gray-600">
                        {ranking.student.college} • {ranking.student.degree}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      +{ranking.metrics.improvement}%
                    </p>
                    <p className="text-xs text-gray-500">
                      {ranking.metrics.firstScore}% → {ranking.metrics.lastScore}%
                    </p>
                    <p className="text-xs text-gray-500">
                      {ranking.metrics.totalAttempts} attempts
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading analytics...</p>
        </div>
      )}
    </div>
  );
};

export default EnhancedAnalytics;

