// src/contexts/AuthContext.jsx - FIXED VERSION
import React, { createContext, useContext, useState, useEffect } from 'react';
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
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
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
        if (data.authenticated && data.user) {
          console.log('✅ User is authenticated:', data.user.email);
          setUser(data.user);
          setIsAuthenticated(true);
        } else {
          console.log('❌ User not authenticated');
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        console.log('❌ Auth check failed:', response.status);
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
  };

  const login = async () => {
    return new Promise((resolve, reject) => {
      console.log('🔐 Starting OAuth login...');
      
      // Create popup window for OAuth
      const popup = window.open(
        `${config.apiUrl}/authorize`,
        'oauth_popup',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        reject(new Error('Popup blocked. Please allow popups for this site.'));
        return;
      }

      // Listen for messages from the popup
      const messageListener = async (event) => {
        console.log('📨 Received message from popup:', event.data);
        
        // Verify origin for security
        if (event.origin !== config.apiUrl) {
          console.log('⚠️ Message from unexpected origin:', event.origin);
          return;
        }

        if (event.data.type === 'AUTH_SUCCESS') {
          console.log('✅ OAuth success received');
          window.removeEventListener('message', messageListener);
          
          try {
            // Re-check auth status to get complete user data
            await checkAuthStatus();
            resolve();
          } catch (error) {
            console.error('❌ Error after OAuth success:', error);
            reject(error);
          }
        } else if (event.data.type === 'AUTH_ERROR') {
          console.error('❌ OAuth error received:', event.data.error);
          window.removeEventListener('message', messageListener);
          reject(new Error(event.data.error || 'Authentication failed'));
        }
      };

      window.addEventListener('message', messageListener);

      // Check if popup was closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
          console.log('❌ OAuth popup was closed');
          reject(new Error('Authentication was cancelled'));
        }
      }, 1000);

      // Timeout after 5 minutes
      setTimeout(() => {
        if (!popup.closed) {
          popup.close();
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
          reject(new Error('Authentication timeout'));
        }
      }, 300000);
    });
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out...');
      
      const response = await fetch(`${config.apiUrl}/logout`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        console.log('✅ Logout successful');
        setUser(null);
        setIsAuthenticated(false);
      } else {
        console.error('❌ Logout failed:', response.status);
        // Clear local state anyway
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Clear local state anyway
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