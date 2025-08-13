import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { School, CheckCircle, Error } from '@mui/icons-material';

const AuthCallback = () => {
  const { checkAuthStatus } = useAuth();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔄 Processing OAuth callback...');
        
        // Check URL parameters for success/error indicators
        const urlParams = new URLSearchParams(window.location.search);
        const error = urlParams.get('error');
        
        if (error) {
          console.error('❌ OAuth error from URL:', error);
          setStatus('error');
          setMessage(decodeURIComponent(error));
          return;
        }
        
        // Wait a moment for the backend to process the session
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check authentication status with the backend
        await checkAuthStatus();
        
        console.log('✅ OAuth callback processed successfully');
        setStatus('success');
        setMessage('Successfully logged in! Redirecting...');
        
        // Redirect to main app after a brief delay
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
        
      } catch (error) {
        console.error('❌ Auth callback error:', error);
        setStatus('error');
        setMessage('Login failed. Please try again.');
        
        // Redirect back to login after delay
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [checkAuthStatus]);

  const getIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle sx={{ fontSize: 64, color: '#10b981' }} />;
      case 'error':
        return <Error sx={{ fontSize: 64, color: '#ef4444' }} />;
      default:
        return <CircularProgress size={64} sx={{ color: '#6366f1' }} />;
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'success':
        return 'Login Successful!';
      case 'error':
        return 'Login Failed';
      default:
        return 'Completing Login...';
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 3
      }}
    >
      <Box
        sx={{
          backgroundColor: 'white',
          borderRadius: '20px',
          p: 6,
          textAlign: 'center',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}
      >
        {/* Logo */}
        <Box sx={{ mb: 3 }}>
          <School sx={{ fontSize: 48, color: '#6366f1', mb: 2 }} />
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: '#1e293b',
              mb: 1
            }}
          >
            Teacherfy
          </Typography>
        </Box>

        {/* Status Icon */}
        <Box sx={{ mb: 3 }}>
          {getIcon()}
        </Box>

        {/* Title */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: '#1e293b',
            mb: 2
          }}
        >
          {getTitle()}
        </Typography>

        {/* Message */}
        {message && (
          <Box sx={{ mb: 2 }}>
            {status === 'error' ? (
              <Alert 
                severity="error" 
                sx={{ 
                  borderRadius: '12px',
                  textAlign: 'left'
                }}
              >
                {message}
              </Alert>
            ) : (
              <Typography
                sx={{
                  color: '#64748b',
                  fontSize: '1rem',
                  lineHeight: 1.6
                }}
              >
                {message}
              </Typography>
            )}
          </Box>
        )}

        {/* Loading indicator */}
        {status === 'processing' && (
          <Typography
            sx={{
              color: '#94a3b8',
              fontSize: '0.875rem',
              mt: 2
            }}
          >
            Please wait while we complete your login...
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default AuthCallback;