// src/contexts/AuthContext.js - CAREFULLY OPTIMIZED while preserving all logic
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { config } from '../utils/config';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on mount and periodically
  const checkAuthStatus = useCallback(async () => {
    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      const response = await fetch(`${config.apiUrl}/auth/check`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.authenticated && data.user) {
          console.log('✅ User is authenticated:', data.user.email);
          setUser(data.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      // Don't log aborted requests as errors
      if (error.name !== 'AbortError') {
        console.error('Error checking auth status:', error);
      }
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []); // Keep empty dependencies to prevent infinite loops

  // FIXED: Properly handle the useEffect dependency
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Direct redirect-based login (no popups)
  const login = useCallback(async (provider = 'google') => {
    try {
      console.log(`🔐 Starting ${provider} login redirect...`);
      
      // Call backend to get OAuth URL
      const response = await fetch(`${config.apiUrl}/api/auth/login/${provider}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to initiate ${provider} login: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`📋 Backend response:`, data);
      
      if (data.success && data.auth_url) {
        console.log(`🔗 Redirecting to OAuth URL: ${data.auth_url}`);
        // Direct redirect to OAuth provider
        window.location.href = data.auth_url;
      } else {
        throw new Error(data.error || 'No auth URL received from server');
      }
      
    } catch (error) {
      console.error('❌ OAuth login error:', error);
      throw new Error(`Failed to initiate ${provider} login`);
    }
  }, []);

  // PRESERVED: Enhanced logout with proper error handling
  const logout = useCallback(async () => {
    try {
      console.log('🚪 Logging out...');
      
      // PRESERVED: Use POST method for logout
      const response = await fetch(`${config.apiUrl}/logout`, {
        method: 'POST', // Changed from GET to POST
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Clear local state regardless of response
      setUser(null);
      setIsAuthenticated(false);
      
      // Clear any local storage items
      try {
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_info');
        sessionStorage.clear();
      } catch (e) {
        console.log('Storage clear error (non-critical):', e);
      }

      if (!response.ok) {
        console.warn(`⚠️ Logout request failed with status ${response.status}, but local state cleared`);
        // Don't throw error - local logout is sufficient
      } else {
        console.log('✅ Logout successful');
      }
      
    } catch (error) {
      console.error('❌ Logout error:', error);
      
      // Even if server logout fails, clear local state
      setUser(null);
      setIsAuthenticated(false);
      
      // Clear storage as fallback
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {
        console.log('Storage clear error (non-critical):', e);
      }
      
      console.log('✅ Local logout completed despite server error');
    }
  }, []);

  // OPTIMIZATION: Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuthStatus
  }), [user, isAuthenticated, isLoading, login, logout, checkAuthStatus]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};