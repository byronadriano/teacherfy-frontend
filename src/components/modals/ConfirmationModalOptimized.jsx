// src/components/modals/ConfirmationModalOptimized.jsx - Modern, clean modal
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper,
  TextField,
  CircularProgress,
  Alert
} from '@mui/material';

const ConfirmationModalOptimized = ({
  open,
  onClose,
  contentState,
  uiState,
  subscriptionState,
  onFinalize,
  onRegenerate
}) => {
  const [modifiedPrompt, setModifiedPrompt] = useState('');
  const [isFinalizing, setIsFinalizing] = useState(false);

  const handleFinalize = async () => {
    setIsFinalizing(true);
    try {
      await onFinalize();
      onClose();
    } catch (error) {
      console.error('Finalize error:', error);
    } finally {
      setIsFinalizing(false);
    }
  };

  const handleRegenerate = async () => {
    if (!modifiedPrompt.trim()) return;
    
    try {
      await onRegenerate(modifiedPrompt);
      setModifiedPrompt('');
    } catch (error) {
      console.error('Regenerate error:', error);
    }
  };

  const resourceType = Array.isArray(contentState?.structuredContent) && contentState.structuredContent.length > 0 
    ? (Object.keys(contentState.generatedResources || {})[0] || 'Resource')
    : 'Resource';

  const canRegenerate = uiState.regenerationCount < 3 && 
    (subscriptionState?.isPremium || (subscriptionState?.generationsLeft > 0));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          Review Your {resourceType}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {contentState.title || 'Generated Content'}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {/* Error Display */}
        {uiState.error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {uiState.error}
          </Alert>
        )}

        {/* Content Preview */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            backgroundColor: '#fafafa',
            border: '1px solid #e0e0e0',
            borderRadius: 2,
            maxHeight: 400,
            overflowY: 'auto'
          }}
        >
          {contentState.structuredContent?.map((item, index) => (
            <Box key={index} sx={{ mb: index < contentState.structuredContent.length - 1 ? 4 : 0 }}>
              {/* Section Title */}
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 'bold', 
                  mb: 2,
                  color: '#1976d2',
                  borderBottom: '2px solid #e3f2fd',
                  pb: 1
                }}
              >
                {resourceType === 'Presentation' ? 'Slide' : 'Section'} {index + 1}: {item.title}
              </Typography>

              {/* Content Items */}
              {item.content && item.content.length > 0 && (
                <Box sx={{ pl: 1 }}>
                  {item.content.map((content, i) => (
                    <Typography 
                      key={i} 
                      sx={{ 
                        mb: 1.5, 
                        lineHeight: 1.7,
                        fontSize: '0.95rem',
                        display: 'flex',
                        alignItems: 'flex-start'
                      }}
                    >
                      <Box 
                        component="span" 
                        sx={{ 
                          color: '#1976d2', 
                          fontWeight: 'bold', 
                          mr: 1, 
                          minWidth: '16px',
                          mt: '2px'
                        }}
                      >
                        •
                      </Box>
                      <Box component="span">{content}</Box>
                    </Typography>
                  ))}
                </Box>
              )}

              {/* Optional: Legacy teacher notes and visual elements for backward compatibility */}
              {item.teacher_notes && item.teacher_notes.length > 0 && (
                <Box sx={{ mt: 2, pl: 1 }}>
                  <Typography variant="subtitle2" sx={{ color: '#16a34a', fontWeight: 600, mb: 1 }}>
                    Teacher Notes:
                  </Typography>
                  {item.teacher_notes.map((note, i) => (
                    <Typography key={i} sx={{ pl: 1, mb: 0.5, fontSize: '0.875rem', color: '#4a5568' }}>
                      • {note}
                    </Typography>
                  ))}
                </Box>
              )}

              {item.visual_elements && item.visual_elements.length > 0 && (
                <Box sx={{ mt: 2, pl: 1 }}>
                  <Typography variant="subtitle2" sx={{ color: '#f59e0b', fontWeight: 600, mb: 1 }}>
                    Visual Elements:
                  </Typography>
                  {item.visual_elements.map((element, i) => (
                    <Typography key={i} sx={{ pl: 1, mb: 0.5, fontSize: '0.875rem', color: '#4a5568' }}>
                      • {element}
                    </Typography>
                  ))}
                </Box>
              )}
            </Box>
          ))}
        </Paper>

        {/* Regeneration Section */}
        {canRegenerate && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              Want to modify the content?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Add specific requirements or changes you'd like to see:
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={modifiedPrompt}
              onChange={(e) => setModifiedPrompt(e.target.value)}
              placeholder="e.g., 'Add more examples for visual learners' or 'Include assessment questions'"
              sx={{ mb: 1 }}
            />
            <Typography variant="caption" color="text.secondary">
              Regenerations remaining: {3 - uiState.regenerationCount}
            </Typography>
          </Box>
        )}

        {/* Usage info for free users */}
        {!subscriptionState?.isPremium && subscriptionState?.generationsLeft <= 3 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            {subscriptionState.generationsLeft} generations remaining. 
            {subscriptionState.generationsLeft === 0 && " Consider upgrading for unlimited access."}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button 
          onClick={onClose}
          color="inherit"
          disabled={isFinalizing || uiState.isLoading}
        >
          Cancel
        </Button>
        
        {canRegenerate && (
          <Button 
            onClick={handleRegenerate}
            disabled={!modifiedPrompt.trim() || uiState.isLoading || isFinalizing}
            color="primary"
            variant="outlined"
          >
            {uiState.isLoading ? <CircularProgress size={20} /> : "Regenerate"}
          </Button>
        )}
        
        <Button 
          onClick={handleFinalize}
          disabled={isFinalizing || uiState.isLoading}
          color="primary"
          variant="contained"
        >
          {isFinalizing ? <CircularProgress size={20} /> : "Finalize Content"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationModalOptimized;