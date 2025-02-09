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
    'X-Requested-With': 'XMLHttpRequest',
    'Origin': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
  }
};

export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
    return {
      error: 'Unable to connect to server. Please check your internet connection.',
      status: 0
    };
  }
  
  if (error.response) {
    return {
      error: error.response.data?.error || 'Server error occurred',
      status: error.response.status
    };
  } 
  
  if (error.request) {
    return {
      error: 'No response from server',
      status: 503
    };
  }
  
  return {
    error: 'Error setting up request',
    status: 500
  };
};