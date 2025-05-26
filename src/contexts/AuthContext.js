// src/contexts/AuthContext.jsx - FIXED VERSION
import React, { createContext, useContext, useState, useEffect } from 'react';
import { googleLogout } from '@react-oauth/google';

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
      console.log('🔍 Checking authentication status...');
      
      const response = await fetch('/auth/check', {
        method: 'GET',
        credentials: 'include', // CRITICAL for session cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('🔍 Auth check response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Auth check successful:', data);
        
        if (data.authenticated && data.user) {
          setUser(data.user);
          setIsAuthenticated(true);
          console.log('✅ User authenticated:', data.user.email);
        } else {
          console.log('ℹ️ User not authenticated');
          setUser(null);
          setIsAuthenticated(false);
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
  };

  const login = async (credentialResponse) => {
    try {
      console.log('🔐 Starting login process...');
      
      // FIXED: Use the server-side OAuth flow instead of client-side
      const authUrl = '/authorize';
      console.log('🔗 Opening OAuth popup...');
      
      // Create popup window
      const popup = window.open(
        authUrl,
        'oauth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error('Popup was blocked. Please allow popups for this site.');
      }

      // Listen for messages from the popup
      return new Promise((resolve, reject) => {
        const messageListener = (event) => {
          console.log('📨 Received message from popup:', event.data);
          
          if (event.data.type === 'AUTH_SUCCESS') {
            console.log('✅ OAuth success received');
            
            // Clean up
            window.removeEventListener('message', messageListener);
            popup.close();
            
            // Set user data
            const userData = event.data.user;
            setUser(userData);
            setIsAuthenticated(true);
            
            console.log('✅ Login completed for:', userData.email);
            resolve(userData);
            
          } else if (event.data.type === 'AUTH_ERROR') {
            console.error('❌ OAuth error received:', event.data.error);
            
            // Clean up
            window.removeEventListener('message', messageListener);
            popup.close();
            
            reject(new Error(event.data.error));
          }
        };

        // Add message listener
        window.addEventListener('message', messageListener);

        // Handle popup being closed manually
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageListener);
            console.log('⚠️ OAuth popup was closed manually');
            reject(new Error('Authentication was cancelled'));
          }
        }, 1000);

        // Timeout after 5 minutes
        setTimeout(() => {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
          if (!popup.closed) {
            popup.close();
          }
          reject(new Error('Authentication timeout'));
        }, 5 * 60 * 1000);
      });

    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Starting logout...');
      
      // Call server logout
      await fetch('/logout', {
        method: 'GET',
        credentials: 'include',
      });

      // Google logout
      try {
        googleLogout();
      } catch (googleError) {
        console.warn('⚠️ Google logout error (non-critical):', googleError);
      }

      // Clear local state
      setUser(null);
      setIsAuthenticated(false);
      
      console.log('✅ Logout completed');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Clear local state even if server logout fails
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