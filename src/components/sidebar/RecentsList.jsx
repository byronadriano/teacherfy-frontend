// src/components/sidebar/RecentsList.jsx - COMPLETE CLEANED VERSION
import { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, Chip, CircularProgress, Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { Presentation, BookOpen, FileQuestion, FileSpreadsheet, Files, Trash2 } from 'lucide-react';
import { historyService } from '../../services/history';
import { useAuth } from '../../contexts/AuthContext';

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

const getResourceTypeInfo = (resourceType) => {
  if (!resourceType) {
    return RESOURCE_TYPES.PRESENTATION;
  }
  
  const typeStr = String(resourceType).toUpperCase().trim();
  
  // Direct mapping first
  if (RESOURCE_TYPES[typeStr]) {
    return RESOURCE_TYPES[typeStr];
  }
  
  // Pattern matching
  if (typeStr.includes('QUIZ') || typeStr.includes('TEST')) {
    return RESOURCE_TYPES['QUIZ/TEST'];
  }
  
  if (typeStr.includes('LESSON') && typeStr.includes('PLAN')) {
    return RESOURCE_TYPES['LESSON PLAN'];
  }
  
  if (typeStr.includes('WORKSHEET')) {
    return RESOURCE_TYPES.WORKSHEET;
  }
  
  if (typeStr.includes('PRESENTATION') || typeStr.includes('SLIDE')) {
    return RESOURCE_TYPES.PRESENTATION;
  }
  
  // Fallback
  return RESOURCE_TYPES.PRESENTATION;
};

const RecentItem = ({ item, onClick }) => {
  const lessonData = item.lessonData || {};
  
  // Handle both string and array formats for types
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

  // ENHANCEMENT: Also check generatedResources to detect additional resource types
  // This helps with items that were saved before multi-resource detection was implemented
  if (lessonData.generatedResources && typeof lessonData.generatedResources === 'object') {
    const generatedTypes = Object.keys(lessonData.generatedResources).filter(key => 
      lessonData.generatedResources[key] && 
      (Array.isArray(lessonData.generatedResources[key]) ? lessonData.generatedResources[key].length > 0 : true)
    );
    
    if (generatedTypes.length > 0) {
      // Capitalize first letter and add to types if not already present
      const formattedGeneratedTypes = generatedTypes.map(type => 
        type.charAt(0).toUpperCase() + type.slice(1)
      );
      
      // Merge with existing types, avoiding duplicates (case-insensitive comparison)
      const existingTypesLower = types.map(t => t.toLowerCase());
      const newTypes = formattedGeneratedTypes.filter(type => 
        !existingTypesLower.includes(type.toLowerCase())
      );
      
      types = [...types, ...newTypes];
    }
  }

  // Debug logging removed to reduce console noise
  
  // Enhanced title generation with specific content preview
  const getEnhancedTitle = () => {
    const baseTitle = item.title || lessonData.generatedTitle || lessonData.lessonTopic || 'Untitled Lesson';
    
    // Check if we have structured content or generated resources
    const structuredContent = lessonData.structuredContent || [];
    const generatedResources = lessonData.generatedResources || {};
    
    // For presentations: show second section title (first is usually "Learning Objectives")
    if (types && types.some(t => t.toLowerCase().includes('presentation'))) {
      if (structuredContent.length > 1 && structuredContent[1]?.title) {
        return structuredContent[1].title;
      }
      if (generatedResources.presentation && generatedResources.presentation.length > 1) {
        return generatedResources.presentation[1]?.title || baseTitle;
      }
      // Fallback to first section if only one exists
      if (structuredContent.length > 0 && structuredContent[0]?.title) {
        return structuredContent[0].title;
      }
      if (generatedResources.presentation && generatedResources.presentation.length > 0) {
        return generatedResources.presentation[0]?.title || baseTitle;
      }
    }
    
    // For worksheets: show first worksheet section title
    if (types && types.some(t => t.toLowerCase().includes('worksheet'))) {
      if (generatedResources.worksheet && generatedResources.worksheet.length > 0) {
        return generatedResources.worksheet[0]?.title || baseTitle;
      }
    }
    
    // For other resources: look for any structured content
    if (structuredContent.length > 0 && structuredContent[0]?.title) {
      return structuredContent[0].title;
    }
    
    return baseTitle;
  };
  
  const title = getEnhancedTitle();
  const subject = lessonData.subjectFocus || '';
  const gradeLevel = lessonData.gradeLevel || '';
  const language = lessonData.language || '';
  const numSections = lessonData.numSections || lessonData.numSlides || lessonData.sectionsCount || item.sections?.length || 0;
  const date = item.date || 'Today';

  // Generate a more descriptive subtitle with lesson details
  const getSubtitle = () => {
    const parts = [];
    if (gradeLevel) parts.push(gradeLevel);
    if (subject) parts.push(subject);
    if (numSections > 0) parts.push(`${numSections} sections`);
    if (language && language !== 'English') parts.push(language);
    return parts.join(' • ');
  };

  const subtitle = getSubtitle();

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
      {/* Show multiple icons if more than one resource type */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {types.slice(0, 3).map((type, index) => {
          const typeInfo = getResourceTypeInfo(type);
          const IconComponent = typeInfo.icon;
          
          // Removed verbose icon rendering debug logs
          
          return (
            <IconComponent 
              key={index} 
              size={16} 
              color={typeInfo.color}
              style={{ 
                opacity: index === 0 ? 1 : 0.7,
                marginLeft: index > 0 ? '-4px' : '0' // Slight overlap for multiple icons
              }}
            />
          );
        })}
        {types.length > 3 && (
          <Typography sx={{ 
            fontSize: '0.6rem', 
            color: '#6b7280',
            ml: 0.5
          }}>
            +{types.length - 3}
          </Typography>
        )}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ 
          fontSize: '0.8rem',
          color: '#374151',
          fontWeight: '600',
          mb: 0.3,
          lineHeight: 1.2
        }}>
          {title}
        </Typography>
        
        {subtitle && (
          <Typography sx={{ 
            fontSize: '0.7rem',
            color: '#6b7280',
            mb: 0.5,
            lineHeight: 1.2
          }}>
            {subtitle}
          </Typography>
        )}
        
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mt: 0.5,
          flexWrap: 'wrap'
        }}>
          {types.map((type, index) => {
            const typeInfo = getResourceTypeInfo(type);
            // Removed verbose chip rendering debug logs
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
                  fontWeight: '500',
                  border: `1px solid ${typeInfo.color}30` // Added border for better visibility
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
const RecentsList = ({ onSelectItem }) => {
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isClearingHistory, setIsClearingHistory] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  
  const isMounted = useRef(true);
  const hasInitiallyFetched = useRef(false);

  const fetchHistory = useCallback(async (forceRefresh = false) => {
    if (hasInitiallyFetched.current && !forceRefresh) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await historyService.getUserHistory();
      
      if (!isMounted.current) return;
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.history && Array.isArray(response.history)) {
        // Backend now handles duplicates, so we can trust the data
        // History count logging removed to reduce noise
        setHistoryItems(response.history);
      } else if (!isAuthenticated) {
        const localHistory = historyService.getLocalHistory();
        setHistoryItems(localHistory);
      }
      
      hasInitiallyFetched.current = true;
    } catch (err) {
      if (!isMounted.current) return;
      
      console.error('Error fetching history:', err);
      setError('Failed to load history. Please try again later.');
      
      if (!isAuthenticated) {
        const localHistory = historyService.getLocalHistory();
        setHistoryItems(localHistory);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    isMounted.current = true;
    
    // Initial fetch
    if (!hasInitiallyFetched.current) {
      fetchHistory();
    }
    
    // Listen for history updates
    const handleHistoryUpdate = () => {
      hasInitiallyFetched.current = false;
      fetchHistory(true); // Force refresh
    };
    
    window.addEventListener('historyUpdated', handleHistoryUpdate);
    
    return () => {
      isMounted.current = false;
      window.removeEventListener('historyUpdated', handleHistoryUpdate);
    };
  }, [isAuthenticated, fetchHistory]);

  const handleItemClick = (item) => {
    if (onSelectItem) {
      onSelectItem(item);
    }
  };

  const handleClearHistory = async () => {
    try {
      setIsClearingHistory(true);
      
      await historyService.clearHistory();
      setHistoryItems([]);
      hasInitiallyFetched.current = false;
      await fetchHistory(true); // Force refresh
      setConfirmDialogOpen(false);
    } catch (error) {
      console.error('Error clearing history:', error);
      setError('Failed to clear history. Please try again later.');
    } finally {
      setIsClearingHistory(false);
    }
  };

  return (
    <Box sx={{ px: 0 }}>
      {/* Header with clear button */}
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 2, 
        backgroundColor: '#f8fafc'
      }}>
        <Typography sx={{ 
          fontWeight: 600, 
          fontSize: '0.875rem',
          color: '#1e293b'
        }}>
          Recent Resources
        </Typography>
        {historyItems.length > 0 && (
          <Button
            size="small"
            variant="text"
            color="error"
            disabled={isClearingHistory}
            onClick={() => setConfirmDialogOpen(true)}
            startIcon={<Trash2 size={14} />}
            sx={{ 
              fontSize: '0.7rem',
              textTransform: 'none',
              p: 0.5,
              minWidth: 'auto'
            }}
          >
            {isClearingHistory ? 'Clearing...' : 'Clear'}
          </Button>
        )}
      </Box>
      
      {/* Content area */}
      <Box sx={{ px: 1 }}>
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
                Sign in to save your history.
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
      </Box>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        aria-labelledby="clear-history-dialog-title"
      >
        <DialogTitle id="clear-history-dialog-title">
          Clear History?
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to clear your history? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setConfirmDialogOpen(false)} 
            color="inherit" 
            disabled={isClearingHistory}
          >
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