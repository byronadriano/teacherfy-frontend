// src/App.js
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import LessonBuilder from './pages/LessonBuilder';
import theme from './styles/theme';
import './styles/app.css';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <LessonBuilder />
    </ThemeProvider>
  );
}

export default App;