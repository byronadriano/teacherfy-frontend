import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Link, useMediaQuery, useTheme } from '@mui/material';

const AppFooter = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const isSidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        py: 1,
        px: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        // borderTop: '1px solid #e0e0e0',
        marginLeft: isSidebarCollapsed 
          ? '20px' 
          : isSmallScreen 
            ? '0' 
            : '240px',
        transition: 'margin-left 0.3s ease',
        width: isSidebarCollapsed 
          ? 'calc(100% - 20px)' 
          : isSmallScreen 
            ? '100%' 
            : 'calc(100% - 240px)'
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          maxWidth: '1200px',
          width: '100%',
          justifyContent: 'center'
        }}
      >
        <Link
          component={RouterLink}
          to="/privacy-policy"
          color="primary"
          underline="hover"
          sx={{ 
            fontSize: '0.875rem',
            color: theme.palette.text.secondary,
            transition: 'color 0.2s',
            '&:hover': {
              color: theme.palette.primary.main
            }
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
            fontSize: '0.875rem',
            color: theme.palette.text.secondary,
            transition: 'color 0.2s',
            '&:hover': {
              color: theme.palette.primary.main
            }
          }}
        >
          Terms of Service
        </Link>
        <Typography 
          component="span" 
          sx={{ 
            display: { xs: 'none', sm: 'block' },
            color: theme.palette.text.disabled,
            fontSize: '0.75rem' 
          }}
        >
          © {new Date().getFullYear()} Teacherfy AI
        </Typography>
      </Box>
    </Box>
  );
};

export default AppFooter;