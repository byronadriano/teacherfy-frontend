// src/pages/LessonBuilder/hooks/useAuth.js
import { useState, useEffect, useCallback } from 'react';
import { googleLogout } from '@react-oauth/google';
import { AUTH } from '../../../utils/constants';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = useCallback(() => {
    googleLogout();
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    sessionStorage.removeItem(AUTH.STORAGE_KEYS.USER_TOKEN);
    sessionStorage.removeItem(AUTH.STORAGE_KEYS.USER_INFO);
  }, []); // No dependencies needed as it only uses setState functions

  // Load auth state from session storage on mount
  useEffect(() => {
    const loadAuthState = () => {
      try {
        const storedToken = sessionStorage.getItem(AUTH.STORAGE_KEYS.USER_TOKEN);
        const storedUserInfo = sessionStorage.getItem(AUTH.STORAGE_KEYS.USER_INFO);

        if (storedToken && storedUserInfo) {
          const userInfo = JSON.parse(storedUserInfo);
          setUser(userInfo);
          setToken(storedToken);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
        handleLogout(); // Clean up any corrupted state
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthState();
  }, [handleLogout]); // Added handleLogout as dependency

  const handleLoginSuccess = useCallback((credentialResponse) => {
    try {
      const credential = credentialResponse.credential;
      const userInfo = JSON.parse(atob(credential.split('.')[1]));
      
      // Enhanced user object with token
      const enhancedUser = {
        ...userInfo,
        token: credential
      };
      
      // Update state
      setUser(enhancedUser);
      setToken(credential);
      setIsAuthenticated(true);
      
      // Store in session storage (persists until tab is closed)
      sessionStorage.setItem(AUTH.STORAGE_KEYS.USER_TOKEN, credential);
      sessionStorage.setItem(AUTH.STORAGE_KEYS.USER_INFO, JSON.stringify(enhancedUser));
      
    } catch (error) {
      console.error('Error processing login:', error);
      handleLogout();
    }
  }, [handleLogout]); // Added handleLogout as dependency

  // Add token validation check
  const validateToken = useCallback(() => {
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      
      if (Date.now() >= expirationTime) {
        handleLogout();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error validating token:', error);
      handleLogout();
      return false;
    }
  }, [token, handleLogout]);

  // Add automatic token validation
  useEffect(() => {
    if (isAuthenticated) {
      const validationInterval = setInterval(() => {
        validateToken();
      }, 60000); // Check every minute
      
      return () => clearInterval(validationInterval);
    }
  }, [isAuthenticated, validateToken]);

  return {
    user,
    isAuthenticated,
    token,
    isLoading,
    handleLoginSuccess,
    handleLogout,
    validateToken
  };
};

export default useAuth;