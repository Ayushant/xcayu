// API utility functions
// Get API URL from environment variables with fallback
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_BASE_URL = `${BASE_URL}/api`;

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Create headers with auth token
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Generic API call function
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: getAuthHeaders(),
    ...options
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Specific API functions
export const fetchScores = () => apiCall('/scores');
export const fetchRealStudentScores = () => apiCall('/scores/real-students');

export const loginUser = (credentials) => 
  apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });

export const submitSimulation = (simulationData) =>
  apiCall('/scores/submit-simulation', {
    method: 'POST',
    body: JSON.stringify(simulationData)
  });

export default {
  apiCall,
  fetchScores,
  fetchRealStudentScores,
  loginUser,
  submitSimulation
};