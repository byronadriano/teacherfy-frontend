// src/App.js - ENHANCED with AuthContext and integrated LoginPage
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { Box, useMediaQuery, Typography } from '@mui/material';
import LessonBuilder from './pages/LessonBuilder';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import AuthCallback from './pages/AuthCallback';
import AppFooter from './components/common/AppFooter';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import theme from './styles/theme';

// Import CSS files
import './styles/app.css';
import './styles/global.css';

// Note: Mobile CSS is imported conditionally if it exists
try {
  require('./styles/mobile.css');
} catch (e) {
  console.log('Mobile CSS not found, skipping import');
}

// Main App Content Component
const AppContent = () => {
  const { isLoading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showFooter, setShowFooter] = useState(true);
  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    // Sync sidebar collapsed state with localStorage
    const storedSidebarState = localStorage.getItem('sidebarCollapsed') === 'true';
    setSidebarCollapsed(storedSidebarState);
    
    // On mobile devices, default to collapsed sidebar
    if (isMobile && !storedSidebarState) {
      setSidebarCollapsed(true);
      localStorage.setItem('sidebarCollapsed', 'true');
    }
    
    // Add mobile class to body if on a mobile device
    if (isMobile) {
      document.body.classList.add('is-mobile-device');
    } else {
      document.body.classList.remove('is-mobile-device');
    }
  }, [isMobile]);

  // Check footer visibility based on sessionStorage
  useEffect(() => {
    const checkFooterVisibility = () => {
      const hideFooter = sessionStorage.getItem('hideFooter') === 'true';
      setShowFooter(!hideFooter);
    };
    
    // Initial check
    checkFooterVisibility();
    
    // Check periodically since sessionStorage changes don't trigger storage event on same tab
    const interval = setInterval(checkFooterVisibility, 100);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleSidebarToggle = (collapsed) => {
    setSidebarCollapsed(collapsed);
    localStorage.setItem('sidebarCollapsed', collapsed.toString());
  };

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  // Users can use the site anonymously - show main app for everyone
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden',
      paddingTop: 'env(safe-area-inset-top)',
      paddingBottom: 'env(safe-area-inset-bottom)'
    }}>

      <Box sx={{ 
        flex: 1,
        // Only add bottom padding when footer is shown
        pb: showFooter ? (isMobile ? '70px' : '60px') : 0,
        position: 'relative'
      }}>
        <Routes>
          <Route 
            path="/" 
            element={
              <LessonBuilder 
                onSidebarToggle={handleSidebarToggle} 
                sidebarCollapsed={sidebarCollapsed} 
              />
            } 
          />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
        </Routes>
      </Box>
      
      {/* Footer only on home page when showFooter is true */}
      {window.location.pathname === '/' && showFooter && !isMobile && (
        <Box
          component="footer"
          sx={{
            position: 'fixed',
            bottom: 0,
            left: '60px',
            right: 0,
            py: 2,
            px: 4,
            backgroundColor: '#ffffff',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 3,
            flexWrap: 'wrap',
            zIndex: 5
          }}
        >
          <AppFooter />
        </Box>
      )}
    </Box>
  );
};

// Main App Component with AuthProvider
function App() {
  return (
    <AuthProvider>
      <Router>
        <ThemeProvider theme={theme}>
          <AppContent />
        </ThemeProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;