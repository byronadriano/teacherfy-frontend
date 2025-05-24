// src/contexts/AuthContext.jsx - FIXED VERSION
import React, { createContext, useContext, useState, useEffect } from 'react';
import { API } from '../utils/constants/api';

const AuthContext = createContext();

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

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Checking auth status...');
      
      const response = await fetch(`${API.BASE_URL}/auth/check`, {
        method: 'GET',
        credentials: 'include', // CRITICAL: Include cookies for Flask sessions
        headers: {
          ...API.HEADERS,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Auth check successful:', data);
        
        if (data.authenticated && data.user) {
          setUser(data.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        console.log('❌ Auth check failed:', response.status);
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('❌ Auth check error:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentialResponse) => {
    try {
      console.log('🔐 Starting login process...');
      
      // Decode the credential to get user info for display
      const credential = credentialResponse.credential;
      const userInfo = JSON.parse(atob(credential.split('.')[1]));
      
      console.log('👤 User info from Google:', {
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture
      });

      // For OAuth login, redirect to your backend OAuth endpoint
      // This will handle the server-side session creation
      const authUrl = `${API.BASE_URL}/authorize`;
      console.log('🔗 Redirecting to:', authUrl);
      
      // Open OAuth in a popup to handle the flow
      const popup = window.open(
        authUrl,
        'oauth',
        'width=500,height=600,scrollbars=yes'
      );

      // Listen for the OAuth callback
      const handleAuthComplete = (event) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'AUTH_SUCCESS') {
          console.log('✅ OAuth success:', event.data);
          popup.close();
          
          // Refresh auth status after successful OAuth
          setTimeout(() => {
            checkAuthStatus();
          }, 1000);
          
          window.removeEventListener('message', handleAuthComplete);
        } else if (event.data.type === 'AUTH_ERROR') {
          console.error('❌ OAuth error:', event.data);
          popup.close();
          window.removeEventListener('message', handleAuthComplete);
        }
      };

      window.addEventListener('message', handleAuthComplete);

      // Fallback: Check if popup was closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleAuthComplete);
          // Check auth status in case login succeeded
          setTimeout(() => {
            checkAuthStatus();
          }, 1000);
        }
      }, 1000);

    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out...');
      
      // Call backend logout endpoint
      await fetch(`${API.BASE_URL}/logout`, {
        method: 'GET',
        credentials: 'include',
        headers: API.HEADERS,
      });

      // Clear local state
      setUser(null);
      setIsAuthenticated(false);
      
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Clear local state even if backend call fails
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};