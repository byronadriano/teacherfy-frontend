import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Tabs,
  Tab,
  Alert,
  AlertTitle
} from "@mui/material";
import { Download, Presentation, BookOpen, FileText, Check, RefreshCw } from 'lucide-react';

const ResourceIcon = ({ resourceType, size = 18 }) => {
  switch(resourceType) {
    case 'Presentation':
      return <Presentation size={size} />;
    case 'Lesson Plan':
      return <BookOpen size={size} />;
    case 'Quiz/Test':
      return <FileText size={size} />;
    case 'Worksheet':
      return <FileText size={size} />;
    default:
      return <FileText size={size} />;
  }
};

const OutlineDisplay = ({ 
  contentState,
  uiState,
  subscriptionState = { isPremium: false, downloadCount: 0 },
  isAuthenticated = false,
  googleSlidesState = { isGenerating: false },
  resourceStatus = {},
  onGeneratePresentation,
  onGenerateGoogleSlides,
  onRegenerateOutline
}) => {
  const [activeTab, setActiveTab] = useState(0);
  
  if (!uiState.outlineConfirmed) return null;

  // Get all resource types from the generated resources or fall back to the main content
  const resourceTypes = contentState.generatedResources 
    ? Object.keys(contentState.generatedResources) 
    : ['Presentation'];
    
  // Get the active resource type
  const activeResourceType = resourceTypes[activeTab] || 'Presentation';
  
  // Get content for the active resource
  const activeContent = contentState.generatedResources?.[activeResourceType] || 
                       contentState.structuredContent;

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleGenerateResource = () => {
    // Only generate if not already generated
    if (resourceStatus[activeResourceType]?.status !== 'success') {
      onGeneratePresentation(activeResourceType);
    } else {
      // If already generated, handle download
      if (resourceStatus[activeResourceType]?.blob) {
        const blob = resourceStatus[activeResourceType].blob;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        
        const topicSlug = contentState.lessonTopic 
          ? contentState.lessonTopic.toLowerCase().replace(/[^a-z0-9]+/g, '_').substring(0, 30)
          : 'lesson';
          
        let fileExt = '.bin';
        if (activeResourceType === 'Presentation') fileExt = '.pptx';
        else fileExt = '.docx';
        
        a.download = `${topicSlug}_${activeResourceType.toLowerCase()}${fileExt}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        // If blob not available, re-generate
        onGeneratePresentation(activeResourceType);
      }
    }
  };

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
          mb: 4
        }}
      >
        Your Resources Are Ready!
      </Typography>

      {/* Resource status notifications */}
      {Object.entries(resourceStatus).map(([resourceType, status]) => 
        status?.status === 'error' && (
          <Alert 
            key={resourceType}
            severity="error"
            sx={{ mb: 2 }}
          >
            <AlertTitle>Error Generating {resourceType}</AlertTitle>
            {status.message}
          </Alert>
        )
      )}

      {/* Tabs for different resource types */}
      {resourceTypes.length > 1 && (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            {resourceTypes.map((type, index) => (
              <Tab 
                key={type} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ResourceIcon resourceType={type} size={16} />
                    <span>{type}</span>
                    {resourceStatus[type]?.status === 'success' && (
                      <Check size={14} color="#16a34a" />
                    )}
                  </Box>
                } 
                sx={{ 
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}
              />
            ))}
          </Tabs>
        </Box>
      )}

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
          {activeContent.map((slide, index) => (
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
                {activeResourceType === 'Presentation' ? 'Slide' : 'Section'} {index + 1}: {slide.title}
              </Typography>

              {/* Instructions Section (for Worksheet) */}
              {activeResourceType === 'Worksheet' && slide.instructions && slide.instructions.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography
                    sx={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#2563eb',
                      mb: 1
                    }}
                  >
                    Instructions
                  </Typography>
                  {slide.instructions.map((item, i) => (
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
              )}

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
                {slide.content && slide.content.map((item, i) => (
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
              {slide.teacher_notes && slide.teacher_notes.length > 0 && (
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
              )}

              {/* Answers Section (for Quiz/Test) */}
              {activeResourceType === 'Quiz/Test' && slide.answers && slide.answers.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography
                    sx={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#2563eb',
                      mb: 1
                    }}
                  >
                    Answers
                  </Typography>
                  {slide.answers.map((item, i) => (
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
              )}

              {/* Visual Elements Section */}
              {slide.visual_elements && slide.visual_elements.length > 0 && (
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
                  {slide.visual_elements.map((element, i) => (
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
                  ))}
                </Box>
              )}

              {index < activeContent.length - 1 && (
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
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            p: 3,
            borderTop: '1px solid #e2e8f0',
            bgcolor: '#f8fafc'
          }}
        >
          <Button
            variant="outlined"
            onClick={onRegenerateOutline}
            startIcon={<RefreshCw size={18} />}
            sx={{
              textTransform: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
              px: 3,
              py: 1.5,
              borderRadius: '8px',
              flex: { xs: '1', sm: 'initial' }
            }}
          >
            Regenerate Content
          </Button>
          
          <Button
            variant="contained"
            onClick={handleGenerateResource}
            disabled={uiState.isLoading || (!subscriptionState.isPremium && subscriptionState.downloadCount >= 5) || (resourceStatus[activeResourceType]?.status === 'generating')}
            startIcon={uiState.isLoading || resourceStatus[activeResourceType]?.status === 'generating' ? <CircularProgress size={20} /> : <Download size={18} />}
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
              borderRadius: '8px',
              flex: { xs: '1', sm: 'initial' }
            }}
          >
            {uiState.isLoading || resourceStatus[activeResourceType]?.status === 'generating' ? 'Generating...' : 
             resourceStatus[activeResourceType]?.status === 'success' ? `Download ${activeResourceType === 'Presentation' ? '.pptx' : '.docx'}` : 
             `Generate ${activeResourceType}`}
          </Button>
          
          {activeResourceType === 'Presentation' && (
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
                borderRadius: '8px',
                flex: { xs: '1', sm: 'initial' }
              }}
            >
              {googleSlidesState.isGenerating ? 'Generating...' : 
               !isAuthenticated ? 'Sign in for Google Slides' : 
               'Open in Google Slides'}
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default OutlineDisplay;