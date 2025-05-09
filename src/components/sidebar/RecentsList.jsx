// src/components/sidebar/RecentsList.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, Chip, CircularProgress, Alert, Divider } from '@mui/material';
import { FileText, Presentation, BookOpen, FileQuestion, FileSpreadsheet, Files } from 'lucide-react';
import { historyService } from '../../services/history';
import { useAuth } from '../../contexts/AuthContext';
import ClearHistoryButton from './ClearHistoryButton';

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
  LESSON_PLAN: {
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

// Default to FileText icon for unknown resource types
const getResourceTypeInfo = (resourceType) => {
  const typeKey = resourceType?.toUpperCase?.() || 'PRESENTATION';
  return RESOURCE_TYPES[typeKey] || {
    icon: FileText,
    color: '#4b5563',
    label: resourceType || 'Resource'
  };
};

const RecentItem = ({ item, onClick }) => {
  // Extract info from the history item
  const lessonData = item.lessonData || {};
  
  // Use subject as the main title, fallback to regular title if not available
  const subject = lessonData.subjectFocus || 'Subject';
  
  // Get first slide title if available
  const firstSlideTitle = lessonData.structuredContent?.[0]?.title || '';
  
  // Handle both string and array formats for types
  const types = Array.isArray(item.types) ? item.types : [item.types || 'PRESENTATION'];
  const date = item.date || 'Today';
  
  // Get resource info for the primary type
  const primaryType = types[0]?.toUpperCase?.() || 'PRESENTATION';
  const resourceType = getResourceTypeInfo(primaryType);
  const Icon = resourceType.icon;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
        p: 1.5,
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: '#f3f4f6'
        }
      }}
      onClick={() => onClick && onClick(item)}
    >
      <Icon size={16} color={resourceType.color} />
      <Box sx={{ flex: 1 }}>
        {/* Subject as main title */}
        <Typography sx={{ 
          fontSize: '0.8rem',
          color: '#374151',
          fontWeight: '600',
          mb: 0.5,
          textTransform: 'capitalize'
        }}>
          {subject}
        </Typography>
        
        {/* First slide title as subtitle */}
        {firstSlideTitle && (
          <Typography sx={{ 
            fontSize: '0.7rem',
            color: '#6b7280',
            mb: 0.5,
            lineHeight: 1.2,
            // Limit to 2 lines with ellipsis
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {firstSlideTitle}
          </Typography>
        )}
        
        {/* Type and date info */}
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mt: 0.5
        }}>
          <Chip
            label={resourceType.label}
            size="small"
            sx={{
              height: '18px',
              fontSize: '0.625rem',
              backgroundColor: `${resourceType.color}15`,
              color: resourceType.color,
              fontWeight: '500'
            }}
          />
          
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

const RecentsList = ({ onSelectItem }) => {
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();
  
  // Add a ref to track if the component is mounted
  const isMounted = useRef(true);
  
  // Add a ref to track if we've already fetched history
  const hasInitiallyFetched = useRef(false);

  // Wrap fetchHistory with useCallback to prevent recreation on every render
  const fetchHistory = useCallback(async () => {
    // Don't fetch if we've already done the initial fetch and auth hasn't changed
    if (hasInitiallyFetched.current && !loading) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch history from server
      const response = await historyService.getUserHistory();
      
      // Check if component is still mounted before updating state
      if (!isMounted.current) return;
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // If authenticated user and history returned
      if (response.history && Array.isArray(response.history)) {
        setHistoryItems(response.history);
      } 
      // For anonymous users, try to get from local storage as fallback
      else if (!isAuthenticated) {
        const localHistory = historyService.getLocalHistory();
        setHistoryItems(localHistory);
      }
      
      // Mark that we've done the initial fetch
      hasInitiallyFetched.current = true;
    } catch (err) {
      // Check if component is still mounted before updating state
      if (!isMounted.current) return;
      
      console.error('Error fetching history:', err);
      setError('Failed to load history. Please try again later.');
      
      // Use local storage as fallback
      if (!isAuthenticated) {
        const localHistory = historyService.getLocalHistory();
        setHistoryItems(localHistory);
      }
    } finally {
      // Check if component is still mounted before updating state
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [isAuthenticated, loading]); // Include dependencies the function relies on

  useEffect(() => {
    // Set up the mounted ref
    isMounted.current = true;
    
    // Only fetch if we haven't already or if auth state changed
    if (!hasInitiallyFetched.current || loading) {
      fetchHistory();
    }
    
    // Cleanup function
    return () => {
      isMounted.current = false;
    };
  }, [isAuthenticated, fetchHistory, loading]); // Added fetchHistory and loading as dependencies

  const handleItemClick = (item) => {
    if (onSelectItem) {
      onSelectItem(item);
    }
  };

  const handleHistoryCleared = () => {
    setHistoryItems([]);
    hasInitiallyFetched.current = false;
    fetchHistory();
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
        <Box sx={{ p: 1.5, textAlign: 'center' }}>
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
                Sign in to save your history.
              </Box>
            )}
          </Typography>
        </Box>
      )}
      
      {historyItems.map((item, index) => (
        <RecentItem 
          key={item.id || index} 
          item={item} 
          onClick={() => handleItemClick(item)}
        />
      ))}
      
      {historyItems.length > 0 && (
        <Divider sx={{ my: 1.5 }} />
      )}
      
      {historyItems.length > 0 && (
        <ClearHistoryButton onHistoryCleared={handleHistoryCleared} />
      )}
    </Box>
  );
};

export default RecentsList;