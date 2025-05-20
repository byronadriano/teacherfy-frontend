// src/pages/LessonBuilder/components/OutlineDisplay.jsx
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
  AlertTitle,
  TextField,
  IconButton
} from "@mui/material";
import { 
  Download, 
  Presentation, 
  BookOpen, 
  FileText, 
  FileQuestion,
  Check, 
  RefreshCw,
  Edit,
  Save,
  Plus,
  Trash2
} from 'lucide-react';

// Helper component for editable content sections
const EditableContentSection = ({ 
  title, 
  items = [], 
  color = '#2563eb', 
  onUpdate,
  sectionIndex,
  sectionKey
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localItems, setLocalItems] = useState([...items]);
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleSave = () => {
    setIsEditing(false);
    if (onUpdate) {
      onUpdate(sectionIndex, sectionKey, localItems);
    }
  };
  
  const handleItemChange = (index, value) => {
    const newItems = [...localItems];
    newItems[index] = value;
    setLocalItems(newItems);
  };
  
  const handleAddItem = () => {
    setLocalItems([...localItems, '']);
  };
  
  const handleRemoveItem = (index) => {
    const newItems = [...localItems];
    newItems.splice(index, 1);
    setLocalItems(newItems);
  };
  
  if (!items || (items.length === 0 && !isEditing)) return null;
  
  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 1
      }}>
        <Typography
          sx={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: color,
          }}
        >
          {title}
        </Typography>
        
        <Button
          size="small"
          startIcon={isEditing ? <Save size={16} /> : <Edit size={16} />}
          onClick={isEditing ? handleSave : handleEdit}
          sx={{ 
            minWidth: 0, 
            p: 0.5,
            textTransform: 'none'
          }}
        >
          {isEditing ? 'Save' : 'Edit'}
        </Button>
      </Box>
      
      {isEditing ? (
        <Box sx={{ pl: 2 }}>
          {localItems.map((item, i) => (
            <Box key={i} sx={{ display: 'flex', mb: 1, gap: 1 }}>
              <TextField
                fullWidth
                value={item}
                onChange={(e) => handleItemChange(i, e.target.value)}
                variant="outlined"
                size="small"
              />
              <IconButton 
                onClick={() => handleRemoveItem(i)}
                size="small"
                sx={{ color: '#ef4444' }}
              >
                <Trash2 size={16} />
              </IconButton>
            </Box>
          ))}
          
          <Button
            startIcon={<Plus size={16} />}
            onClick={handleAddItem}
            size="small"
            sx={{ mt: 1, textTransform: 'none' }}
          >
            Add Item
          </Button>
        </Box>
      ) : (
        localItems.map((item, i) => (
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
        ))
      )}
    </Box>
  );
};


