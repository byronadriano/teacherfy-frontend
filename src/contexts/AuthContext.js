// src/contexts/AuthContext.js - FIXED VERSION to handle COOP policy
import React, { createContext, useContext, useState, useEffect } from 'react';
import { config } from '../utils/config';

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
    console.log('🔍 Checking authentication status...');
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
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
          setUser(data.user);
          setIsAuthenticated(true);
          console.log('✅ User is authenticated:', data.user.email);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          console.log('ℹ️ User is not authenticated');
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        console.log('ℹ️ Auth check failed - user not authenticated');
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
      
      const authUrl = `${config.apiUrl}/authorize`;
      console.log('🔗 Opening OAuth popup:', authUrl);
      
      // FIXED: Open popup with proper window features and error handling
      const popup = window.open(
        authUrl,
        'oauth-popup',
        'width=500,height=600,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no'
      );

      if (!popup) {
        console.error('❌ Failed to open OAuth popup - popup blocked?');
        reject(new Error('Failed to open authentication popup. Please allow popups and try again.'));
        return;
      }

      let messageReceived = false;
      let checkClosedTimeout;
      
      // FIXED: Use postMessage listener instead of checking popup.closed
      const messageListener = (event) => {
        // Verify origin for security
        if (event.origin !== window.location.origin && event.origin !== config.apiUrl) {
          console.warn('⚠️ Received message from unexpected origin:', event.origin);
          return;
        }

        console.log('📨 Received postMessage:', event.data);

        if (event.data.type === 'AUTH_SUCCESS') {
          messageReceived = true;
          console.log('✅ OAuth success received via postMessage');
          
          // Clean up
          window.removeEventListener('message', messageListener);
          if (checkClosedTimeout) clearInterval(checkClosedTimeout);
          
          // Set user data from the message
          if (event.data.user) {
            setUser(event.data.user);
            setIsAuthenticated(true);
            console.log('✅ User data updated from OAuth:', event.data.user.email);
          }
          
          // Re-check auth status to get latest data from server
          checkAuthStatus().then(() => {
            resolve();
          }).catch((error) => {
            console.warn('⚠️ Auth recheck failed but continuing:', error);
            resolve(); // Still resolve since OAuth succeeded
          });
          
        } else if (event.data.type === 'AUTH_ERROR') {
          messageReceived = true;
          console.error('❌ OAuth error received via postMessage:', event.data.error);
          
          // Clean up
          window.removeEventListener('message', messageListener);
          if (checkClosedTimeout) clearInterval(checkClosedTimeout);
          
          reject(new Error(event.data.error || 'Authentication failed'));
        }
      };

      // Listen for postMessage from the popup
      window.addEventListener('message', messageListener);

      // FIXED: Fallback check for popup closure without using popup.closed
      checkClosedTimeout = setInterval(() => {
        try {
          // Try to access popup.location - this will throw if popup is closed or cross-origin
          if (popup.location && popup.location.href) {
            // Popup is still open and accessible
            return;
          }
        } catch (e) {
          // This catch block handles both closure and cross-origin cases
          if (!messageReceived) {
            console.log('❌ OAuth popup was closed or became inaccessible');
            
            // Clean up
            window.removeEventListener('message', messageListener);
            clearInterval(checkClosedTimeout);
            
            reject(new Error('Authentication was cancelled'));
          }
          return;
        }
      }, 1000);

      // FIXED: Add timeout to prevent infinite waiting
      setTimeout(() => {
        if (!messageReceived) {
          console.log('⏰ OAuth timeout - cleaning up');
          
          try {
            popup.close();
          } catch (e) {
            // Ignore errors when closing popup
          }
          
          window.removeEventListener('message', messageListener);
          if (checkClosedTimeout) clearInterval(checkClosedTimeout);
          
          reject(new Error('Authentication timed out. Please try again.'));
        }
      }, 300000); // 5 minute timeout
    });
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out...');
      
      const response = await fetch(`${config.apiUrl}/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Always clear local state, even if server request fails
      setUser(null);
      setIsAuthenticated(false);
      
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Still clear local state on error
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