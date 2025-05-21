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
  handleRegenerateOutline,
  handleDownload,
  onFinalize  // This prop is crucial for tracking
}) => {
  const [localModifiedPrompt, setLocalModifiedPrompt] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);

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

  const handleFinalize = async () => {
    if (!contentState.structuredContent?.length) {
      setUiState(prev => ({
        ...prev,
        error: "No valid outline content to finalize"
      }));
      return;
    }
    
    setIsFinalizing(true);
    console.log('Finalizing outline with structured content:', 
      contentState.structuredContent.map(slide => ({
        title: slide.title,
        layout: slide.layout,
        contentLength: slide.content?.length || 0
      }))
    );
    
    try {
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
      
      // Ensure consistent data: use the same formatted outline for both properties
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
      
      // Call the tracking function
      if (onFinalize) {
        try {
          await onFinalize();
          console.log('Lesson tracked in history successfully');
        } catch (error) {
          console.error('Error tracking lesson in history:', error);
          // Continue even if tracking fails
        }
      }
    } catch (error) {
      console.error('Error finalizing outline:', error);
      setUiState(prev => ({
        ...prev,
        error: "Failed to finalize outline. Please try again."
      }));
    } finally {
      setIsFinalizing(false);
    }
  };

  const handleClose = () => {
    setUiState(prev => ({ 
      ...prev, 
      outlineModalOpen: false,
      generateOutlineClicked: false,
      isLoading: false
    }));
  };

  // Helper function to render resource-specific sections
  // const renderResourceContent = (item, resourceType) => {
  //   // Normalize resource type name
  //   const type = resourceType?.toLowerCase() || '';
    
  //   switch(true) {
  //     case type.includes('quiz') || type.includes('test'):
  //       return (
  //         <>
  //           <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2, color: '#1976d2' }}>
  //             Questions:
  //           </Typography>
  //           {item.content && item.content.map((question, i) => (
  //             <Typography key={i} sx={{ pl: 2, mb: 0.5 }}>
  //               • {question}
  //             </Typography>
  //           ))}
            
  //           {item.answers && item.answers.length > 0 && (
  //             <>
  //               <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2, color: '#1976d2' }}>
  //                 Answers:
  //               </Typography>
  //               {item.answers.map((answer, i) => (
  //                 <Typography key={i} sx={{ pl: 2, mb: 0.5 }}>
  //                   • {answer}
  //                 </Typography>
  //               ))}
  //             </>
  //           )}
  //         </>
  //       );
        
  //     case type.includes('worksheet'):
  //       return (
  //         <>
  //           {item.instructions && item.instructions.length > 0 && (
  //             <>
  //               <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2, color: '#1976d2' }}>
  //                 Instructions:
  //               </Typography>
  //               {item.instructions.map((instruction, i) => (
  //                 <Typography key={i} sx={{ pl: 2, mb: 0.5 }}>
  //                   • {instruction}
  //                 </Typography>
  //               ))}
  //             </>
  //           )}
            
  //           <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2, color: '#1976d2' }}>
  //             Content:
  //           </Typography>
  //           {item.content && item.content.map((content, i) => (
  //             <Typography key={i} sx={{ pl: 2, mb: 0.5 }}>
  //               • {content}
  //             </Typography>
  //           ))}
  //         </>
  //       );
        
  //     case type.includes('lesson'):
  //       return (
  //         <>
  //           {item.duration && (
  //             <Typography sx={{ fontWeight: 'bold', mt: 2, color: '#7c3aed' }}>
  //               Duration: {item.duration}
  //             </Typography>
  //           )}
            
  //           <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2, color: '#1976d2' }}>
  //             Content:
  //           </Typography>
  //           {item.content && item.content.map((content, i) => (
  //             <Typography key={i} sx={{ pl: 2, mb: 0.5 }}>
  //               • {content}
  //             </Typography>
  //           ))}
            
  //           {item.procedure && item.procedure.length > 0 && (
  //             <>
  //               <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2, color: '#1976d2' }}>
  //                 Procedure:
  //               </Typography>
  //               {item.procedure.map((step, i) => (
  //                 <Typography key={i} sx={{ pl: 2, mb: 0.5 }}>
  //                   • {step}
  //                 </Typography>
  //               ))}
  //             </>
  //           )}
            
  //           {item.teacher_notes && item.teacher_notes.length > 0 && (
  //             <>
  //               <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2, color: '#16a34a' }}>
  //                 Teacher Notes:
  //               </Typography>
  //               {item.teacher_notes.map((note, i) => (
  //                 <Typography key={i} sx={{ pl: 2, mb: 0.5 }}>
  //                   • {note}
  //                 </Typography>
  //               ))}
  //             </>
  //           )}
  //         </>
  //       );
        
  //     // Default case for presentations or anything else
  //     default:
  //       return (
  //         <>
  //           <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2, color: '#1976d2' }}>
  //             Content:
  //           </Typography>
  //           {item.content && item.content.map((content, i) => (
  //             <Typography key={i} sx={{ pl: 2, mb: 0.5 }}>
  //               • {content}
  //             </Typography>
  //           ))}
            
  //           {item.teacher_notes && item.teacher_notes.length > 0 && (
  //             <>
  //               <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2, color: '#16a34a' }}>
  //                 Teacher Notes:
  //               </Typography>
  //               {item.teacher_notes.map((note, i) => (
  //                 <Typography key={i} sx={{ pl: 2, mb: 0.5 }}>
  //                   • {note}
  //                 </Typography>
  //               ))}
  //             </>
  //           )}
  //         </>
  //       );
  //   }
  // };

  // Determine primary resource type (for display purposes)
  const getPrimaryResourceType = () => {
    // Check if resource type exists in form state
    const resourceType = Array.isArray(uiState.resourceType) 
      ? uiState.resourceType[0] 
      : uiState.resourceType;
    
    // Handle special cases
    if (resourceType?.toLowerCase().includes('quiz') || 
        resourceType?.toLowerCase().includes('test')) {
      return 'Quiz/Test';
    }
    
    if (resourceType?.toLowerCase().includes('worksheet')) {
      return 'Worksheet';
    }
    
    if (resourceType?.toLowerCase().includes('lesson')) {
      return 'Lesson Plan';
    }
    
    return 'Presentation';
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
            {contentState.structuredContent.map((item, index) => (
              <Box key={index} sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  {getPrimaryResourceType() === 'Presentation' ? 'Slide' : 'Section'} {index + 1}: {item.title}
                </Typography>
                
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#2563eb', mb: 1 }}>
                  Content:
                </Typography>
                {item.content && item.content.map((content, i) => (
                  <Typography key={i} sx={{ pl: 2, mb: 0.5 }}>
                    • {content}
                  </Typography>
                ))}
                
                {item.teacher_notes && item.teacher_notes.length > 0 && (
                  <>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#16a34a', mt: 2, mb: 1 }}>
                      Teacher Notes:
                    </Typography>
                    {item.teacher_notes.map((note, i) => (
                      <Typography key={i} sx={{ pl: 2, mb: 0.5 }}>
                        • {note}
                      </Typography>
                    ))}
                  </>
                )}
                
                {item.visual_elements && item.visual_elements.length > 0 && (
                  <>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#f59e0b', mt: 2, mb: 1 }}>
                      Visual Elements:
                    </Typography>
                    {item.visual_elements.map((element, i) => (
                      <Typography key={i} sx={{ pl: 2, mb: 0.5 }}>
                        • {element}
                      </Typography>
                    ))}
                  </>
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
          disabled={isFinalizing}
        >
          Cancel
        </Button>
        {uiState.regenerationCount < 3 && (
          <Button 
            onClick={handleRegenerateClick}
            disabled={!localModifiedPrompt.trim() || isRegenerating || isFinalizing || (!subscriptionState.isPremium && subscriptionState.downloadCount >= 5)}
          >
            {isRegenerating ? <CircularProgress size={24} /> : "Regenerate Outline"}
          </Button>
        )}
        <Button 
          onClick={handleFinalize}
          variant="contained" 
          color="primary"
          disabled={isRegenerating || isFinalizing}
        >
          {isFinalizing ? <CircularProgress size={24} /> : "Finalize Outline"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationModal;