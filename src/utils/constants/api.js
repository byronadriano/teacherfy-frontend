// src/utils/constants/api.js
export const API = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 
            (process.env.NODE_ENV === 'development' 
              ? "http://localhost:5000"  
              : "https://teacherfy-gma6hncme7cpghda.westus-01.azurewebsites.net"),
  ENDPOINTS: {
    OUTLINE: "/outline",
    GENERATE: "/generate",
    GENERATE_SLIDES: "/generate_slides",
    USER_HISTORY: "/user/history",
    CLEAR_HISTORY: "/user/history/clear"
  },
  TIMEOUT: 100000, // Increase the timeout to 100 seconds since OpenAI API calls can take time
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'Origin': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
  }
};

export const handleApiError = (error) => {
  console.error('Full API Error:', error);
  
  // More comprehensive error handling
  if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
    return {
      error: 'Unable to connect to server. Please check your internet connection.',
      status: 0,
      details: 'Network error or server unreachable'
    };
  }
  
  if (error.name === 'AbortError') {
    return {
      error: 'Request timed out. The server is taking too long to respond.',
      status: 408,
      details: 'Consider trying again or using the example feature'
    };
  }
  
  if (error.response) {
    return {
      error: error.response.data?.error || 'Server error occurred',
      status: error.response.status,
      details: error.response.data?.details || 'No additional details available'
    };
  } 
  
  return {
    error: error.message || 'An unexpected error occurred',
    status: 500,
    details: 'Unknown error type'
  };
};