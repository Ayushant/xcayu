/**
 * API Configuration
 * Centralized configuration for API endpoints
 */

// Get API URL from environment variables with fallback to localhost for development
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// API endpoint with /api path
export const API_URL = `${API_BASE_URL}/api`;

// Export default object for convenience
export default {
  BASE_URL: API_BASE_URL,
  API_URL: API_URL,
};

