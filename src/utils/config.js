// src/utils/config.js
const getApiUrl = () => {
    if (process.env.NODE_ENV === 'production') {
      return 'https://teacherfy-gma6hncme7cpghda.westus-01.azurewebsites.net';
    }
    return 'http://localhost:5000';
  };
  
  export const config = {
    apiUrl: getApiUrl(),
    environment: process.env.NODE_ENV || 'development'
  };