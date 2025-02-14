export const API = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 
            (process.env.NODE_ENV === 'development' 
              ? "http://localhost:5000"  
              : "https://teacherfy.ai"),
  ENDPOINTS: {
    OUTLINE: "/outline",
    GENERATE: "/generate",
    GENERATE_SLIDES: "/generate_slides"
  },
  TIMEOUT: 30000, // 30 seconds timeout
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'Origin': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
  }
};

export const handleApiError = (error) => {
  console.error('Full API Error:', {
    name: error.name,
    message: error.message,
    stack: error.stack
  });
  
  // More comprehensive error handling
  if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
    return {
      error: 'Unable to connect to server. Please check your internet connection.',
      status: 0,
      details: 'Network error or server unreachable'
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