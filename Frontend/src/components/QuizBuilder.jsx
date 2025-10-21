import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Toast notifications disabled (silent mode)
const toast = { success: () => {}, error: () => {}, loading: () => {}, info: () => {}, warning: () => {}, promise: () => {}, custom: () => {}, dismiss: () => {} };
import { API_URL } from '../config/api';

/**
 * Quiz Builder Component
 * 
 * Allows Super Admins to create quizzes dynamically with:
 * - MCQ questions with multiple options
 * - Correct answer marking
 * - Link to simulations and courses
 * - Difficulty levels
 * - Passing score configuration
 * - Live preview
 * - Real-time Socket.IO updates on creation
 * 
 * Usage: <QuizBuilder />
 */
const QuizBuilder = () => {
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    duration: 20,
    difficulty: 'Medium',
    passingScore: 60,
    simulationId: '',
    course: '',
    degree: '',
    college: '',
    tags: [],
    questions: []
  });

  const [simulations, setSimulations] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
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
    fetchSimulations();
    fetchCourses();
  }, []);

  const fetchSimulations = async () => {
    try {
      const response = await api.get('/superadmin/simulations');
      setSimulations(response.data.data.simulations);
    } catch (error) {
      console.error('Error fetching simulations:', error);
      toast.error('Failed to load simulations');
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await api.get('/superadmin/courses');
      setCourses(response.data.data.courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    }
  };

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      text: '',
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ],
      points: 1,
      explanation: ''
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
              options: [...q.options, { text: '', isCorrect: false }]
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

  const markCorrectAnswer = (questionId, optionIndex) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((opt, i) => ({
                ...opt,
                isCorrect: i === optionIndex
              }))
            }
          : q
      )
    }));
  };

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

      const hasCorrect = question.options.some(opt => opt.isCorrect);
      if (!hasCorrect) {
        toast.error(`Question "${question.text.substring(0, 50)}..." must have a correct answer marked`);
        return false;
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
      const quizPayload = {
        ...quizData,
        // Remove temporary IDs before sending
        questions: quizData.questions.map(({ id, ...q }) => q)
      };

      const response = await api.post('/superadmin/quizzes', quizPayload);

      toast.success('Quiz created successfully!');
      
      // Reset form
      setQuizData({
        title: '',
        description: '',
        duration: 20,
        difficulty: 'Medium',
        passingScore: 60,
        simulationId: '',
        course: '',
        degree: '',
        college: '',
        tags: [],
        questions: []
      });

    } catch (error) {
      console.error('Error creating quiz:', error);
      toast.error(error.response?.data?.message || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPoints = () => {
    return quizData.questions.reduce((sum, q) => sum + (q.points || 1), 0);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Quiz Builder</h2>
            <p className="text-gray-600 mt-1">Create interactive MCQ quizzes for your simulations</p>
          </div>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quiz Title *
              </label>
              <input
                type="text"
                value={quizData.title}
                onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., MBA Strategy Quiz Week 1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes) *
              </label>
              <input
                type="number"
                value={quizData.duration}
                onChange={(e) => setQuizData({ ...quizData, duration: parseInt(e.target.value) })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={quizData.description}
                onChange={(e) => setQuizData({ ...quizData, description: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Describe what this quiz covers..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Simulation
              </label>
              <select
                value={quizData.simulationId}
                onChange={(e) => setQuizData({ ...quizData, simulationId: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Simulation (Optional)</option>
                {simulations.map(sim => (
                  <option key={sim._id} value={sim._id}>
                    {sim.simulationName} ({sim.degree})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course
              </label>
              <select
                value={quizData.course}
                onChange={(e) => setQuizData({ ...quizData, course: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Course (Optional)</option>
                {courses.map(course => (
                  <option key={course._id} value={course._id}>
                    {course.courseName} ({course.courseCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Degree
              </label>
              <select
                value={quizData.degree}
                onChange={(e) => setQuizData({ ...quizData, degree: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Degree</option>
                {degrees.map(degree => (
                  <option key={degree} value={degree}>{degree}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                value={quizData.difficulty}
                onChange={(e) => setQuizData({ ...quizData, difficulty: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                value={quizData.passingScore}
                onChange={(e) => setQuizData({ ...quizData, passingScore: parseInt(e.target.value) })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                max="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                College (Optional)
              </label>
              <input
                type="text"
                value={quizData.college}
                onChange={(e) => setQuizData({ ...quizData, college: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Oxford University"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add tags (press Enter)"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {quizData.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <hr className="my-8" />

          {/* Questions Section */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Questions</h3>
                <p className="text-gray-600">
                  Total: {quizData.questions.length} questions | {calculateTotalPoints()} points
                </p>
              </div>
              <button
                type="button"
                onClick={addQuestion}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                + Add Question
              </button>
            </div>

            {quizData.questions.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500 text-lg">No questions yet. Click "Add Question" to get started.</p>
              </div>
            )}

            {/* Questions List */}
            <div className="space-y-6">
              {quizData.questions.map((question, qIndex) => (
                <div key={question.id} className="border-2 border-gray-200 rounded-lg p-6 bg-gray-50">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-semibold text-gray-800">Question {qIndex + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeQuestion(question.id)}
                      className="text-red-500 hover:text-red-700 font-bold"
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
                        value={question.text}
                        onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        rows="2"
                        placeholder="Enter your question..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Points
                        </label>
                        <input
                          type="number"
                          value={question.points}
                          onChange={(e) => updateQuestion(question.id, 'points', parseInt(e.target.value))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          min="1"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <label className="text-sm font-medium text-gray-700">
                          Options (Click to mark correct answer)
                        </label>
                        <button
                          type="button"
                          onClick={() => addOption(question.id)}
                          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
                        >
                          + Add Option
                        </button>
                      </div>

                      <div className="space-y-2">
                        {question.options.map((option, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-${question.id}`}
                              checked={option.isCorrect}
                              onChange={() => markCorrectAnswer(question.id, oIndex)}
                              className="w-5 h-5 text-green-600 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={option.text}
                              onChange={(e) => updateOption(question.id, oIndex, 'text', e.target.value)}
                              className={`flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                                option.isCorrect ? 'border-green-500 bg-green-50' : 'border-gray-300'
                              }`}
                              placeholder={`Option ${oIndex + 1}`}
                            />
                            {question.options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removeOption(question.id, oIndex)}
                                className="text-red-500 hover:text-red-700 font-bold px-2"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Explanation (Optional)
                      </label>
                      <textarea
                        value={question.explanation}
                        onChange={(e) => updateQuestion(question.id, 'explanation', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        rows="2"
                        placeholder="Explain why this answer is correct..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => {
                // Reset confirmation (silent - always proceed)
                setQuizData({
                    title: '',
                    description: '',
                    duration: 20,
                    difficulty: 'Medium',
                    passingScore: 60,
                    simulationId: '',
                    course: '',
                    degree: '',
                    college: '',
                    tags: [],
                    questions: []
                  });
                }
              }}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={loading || quizData.questions.length === 0}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Creating Quiz...' : 'Create Quiz'}
            </button>
          </div>
        </form>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Quiz Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700 text-3xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-2xl font-bold text-blue-900">{quizData.title || 'Untitled Quiz'}</h4>
                <p className="text-gray-600 mt-2">{quizData.description || 'No description'}</p>
                <div className="flex gap-4 mt-4 text-sm">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                    ⏱️ {quizData.duration} minutes
                  </span>
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                    🎯 {quizData.difficulty}
                  </span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                    ✅ {quizData.passingScore}% to pass
                  </span>
                </div>
              </div>

              <hr />

              {quizData.questions.map((question, qIndex) => (
                <div key={question.id} className="bg-gray-50 rounded-lg p-6">
                  <p className="font-semibold text-lg mb-4">
                    {qIndex + 1}. {question.text || 'No question text'}
                  </p>
                  <div className="space-y-2">
                    {question.options.map((option, oIndex) => (
                      <div
                        key={oIndex}
                        className={`p-3 rounded-lg border-2 ${
                          option.isCorrect
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        {option.text || `Option ${oIndex + 1}`}
                        {option.isCorrect && (
                          <span className="ml-2 text-green-600 font-semibold">✓ Correct</span>
                        )}
                      </div>
                    ))}
                  </div>
                  {question.explanation && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
                      <strong>Explanation:</strong> {question.explanation}
                    </div>
                  )}
                </div>
              ))}

              {quizData.questions.length === 0 && (
                <p className="text-center text-gray-500 py-12">No questions added yet</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizBuilder;

