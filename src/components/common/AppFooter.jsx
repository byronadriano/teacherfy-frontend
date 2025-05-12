// Complete AppFooter.jsx with proper styling
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Link, useMediaQuery, useTheme } from '@mui/material';

const AppFooter = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const isMobileDevice = useMediaQuery('(max-width:600px)');
  const isSidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
  
  // Get iOS safe area value 
  const getSafeAreaBottom = () => {
    if (typeof window !== 'undefined') {
      const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (iOS) {
        // Return env(safe-area-inset-bottom) for iOS devices
        return 'env(safe-area-inset-bottom, 0px)';
      }
    }
    return '0px';
  };

  return (
    <Box
      component="footer"
      className="app-footer"
      sx={{
        position: 'fixed', // Always fixed to bottom
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50, // High enough but lower than buttons (100)
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        py: 1.5,
        px: 2,
        paddingBottom: `calc(${isMobileDevice ? '20px' : '10px'} + ${getSafeAreaBottom()})`,
        backgroundColor: 'rgba(255, 255, 255, 0.95)', // Semi-transparent background
        borderTop: '1px solid #e5e7eb',
        marginLeft: isMobileDevice ? 0 : (isSidebarCollapsed ? '20px' : (isSmallScreen ? '0' : '240px')),
        transition: 'margin-left 0.3s ease',
        width: isMobileDevice ? '100%' : (isSidebarCollapsed ? 'calc(100% - 20px)' : (isSmallScreen ? '100%' : 'calc(100% - 240px)')),
        boxShadow: '0 -1px 3px rgba(0, 0, 0, 0.05)',
        fontSize: isMobileDevice ? '0.75rem' : 'inherit'
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: isMobileDevice ? 1 : 2, // Reduce gap on mobile
          maxWidth: '1200px',
          width: '100%',
          justifyContent: 'center',
          flexWrap: isMobileDevice ? 'wrap' : 'nowrap', // Allow wrapping on small devices
          py: isMobileDevice ? 1 : 0
        }}
      >
        <Link
          component={RouterLink}
          to="/privacy-policy"
          color="primary"
          underline="hover"
          sx={{ 
            fontSize: isMobileDevice ? '0.75rem' : '0.875rem', // Smaller font on mobile
            color: theme.palette.text.secondary,
            transition: 'color 0.2s',
            '&:hover': {
              color: theme.palette.primary.main
            },
            py: isMobileDevice ? 0.5 : 0
          }}
        >
          Privacy Policy
        </Link>
        
        <Typography 
          component="span" 
          sx={{ 
            color: theme.palette.text.disabled,
            fontSize: '0.75rem' 
          }}
        >
          |
        </Typography>
        
        <Link
          component={RouterLink}
          to="/terms-of-service"
          color="primary"
          underline="hover"
          sx={{ 
            fontSize: isMobileDevice ? '0.75rem' : '0.875rem', // Smaller font on mobile
            color: theme.palette.text.secondary,
            transition: 'color 0.2s',
            '&:hover': {
              color: theme.palette.primary.main
            },
            py: isMobileDevice ? 0.5 : 0
          }}
        >
          Terms of Service
        </Link>
        
        {/* Copyright notice - hide on very small screens */}
        <Typography 
          component="span" 
          sx={{ 
            display: { xs: isMobileDevice ? 'none' : 'block', sm: 'block' },
            color: theme.palette.text.disabled,
            fontSize: '0.75rem',
            ml: isMobileDevice ? 0 : 1
          }}
        >
          © {new Date().getFullYear()} Teacherfy AI
        </Typography>
      </Box>
    </Box>
  );
};

export default AppFooter;