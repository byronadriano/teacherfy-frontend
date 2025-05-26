// src/contexts/AuthContext.js - COMPLETE FIXED VERSION
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { googleLogout } from '@react-oauth/google';
import { config } from '../utils/config';

const AuthContext = createContext({});

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
  const checkAuthStatus = useCallback(async () => {
    try {
      console.log('🔍 Checking authentication status...');
      
      const response = await fetch(`${config.apiUrl}/auth/check`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Auth check successful:', data);
        
        if (data.authenticated && data.user) {
          setUser(data.user);
          setIsAuthenticated(true);
          console.log('✅ User is authenticated:', data.user.email);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          console.log('ℹ️ User is not authenticated');
        }
      } else {
        console.log('ℹ️ Auth check failed, user not authenticated');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('❌ Error checking auth status:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login function that handles OAuth popup
  const login = useCallback(async (credentialResponse) => {
    try {
      console.log('🔐 Starting login process...');
      setIsLoading(true);

      // Open OAuth popup
      const authUrl = `${config.apiUrl}/authorize`;
      console.log('🔗 Opening OAuth popup:', authUrl);
      
      const popup = window.open(
        authUrl,
        'oauth_popup',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error('Popup blocked by browser. Please allow popups for this site.');
      }

      // Listen for messages from the popup
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          popup.close();
          reject(new Error('Login timeout - please try again'));
        }, 120000); // 2 minutes timeout

        const messageListener = (event) => {
          console.log('📨 Received message from popup:', event.data);
          
          // Verify origin for security
          const allowedOrigins = [
            config.apiUrl,
            'http://localhost:5000',
            'https://teacherfy-gma6hncme7cpghda.westus-01.azurewebsites.net',
            window.location.origin
          ];
          
          // Allow same-origin messages
          if (!allowedOrigins.includes(event.origin) && event.origin !== window.location.origin) {
            console.warn('⚠️ Received message from unauthorized origin:', event.origin);
            return;
          }

          if (event.data && event.data.type === 'AUTH_SUCCESS') {
            console.log('✅ Authentication successful!');
            clearTimeout(timeout);
            window.removeEventListener('message', messageListener);
            popup.close();
            
            // Set user data from the message
            if (event.data.user) {
              setUser(event.data.user);
              setIsAuthenticated(true);
              console.log('✅ User set from OAuth response:', event.data.user);
            }
            
            // Also check auth status to get complete user data
            checkAuthStatus().then(() => {
              resolve(event.data.user);
            });
            
          } else if (event.data && event.data.type === 'AUTH_ERROR') {
            console.error('❌ Authentication error:', event.data.error);
            clearTimeout(timeout);
            window.removeEventListener('message', messageListener);
            popup.close();
            reject(new Error(event.data.error || 'Authentication failed'));
          }
        };

        window.addEventListener('message', messageListener);

        // Also check if popup was closed manually
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            clearTimeout(timeout);
            window.removeEventListener('message', messageListener);
            reject(new Error('Login cancelled - popup was closed'));
          }
        }, 1000);
      });

    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [checkAuthStatus]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      console.log('🚪 Logging out...');
      setIsLoading(true);

      // Call server logout endpoint
      try {
        await fetch(`${config.apiUrl}/logout`, {
          method: 'GET',
          credentials: 'include',
        });
      } catch (error) {
        console.warn('⚠️ Server logout failed, continuing with client logout:', error);
      }

      // Google logout
      try {
        googleLogout();
      } catch (error) {
        console.warn('⚠️ Google logout failed:', error);
      }

      // Clear local state
      setUser(null);
      setIsAuthenticated(false);
      console.log('✅ Logout complete');

    } catch (error) {
      console.error('❌ Logout error:', error);
      // Still clear local state even if server logout fails
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check auth status on mount and when app regains focus
  useEffect(() => {
    checkAuthStatus();

    // Check auth when window regains focus (in case user logged in another tab)
    const handleFocus = () => {
      if (!isLoading) {
        checkAuthStatus();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [checkAuthStatus, isLoading]);

  // Periodically check auth status (every 5 minutes)
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        checkAuthStatus();
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, checkAuthStatus]);

  const contextValue = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};