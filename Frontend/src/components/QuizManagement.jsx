import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Toast notifications disabled (silent mode)
const toast = { success: () => {}, error: () => {}, loading: () => {}, info: () => {}, warning: () => {}, promise: () => {}, custom: () => {}, dismiss: () => {} };
import { API_URL } from '../config/api';

const QuizManagement = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    description: '',
    duration: 20,
    status: 'Active'
  });

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to manage quizzes');
        return;
      }

      const userRole = localStorage.getItem('userRole');
      const apiPath = userRole === 'superadmin' ? '/superadmin' : '/admin';
      const response = await axios.get(
        `${API_URL}${apiPath}/quizzes`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setQuizzes(response.data);
    } catch (error) {
      console.error('Error fetching quizzes:', error.response?.data?.message || error.message);
    }
  };

  const handleAddQuiz = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to manage quizzes');
        return;
      }

      // Validate required fields
      if (!newQuiz.title || !newQuiz.description) {
        toast.error('Title and description are required');
        return;
      }

      const userRole = localStorage.getItem('userRole');
      const apiPath = userRole === 'superadmin' ? '/superadmin' : '/admin';
      const response = await axios.post(
        `${API_URL}${apiPath}/quizzes`,
        newQuiz,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      toast.success('Quiz created successfully');
      
      setShowAddForm(false);
      fetchQuizzes();
      setNewQuiz({
        title: '',
        description: '',
        duration: 20,
        status: 'Active'
      });
    } catch (error) {
      console.error('Error adding quiz:', error);
      toast.error(error.response?.data?.message || 'Error creating quiz');
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Quiz Management</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 flex items-center"
        >
          <span className="text-xl mr-1">+</span> Create Quiz
        </button>
      </div>

      {/* Quiz Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <div key={quiz._id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{quiz.title}</h3>
                <p className="text-gray-500 text-sm mt-1">{quiz.description}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs ${
                quiz.status === 'Active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {quiz.status}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {quiz.duration} minutes
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {quiz.questions?.length || 0} questions
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={() => {
                  const userRole = localStorage.getItem('userRole');
                  const basePath = userRole === 'superadmin' ? '/superadmin' : '/admin';
                  window.location.href = `${basePath}/quizzes/${quiz._id}/edit`;
                }}
                className="w-full text-center text-orange-500 font-medium hover:text-orange-600"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Quiz Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-bold mb-4">Create New Quiz</h3>
            <form onSubmit={handleAddQuiz} className="space-y-4" noValidate>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Title</label>
                <input
                  type="text"
                  placeholder="Enter quiz title"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  value={newQuiz.title}
                  onChange={(e) => setNewQuiz({...newQuiz, title: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  placeholder="Enter quiz description"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  value={newQuiz.description}
                  onChange={(e) => setNewQuiz({...newQuiz, description: e.target.value})}
                  required
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  value={newQuiz.duration}
                  onChange={(e) => setNewQuiz({...newQuiz, duration: parseInt(e.target.value)})}
                  required
                  min="1"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md shadow-sm hover:bg-orange-600"
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

export default QuizManagement;
