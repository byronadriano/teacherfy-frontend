import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Fade
} from '@mui/material';
import { Close, Google, Code, School } from '@mui/icons-material';
import { config } from '../../utils/config';

const LoginModal = ({ open, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [provider, setProvider] = useState('');

  const handleOAuthLogin = async (authProvider) => {
    try {
      setIsLoading(true);
      setProvider(authProvider);
      setError('');
      
      console.log(`🔐 Starting ${authProvider} login redirect...`);
      
      // Call backend to get OAuth URL
      const response = await fetch(`${config.apiUrl}/api/auth/login/${authProvider}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to initiate ${authProvider} login: ${response.status}`);
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
      setError(`Failed to login with ${authProvider}. Please try again.`);
      setIsLoading(false);
      setProvider('');
    }
  };

  const loginProviders = [
    {
      name: 'google',
      label: 'Continue with Google',
      icon: <Google />,
      color: '#4285f4',
      hoverColor: '#3367d6'
    },
    {
      name: 'github',
      label: 'Continue with GitHub', 
      icon: <Code />,
      color: '#333',
      hoverColor: '#24292e'
    }
  ];

  return (
    <Dialog
      open={open}
      onClose={!isLoading ? onClose : undefined}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          overflow: 'visible',
          // Mobile safe area adjustments
          '@media (max-width: 600px)': {
            margin: '16px',
            marginTop: 'calc(16px + env(safe-area-inset-top, 0px))',
            marginBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
            maxHeight: 'calc(100vh - 32px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))',
            width: 'calc(100vw - 32px)',
            maxWidth: 'calc(100vw - 32px)'
          },
          // iOS-specific safe area handling
          '@supports (-webkit-touch-callout: none)': {
            '@media (max-width: 600px)': {
              marginTop: 'calc(24px + env(safe-area-inset-top, 20px))',
              marginBottom: 'calc(24px + env(safe-area-inset-bottom, 20px))'
            }
          }
        }
      }}
      sx={{
        // Ensure modal is above all mobile navigation bars
        zIndex: 9999,
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(0, 0, 0, 0.6)'
        }
      }}
    >
      <DialogContent sx={{ p: 0, overflow: 'visible' }}>
        <Box sx={{ position: 'relative', p: 4 }}>
          {/* Close button */}
          {!isLoading && (
            <IconButton
              onClick={onClose}
              sx={{
                position: 'absolute',
                right: 12,
                top: 12,
                color: '#64748b'
              }}
            >
              <Close />
            </IconButton>
          )}

          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              mb: 2 
            }}>
              <School sx={{ 
                fontSize: { xs: 56, sm: 48 }, // Larger on mobile for better visibility
                color: '#6366f1' 
              }} />
            </Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: '#1e293b',
                mb: 1,
                fontSize: { xs: '1.5rem', sm: '2rem' } // Responsive font size
              }}
            >
              Welcome to Teacherfy
            </Typography>
            <Typography
              sx={{
                color: '#64748b',
                fontSize: { xs: '0.9rem', sm: '1rem' }, // Responsive description
                maxWidth: '320px',
                mx: 'auto',
                lineHeight: 1.6
              }}
            >
              AI-powered educational resource creator for teachers
            </Typography>
          </Box>

          {/* Error message */}
          {error && (
            <Fade in={!!error}>
              <Alert 
                severity="error" 
                sx={{ mb: 3, borderRadius: '12px' }}
                onClose={() => setError('')}
              >
                {error}
              </Alert>
            </Fade>
          )}

          {/* Login providers */}
          <Box sx={{ space: 2 }}>
            {loginProviders.map((providerInfo) => (
              <Button
                key={providerInfo.name}
                fullWidth
                variant="outlined"
                size="large"
                disabled={isLoading}
                onClick={() => handleOAuthLogin(providerInfo.name)}
                startIcon={
                  isLoading && provider === providerInfo.name ? (
                    <CircularProgress size={20} />
                  ) : (
                    providerInfo.icon
                  )
                }
                sx={{
                  mb: 2,
                  py: 1.5,
                  px: 3,
                  borderRadius: '12px',
                  border: '2px solid #e2e8f0',
                  color: '#1e293b',
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: providerInfo.color,
                    color: providerInfo.color,
                    backgroundColor: `${providerInfo.color}08`,
                    transform: 'translateY(-1px)',
                    boxShadow: `0 4px 12px ${providerInfo.color}20`
                  },
                  '&:disabled': {
                    opacity: 0.6,
                    transform: 'none',
                    boxShadow: 'none'
                  }
                }}
              >
                {isLoading && provider === providerInfo.name
                  ? 'Signing in...'
                  : providerInfo.label
                }
              </Button>
            ))}
          </Box>

          {/* Footer */}
          <Box sx={{ textAlign: 'center', mt: 4, pt: 3, borderTop: '1px solid #e2e8f0' }}>
            <Typography
              sx={{
                color: '#94a3b8',
                fontSize: '0.875rem',
                lineHeight: 1.5
              }}
            >
              By continuing, you agree to our{' '}
              <Typography
                component="a"
                href="#"
                sx={{
                  color: '#6366f1',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                Terms of Service
              </Typography>
              {' '}and{' '}
              <Typography
                component="a"
                href="#"
                sx={{
                  color: '#6366f1',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                Privacy Policy
              </Typography>
            </Typography>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;