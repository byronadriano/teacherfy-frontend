import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { Box } from '@mui/material';
import LessonBuilder from './pages/LessonBuilder';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import AppFooter from './components/common/AppFooter';
import theme from './styles/theme';
import './styles/app.css';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    // Sync sidebar collapsed state with localStorage
    const storedSidebarState = localStorage.getItem('sidebarCollapsed') === 'true';
    setSidebarCollapsed(storedSidebarState);
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
          
          {/* Footer for main pages */}
          {window.location.pathname === '/' && <AppFooter />}
        </Box>
      </ThemeProvider>
    </Router>
  );
}

export default App;