// src/components/debug/DebugPanel.jsx
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const DebugPanel = ({ contentState, uiState }) => {
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        p: 2,
        maxWidth: '400px',
        maxHeight: '300px',
        overflow: 'auto',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        zIndex: 9999,
        fontFamily: 'monospace',
        fontSize: '12px'
      }}
    >
      <Typography variant="h6" sx={{ color: '#00ff00', mb: 1 }}>Debug Info</Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography sx={{ color: '#00ff00' }}>UI State:</Typography>
        <pre style={{ margin: 0 }}>
          {JSON.stringify(uiState, null, 2)}
        </pre>
      </Box>
      
      <Box>
        <Typography sx={{ color: '#00ff00' }}>Content State:</Typography>
        <pre style={{ margin: 0 }}>
          {JSON.stringify(contentState, null, 2)}
        </pre>
      </Box>
    </Paper>
  );
};

export default DebugPanel;