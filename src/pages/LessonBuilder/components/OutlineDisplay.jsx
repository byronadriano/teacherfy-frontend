// src/pages/LessonBuilder/components/OutlineDisplay.jsx
import { useState, useRef } from 'react';
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
  
  if (!items || (!Array.isArray(items) && !isEditing)) return null;
  if (Array.isArray(items) && items.length === 0 && !isEditing) return null;
  
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
  subscriptionState = { isPremium: false, generationsLeft: 0 },
  isAuthenticated = false,
  googleSlidesState = { isGenerating: false },
  resourceStatus = {},
  onGeneratePresentation,
  onGenerateGoogleSlides,
  onRegenerateOutline,
  onContentUpdate
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const debugLogged = useRef(false);
  
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

  // Simplified debug logging - only show when loading problematic content
  if (process.env.NODE_ENV === 'development' && activeContent && activeContent.length > 0 && !debugLogged.current) {
    const hasExpectedStructure = activeResourceType === 'Worksheet' ? !!activeContent[0]?.structured_activities : 
                                 activeResourceType === 'Quiz/Test' ? !!activeContent[0]?.structured_questions :
                                 !!activeContent[0]?.content;
    
    // Only log if structure might be problematic
    if (!hasExpectedStructure) {
      console.log(`⚠️ ${activeResourceType} may need normalization:`, {
        sections: activeContent.length,
        firstSectionKeys: Object.keys(activeContent[0] || {}),
        hasExpectedStructure
      });
    }
    debugLogged.current = true;
  }

  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
  };

  const handleGenerateResource = () => {
    // Check if we have content but no blob (e.g., loaded from history)
    const hasContent = activeContent && activeContent.length > 0;
    const hasBlob = resourceStatus[activeResourceType]?.blob;
    const isSuccessStatus = resourceStatus[activeResourceType]?.status === 'success';
    
    if (hasContent && isSuccessStatus && hasBlob) {
      // We have a generated resource with blob - download it
      const blob = resourceStatus[activeResourceType].blob;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      
      const topicSlug = contentState.title 
        ? contentState.title.toLowerCase().replace(/[^a-z0-9]+/g, '_').substring(0, 30)
        : 'lesson';
        
      let fileExt = '.bin';
      if (activeResourceType === 'Presentation') fileExt = '.pptx';
      else fileExt = '.docx';
      
      a.download = `${topicSlug}_${activeResourceType.toLowerCase().replace(/[^a-z0-9]+/g, '_')}${fileExt}`;
      document.body.appendChild(a);
      a.click();
      
      // Use a longer timeout to ensure download completes
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 5000);
    } else {
      // Generate the resource (either new or re-generate for download)
      console.log(`🔄 Generating ${activeResourceType} for download`, {
        hasContent,
        hasBlob,
        isSuccessStatus,
        contentLength: activeContent?.length
      });
      onGeneratePresentation(activeResourceType);
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
    
  onContentUpdate(updatedResources, activeResourceType);
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
        Look What You've Created!
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
                // Debug logging only for first section and when there are issues
                if (process.env.NODE_ENV === 'development' && index === 0) {
                  const hasExpectedContent = 
                    (activeResourceType === 'Worksheet' && (item.structured_activities || item.exercises)) ||
                    (activeResourceType === 'Quiz/Test' && (item.structured_questions || item.content)) ||
                    (activeResourceType === 'Lesson Plan' && (item.objectives || item.procedures || item.content)) ||
                    (item.content);
                  
                  if (!hasExpectedContent) {
                    console.log(`⚠️ Missing expected content for ${activeResourceType}:`, Object.keys(item));
                  }
                }

                // Removed old checkContentDisplayed function - now using universal content display

                // Universal content display - automatically handles any JSON structure
                const availableContent = Object.entries(item).filter(([key, value]) => 
                  key !== 'title' && key !== 'layout' && Array.isArray(value) && value.length > 0
                );
                
                // Define field priorities and colors for better presentation
                const fieldConfig = {
                  // Primary content fields
                  'content': { title: 'Content', color: '#2563eb', priority: 1 },
                  'structured_questions': { title: 'Questions', color: '#2563eb', priority: 1 },
                  'structured_activities': { title: 'Activities', color: '#16a34a', priority: 1 },
                  'exercises': { title: 'Exercises', color: '#7c3aed', priority: 1 },
                  'problems': { title: 'Problems', color: '#dc2626', priority: 1 },
                  
                  // Learning structure fields
                  'objectives': { title: 'Learning Objectives', color: '#2563eb', priority: 2 },
                  'materials': { title: 'Materials Needed', color: '#dc2626', priority: 2 },
                  'procedures': { title: 'Procedures', color: '#9333ea', priority: 2 },
                  'procedure': { title: 'Procedure', color: '#9333ea', priority: 2 },
                  'activities': { title: 'Activities', color: '#16a34a', priority: 2 },
                  'assessment': { title: 'Assessment', color: '#f59e0b', priority: 2 },
                  'homework': { title: 'Homework/Extensions', color: '#7c3aed', priority: 2 },
                  'standards': { title: 'Standards Addressed', color: '#0284c7', priority: 2 },
                  
                  // Answer/response fields
                  'answers': { title: 'Answers', color: '#16a34a', priority: 3 },
                  'answer_key': { title: 'Answer Key', color: '#16a34a', priority: 3 },
                  
                  // Instructions and guidance
                  'instructions': { title: 'Instructions', color: '#0284c7', priority: 4 },
                  'teacher_notes': { title: 'Teacher Notes', color: '#16a34a', priority: 5 },
                  'differentiation_tips': { title: 'Differentiation Tips', color: '#f59e0b', priority: 5 }
                };
                
                // Sort content by priority and name
                const sortedContent = availableContent.sort(([keyA], [keyB]) => {
                  const priorityA = fieldConfig[keyA]?.priority || 99;
                  const priorityB = fieldConfig[keyB]?.priority || 99;
                  
                  if (priorityA !== priorityB) {
                    return priorityA - priorityB;
                  }
                  
                  return keyA.localeCompare(keyB);
                });
                
                if (sortedContent.length > 0) {
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
                      
                      {/* Display all available content fields */}
                      {sortedContent.map(([key, value]) => {
                        const config = fieldConfig[key] || { 
                          title: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '), 
                          color: '#6366f1' 
                        };
                        
                        // Smart item processing - handle objects or strings
                        const processedItems = value.map(v => {
                          if (typeof v === 'string') {
                            return v;
                          } else if (typeof v === 'object' && v !== null) {
                            // Extract meaningful content from objects
                            return v.question || v.prompt || v.text || v.description || v.name || v.activity || JSON.stringify(v);
                          } else {
                            return String(v);
                          }
                        });
                        
                        return (
                          <EditableContentSection
                            key={key}
                            title={config.title}
                            items={processedItems}
                            color={config.color}
                            onUpdate={handleContentUpdate}
                            sectionIndex={index}
                            sectionKey={key}
                          />
                        );
                      })}
                    </>
                  );
                }
                
                // Generic fallback content display if no specific content found
                return (
                  <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: '6px', border: '1px dashed #e2e8f0' }}>
                    <Typography sx={{ fontSize: '0.875rem', color: '#64748b', mb: 2, fontStyle: 'italic' }}>
                      No specific content structure found. Showing available data:
                    </Typography>
                    {Object.entries(item).map(([key, value]) => {
                      if (key === 'title' || !value) return null;
                      
                      if (Array.isArray(value) && value.length > 0) {
                        return (
                          <EditableContentSection
                            key={key}
                            title={key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}
                            items={value.map(v => typeof v === 'string' ? v : JSON.stringify(v))}
                            color="#6366f1"
                            onUpdate={handleContentUpdate}
                            sectionIndex={index}
                            sectionKey={key}
                          />
                        );
                      } else if (typeof value === 'string' && value.trim()) {
                        return (
                          <EditableContentSection
                            key={key}
                            title={key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}
                            items={[value]}
                            color="#6366f1"
                            onUpdate={handleContentUpdate}
                            sectionIndex={index}
                            sectionKey={key}
                          />
                        );
                      }
                      return null;
                    })}
                  </Box>
                );
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
          {/* Limit banner when disabled */}
          {!subscriptionState?.isPremium && Number(subscriptionState?.generationsLeft) <= 0 && (
            <Box sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              p: 1.5,
              border: '1px dashed #e2e8f0',
              borderRadius: '8px',
              bgcolor: '#fff',
              mb: { xs: 1, sm: 0 }
            }}>
              <Typography sx={{ fontSize: '0.85rem', color: '#475569' }}>
                You’ve reached your generation limit. Please wait for your limit to reset or upgrade for unlimited generations.
              </Typography>
            </Box>
          )}

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
            disabled={
              uiState.isLoading ||
              (!subscriptionState?.isPremium && Number(subscriptionState?.generationsLeft) <= 0) ||
              (resourceStatus[activeResourceType]?.status === 'generating')
            }
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
             (resourceStatus[activeResourceType]?.status === 'success' && resourceStatus[activeResourceType]?.blob) ? `Download ${activeResourceType === 'Presentation' ? '.pptx' : '.docx'}` : 
             activeContent && activeContent.length > 0 ? `Generate ${activeResourceType} for Download` :
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