const ResourceIcon = ({ resourceType, size = 18 }) => {
  switch(resourceType) {
    case 'Presentation':
      return <Presentation size={size} />;
    case 'Lesson Plan':
      return <BookOpen size={size} />;
    case 'Quiz/Test':
      return <FileQuestion size={size} />;
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
  onRegenerateOutline,
  onContentUpdate
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
        
        // Use a longer timeout to ensure download completes
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }, 5000);
      } else {
        // If blob not available, re-generate
        onGeneratePresentation(activeResourceType);
      }
    }
  };

  // Handler for updating content sections
  const handleContentUpdate = (itemIndex, sectionKey, newItems) => {
    if (!onContentUpdate) return;
    
    const updatedContent = [...activeContent];
    updatedContent[itemIndex] = {
      ...updatedContent[itemIndex],
      [sectionKey]: newItems
    };
    
    const updatedResources = {
      ...contentState.generatedResources,
      [activeResourceType]: updatedContent
    };
    
    onContentUpdate(updatedResources);
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
          {activeContent.map((item, index) => (
            <Box 
              key={index} 
              sx={{ 
                mb: 4,
                p: 3,
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
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
                  mb: 2,
                  pb: 2,
                  borderBottom: '1px solid #f1f5f9'
                }}
              >
                {activeResourceType === 'Presentation' ? 'Slide' : 'Section'} {index + 1}: {item.title}
              </Typography>

              {/* Resource-specific sections based on type */}
              {(() => {
                // Different display based on resource type
                switch(activeResourceType) {
                  case 'Worksheet':
                    return (
                      <>
                        {/* Instructions Section */}
                        {item.instructions && item.instructions.length > 0 && (
                          <EditableContentSection
                            title="Instructions"
                            items={item.instructions}
                            color="#0284c7"
                            onUpdate={handleContentUpdate}
                            sectionIndex={index}
                            sectionKey="instructions"
                          />
                        )}
                        
                        {/* Questions/Content Section */}
                        <EditableContentSection
                          title="Questions"
                          items={item.content}
                          color="#2563eb"
                          onUpdate={handleContentUpdate}
                          sectionIndex={index}
                          sectionKey="content"
                        />
                      </>
                    );
                    
                  case 'Quiz/Test':
                    return (
                      <>
                        {/* Questions Section */}
                        <EditableContentSection
                          title="Questions"
                          items={item.content}
                          color="#2563eb"
                          onUpdate={handleContentUpdate}
                          sectionIndex={index}
                          sectionKey="content"
                        />
                        
                        {/* Answers Section */}
                        {item.answers && (
                          <EditableContentSection
                            title="Answers"
                            items={item.answers}
                            color="#16a34a"
                            onUpdate={handleContentUpdate}
                            sectionIndex={index}
                            sectionKey="answers"
                          />
                        )}
                      </>
                    );
                    
                  case 'Lesson Plan':
                    return (
                      <>
                        {/* Duration if available */}
                        {item.duration && (
                          <Typography
                            sx={{
                              fontSize: '0.875rem',
                              fontWeight: 600,
                              color: '#7c3aed',
                              mb: 2
                            }}
                          >
                            Duration: {item.duration}
                          </Typography>
                        )}
                        
                        {/* Content Section */}
                        <EditableContentSection
                          title="Content"
                          items={item.content}
                          color="#2563eb"
                          onUpdate={handleContentUpdate}
                          sectionIndex={index}
                          sectionKey="content"
                        />
                        
                        {/* Procedure Section */}
                        {item.procedure && (
                          <EditableContentSection
                            title="Procedure"
                            items={item.procedure}
                            color="#9333ea"
                            onUpdate={handleContentUpdate}
                            sectionIndex={index}
                            sectionKey="procedure"
                          />
                        )}
                        
                        {/* Teacher Notes Section */}
                        {item.teacher_notes && (
                          <EditableContentSection
                            title="Teacher Notes"
                            items={item.teacher_notes}
                            color="#16a34a"
                            onUpdate={handleContentUpdate}
                            sectionIndex={index}
                            sectionKey="teacher_notes"
                          />
                        )}
                      </>
                    );
                    
                  default: // Presentation or fallback
                    return (
                      <>
                        {/* Content Section */}
                        <EditableContentSection
                          title="Content"
                          items={item.content}
                          color="#2563eb"
                          onUpdate={handleContentUpdate}
                          sectionIndex={index}
                          sectionKey="content"
                        />
                        
                        {/* For backward compatibility */}
                        {item.teacher_notes && item.teacher_notes.length > 0 && (
                          <EditableContentSection
                            title="Teacher Notes"
                            items={item.teacher_notes}
                            color="#16a34a"
                            onUpdate={handleContentUpdate}
                            sectionIndex={index}
                            sectionKey="teacher_notes"
                          />
                        )}
                        
                        {item.visual_elements && item.visual_elements.length > 0 && (
                          <EditableContentSection
                            title="Visual Elements"
                            items={item.visual_elements}
                            color="#f59e0b"
                            onUpdate={handleContentUpdate}
                            sectionIndex={index}
                            sectionKey="visual_elements"
                          />
                        )}
                      </>
                    );
                }
              })()}
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