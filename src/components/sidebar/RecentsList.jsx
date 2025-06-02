// FIXED VERSION - Replace your RecentsList.jsx with this
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, Chip, CircularProgress, Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { Presentation, BookOpen, FileQuestion, FileSpreadsheet, Files, Trash2 } from 'lucide-react';
import { historyService } from '../../services/history';
import { useAuth } from '../../contexts/AuthContext';

// Resource type mapping (keep your existing code)
const RESOURCE_TYPES = {
  PRESENTATION: {
    icon: Presentation,
    color: '#2563eb',
    label: 'Presentation'
  },
  QUIZ: {
    icon: FileQuestion,
    color: '#dc2626',
    label: 'Quiz'
  },
  'QUIZ/TEST': {
    icon: FileQuestion,
    color: '#dc2626', 
    label: 'Quiz/Test'
  },
  TEST: {
    icon: FileQuestion,
    color: '#dc2626',
    label: 'Test'
  },
  LESSON_PLAN: {
    icon: BookOpen,
    color: '#059669',
    label: 'Lesson Plan'
  },
  'LESSON PLAN': {
    icon: BookOpen,
    color: '#059669',
    label: 'Lesson Plan'
  },
  WORKSHEET: {
    icon: FileSpreadsheet,
    color: '#7c3aed',
    label: 'Worksheet'
  },
  ALL_OPTIONS: {
    icon: Files,
    color: '#d97706',
    label: 'All Options'
  }
};

// Keep your existing getResourceTypeInfo function
const getResourceTypeInfo = (resourceType) => {
  console.log('🔍 Analyzing resource type:', resourceType, typeof resourceType);
  
  if (!resourceType) {
    console.log('❌ No resource type provided, defaulting to PRESENTATION');
    return RESOURCE_TYPES.PRESENTATION;
  }
  
  const typeStr = String(resourceType).toUpperCase().trim();
  console.log('📝 Normalized type string:', typeStr);
  
  if (RESOURCE_TYPES[typeStr]) {
    console.log('✅ Direct match found:', typeStr);
    return RESOURCE_TYPES[typeStr];
  }
  
  if (typeStr.includes('QUIZ') || typeStr.includes('TEST')) {
    console.log('✅ Detected as QUIZ/TEST type');
    return RESOURCE_TYPES['QUIZ/TEST'];
  }
  
  if (typeStr.includes('LESSON') && typeStr.includes('PLAN')) {
    console.log('✅ Detected as LESSON PLAN type');
    return RESOURCE_TYPES['LESSON PLAN'];
  }
  
  if (typeStr.includes('WORKSHEET')) {
    console.log('✅ Detected as WORKSHEET type');
    return RESOURCE_TYPES.WORKSHEET;
  }
  
  if (typeStr.includes('PRESENTATION') || typeStr.includes('SLIDE')) {
    console.log('✅ Detected as PRESENTATION type');
    return RESOURCE_TYPES.PRESENTATION;
  }
  
  console.log('❌ No pattern match, defaulting to PRESENTATION');
  return RESOURCE_TYPES.PRESENTATION;
};

// Keep your existing RecentItem component
const RecentItem = ({ item, onClick }) => {
  console.log('🏷️ Processing history item:', item);
  
  const lessonData = item.lessonData || {};
  const title = item.title || 'Untitled Lesson';
  const subject = lessonData.subjectFocus || '';
  
  let types;
  if (Array.isArray(item.types)) {
    types = item.types;
  } else if (item.types) {
    types = [item.types];
  } else if (lessonData.resourceType) {
    types = Array.isArray(lessonData.resourceType) 
      ? lessonData.resourceType 
      : [lessonData.resourceType];
  } else {
    types = ['Presentation'];
  }
  
  console.log('📋 Extracted types:', types);
  
  const date = item.date || 'Today';
  const primaryType = types[0] || 'Presentation';
  console.log('🎯 Primary type for icon:', primaryType);
  
  const resourceType = getResourceTypeInfo(primaryType);
  const Icon = resourceType.icon;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
        p: 1.5,
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: '#f1f5f9'
        }
      }}
      onClick={() => onClick && onClick(item)}
    >
      <Icon size={16} color={resourceType.color} />
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ 
          fontSize: '0.8rem',
          color: '#374151',
          fontWeight: '600',
          mb: 0.5
        }}>
          {title}
        </Typography>
        
        {subject && (
          <Typography sx={{ 
            fontSize: '0.7rem',
            color: '#6b7280',
            mb: 0.5
          }}>
            {subject}
          </Typography>
        )}
        
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mt: 0.5
        }}>
          {types.map((type, index) => {
            const typeInfo = getResourceTypeInfo(type);
            return (
              <Chip
                key={index}
                label={typeInfo.label}
                size="small"
                sx={{
                  height: '18px',
                  fontSize: '0.625rem',
                  backgroundColor: `${typeInfo.color}15`,
                  color: typeInfo.color,
                  fontWeight: '500'
                }}
              />
            );
          })}
          
          <Typography sx={{ 
            fontSize: '0.625rem',
            color: '#94a3b8'
          }}>
            {date}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

