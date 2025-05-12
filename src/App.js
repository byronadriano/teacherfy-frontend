// Fixed App.js
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
            pb: isMobile ? '70px' : '60px', // Extra padding on mobile for footer
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
          
          {/* Footer displays outside the main content area */}
          {window.location.pathname === '/' && <AppFooter />}
        </Box>
      </ThemeProvider>
    </Router>
  );
}

export default App;