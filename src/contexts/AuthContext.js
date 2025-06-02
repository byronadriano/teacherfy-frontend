// src/contexts/AuthContext.js - FIXED COOP and logout issues
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { config } from '../utils/config';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on mount and periodically
  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await fetch(`${config.apiUrl}/auth/check`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

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
      console.error('Error checking auth status:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // FIXED: Enhanced login with better popup and COOP handling
  const login = useCallback(async () => {
    return new Promise((resolve, reject) => {
      console.log('🔐 Starting OAuth login...');
      
      const authUrl = `${config.apiUrl}/authorize`;
      console.log('🔗 Opening OAuth popup:', authUrl);
      
      // FIXED: Enhanced popup options to handle COOP
      const popup = window.open(
        authUrl,
        'oauth_popup',
        'width=500,height=600,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no'
      );

      if (!popup) {
        console.error('❌ Failed to open popup - popup blocker?');
        reject(new Error('Failed to open authentication popup. Please disable popup blockers and try again.'));
        return;
      }

      let messageReceived = false;
      let popupClosed = false;
      let authCompleted = false;

      // FIXED: Enhanced message listener with better error handling
      const handleMessage = (event) => {
        // Allow messages from our domain and localhost for development
        const allowedOrigins = [
          config.apiUrl,
          'https://teacherfy.ai',
          'https://teacherfy-gma6hncme7cpghda.westus-01.azurewebsites.net',
          'http://localhost:3000',
          'http://localhost:5000'
        ];

        // For development, be more permissive with origin checking
        const isDev = config.environment === 'development';
        const isAllowedOrigin = isDev ? true : allowedOrigins.some(origin => event.origin === origin);

        if (!isAllowedOrigin) {
          console.warn('🔒 Ignoring message from unauthorized origin:', event.origin);
          return;
        }

        console.log('📨 Received message:', event.data, 'from origin:', event.origin);

        if (event.data?.type === 'AUTH_SUCCESS' && !authCompleted) {
          authCompleted = true;
          messageReceived = true;
          console.log('✅ Authentication successful!');
          
          // Close popup
          try {
            popup.close();
          } catch (e) {
            console.log('Popup already closed');
          }
          
          // Update auth state
          setUser(event.data.user);
          setIsAuthenticated(true);
          
          // Cleanup
          window.removeEventListener('message', handleMessage);
          clearInterval(popupChecker);
          clearTimeout(timeout);
          
          resolve(event.data.user);
        } else if (event.data?.type === 'AUTH_ERROR' && !authCompleted) {
          authCompleted = true;
          messageReceived = true;
          console.error('❌ Authentication error:', event.data.error);
          
          // Close popup
          try {
            popup.close();
          } catch (e) {
            console.log('Popup already closed');
          }
          
          // Cleanup
          window.removeEventListener('message', handleMessage);
          clearInterval(popupChecker);
          clearTimeout(timeout);
          
          reject(new Error(event.data.error || 'Authentication failed'));
        }
      };

      // FIXED: Enhanced popup monitoring with COOP detection
      const popupChecker = setInterval(() => {
        try {
          // Check if popup is closed
          if (popup.closed) {
            popupClosed = true;
            clearInterval(popupChecker);
            
            if (!messageReceived && !authCompleted) {
              console.log('❌ OAuth popup was closed before receiving success message');
              window.removeEventListener('message', handleMessage);
              clearTimeout(timeout);
              authCompleted = true;
              reject(new Error('Authentication was cancelled'));
            }
            return;
          }

          // FIXED: Try to communicate with popup proactively
          try {
            // Send a ping to the popup to help with communication
            popup.postMessage({ type: 'PARENT_PING' }, '*');
          } catch (e) {
            // This is expected with COOP restrictions
          }

        } catch (error) {
          console.error('Error checking popup status:', error);
        }
      }, 1000);

      // Set up message listener BEFORE popup loads
      window.addEventListener('message', handleMessage);
      console.log('📡 Message listener set up, waiting for popup communication...');

      // FIXED: Enhanced timeout with better cleanup
      const timeout = setTimeout(() => {
        if (!messageReceived && !popupClosed && !authCompleted) {
          console.error('❌ Authentication timeout after 2 minutes');
          authCompleted = true;
          
          try {
            popup.close();
          } catch (e) {
            console.log('Error closing popup:', e);
          }
          
          clearInterval(popupChecker);
          window.removeEventListener('message', handleMessage);
          
          reject(new Error('Authentication timeout. Please try again.'));
        }
      }, 120000); // 2 minute timeout

    });
  }, []);

  // FIXED: Enhanced logout with proper error handling
  const logout = useCallback(async () => {
    try {
      console.log('🚪 Logging out...');
      
      // FIXED: Use POST method for logout
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};