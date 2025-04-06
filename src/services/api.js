import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Create a base api instance with configured defaults
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  // Limit number of retries and timeout to avoid infinite loops
  timeout: 10000, // 10 second timeout
});

// Track if a token refresh is in progress to avoid duplicate requests
let isRefreshing = false;
let lastRefreshTime = 0;
const MIN_REFRESH_INTERVAL = 5000; // Minimum 5 seconds between refresh attempts

// Add a request interceptor to include the authentication token
api.interceptors.request.use(
  async (config) => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('No authentication token available');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Don't handle errors if request was cancelled
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }
    
    // Check for network errors or timeouts and provide a friendly message
    if (error.message === 'Network Error' || error.code === 'ECONNABORTED') {
      console.error('Network connection issue detected');
      return Promise.reject(new Error('Network connection issue. Please check your internet connection.'));
    }
    
    const { response } = error;
    
    // Handle 401 Unauthorized errors
    if (response && response.status === 401) {
      const currentTime = Date.now();
      
      // Prevent multiple simultaneous token refresh attempts
      if (!isRefreshing && (currentTime - lastRefreshTime > MIN_REFRESH_INTERVAL)) {
        isRefreshing = true;
        lastRefreshTime = currentTime;
        
        console.log('Unauthorized access, clearing credentials');
        
        // Clear tokens
        localStorage.removeItem('authToken');
        localStorage.removeItem('userEmail');
        
        // If not on login page, redirect there
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        
        setTimeout(() => {
          isRefreshing = false;
        }, 1000);
      }
    }
    
    // Handle 403 Forbidden errors (invalid token, etc)
    if (response && response.status === 403) {
      console.log('Forbidden access, token might be invalid');
      
      if (!window.location.pathname.includes('/login')) {
        // Clear tokens
        localStorage.removeItem('authToken');
        localStorage.removeItem('userEmail');
      }
    }
    
    // Handle server errors with a generic message
    if (response && response.status >= 500) {
      console.error('Server error:', response.status);
      return Promise.reject(new Error('Server error. Please try again later.'));
    }
    
    return Promise.reject(error);
  }
);

export default api;