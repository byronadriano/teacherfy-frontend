import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  TextField,
  Paper,
  CircularProgress
} from "@mui/material";

const ConfirmationModal = ({ 
  uiState, 
  contentState,
  subscriptionState, 
  setUiState, 
  setContentState, 
  handleRegenerateOutline 
}) => {
  const [localModifiedPrompt, setLocalModifiedPrompt] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleModifiedPromptChange = (e) => {
    setLocalModifiedPrompt(e.target.value);
  };
  
  const handleRegenerateClick = async () => {
    if (!localModifiedPrompt.trim()) return;
    
    try {
      setIsRegenerating(true);
      setUiState(prev => ({
        ...prev,
        modifiedPrompt: localModifiedPrompt
      }));
      
      await handleRegenerateOutline();
    } catch (error) {
      console.error('Regeneration error:', error);
      setUiState(prev => ({
        ...prev,
        error: "Failed to regenerate outline. Please try again."
      }));
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleFinalize = () => {
    if (!contentState.structuredContent?.length) {
      setUiState(prev => ({
        ...prev,
        error: "No valid outline content to finalize"
      }));
      return;
    }
    
    console.log('Finalizing outline with structured content:', 
      contentState.structuredContent.map(slide => ({
        title: slide.title,
        layout: slide.layout,
        contentLength: slide.content?.length || 0
      }))
    );
    
    // Make a deep copy of structured content to avoid reference issues
    const validatedContent = contentState.structuredContent.map(slide => ({
      // Ensure all required fields exist with proper defaults
      title: slide.title || `Untitled Slide`,
      layout: slide.layout || 'TITLE_AND_CONTENT',
      content: Array.isArray(slide.content) ? [...slide.content] : [],
      teacher_notes: Array.isArray(slide.teacher_notes) ? [...slide.teacher_notes] : [],
      visual_elements: Array.isArray(slide.visual_elements) ? [...slide.visual_elements] : [],
      left_column: Array.isArray(slide.left_column) ? [...slide.left_column] : [],
      right_column: Array.isArray(slide.right_column) ? [...slide.right_column] : []
    }));
    
    // Ensure the data is properly set for the next step
    setContentState(prev => ({ 
      ...prev, 
      finalOutline: contentState.outlineToConfirm,
      structuredContent: validatedContent
    }));
    
    // Close the modal and update UI state
    setUiState(prev => ({ 
      ...prev, 
      outlineConfirmed: true,
      outlineModalOpen: false,
      isLoading: false
    }));
    
    console.log('Outline finalized and ready for presentation generation');
  };
  

  const handleClose = () => {
    setUiState(prev => ({ 
      ...prev, 
      outlineModalOpen: false,
      generateOutlineClicked: false,
      isLoading: false
    }));
  };

  return (
    <Dialog 
      open={uiState.outlineModalOpen} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Review and Modify Outline
          {uiState.regenerationCount > 0 && (
            <Typography variant="subtitle2" color="text.secondary">
              Regeneration attempts: {uiState.regenerationCount}/3
            </Typography>
          )}
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Generated Outline:
          </Typography>
          <Paper sx={{ 
            p: 2, 
            maxHeight: "400px", 
            overflowY: "auto",
            backgroundColor: "#fafafa" 
          }}>
            {contentState.structuredContent.map((slide, index) => (
              <Box key={index} sx={{ mb: index < contentState.structuredContent.length - 1 ? 4 : 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Slide {index + 1}: {slide.title}
                </Typography>

                {slide.content && slide.content.length > 0 && (
                  <>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2, color: '#1976d2' }}>
                      Content:
                    </Typography>
                    {slide.content.map((item, i) => (
                      <Typography key={i} sx={{ pl: 2, mb: 0.5 }}>
                        • {item}
                      </Typography>
                    ))}
                  </>
                )}

                {slide.teacher_notes && slide.teacher_notes.length > 0 && (
                  <>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2, color: '#1976d2' }}>
                      Teacher Notes:
                    </Typography>
                    {slide.teacher_notes.map((note, i) => (
                      <Typography key={i} sx={{ pl: 2, mb: 0.5 }}>
                        • {note}
                      </Typography>
                    ))}
                  </>
                )}

                {slide.visual_elements && (
                  <>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2, color: '#1976d2' }}>
                      Visual Elements:
                    </Typography>
                    {slide.visual_elements.length > 0 ? (
                      slide.visual_elements.map((element, i) => (
                        <Typography key={i} sx={{ pl: 2, mb: 0.5 }}>
                          • {element}
                        </Typography>
                      ))
                    ) : (
                      <Typography sx={{ pl: 2, mb: 0.5, fontStyle: 'italic' }}>
                        • (None provided)
                      </Typography>
                    )}
                  </>
                )}

                {index < contentState.structuredContent.length - 1 && (
                  <Box sx={{ my: 3, borderBottom: '1px solid #e0e0e0' }} />
                )}
              </Box>
            ))}
          </Paper>
        </Box>
        
        {uiState.regenerationCount < 3 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Want to modify the outline? Add your requirements:
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={localModifiedPrompt}
              onChange={handleModifiedPromptChange}
              placeholder="Enter additional requirements or modifications..."
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button 
          onClick={handleClose}
          color="inherit"
        >
          Cancel
        </Button>
        {uiState.regenerationCount < 3 && (
          <Button 
            onClick={handleRegenerateClick}
            disabled={!localModifiedPrompt.trim() || isRegenerating || (!subscriptionState.isPremium && subscriptionState.downloadCount >= 5)}
          >
            {isRegenerating ? <CircularProgress size={24} /> : "Regenerate Outline"}
          </Button>
        )}
        <Button 
          onClick={handleFinalize}
          variant="contained" 
          color="primary"
          disabled={isRegenerating}
        >
          Finalize Outline
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationModal;