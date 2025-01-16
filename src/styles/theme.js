// src/styles/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb',
      dark: '#1d4ed8',
      light: '#60a5fa'
    },
    secondary: {
      main: '#dc2626',
      dark: '#b91c1c',
      light: '#f87171'
    }
  },
  // Optional: unify border radius across components.
  shape: {
    borderRadius: 6,
  },
  // Optional: unify typography across the app.
  typography: {
    fontFamily: "'Inter', sans-serif",
    h1: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    button: {
      textTransform: 'none', // Ensures default MUI buttons don't uppercase
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          // If using shape.borderRadius, you can remove borderRadius here
          borderRadius: '6px',
          textTransform: 'none',
        }
      }
    }
  }
});

export default theme;
