import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Toast notifications disabled (silent mode)
const toast = { success: () => {}, error: () => {}, loading: () => {}, info: () => {}, warning: () => {}, promise: () => {}, custom: () => {}, dismiss: () => {} };
import { API_URL } from '../config/api';

/**
 * Enhanced Quiz Builder Component with List View
 * 
 * Features:
 * - View all created quizzes
 * - Create new quizzes
 * - Edit existing quizzes
 * - Delete quizzes
 * - Toggle between list and create views
 */
const EnhancedQuizBuilder = () => {
  const [view, setView] = useState('list'); // 'list' or 'create'
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    preface: '', // Preface shown before quiz starts
    difficulty: 'Medium',
    passingScore: 60,
    maxMarks: 100, // Total marks for quiz (set by Super Admin)
    course: '', // Required field
    college: '',
    tags: [],
    questions: []
  });

  const [simulations, setSimulations] = useState([]);
  const [courses, setCourses] = useState([]);
  const [tagInput, setTagInput] = useState('');

  const degrees = ['BSc', 'MSc', 'BTech', 'MTech', 'BA', 'MA', 'BBA', 'MBA', 'BCA', 'MCA', 'PhD', 'Other'];

  const api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  useEffect(() => {
    fetchQuizzes();
    fetchSimulations();
    fetchCourses();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/superadmin/quizzes');
      setQuizzes(response.data.quizzes || response.data.data?.quizzes || []);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const fetchSimulations = async () => {
    try {
      const response = await api.get('/superadmin/simulations');
      setSimulations(response.data.data?.simulations || []);
    } catch (error) {
      console.error('Error fetching simulations:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await api.get('/superadmin/courses');
      setCourses(response.data.data?.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      text: '',
      points: [ // Multiple numbered points (Point 1, Point 2, etc.)
        { text: '' },
        { text: '' }
      ],
      options: [
        { text: '', correctRank: 1, marks: 10, impact: '' }, // Each option has marks and impact
        { text: '', correctRank: 2, marks: 8, impact: '' },
        { text: '', correctRank: 3, marks: 6, impact: '' },
        { text: '', correctRank: 4, marks: 4, impact: '' }
      ],
      instructionRequired: true
    };

    setQuizData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const removeQuestion = (questionId) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  const updateQuestion = (questionId, field, value) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId ? { ...q, [field]: value } : q
      )
    }));
  };

  const addOption = (questionId) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId
          ? {
              ...q,
              options: [...q.options, { text: '', correctRank: q.options.length + 1, marks: 5, impact: '' }]
            }
          : q
      )
    }));
  };

  const removeOption = (questionId, optionIndex) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.filter((_, i) => i !== optionIndex)
            }
          : q
      )
    }));
  };

  const updateOption = (questionId, optionIndex, field, value) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((opt, i) =>
                i === optionIndex ? { ...opt, [field]: value } : opt
              )
            }
          : q
      )
    }));
  };

  // Point management functions
  const addPoint = (questionId) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId
          ? {
              ...q,
              points: [...(q.points || []), { text: '' }]
            }
          : q
      )
    }));
  };

  const removePoint = (questionId, pointIndex) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId
          ? {
              ...q,
              points: q.points.filter((_, i) => i !== pointIndex)
            }
          : q
      )
    }));
  };

  const updatePoint = (questionId, pointIndex, value) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId
          ? {
              ...q,
              points: q.points.map((point, i) =>
                i === pointIndex ? { text: value } : point
              )
            }
          : q
      )
    }));
  };

  // Removed - no longer needed for ranking

  const addTag = () => {
    if (tagInput.trim() && !quizData.tags.includes(tagInput.trim())) {
      setQuizData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setQuizData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const validateQuiz = () => {
    if (!quizData.title.trim()) {
      toast.error('Quiz title is required');
      return false;
    }

    if (!quizData.description.trim()) {
      toast.error('Quiz description is required');
      return false;
    }

    if (!quizData.maxMarks || quizData.maxMarks <= 0) {
      toast.error('Total marks must be greater than 0');
      return false;
    }

    if (!quizData.course || quizData.course.trim() === '') {
      toast.error('Course is required - please select a course');
      return false;
    }

    if (quizData.questions.length === 0) {
      toast.error('Add at least one question');
      return false;
    }

    for (const question of quizData.questions) {
      if (!question.text.trim()) {
        toast.error('All questions must have text');
        return false;
      }

      if (question.options.length < 2) {
        toast.error('Each question must have at least 2 options');
        return false;
      }

      // Validate ranking numbers
      const ranks = question.options.map(opt => opt.correctRank);
      const uniqueRanks = new Set(ranks);
      
      if (uniqueRanks.size !== question.options.length) {
        toast.error(`Question "${question.text.substring(0, 50)}..." has duplicate ranking numbers. Each option must have a unique rank.`);
        return false;
      }

      // Check if ranks are consecutive from 1 to n
      const sortedRanks = [...ranks].sort((a, b) => a - b);
      for (let i = 0; i < sortedRanks.length; i++) {
        if (sortedRanks[i] !== i + 1) {
          toast.error(`Question "${question.text.substring(0, 50)}..." must have consecutive ranks starting from 1`);
          return false;
        }
      }

      const hasEmptyOption = question.options.some(opt => !opt.text.trim());
      if (hasEmptyOption) {
        toast.error(`All options in question "${question.text.substring(0, 50)}..." must have text`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateQuiz()) {
      return;
    }

    setLoading(true);

    try {
      // Clean the payload - only send fields that backend expects
      // Convert 'marks' to 'points' for backend compatibility
      const quizPayload = {
        title: quizData.title,
        description: quizData.description,
        preface: quizData.preface || '',
        course: quizData.course, // Required field
        difficulty: quizData.difficulty || 'Medium',
        passingScore: quizData.passingScore || 60,
        college: quizData.college || '',
        tags: quizData.tags || [],
        questions: quizData.questions.map(({ id, ...q }) => ({
          ...q,
          options: q.options.map(opt => ({
            text: opt.text,
            correctRank: opt.correctRank,
            points: opt.marks || opt.points || 0, // Convert marks → points for backend
            isCorrect: opt.isCorrect,
            impact: opt.impact || ''
          }))
        }))
      };

      console.log('💾 Sending quiz payload:', quizPayload);

      if (editingQuiz) {
        await api.put(`/superadmin/quizzes/${editingQuiz._id}`, quizPayload);
        toast.success('Quiz updated successfully!');
      } else {
        await api.post('/superadmin/quizzes', quizPayload);
        toast.success('Quiz created successfully!');
      }
      
      // Reset form
      setQuizData({
        title: '',
        description: '',
        preface: '',
        difficulty: 'Medium',
        passingScore: 60,
        course: '',
        college: '',
        tags: [],
        questions: []
      });
      setEditingQuiz(null);
      setView('list');
      fetchQuizzes();

    } catch (error) {
      console.error('Error saving quiz:', error);
      toast.error(error.response?.data?.message || 'Failed to save quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (quiz) => {
    setEditingQuiz(quiz);
    setQuizData({
      title: quiz.title || '',
      description: quiz.description || '',
      preface: quiz.preface || '',
      duration: quiz.duration || 20,
      difficulty: quiz.difficulty || 'Medium',
      passingScore: quiz.passingScore || 60,
      maxMarks: quiz.maxMarks || 100,
      course: quiz.course?._id || quiz.course || '',
      degree: quiz.degree || '',
      college: quiz.college || '',
      tags: quiz.tags || [],
      questions: (quiz.questions || []).map((q, i) => ({
        ...q,
        id: q._id || Date.now() + i,
        options: (q.options || []).map(opt => ({
          ...opt,
          marks: opt.points || opt.marks || 0, // Convert points → marks for frontend
        }))
      }))
    });
    setView('create');
  };

  const handleDelete = async (quizId) => {
    // Delete confirmation (silent - always proceed)

    try {
      await api.delete(`/superadmin/quizzes/${quizId}`);
      toast.success('Quiz deleted successfully');
      fetchQuizzes();
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast.error('Failed to delete quiz');
    }
  };

  const handleCancel = () => {
    setView('list');
    setEditingQuiz(null);
    setQuizData({
      title: '',
      description: '',
      preface: '',
      duration: 20,
      difficulty: 'Medium',
      passingScore: 60,
      maxMarks: 100,
      course: '',
      degree: '',
      college: '',
      tags: [],
      questions: []
    });
  };

  // LIST VIEW
  if (view === 'list') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Quiz Management</h2>
              <p className="text-gray-600">Create and manage quizzes for your simulations</p>
            </div>
            <button
              onClick={() => setView('create')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              Create New Quiz
            </button>
          </div>
        </div>

        {/* Quiz List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading quizzes...</span>
            </div>
          ) : quizzes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No quizzes created yet</p>
              <button
                onClick={() => setView('create')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Your First Quiz
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Questions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time Limit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Difficulty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {quizzes.map((quiz) => (
                    <tr key={quiz._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{quiz.title}</div>
                        <div className="text-sm text-gray-500">{quiz.description?.substring(0, 60)}...</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {quiz.course?.courseName || quiz.course?.courseCode || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {quiz.questions?.length || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        No Time Limit
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          quiz.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                          quiz.difficulty === 'Hard' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {quiz.difficulty || 'Medium'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          quiz.status === 'Active' || quiz.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {quiz.status || (quiz.isActive ? 'Active' : 'Inactive')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(quiz)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(quiz._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // CREATE/EDIT VIEW
  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {editingQuiz ? 'Edit Quiz' : 'Create New Ranking Quiz'}
            </h2>
            <p className="text-gray-600">Build ranking-based quizzes where students rank options by priority</p>
          </div>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            ← Back to List
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Total Marks - Prominently displayed at top */}

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quiz Title *
              </label>
              <input
                type="text"
                required
                value={quizData.title}
                onChange={(e) => setQuizData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Business Strategy Assessment"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course *
              </label>
              <select
                required
                value={quizData.course}
                onChange={(e) => setQuizData(prev => ({ ...prev, course: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Course (Required)</option>
                {courses.map(course => (
                  <option key={course._id} value={course._id}>
                    {course.courseName} ({course.courseCode})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Students enrolled in this course will see this quiz</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                value={quizData.difficulty}
                onChange={(e) => setQuizData(prev => ({ ...prev, difficulty: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Passing Score (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={quizData.passingScore}
                onChange={(e) => setQuizData(prev => ({ ...prev, passingScore: parseInt(e.target.value) }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              required
              rows="2"
              value={quizData.description}
              onChange={(e) => setQuizData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe what this quiz covers..."
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preface (Shown before quiz starts)
            </label>
            <textarea
              rows="3"
              value={quizData.preface}
              onChange={(e) => setQuizData(prev => ({ ...prev, preface: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add important information, instructions, or context that students should read before starting the quiz..."
            />
            <p className="text-xs text-gray-500 mt-1">📄 This will be displayed on a separate screen before the quiz questions</p>
          </div>

          {/* Questions Section */}
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Questions ({quizData.questions.length})
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Total Marks: <span className="font-bold text-blue-600">
                    {quizData.questions.length * 10}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">(Each question = 10 marks)</span>
                </p>
              </div>
              <button
                type="button"
                onClick={addQuestion}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                + Add Question
              </button>
            </div>

            <div className="space-y-6">
              {quizData.questions.map((question, qIndex) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-md font-semibold text-gray-700">Question {qIndex + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeQuestion(question.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question Text *
                      </label>
                      <textarea
                        rows="2"
                        value={question.text}
                        onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your question..."
                      />
                    </div>

                    {/* Points - Numbered List */}
                    <div className="bg-purple-50 border-2 border-purple-400 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <label className="text-sm font-bold text-gray-900">
                          📝 Points (Read-only for Students)
                        </label>
                        <button
                          type="button"
                          onClick={() => addPoint(question.id)}
                          className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
                        >
                          + Add Point
                        </button>
                      </div>
                      <p className="text-xs text-purple-700 mb-3">
                        💡 These will be shown as numbered points (Point 1, Point 2...) that students can see but not change
                      </p>
                      
                      {question.points && question.points.length > 0 ? (
                        <div className="space-y-2">
                          {question.points.map((point, pIndex) => (
                            <div key={pIndex} className="flex items-start gap-2 bg-white rounded-lg p-2">
                              <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm mt-1">
                                {pIndex + 1}
                              </div>
                              <input
                                type="text"
                                value={point.text}
                                onChange={(e) => updatePoint(question.id, pIndex, e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                placeholder={`Point ${pIndex + 1} text...`}
                              />
                              {question.points.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removePoint(question.id, pIndex)}
                                  className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">
                          No points added yet. Click "Add Point" to create numbered points.
                        </p>
                      )}
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Options with Correct Ranking (1 = highest priority)
                        </label>
                        <button
                          type="button"
                          onClick={() => addOption(question.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          + Add Option
                        </button>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                        <p className="text-sm text-blue-800">
                          <strong>Ranking Instructions:</strong> Assign each option a rank number (1, 2, 3, 4...) where 1 is the highest priority/best answer. Students will rank these options by dragging them.
                        </p>
                      </div>

                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex flex-col items-center">
                              <label className="text-xs text-gray-600 mb-1">Rank</label>
                              <input
                                type="number"
                                min="1"
                                max={question.options.length}
                                value={option.correctRank || oIndex + 1}
                                onChange={(e) => updateOption(question.id, oIndex, 'correctRank', parseInt(e.target.value) || 1)}
                                className="w-16 px-2 py-2 border-2 border-blue-500 rounded-lg text-center font-bold text-blue-700 focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <input
                              type="text"
                              value={option.text}
                              onChange={(e) => updateOption(question.id, oIndex, 'text', e.target.value)}
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder={`Option ${oIndex + 1} text...`}
                            />
                            <div className="flex flex-col items-center">
                              <label className="text-xs text-gray-600 mb-1">Marks</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={option.marks || 0}
                                onChange={(e) => updateOption(question.id, oIndex, 'marks', parseInt(e.target.value) || 0)}
                                className="w-20 px-2 py-2 border-2 border-green-500 rounded-lg text-center font-bold text-green-700 focus:ring-2 focus:ring-green-500"
                              />
                            </div>
                            {question.options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removeOption(question.id, oIndex)}
                                className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          <div className="mt-2">
                            <label className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                              <span className="text-purple-600">💡</span>
                              Impact (Shown to students after submission)
                            </label>
                            <textarea
                              value={option.impact || ''}
                              onChange={(e) => updateOption(question.id, oIndex, 'impact', e.target.value)}
                              className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                              placeholder={`Explain what selecting this option means (e.g., "This shows strong understanding of..." or "Consider reviewing...")`}
                              rows="2"
                            />
                          </div>
                        </div>
                      ))}
                      
                      <p className="text-xs text-gray-500 mt-2">
                        💡 Tip: Ensure each option has a unique rank from 1 to {question.options.length}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Single Save Button */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-green-600 text-white text-lg font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <span className="text-xl">💾</span>
                  {editingQuiz ? 'Save Changes' : 'Create Quiz'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnhancedQuizBuilder;

