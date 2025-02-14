import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, IconButton, Collapse } from '@mui/material';
import { ChevronDown, ChevronUp, Grip, X, Copy } from 'lucide-react';

const DebugPanel = ({ contentState, uiState }) => {
  const [position, setPosition] = useState({ x: 20, y: window.innerHeight - 400 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  
  const panelRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (isDragging && panelRef.current) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Keep panel within viewport bounds
      const maxX = window.innerWidth - panelRef.current.offsetWidth;
      const maxY = window.innerHeight - panelRef.current.offsetHeight;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  }, [isDragging, dragOffset]);

  // Handle dragging
  const handleMouseDown = (e) => {
    if (e.target.closest('.drag-handle')) {
      setIsDragging(true);
      const rect = panelRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add and remove event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove]);

  // Handle copy state
  const copyState = (state, type) => {
    navigator.clipboard.writeText(JSON.stringify(state, null, 2))
      .then(() => {
        setCopyFeedback(`${type} copied!`);
        setTimeout(() => setCopyFeedback(''), 2000);
      })
      .catch(err => console.error('Failed to copy:', err));
  };

  const close = () => {
    setIsVisible(false);
  };

  // Only render in development and when visible
  if (process.env.NODE_ENV !== 'development' || !isVisible) {
    return null;
  }

  return (
    <Paper
      ref={panelRef}
      onMouseDown={handleMouseDown}
      sx={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        p: 0,
        width: '300px',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        zIndex: 9999,
        cursor: isDragging ? 'grabbing' : 'default',
        transition: 'all 0.2s ease',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
      }}
    >
      {/* Header */}
      <Box
        className="drag-handle"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 1,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          cursor: 'grab',
          bgcolor: 'rgba(255, 255, 255, 0.05)',
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Grip size={16} className="drag-handle" />
          <Typography variant="subtitle2" sx={{ color: '#00ff00' }}>
            Debug Panel
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton 
            size="small" 
            onClick={() => setIsCollapsed(!isCollapsed)}
            sx={{ color: 'white', p: 0.5 }}
          >
            {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </IconButton>
          <IconButton 
            size="small" 
            onClick={close}
            sx={{ color: 'white', p: 0.5 }}
          >
            <X size={16} />
          </IconButton>
        </Box>
      </Box>

      {/* Content */}
      <Collapse in={!isCollapsed}>
        <Box sx={{ p: 2 }}>
          {copyFeedback && (
            <Typography 
              sx={{ 
                color: '#00ff00', 
                fontSize: '12px', 
                mb: 1, 
                textAlign: 'center' 
              }}
            >
              {copyFeedback}
            </Typography>
          )}
          
          {/* UI State */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 1 
            }}>
              <Typography sx={{ color: '#00ff00', fontSize: '14px' }}>
                UI State
              </Typography>
              <IconButton
                size="small"
                onClick={() => copyState(uiState, 'UI State')}
                sx={{ color: 'white', p: 0.5 }}
              >
                <Copy size={14} />
              </IconButton>
            </Box>
            <Box 
              sx={{ 
                maxHeight: '150px', 
                overflow: 'auto',
                '&::-webkit-scrollbar': {
                  width: '8px'
                },
                '&::-webkit-scrollbar-track': {
                  background: 'rgba(255, 255, 255, 0.1)'
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(255, 255, 255, 0.3)',
                  borderRadius: '4px'
                }
              }}
            >
              <pre style={{ margin: 0, fontSize: '11px' }}>
                {JSON.stringify(uiState, null, 2)}
              </pre>
            </Box>
          </Box>

          {/* Content State */}
          <Box>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 1 
            }}>
              <Typography sx={{ color: '#00ff00', fontSize: '14px' }}>
                Content State
              </Typography>
              <IconButton
                size="small"
                onClick={() => copyState(contentState, 'Content State')}
                sx={{ color: 'white', p: 0.5 }}
              >
                <Copy size={14} />
              </IconButton>
            </Box>
            <Box 
              sx={{ 
                maxHeight: '150px', 
                overflow: 'auto',
                '&::-webkit-scrollbar': {
                  width: '8px'
                },
                '&::-webkit-scrollbar-track': {
                  background: 'rgba(255, 255, 255, 0.1)'
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(255, 255, 255, 0.3)',
                  borderRadius: '4px'
                }
              }}
            >
              <pre style={{ margin: 0, fontSize: '11px' }}>
                {JSON.stringify(contentState, null, 2)}
              </pre>
            </Box>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default DebugPanel;