import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { Box, Typography, Link as MuiLink } from '@mui/material';
import LessonBuilder from './pages/LessonBuilder';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import theme from './styles/theme';
import './styles/app.css';

function App() {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <Routes>
          <Route path="/" element={<LessonBuilder />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
        </Routes>
        {/* Optional: Global links */}
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 100,
            right: 0,
            bgcolor: 'white',
            py: 2,
            display: 'flex',
            justifyContent: 'center',
            gap: 2,
            typography: 'body2',
            color: theme.palette.text.secondary
          }}
        >
          <MuiLink
            component={Link}
            to="/privacy-policy"
            color="primary"
            underline="hover"
            variant="body2"
          >
            Privacy Policy
          </MuiLink>
          <Typography variant="body2">|</Typography>
          <MuiLink
            component={Link}
            to="/terms-of-service"
            color="primary"
            underline="hover"
            variant="body2"
          >
            Terms of Service
          </MuiLink>
        </Box>
      </ThemeProvider>
    </Router>
  );
}

export default App;