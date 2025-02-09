// src/utils/constants/api.js
export const API = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 
            (process.env.NODE_ENV === 'development' 
              ? "http://localhost:5000"  
              : "https://teacherfy-gma6hncme7cpghda.westus-01.azurewebsites.net"),
  ENDPOINTS: {
    OUTLINE: "/outline",
    GENERATE: "/generate",
    GENERATE_SLIDES: "/generate_slides"
  },
  TIMEOUT: 30000, // 30 seconds
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Origin': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
  }
};
// Add helper functions for error handling
export const handleApiError = (error) => {
  console.error('API Error:', error);
  if (error.response) {
    // Server responded with error
    return {
      error: error.response.data.error || 'Server error occurred',
      status: error.response.status
    };
  } else if (error.request) {
    // Request made but no response
    return {
      error: 'No response from server',
      status: 503
    };
  } else {
    // Request setup error
    return {
      error: 'Error setting up request',
      status: 500
    };
  }
};