// MAIN COMPONENT - FIXED VERSION
const RecentsList = ({ onSelectItem }) => {
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isClearingHistory, setIsClearingHistory] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  
  const isMounted = useRef(true);
  const hasInitiallyFetched = useRef(false);

  const fetchHistory = useCallback(async () => {
    if (hasInitiallyFetched.current && !loading) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // FIXED: Handle authenticated vs anonymous users differently
      if (isAuthenticated) {
        // For authenticated users, use server API
        const response = await historyService.getUserHistory();
        
        if (!isMounted.current) return;
        
        if (response.error) {
          throw new Error(response.error);
        }
        
        if (response.history && Array.isArray(response.history)) {
          setHistoryItems(response.history);
        }
      } else {
        // FIXED: For anonymous users, read directly from localStorage
        console.log('📦 Loading history from localStorage for anonymous user');
        const localHistory = historyService.getLocalHistory();
        console.log('💾 Found local history items:', localHistory.length);
        
        if (!isMounted.current) return;
        setHistoryItems(localHistory);
      }
      
      hasInitiallyFetched.current = true;
    } catch (err) {
      if (!isMounted.current) return;
      
      console.error('Error fetching history:', err);
      
      // FALLBACK: Always try localStorage for anonymous users
      if (!isAuthenticated) {
        console.log('📦 Fallback: Using localStorage for anonymous user');
        const localHistory = historyService.getLocalHistory();
        setHistoryItems(localHistory);
        setError(null); // Clear error since we got fallback data
      } else {
        setError('Failed to load history. Please try again later.');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [isAuthenticated, loading]);

  useEffect(() => {
    isMounted.current = true;
    
    if (!hasInitiallyFetched.current || loading) {
      fetchHistory();
    }
    
    return () => {
      isMounted.current = false;
    };
  }, [isAuthenticated, fetchHistory, loading]);

  const handleItemClick = (item) => {
    if (onSelectItem) {
      onSelectItem(item);
    }
  };

  const openConfirmDialog = () => {
    setConfirmDialogOpen(true);
  };

  const closeConfirmDialog = () => {
    setConfirmDialogOpen(false);
  };

  const handleClearHistory = async () => {
    try {
      setIsClearingHistory(true);
      
      if (isAuthenticated) {
        await historyService.clearHistory();
      } else {
        // FIXED: Clear localStorage for anonymous users
        historyService.clearLocalHistory();
      }
      
      setHistoryItems([]);
      hasInitiallyFetched.current = false;
      await fetchHistory();
      closeConfirmDialog();
    } catch (error) {
      console.error('Error clearing history:', error);
      setError('Failed to clear history. Please try again later.');
    } finally {
      setIsClearingHistory(false);
    }
  };

  return (
    <Box sx={{ mt: 2, px: 1 }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        px: 1.5,
        mb: 1
      }}>
        <Typography 
          variant="h6" 
          sx={{ 
            color: '#4b5563',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}
        >
          Recent Resources
        </Typography>
        
        {historyItems.length > 0 && (
          <Button
            size="small"
            variant="text"
            color="error"
            disabled={isClearingHistory}
            onClick={openConfirmDialog}
            startIcon={<Trash2 size={14} />}
            sx={{ 
              fontSize: '0.7rem',
              textTransform: 'none',
              p: 0.5
            }}
          >
            {isClearingHistory ? 'Clearing...' : 'Clear'}
          </Button>
        )}
      </Box>
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={24} />
        </Box>
      )}
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mx: 1.5, 
            mb: 2,
            fontSize: '0.75rem' 
          }}
        >
          {error}
        </Alert>
      )}
      
      {!loading && !error && historyItems.length === 0 && (
        <Box sx={{ 
          p: 3, 
          textAlign: 'center',
          border: '1px dashed #cbd5e1',
          borderRadius: '8px',
          mx: 1.5
        }}>
          <Typography 
            sx={{ 
              fontSize: '0.75rem',
              color: '#6b7280',
              fontStyle: 'italic'
            }}
          >
            No recent activities yet.
            {!isAuthenticated && (
              <Box component="span" sx={{ display: 'block', mt: 0.5 }}>
                Sign in to save your history across devices.
              </Box>
            )}
          </Typography>
        </Box>
      )}
      
      <Box sx={{ 
        mt: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 0.5 
      }}>
        {historyItems.map((item, index) => (
          <RecentItem 
            key={item.id || index} 
            item={item} 
            onClick={() => handleItemClick(item)}
          />
        ))}
      </Box>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={closeConfirmDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Clear History?
        </DialogTitle>
        <DialogContent>
          <Typography id="alert-dialog-description">
            Are you sure you want to clear your history? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDialog} color="inherit" disabled={isClearingHistory}>
            Cancel
          </Button>
          <Button 
            onClick={handleClearHistory} 
            color="error" 
            autoFocus
            disabled={isClearingHistory}
          >
            {isClearingHistory ? 'Clearing...' : 'Clear History'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RecentsList;