// src/pages/LessonBuilder/hooks/useAuth.js
import { useState, useCallback } from 'react';
import { googleLogout } from '@react-oauth/google';
import { AUTH } from '../../../utils/constants';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);

  const handleLoginSuccess = useCallback((credentialResponse) => {
    const credential = credentialResponse.credential;
    const userInfo = JSON.parse(atob(credential.split('.')[1]));
    
    // Set the user with token included
    setUser({
      ...userInfo,
      token: credential // Include the token in the user object
    });
    
    setToken(credential);
    setIsAuthenticated(true);
    
    // Save to localStorage if you want persistence
    localStorage.setItem(AUTH.STORAGE_KEYS.USER_TOKEN, credential);
    localStorage.setItem(AUTH.STORAGE_KEYS.USER_INFO, JSON.stringify({
      ...userInfo,
      token: credential
    }));
  }, []);

  const handleLogout = useCallback(() => {
    googleLogout();
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH.STORAGE_KEYS.USER_TOKEN);
    localStorage.removeItem(AUTH.STORAGE_KEYS.USER_INFO);
  }, []);

  return {
    user,
    isAuthenticated,
    token,
    handleLoginSuccess,
    handleLogout
  };
};

export default useAuth;