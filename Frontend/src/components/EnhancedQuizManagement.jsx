import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Toast notifications disabled (silent mode)
const toast = { success: () => {}, error: () => {}, loading: () => {}, info: () => {}, warning: () => {}, promise: () => {}, custom: () => {}, dismiss: () => {} };

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

const EnhancedQuizManagement = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const [newQuiz, setNewQuiz] = useState({
    title: '',
    description: '',
    duration: 20,
    questions: [],
    course: '',
    degree: '',
    college: '',
    difficulty: 'Medium',
    passingScore: 60,
    tags: []
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    text: '',
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ]
  });

  const degrees = ['BSc', 'MSc', 'BTech', 'MTech', 'BA', 'MA', 'BBA', 'MBA', 'BCA', 'MCA', 'PhD', 'Other'];

  useEffect(() => {
    fetchQuizzes();
    fetchCourses();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/superadmin/quizzes');
      setQuizzes(response.data.quizzes || []);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast.error('Failed to fetch quizzes');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await api.get('/superadmin/courses?limit=100');
      setCourses(response.data.data?.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const addOption = () => {
    setCurrentQuestion({
      ...currentQuestion,
      options: [...currentQuestion.options, { text: '', isCorrect: false }]
    });
  };

  const removeOption = (index) => {
    if (currentQuestion.options.length <= 2) {
      toast.error('A question must have at least 2 options');
      return;
    }
    setCurrentQuestion({
      ...currentQuestion,
      options: currentQuestion.options.filter((_, i) => i !== index)
    });
  };

  const updateOption = (index, field, value) => {
    const updatedOptions = currentQuestion.options.map((opt, i) => {
      if (i === index) {
        return { ...opt, [field]: value };
      }
      // If marking this option as correct, unmark others
      if (field === 'isCorrect' && value === true) {
        return { ...opt, isCorrect: false };
      }
      return opt;
    });
    setCurrentQuestion({ ...currentQuestion, options: updatedOptions });
  };

  const addQuestionToQuiz = () => {
    if (!currentQuestion.text.trim()) {
      toast.error('Question text is required');
      return;
    }

    if (currentQuestion.options.some(opt => !opt.text.trim())) {
      toast.error('All options must have text');
      return;
    }

    if (!currentQuestion.options.some(opt => opt.isCorrect)) {
      toast.error('At least one option must be marked as correct');
      return;
    }

    setNewQuiz({
      ...newQuiz,
      questions: [...newQuiz.questions, { ...currentQuestion }]
    });

    setCurrentQuestion({
      text: '',
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ]
    });

    toast.success('Question added to quiz');
  };

  const removeQuestionFromQuiz = (index) => {
    setNewQuiz({
      ...newQuiz,
      questions: newQuiz.questions.filter((_, i) => i !== index)
    });
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();

    if (newQuiz.questions.length === 0) {
      toast.error('Add at least one question to the quiz');
      return;
    }

    try {
      const response = await api.post('/superadmin/quizzes', newQuiz);
      toast.success(response.data.message || 'Quiz created successfully');
      setShowAddForm(false);
      setNewQuiz({
        title: '',
        description: '',
        duration: 20,
        questions: [],
        course: '',
        degree: '',
        college: '',
        difficulty: 'Medium',
        passingScore: 60,
        tags: []
      });
      fetchQuizzes();
    } catch (error) {
      console.error('Error creating quiz:', error);
      toast.error(error.response?.data?.message || 'Failed to create quiz');
    }
  };

  const handleDeleteQuiz = async (id) => {
    // Delete confirmation (silent - always proceed)

    try {
      const response = await api.delete(`/superadmin/quizzes/${id}`);
      toast.success(response.data.message || 'Quiz deleted successfully');
      fetchQuizzes();
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast.error(error.response?.data?.message || 'Failed to delete quiz');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Enhanced Quiz Management</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          + Create Quiz
        </button>
      </div>

      {/* Quizzes List */}
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Difficulty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Questions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {quizzes.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No quizzes found
                  </td>
                </tr>
              ) : (
                quizzes.map((quiz) => (
                  <tr key={quiz._id}>
                    <td className="px-6 py-4">{quiz.title}</td>
                    <td className="px-6 py-4">
                      {quiz.course?.courseName || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        quiz.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                        quiz.difficulty === 'Hard' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {quiz.difficulty || 'Medium'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">{quiz.questions?.length || 0}</td>
                    <td className="px-6 py-4">{quiz.duration} min</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        quiz.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {quiz.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleDeleteQuiz(quiz._id)}
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

      {/* Add Quiz Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Create New Quiz</h3>
            <form onSubmit={handleCreateQuiz} noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={newQuiz.title}
                    onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Duration (minutes) *</label>
                  <input
                    type="number"
                    required
                    value={newQuiz.duration}
                    onChange={(e) => setNewQuiz({ ...newQuiz, duration: parseInt(e.target.value) })}
                    className="w-full border rounded-lg px-3 py-2"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Difficulty</label>
                  <select
                    value={newQuiz.difficulty}
                    onChange={(e) => setNewQuiz({ ...newQuiz, difficulty: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Passing Score (%)</label>
                  <input
                    type="number"
                    value={newQuiz.passingScore}
                    onChange={(e) => setNewQuiz({ ...newQuiz, passingScore: parseInt(e.target.value) })}
                    className="w-full border rounded-lg px-3 py-2"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Course</label>
                  <select
                    value={newQuiz.course}
                    onChange={(e) => setNewQuiz({ ...newQuiz, course: e.target.value })}
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
                  <label className="block text-sm font-medium mb-1">Degree</label>
                  <select
                    value={newQuiz.degree}
                    onChange={(e) => setNewQuiz({ ...newQuiz, degree: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">Select Degree</option>
                    {degrees.map(degree => (
                      <option key={degree} value={degree}>{degree}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Description *</label>
                  <textarea
                    required
                    value={newQuiz.description}
                    onChange={(e) => setNewQuiz({ ...newQuiz, description: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    rows="2"
                  />
                </div>
              </div>

              {/* Dynamic Question Builder */}
              <div className="border-t pt-4 mb-4">
                <h4 className="font-semibold mb-3">Add Question</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Question Text</label>
                    <textarea
                      value={currentQuestion.text}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, text: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                      rows="2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Options</label>
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <input
                          type="text"
                          value={option.text}
                          onChange={(e) => updateOption(index, 'text', e.target.value)}
                          className="flex-1 border rounded-lg px-3 py-2"
                          placeholder={`Option ${index + 1}`}
                        />
                        <label className="flex items-center space-x-1">
                          <input
                            type="checkbox"
                            checked={option.isCorrect}
                            onChange={(e) => updateOption(index, 'isCorrect', e.target.checked)}
                            className="rounded"
                          />
                          <span className="text-sm">Correct</span>
                        </label>
                        {currentQuestion.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addOption}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      + Add Option
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={addQuestionToQuiz}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                  >
                    Add Question to Quiz
                  </button>
                </div>
              </div>

              {/* Questions List */}
              {newQuiz.questions.length > 0 && (
                <div className="border-t pt-4 mb-4">
                  <h4 className="font-semibold mb-3">Questions ({newQuiz.questions.length})</h4>
                  <div className="space-y-3">
                    {newQuiz.questions.map((question, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium">{index + 1}. {question.text}</p>
                            <ul className="mt-2 space-y-1">
                              {question.options.map((opt, optIndex) => (
                                <li key={optIndex} className="text-sm">
                                  {opt.isCorrect && '✓ '}
                                  {opt.text}
                                  {opt.isCorrect && <span className="text-green-600 ml-1">(Correct)</span>}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeQuestionFromQuiz(index)}
                            className="text-red-600 hover:text-red-800 ml-2"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewQuiz({
                      title: '',
                      description: '',
                      duration: 20,
                      questions: [],
                      course: '',
                      degree: '',
                      college: '',
                      difficulty: 'Medium',
                      passingScore: 60,
                      tags: []
                    });
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Quiz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedQuizManagement;

