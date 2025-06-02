// src/utils/constants/api.js - CLEANED VERSION
import { config } from '../config';

export const API = {
  BASE_URL: config.apiUrl,
  ENDPOINTS: {
    OUTLINE: "/outline",
    GENERATE: "/generate",
    GENERATE_SLIDES: "/generate_slides",
    USER_HISTORY: "/user/history",
    CLEAR_HISTORY: "/user/history/clear"
  },
  TIMEOUT: 100000, // 100 seconds for OpenAI API calls
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
};

export const handleApiError = (error) => {
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