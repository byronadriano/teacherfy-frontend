// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AUTH } from '../utils/constants';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load auth state from session storage on mount
  useEffect(() => {
    const loadAuthState = () => {
      try {
        const storedToken = sessionStorage.getItem(AUTH.STORAGE_KEYS.USER_TOKEN);
        const storedUserInfo = sessionStorage.getItem(AUTH.STORAGE_KEYS.USER_INFO);

        if (storedToken && storedUserInfo) {
          const userInfo = JSON.parse(storedUserInfo);
          setUser(userInfo);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
        // Clean up on error
        sessionStorage.removeItem(AUTH.STORAGE_KEYS.USER_TOKEN);
        sessionStorage.removeItem(AUTH.STORAGE_KEYS.USER_INFO);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthState();
  }, []);

  const login = (userInfo, token) => {
    const enhancedUser = { ...userInfo, token };
    setUser(enhancedUser);
    setIsAuthenticated(true);
    sessionStorage.setItem(AUTH.STORAGE_KEYS.USER_TOKEN, token);
    sessionStorage.setItem(AUTH.STORAGE_KEYS.USER_INFO, JSON.stringify(enhancedUser));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    sessionStorage.removeItem(AUTH.STORAGE_KEYS.USER_TOKEN);
    sessionStorage.removeItem(AUTH.STORAGE_KEYS.USER_INFO);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};