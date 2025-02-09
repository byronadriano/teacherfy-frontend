import React from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper
} from "@mui/material";
import { Download, Presentation } from 'lucide-react';

const OutlineDisplay = ({ 
  contentState,
  uiState,
  subscriptionState = { isPremium: false, downloadCount: 0 },
  isAuthenticated = false,
  googleSlidesState = { isGenerating: false }, // Add default value here
  onGeneratePresentation,
  onGenerateGoogleSlides
}) => {
  if (!uiState.outlineConfirmed) return null;

  return (
    <Box 
      sx={{ 
        width: '100%',
        maxWidth: '1000px',
        mx: 'auto',
        mt: 4
      }}
    >
      <Typography 
        variant="h1"
        sx={{ 
          fontWeight: '300',
          fontSize: { xs: '2rem', sm: '2.5rem' },
          color: '#1e3a8a',
          textAlign: 'center', 
          mb: 6
        }}
      >
        Look What You've Created!
      </Typography>

      <Paper
        elevation={0}
        sx={{ 
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          bgcolor: '#ffffff',
          overflow: 'hidden'
        }}
      >
        {/* Content Area */}
        <Box sx={{
          maxHeight: '600px',
          overflowY: 'auto',
          p: 4,
          '&::-webkit-scrollbar': {
            width: '8px'
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f5f9'
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#94a3b8',
            borderRadius: '4px'
          }
        }}>
          {contentState.structuredContent.map((slide, index) => (
            <Box 
              key={index} 
              sx={{ 
                mb: 4,
                '&:last-child': {
                  mb: 0
                }
              }}
            >
              <Typography
                sx={{
                  fontSize: '1.25rem',
                  fontWeight: 500,
                  color: '#1e293b',
                  mb: 2
                }}
              >
                Slide {index + 1}: {slide.title}
              </Typography>

              {/* Content Section */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#2563eb',
                    mb: 1
                  }}
                >
                  Content
                </Typography>
                {slide.content.map((item, i) => (
                  <Typography
                    key={i}
                    sx={{
                      fontSize: '0.875rem',
                      color: '#475569',
                      pl: 2,
                      mb: 0.75,
                      position: 'relative',
                      '&:before': {
                        content: '"•"',
                        position: 'absolute',
                        left: '4px'
                      }
                    }}
                  >
                    {item}
                  </Typography>
                ))}
              </Box>

              {/* Teacher Notes Section */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#2563eb',
                    mb: 1
                  }}
                >
                  Teacher Notes
                </Typography>
                {slide.teacher_notes.map((note, i) => (
                  <Typography
                    key={i}
                    sx={{
                      fontSize: '0.875rem',
                      color: '#475569',
                      pl: 2,
                      mb: 0.75,
                      position: 'relative',
                      '&:before': {
                        content: '"•"',
                        position: 'absolute',
                        left: '4px'
                      }
                    }}
                  >
                    {note}
                  </Typography>
                ))}
              </Box>

              {/* Visual Elements Section */}
              <Box>
                <Typography
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#2563eb',
                    mb: 1
                  }}
                >
                  Visual Elements
                </Typography>
                {slide.visual_elements.length > 0 ? (
                  slide.visual_elements.map((element, i) => (
                    <Typography
                      key={i}
                      sx={{
                        fontSize: '0.875rem',
                        color: '#475569',
                        pl: 2,
                        mb: 0.75,
                        position: 'relative',
                        '&:before': {
                          content: '"•"',
                          position: 'absolute',
                          left: '4px'
                        }
                      }}
                    >
                      {element}
                    </Typography>
                  ))
                ) : (
                  <Typography
                    sx={{
                      fontSize: '0.875rem',
                      color: '#94a3b8',
                      pl: 2,
                      fontStyle: 'italic'
                    }}
                  >
                    No visual elements specified
                  </Typography>
                )}
              </Box>

              {index < contentState.structuredContent.length - 1 && (
                <Box 
                  sx={{ 
                    my: 4,
                    borderBottom: '1px solid #e2e8f0'
                  }} 
                />
              )}
            </Box>
          ))}
        </Box>

        {/* Actions Area */}
        <Box 
          sx={{ 
            display: 'flex',
            gap: 2,
            p: 3,
            borderTop: '1px solid #e2e8f0',
            bgcolor: '#f8fafc'
          }}
        >
          <Button
            variant="contained"
            onClick={onGeneratePresentation}
            disabled={uiState.isLoading || (!subscriptionState.isPremium && subscriptionState.downloadCount >= 5)}
            startIcon={uiState.isLoading ? <CircularProgress size={20} /> : <Download size={18} />}
            sx={{
              bgcolor: '#2563eb',
              '&:hover': {
                bgcolor: '#1d4ed8'
              },
              '&:disabled': {
                bgcolor: '#94a3b8'
              },
              textTransform: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
              px: 3,
              py: 1.5,
              borderRadius: '8px'
            }}
          >
            {uiState.isLoading ? 'Generating...' : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Open in PowerPoint
                {!subscriptionState.isPremium && (
                  <Typography 
                    component="span"
                    sx={{ 
                      fontSize: '0.75rem',
                      opacity: 0.8,
                      ml: 1
                    }}
                  >
                    ({5 - subscriptionState.downloadCount} remaining)
                  </Typography>
                )}
              </Box>
            )}
          </Button>
          
          <Button
            variant="contained"
            onClick={onGenerateGoogleSlides}
            disabled={uiState.isLoading || googleSlidesState.isGenerating || !isAuthenticated}
            startIcon={googleSlidesState.isGenerating ? <CircularProgress size={20} /> : <Presentation size={18} />}
            sx={{
              bgcolor: '#dc2626',
              '&:hover': {
                bgcolor: '#b91c1c'
              },
              '&:disabled': {
                bgcolor: '#94a3b8'
              },
              textTransform: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
              px: 3,
              py: 1.5,
              borderRadius: '8px'
            }}
          >
            {googleSlidesState.isGenerating ? 'Generating...' : 
             !isAuthenticated ? 'Sign in for Google Slides' : 
             'Open in Google Slides'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default OutlineDisplay;