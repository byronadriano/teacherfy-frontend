// src/utils/constants/api.js
export const API = {
  BASE_URL: process.env.NODE_ENV === 'development' 
    ? "http://localhost:5000"  // Force local development server
    : "https://teacherfy-gma6hncme7cpghda.westus-01.azurewebsites.net",
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