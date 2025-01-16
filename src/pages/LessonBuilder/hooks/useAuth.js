// src/pages/LessonBuilder/hooks/useAuth.js
import { useState, useCallback } from 'react';
import { googleLogout } from '@react-oauth/google';
// import { AUTH } from '../../../utils/constants';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [showSignInPrompt, setShowSignInPrompt] = useState(true);

  const handleLoginSuccess = useCallback((credentialResponse) => {
    setToken(credentialResponse.credential);
    setIsAuthenticated(true);
    const userInfo = JSON.parse(atob(credentialResponse.credential.split(".")[1]));
    setUser(userInfo);
    setShowSignInPrompt(false);
  }, []);

  const handleLogout = useCallback(() => {
    googleLogout();
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    setShowSignInPrompt(true);
  }, []);

  const setSignInPromptState = useCallback((value) => {
    setShowSignInPrompt(value);
  }, []);

  return {
    user,
    isAuthenticated,
    token,
    showSignInPrompt,
    setShowSignInPrompt: setSignInPromptState,
    handleLoginSuccess,
    handleLogout
  };
};

export default useAuth;