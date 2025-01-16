import React from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import SlideshowIcon from '@mui/icons-material/Slideshow';

const OutlineDisplay = ({ 
  contentState,
  uiState,
  subscriptionState,
  isAuthenticated,
  googleSlidesState,
  onGeneratePresentation,
  onGenerateGoogleSlides
}) => {
  if (!uiState.outlineConfirmed) return null;

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3,
        border: '1px solid #e5e7eb',
        borderRadius: '8px'
      }}
    >
      <Box sx={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        mb: 2 
      }}>
        <Typography variant="h6" sx={{ 
                fontWeight: "200",
                fontSize: '2rem',
                color: '#111827',
                textAlign: 'center', // Center the text
                width: '100%' // Ensure the text takes the full width
        }}>
          Lesson Outline
        </Typography>
      </Box>

      <Box sx={{
        maxHeight: 500,
        overflowY: "auto",
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        p: 3,
        mb: 3,
        backgroundColor: "#f9fafb"
      }}>
        {contentState.structuredContent.map((slide, index) => (
          <Box key={index} sx={{ mb: index < contentState.structuredContent.length - 1 ? 4 : 0 }}>
            <Typography variant="h6" sx={{ 
              fontWeight: '600', 
              mb: 2,
              color: '#111827'
            }}>
              Slide {index + 1}: {slide.title}
            </Typography>

            <Typography variant="subtitle1" sx={{ 
              fontWeight: '600', 
              mt: 2,
              color: '#374151'
            }}>
              Content:
            </Typography>
            {slide.content.map((item, i) => (
              <Typography key={i} sx={{ 
                pl: 2, 
                mb: 0.5,
                color: '#4b5563'
              }}>
                • {item}
              </Typography>
            ))}

            <Typography variant="subtitle1" sx={{ 
              fontWeight: '600', 
              mt: 2,
              color: '#374151'
            }}>
              Teacher Notes:
            </Typography>
            {slide.teacher_notes.map((note, i) => (
              <Typography key={i} sx={{ 
                pl: 2, 
                mb: 0.5,
                color: '#4b5563'
              }}>
                • {note}
              </Typography>
            ))}

            <Typography variant="subtitle1" sx={{ 
              fontWeight: '600', 
              mt: 2,
              color: '#374151'
            }}>
              Visual Elements:
            </Typography>
            {slide.visual_elements.length > 0 ? (
              slide.visual_elements.map((element, i) => (
                <Typography key={i} sx={{ 
                  pl: 2, 
                  mb: 0.5,
                  color: '#4b5563'
                }}>
                  • {element}
                </Typography>
              ))
            ) : (
              <Typography sx={{ 
                pl: 2, 
                mb: 0.5,
                color: '#6b7280'
              }}>
                • (None provided)
              </Typography>
            )}

            {index < contentState.structuredContent.length - 1 && (
              <Box sx={{ 
                my: 3, 
                borderBottom: '1px solid #e5e7eb' 
              }} />
            )}
          </Box>
        ))}
      </Box>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          onClick={onGeneratePresentation}
          disabled={uiState.isLoading || (!subscriptionState.isPremium && subscriptionState.downloadCount >= 5)}
          startIcon={<DownloadIcon />}
          sx={{
            backgroundColor: "#2563eb",
            '&:hover': {
              backgroundColor: "#1d4ed8"
            },
            '&:disabled': {
              backgroundColor: "#9ca3af"
            }
          }}
        >
          {uiState.isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            <>
              Open in PowerPoint
              {!subscriptionState.isPremium && (
                <Typography 
                  variant="caption" 
                  sx={{ ml: 1, opacity: 0.8 }}
                >
                  ({5 - subscriptionState.downloadCount} remaining)
                </Typography>
              )}
            </>
          )}
        </Button>
        
        <Button
          variant="contained"
          onClick={onGenerateGoogleSlides}
          startIcon={<SlideshowIcon />}
          disabled={uiState.isLoading || googleSlidesState.isGenerating || !isAuthenticated}
          sx={{
            backgroundColor: "#dc2626",
            '&:hover': {
              backgroundColor: "#b91c1c"
            },
            '&:disabled': {
              backgroundColor: "#9ca3af"
            }
          }}
        >
          {googleSlidesState.isGenerating ? (
            <CircularProgress size={24} color="inherit" />
          ) : !isAuthenticated ? (
            "Sign in for Google Slides"
          ) : (
            "Open in Google Slides"
          )}
        </Button>
      </Box>
    </Paper>
  );
};

export default OutlineDisplay;