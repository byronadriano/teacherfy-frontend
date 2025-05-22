// Fixed App.js - Completely remove footer container when hidden
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { Box, useMediaQuery } from '@mui/material';
import LessonBuilder from './pages/LessonBuilder';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import AppFooter from './components/common/AppFooter';
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

function App() {
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

  return (
    <Router>
      <ThemeProvider theme={theme}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          minHeight: '100vh',
          position: 'relative',
          overflow: 'hidden' // Prevent any horizontal scrolling
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
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
            </Routes>
          </Box>
          
          {/* FIXED: Only render footer container when showFooter is true AND on home page */}
          {window.location.pathname === '/' && showFooter && (
            <Box
              component="footer"
              sx={{
                position: 'fixed',
                bottom: 0,
                left: '60px', // Account for sidebar width
                right: 0,
                py: 2,
                px: 4,
                backgroundColor: '#ffffff',
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 3,
                flexWrap: 'wrap',
                zIndex: 5 // Below sidebar but above content
              }}
            >
              <AppFooter />
            </Box>
          )}
        </Box>
      </ThemeProvider>
    </Router>
  );
}

export default App;