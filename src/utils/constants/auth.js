// src/utils/constants/auth.js
export const AUTH = {
    GOOGLE_CLIENT_ID: "610970411179-kenrq7o9355fa90v2aj9pisroaurnvdm.apps.googleusercontent.com",
    STORAGE_KEYS: {
      USER_TOKEN: 'user_token',
      USER_INFO: 'user_info'
    }
  };
  
  // Add this line to maintain backward compatibility
  export const GOOGLE_CLIENT_ID = AUTH.GOOGLE_CLIENT_ID;