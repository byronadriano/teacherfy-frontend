// src/pages/LessonBuilder/index.js - OPTIMIZED with lazy loading for performance
import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

import Sidebar from '../../components/sidebar/Sidebar';
import FiltersBar from '../../components/filters/FiltersBar';
import CustomizationForm from '../../components/form/CustomizationForm';

import { useAuth } from '../../contexts/AuthContext'; // Use the context
import useForm from './hooks/useForm';
import useOutline from './hooks/useOutline';
import usePresentation from './hooks/usePresentation';
import { historyService } from '../../services';
import Logo from '../../assets/images/Teacherfyoai.png';

// Lazy load components that aren't immediately needed
const ConfirmationModal = lazy(() => import('../../components/modals/ConfirmationModal'));
const OutlineDisplay = lazy(() => import('./components/OutlineDisplay'));
// ResourceManager removed - always show content (OutlineDisplay)
const LoginModal = lazy(() => import('../../components/auth/LoginModal'));
const DebugPanel = lazy(() => import('../../components/debug/DebugPanel'));

const LessonBuilder = ({ onSidebarToggle, sidebarCollapsed }) => {
  // Auth context and login modal state
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // States
  const [userSettings, setUserSettings] = useState({
    defaultGrade: '',
    defaultSubject: '',
    defaultLanguage: '',
    defaultSlides: 5,
    alwaysIncludeImages: false
  });
  
  // Resource status tracking
  const [resourceStatus, setResourceStatus] = useState({});

  const {
    formState,
    uiState,
    contentState,
    setUiState,
    setContentState,
    handleFormChange,
    toggleExample,
    handleGenerateOutline,
    handleRegenerateOutline,
    resetForm,
    enhancedLoading
  } = useForm({
    token: user?.token,
    user,
    setShowSignInPrompt: () => setShowLoginModal(true) // Show login modal when auth required
  });

  const { isLoading: outlineLoading } = useOutline();

  const {
    isLoading: presentationLoading,
    googleSlidesState,
    subscriptionState,
    generateMultiResource,
    generateGoogleSlides,
  } = usePresentation({
    token: user?.token,
    user,
    isAuthenticated,
    setShowSignInPrompt: () => setShowLoginModal(true) // Show login modal when auth required
  });

  // Load user settings from session storage
  useEffect(() => {
    const savedSettings = sessionStorage.getItem('userSettings');
    if (savedSettings) {
      setUserSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Idle prefetch near-future chunks for faster interactions
  useEffect(() => {
    const idle = (cb) => (window.requestIdleCallback ? window.requestIdleCallback(cb, { timeout: 2000 }) : setTimeout(cb, 500));
    idle(() => {
      import(/* webpackPrefetch: true */ './components/OutlineDisplay');
      import(/* webpackPrefetch: true */ '../../components/modals/ConfirmationModal');
    });
  }, []);

  const handleSettingsChange = (newSettings) => {
    setUserSettings(newSettings);
    sessionStorage.setItem('userSettings', JSON.stringify(newSettings));
  };

  const handleInputChange = (e) => {
    handleFormChange('customPrompt', e.target.value);
  };

  // Invalidate generated blobs if core inputs or content change, to avoid stale downloads
  useEffect(() => {
    // Clear blobs but keep statuses so UI can regenerate
    setResourceStatus(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => {
        if (next[k]?.blob) {
          next[k] = { status: 'pending', message: '' };
        }
      });
      return next;
    });
  // Trigger on key inputs or when structured content changes
  }, [
    formState.lessonTopic,
    formState.gradeLevel,
    formState.subjectFocus,
    formState.language,
    formState.numSlides,
    formState.includeImages,
    formState.customPrompt,
    contentState.finalOutline,
    contentState.structuredContent
  ]);

  // Save lesson to history after successful generation
  const saveToHistory = useCallback(async () => {
    if (contentState.structuredContent?.length > 0) {
      try {
        console.log('💾 Saving lesson to history...');
        
        const cleanFormState = {
          // Support both resourceType (singular) and resourceTypes (plural) for multi-resource
          resourceType: formState.resourceType,
          resourceTypes: formState.resourceTypes,
          gradeLevel: formState.gradeLevel || '',
          subjectFocus: formState.subjectFocus || '',
          language: formState.language || '',
          lessonTopic: formState.lessonTopic || formState.subjectFocus || 'Untitled Lesson',
          numSlides: formState.numSlides || 5,
          includeImages: Boolean(formState.includeImages),
          customPrompt: formState.customPrompt || '',
          selectedStandards: Array.isArray(formState.selectedStandards) ? [...formState.selectedStandards] : []
        };
        
        const cleanGeneratedResources = {};
        
        if (contentState.generatedResources) {
          Object.entries(contentState.generatedResources).forEach(([type, content]) => {
            cleanGeneratedResources[type] = content.map(slide => {
              // Only save fields that actually exist and have content
              const cleanSlide = {
                title: slide.title || 'Untitled Slide',
                layout: slide.layout || 'TITLE_AND_CONTENT'
              };
              
              // Prioritize modern structure fields and avoid duplicates
              // For worksheets: prefer structured_activities over content
              if (slide.structured_activities && Array.isArray(slide.structured_activities) && slide.structured_activities.length > 0) {
                cleanSlide.structured_activities = [...slide.structured_activities];
              } else if (slide.exercises && Array.isArray(slide.exercises) && slide.exercises.length > 0) {
                cleanSlide.exercises = [...slide.exercises];
              } else if (!slide.structured_activities && !slide.exercises && slide.content && Array.isArray(slide.content) && slide.content.length > 0) {
                // Only save content if no modern worksheet fields exist
                cleanSlide.content = [...slide.content];
              }
              
              // For quizzes: prefer structured_questions over content
              if (slide.structured_questions && Array.isArray(slide.structured_questions) && slide.structured_questions.length > 0) {
                cleanSlide.structured_questions = [...slide.structured_questions];
              } else if (!slide.structured_questions && slide.content && Array.isArray(slide.content) && slide.content.length > 0) {
                // Only save content if no structured_questions exist
                cleanSlide.content = [...slide.content];
              }
              
              // For lesson plans: save all relevant fields
              if (slide.objectives && Array.isArray(slide.objectives) && slide.objectives.length > 0) {
                cleanSlide.objectives = [...slide.objectives];
              }
              if (slide.procedures && Array.isArray(slide.procedures) && slide.procedures.length > 0) {
                cleanSlide.procedures = [...slide.procedures];
              }
              if (slide.materials && Array.isArray(slide.materials) && slide.materials.length > 0) {
                cleanSlide.materials = [...slide.materials];
              }
              if (slide.activities && Array.isArray(slide.activities) && slide.activities.length > 0) {
                cleanSlide.activities = [...slide.activities];
              }
              
              // For presentations and general content: save content if no other specific fields
              if (!cleanSlide.structured_activities && !cleanSlide.structured_questions && !cleanSlide.objectives && 
                  slide.content && Array.isArray(slide.content) && slide.content.length > 0) {
                cleanSlide.content = [...slide.content];
              }
              
              // Always save teacher notes
              if (slide.teacher_notes && Array.isArray(slide.teacher_notes) && slide.teacher_notes.length > 0) {
                cleanSlide.teacher_notes = [...slide.teacher_notes];
              }
              
              return cleanSlide;
            });
          });
        }
        
        const cleanStructuredContent = contentState.structuredContent.map(slide => {
          // Only save fields that actually exist and have content, prioritizing modern structure
          const cleanSlide = {
            title: slide.title || 'Untitled Slide',
            layout: slide.layout || 'TITLE_AND_CONTENT'
          };
          
          // Prioritize modern structure fields and avoid duplicates
          // For worksheets: prefer structured_activities over content
          if (slide.structured_activities && Array.isArray(slide.structured_activities) && slide.structured_activities.length > 0) {
            cleanSlide.structured_activities = [...slide.structured_activities];
          } else if (slide.exercises && Array.isArray(slide.exercises) && slide.exercises.length > 0) {
            cleanSlide.exercises = [...slide.exercises];
          } else if (!slide.structured_activities && !slide.exercises && slide.content && Array.isArray(slide.content) && slide.content.length > 0) {
            // Only save content if no modern worksheet fields exist
            cleanSlide.content = [...slide.content];
          }
          
          // For quizzes: prefer structured_questions over content
          if (slide.structured_questions && Array.isArray(slide.structured_questions) && slide.structured_questions.length > 0) {
            cleanSlide.structured_questions = [...slide.structured_questions];
          } else if (!slide.structured_questions && slide.content && Array.isArray(slide.content) && slide.content.length > 0) {
            // Only save content if no structured_questions exist
            cleanSlide.content = [...slide.content];
          }
          
          // For lesson plans: save all relevant fields
          if (slide.objectives && Array.isArray(slide.objectives) && slide.objectives.length > 0) {
            cleanSlide.objectives = [...slide.objectives];
          }
          if (slide.procedures && Array.isArray(slide.procedures) && slide.procedures.length > 0) {
            cleanSlide.procedures = [...slide.procedures];
          }
          if (slide.materials && Array.isArray(slide.materials) && slide.materials.length > 0) {
            cleanSlide.materials = [...slide.materials];
          }
          if (slide.activities && Array.isArray(slide.activities) && slide.activities.length > 0) {
            cleanSlide.activities = [...slide.activities];
          }
          
          // For presentations and general content: save content if no other specific fields
          if (!cleanSlide.structured_activities && !cleanSlide.structured_questions && !cleanSlide.objectives && 
              slide.content && Array.isArray(slide.content) && slide.content.length > 0) {
            cleanSlide.content = [...slide.content];
          }
          
          // Always save teacher notes
          if (slide.teacher_notes && Array.isArray(slide.teacher_notes) && slide.teacher_notes.length > 0) {
            cleanSlide.teacher_notes = [...slide.teacher_notes];
          }
          
          return cleanSlide;
        });
        
        const enhancedContentState = {
          title: contentState.title,
          structuredContent: cleanStructuredContent,
          finalOutline: contentState.finalOutline || '',
          generatedResources: cleanGeneratedResources
        };
        
        const result = await historyService.trackLessonGeneration(cleanFormState, enhancedContentState);
        
        if (result.success) {
          console.log('✅ Lesson successfully saved to history with title:', contentState.title);
        } else {
          console.log('⚠️ History save had issues but continued:', result.error);
        }
      } catch (error) {
        console.error('❌ Error saving to history:', error);
        
        // Fallback to local history
        try {
          const lessonTitle = contentState.title || 
                            formState.lessonTopic || 
                            formState.subjectFocus || 
                            'Untitled Lesson';
          
          const localHistoryItem = {
            id: Date.now(),
            title: lessonTitle,
            types: Array.isArray(formState.resourceType) ? formState.resourceType : [formState.resourceType || 'Presentation'],
            date: 'Today',
            lessonData: {
              ...formState,
              generatedTitle: contentState.title,
              structuredContent: contentState.structuredContent,
              finalOutline: contentState.finalOutline,
              generatedResources: contentState.generatedResources
            }
          };
          
          historyService.saveLocalHistory(localHistoryItem);
          console.log('💾 Lesson saved to local history as fallback with title:', lessonTitle);
        } catch (localError) {
          console.error('❌ Failed to save to local history:', localError);
        }
      }
    }
  }, [formState, contentState]);

  // After outline is confirmed, save to history
  useEffect(() => {
    if (uiState.outlineConfirmed && contentState.structuredContent?.length > 0) {
      saveToHistory();
    }
  }, [uiState.outlineConfirmed, contentState.structuredContent, saveToHistory]);

  // Check if we should show the initial state (logo, title, form)
  const showInitialState = !uiState.outlineConfirmed || contentState.structuredContent.length === 0;

  // Communicate footer visibility to parent (App.js) via event
  useEffect(() => {
    const hideFooter = !showInitialState;
    window.dispatchEvent(new CustomEvent('footer-visibility', { detail: { hideFooter } }));
    // Keep sessionStorage as fallback for first paint
    sessionStorage.setItem('hideFooter', hideFooter.toString());
  }, [showInitialState]);

  // Handle history item selection
// Handle history item selection
  const handleHistoryItemSelect = (item) => {
    if (!item || !item.lessonData) {
      console.error('❌ Invalid history item selected:', item);
      return;
    }
    
    console.log('📂 Loading lesson from history:', item.title);
    
    try {
      const { lessonData } = item;
      
      // FIXED: Properly handle resourceType conversion to array format
      if (lessonData.resourceType) {
        let resourceType;
        if (Array.isArray(lessonData.resourceType)) {
          resourceType = lessonData.resourceType;
        } else if (typeof lessonData.resourceType === 'string') {
          resourceType = [lessonData.resourceType];
        } else {
          console.warn('⚠️ Unexpected resourceType format:', lessonData.resourceType);
          resourceType = ['Presentation']; // Default fallback
        }
        
        console.log('🔧 Setting resourceType to:', resourceType);
        handleFormChange('resourceType', resourceType);
      }
      
      // Set other form fields
      if (lessonData.gradeLevel) handleFormChange('gradeLevel', lessonData.gradeLevel);
      if (lessonData.subjectFocus) handleFormChange('subjectFocus', lessonData.subjectFocus);
      if (lessonData.language) handleFormChange('language', lessonData.language);
      if (lessonData.lessonTopic) handleFormChange('lessonTopic', lessonData.lessonTopic);
      if (lessonData.numSlides) handleFormChange('numSlides', lessonData.numSlides);
      if (lessonData.includeImages !== undefined) handleFormChange('includeImages', lessonData.includeImages);
      if (lessonData.customPrompt) handleFormChange('customPrompt', lessonData.customPrompt);
      if (lessonData.selectedStandards && Array.isArray(lessonData.selectedStandards)) {
        handleFormChange('selectedStandards', lessonData.selectedStandards);
      }
      
      // Prepare content update
      const contentUpdate = {
        title: lessonData.generatedTitle || item.title || 'Loaded Lesson',
        finalOutline: lessonData.finalOutline || ''
      };
      
      // Helper function to normalize content structure for different resource types
      const normalizeContentStructure = (content, resourceType) => {
        if (!Array.isArray(content)) return content;
        
        return content.map(section => {
          const normalizedSection = { ...section };
          
          // Handle content field normalization for different resource types
          if (resourceType === 'Worksheet') {
            if (section.content && !section.structured_activities && !section.exercises) {
              // Map content to structured_activities for worksheets that need it
              normalizedSection.structured_activities = [...section.content];
              delete normalizedSection.content; // Remove the duplicate content field
              console.log(`✅ FIXED: Mapped Worksheet "${section.title}" content → structured_activities (${section.content.length} items)`);
            } else if (section.structured_activities && section.content) {
              // Already has structured_activities, remove duplicate content field
              delete normalizedSection.content;
              console.log(`🧹 CLEANED: Removed duplicate content field from Worksheet "${section.title}"`);
            }
          } else if (resourceType === 'Quiz/Test' || resourceType === 'Quiz') {
            if (section.content && !section.structured_questions) {
              // Map content to structured_questions for quizzes that need it
              normalizedSection.structured_questions = [...section.content];
              delete normalizedSection.content; // Remove the duplicate content field
              console.log(`✅ FIXED: Mapped Quiz "${section.title}" content → structured_questions (${section.content.length} items)`);
            } else if (section.structured_questions && section.content) {
              // Already has structured_questions, remove duplicate content field
              delete normalizedSection.content;
              console.log(`🧹 CLEANED: Removed duplicate content field from Quiz "${section.title}"`);
            }
          }
          
          // Remove obsolete empty arrays that shouldn't exist
          const obsoleteFields = ['left_column', 'right_column', 'visual_elements'];
          obsoleteFields.forEach(field => {
            if (Array.isArray(normalizedSection[field]) && normalizedSection[field].length === 0) {
              delete normalizedSection[field];
            }
          });
          
          return normalizedSection;
        });
      };

      // Handle generated resources
      if (lessonData.generatedResources && typeof lessonData.generatedResources === 'object') {
        // Normalize each resource type's content
        const normalizedResources = {};
        Object.entries(lessonData.generatedResources).forEach(([resourceType, content]) => {
          normalizedResources[resourceType] = normalizeContentStructure(content, resourceType);
        });
        
        contentUpdate.generatedResources = normalizedResources;
        
        const primaryType = Object.keys(normalizedResources)[0];
        if (primaryType) {
          contentUpdate.structuredContent = normalizedResources[primaryType];
        }
      } else if (lessonData.structuredContent && Array.isArray(lessonData.structuredContent)) {
        // FIXED: Get resource type for backwards compatibility
        let resourceTypeForContent = 'Presentation'; // Default
        if (Array.isArray(lessonData.resourceType)) {
          resourceTypeForContent = lessonData.resourceType[0];
        } else if (typeof lessonData.resourceType === 'string') {
          resourceTypeForContent = lessonData.resourceType;
        }
        
        // Normalize the structured content
        const normalizedContent = normalizeContentStructure(lessonData.structuredContent, resourceTypeForContent);
        contentUpdate.structuredContent = normalizedContent;
        
        contentUpdate.generatedResources = {
          [resourceTypeForContent]: normalizedContent
        };
      }
      
      // Update content state
      setContentState(prev => ({
        ...prev,
        ...contentUpdate
      }));
      
      // Update UI state
      setUiState(prev => ({
        ...prev,
        outlineConfirmed: true,
        isLoading: false,
        error: ''
      }));
      
      console.log('✅ Lesson loaded from history with title:', contentUpdate.title);
    } catch (error) {
      console.error('❌ Error loading lesson from history:', error);
      setUiState(prev => ({
        ...prev,
        error: 'Failed to load lesson from history'
      }));
    }
  };
  
  const trackLessonInHistory = async () => {
    if (!contentState.structuredContent || contentState.structuredContent.length === 0) {
      return;
    }
    
    try {
      await historyService.trackLessonGeneration(formState, contentState);
      console.log('✅ Lesson tracked in history');
    } catch (error) {
      console.error('❌ Failed to track lesson in history:', error);
    }
  };

  const handleGenerateResource = async (specificResourceTypes = null) => {
    try {
      // If out of generations and not premium, block immediately
      if (!subscriptionState.isPremium && Number(subscriptionState.generationsLeft) <= 0) {
        setUiState(prev => ({ ...prev, error: 'You have reached your generation limit. Please try again after reset or upgrade to Premium.' }));
        return;
      }

      setUiState(prev => ({
        ...prev,
        isLoading: true
      }));
      
      // FIXED: Better handling of resource types from different sources
      let resourcesToGenerate;
      
      if (specificResourceTypes) {
        // Handle specificResourceTypes parameter
        if (Array.isArray(specificResourceTypes)) {
          resourcesToGenerate = specificResourceTypes;
        } else if (typeof specificResourceTypes === 'string') {
          resourcesToGenerate = [specificResourceTypes];
        } else {
          console.warn('⚠️ Unexpected specificResourceTypes format:', specificResourceTypes);
          resourcesToGenerate = ['Presentation'];
        }
      } else {
        // Get from form state
        if (Array.isArray(formState.resourceType)) {
          resourcesToGenerate = formState.resourceType;
        } else if (typeof formState.resourceType === 'string') {
          resourcesToGenerate = [formState.resourceType];
        } else {
          console.warn('⚠️ Unexpected formState.resourceType format:', formState.resourceType);
          resourcesToGenerate = ['Presentation'];
        }
      }
      
      console.log('🔧 handleGenerateResource processing:', {
        specificResourceTypes,
        'formState.resourceType': formState.resourceType,
        'final resourcesToGenerate': resourcesToGenerate
      });
      
      // Validate all resource types are strings
      resourcesToGenerate = resourcesToGenerate.map(type => {
        if (typeof type !== 'string') {
          console.warn('⚠️ Converting non-string resource type:', type);
          return String(type);
        }
        return type;
      });
      
      // Filter out resources that are already successfully generated
      // BUT: if specificResourceTypes is provided, always generate those (user explicitly requested)
      const pendingResources = specificResourceTypes 
        ? resourcesToGenerate  // Generate exactly what was requested, don't filter
        : resourcesToGenerate.filter(type => resourceStatus[type]?.status !== 'success');
      
      if (pendingResources.length === 0) {
        console.log('ℹ️ No new resources to generate, skipping API call');
        setUiState(prev => ({ ...prev, isLoading: false }));
        return;
      }
      
      // Update status to 'generating' for pending resources
      const newStatus = { ...resourceStatus };
      pendingResources.forEach(type => {
        newStatus[type] = { status: 'generating' };
      });
      setResourceStatus(newStatus);
      
      // Generate the resources
      const results = await generateMultiResource(formState, contentState, pendingResources);
      
      // Update status based on results
      const updatedStatus = { ...newStatus };
      Object.entries(results).forEach(([type, result]) => {
        if (result.error) {
          updatedStatus[type] = { 
            status: 'error', 
            message: result.error 
          };
        } else {
          updatedStatus[type] = { 
            status: 'success',
            blob: result.blob,
            contentType: result.contentType
          };
        }
      });
      setResourceStatus(updatedStatus);

      // Decrement generationsLeft for non-premium users on successful generations
      const successCount = Object.values(results).filter(r => r && !r.error).length;
      if (successCount > 0 && !subscriptionState.isPremium) {
        // Optimistic UI update; server should enforce as well
        // Note: usePresentation owns subscriptionState; we can't set it here directly.
        // Instead, reflect disabled state via remaining resources and updated UI errors.
      }
      
      // Save to history after successful generation
      saveToHistory();
    } catch (error) {
      console.error('❌ Error generating resources:', error);
      
      // Update error status for all resources we tried to generate
      const errorStatus = { ...resourceStatus };
      const resourcesToGenerate = specificResourceTypes 
        ? (Array.isArray(specificResourceTypes) ? specificResourceTypes : [specificResourceTypes])
        : (Array.isArray(formState.resourceType) ? formState.resourceType : [formState.resourceType]);
          
      resourcesToGenerate.forEach(type => {
        errorStatus[type] = { 
          status: 'error', 
          message: error.message || 'Failed to generate resource' 
        };
      });
      setResourceStatus(errorStatus);
      
      setUiState(prev => ({
        ...prev,
        error: error.message || 'Error generating resources. Please try again.'
      }));
    } finally {
      setUiState(prev => ({
        ...prev,
        isLoading: false
      }));
    }
  };

  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex',
      height: '100vh',
      bgcolor: '#ffffff',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <Sidebar
        defaultSettings={userSettings}
        onSettingsChange={handleSettingsChange}
        onLogoReset={resetForm}
        onHistoryItemSelect={handleHistoryItemSelect}
      />

      {/* Main Content */}
      <Box 
          component="main"
          sx={{ 
              marginLeft: '60px', // Fixed width for collapsed sidebar
              flex: 1,
              height: '100vh',
              display: 'flex', 
              flexDirection: 'column',
              position: 'relative',
              overflowY: 'auto',
              overflowX: 'hidden',
              // Add mobile-specific padding
              '@media (max-width: 600px)': {
                  paddingBottom: '20px', // Less bottom padding on mobile
                  height: 'calc(105vh - 20px)' // Account for any UI elements
              }
          }}
      >
        {/* Center all content vertically when no content is displayed */}
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: showInitialState ? 'center' : 'flex-start',
          minHeight: showInitialState ? '100%' : 'auto',
          width: '100%',
          pt: showInitialState ? { xs: 4, sm: 2, md: 0 } : { xs: 3, md: 4 }, // Increased mobile top padding to prevent logo cutoff
          pb: showInitialState ? { xs: '60px', sm: '80px', md: '120px' } : '40px', // Responsive bottom padding
        }}>
          {/* Content wrapper - centers horizontally */}
          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            maxWidth: '1200px',
            mx: 'auto',
            px: { xs: 2, sm: 4, md: 6 },
          }}>
            {/* Logo - Always visible but responsive to state */}
            <Box sx={{ 
              mb: showInitialState ? { xs: 3, sm: 3, md: 4 } : { xs: 2, sm: 2, md: 3 },
              mt: showInitialState ? { xs: 2, sm: 1, md: 0 } : { xs: 1, sm: 0, md: 0 }, // Extra top margin on mobile to prevent cutoff
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              px: { xs: 1, sm: 0 }
            }}>
              <Box
                component="img"
                src={Logo}
                alt="Teacherfy AI Logo"
                sx={{
                  // Larger sizes for better prominence and visibility
                  width: showInitialState 
                    ? { xs: '140px', sm: '160px', md: '180px' }
                    : { xs: '80px', sm: '90px', md: '100px' },
                  height: showInitialState 
                    ? { xs: '140px', sm: '160px', md: '180px' }
                    : { xs: '80px', sm: '90px', md: '100px' },
                  // Remove border radius to eliminate white box appearance
                  borderRadius: 0,
                  objectFit: 'contain',
                  maxWidth: '100%',
                  // Remove all shadows and backgrounds for clean blend
                  boxShadow: 'none',
                  backgroundColor: 'transparent',
                  transition: 'all 0.3s ease',
                  // Subtle hover effect without shadows
                  '&:hover': {
                    transform: 'scale(1.02)',
                    opacity: 0.9
                  }
                }}
              />
            </Box>

            {/* Initial State: Title + Form */}
            {showInitialState && (
              <>
                {/* Title */}
                <Typography 
                  variant="h1" 
                  sx={{ 
                    color: '#1e3a8a',
                    fontSize: { xs: '1.25rem', sm: '1.75rem', md: '2.25rem' },
                    fontWeight: '300',
                    textAlign: 'center',
                    mb: { xs: 2, sm: 3, md: 4 },
                    px: { xs: 1, sm: 0 }, // Add horizontal padding on mobile
                    lineHeight: { xs: 1.3, sm: 1.4 } // Better line height on mobile
                  }}
                >
                  What would you like to create?
                </Typography>
              </>
            )}

            {/* Form container - Always centered */}
            <Box sx={{
              width: '100%',
              maxWidth: '800px',
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              mb: contentState.structuredContent.length > 0 ? 4 : 0,
            }}>
              <FiltersBar 
                formState={formState}
                handleFormChange={handleFormChange}
              />

              <CustomizationForm 
                value={formState.customPrompt}
                onChange={handleInputChange}
                isExample={uiState.isExample}
                setIsExample={(isChecked) => toggleExample(isChecked)}
                onSubmit={handleGenerateOutline}
                isLoading={uiState.isLoading || outlineLoading}
                error={uiState.error}
                rateLimitInfo={uiState.rateLimitInfo}
                monthlyLimitInfo={uiState.monthlyLimitInfo} // Add monthly limit info
                subscriptionState={{
                  isPremium: subscriptionState.isPremium,
                  generationsLeft: subscriptionState.generationsLeft,
                  resetTime: subscriptionState.resetTime
                }}
                formState={formState} // Pass formState for resource type information
                enhancedLoading={enhancedLoading}
              />
            </Box>

            {/* Resource Manager and Content Display */}
            {contentState.structuredContent.length > 0 && (
              <>
                {/* Always show content (OutlineDisplay) - ResourceManager removed */}
                <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>}>
                  <OutlineDisplay
                    contentState={contentState}
                    uiState={{
                      ...uiState,
                      isLoading: presentationLoading
                    }}
                    subscriptionState={{
                      isPremium: subscriptionState.isPremium,
                      generationsLeft: subscriptionState.generationsLeft,
                      resetTime: subscriptionState.resetTime
                    }}
                    isAuthenticated={isAuthenticated}
                    googleSlidesState={googleSlidesState}
                    resourceStatus={resourceStatus}
                    onGeneratePresentation={(resourceType) => handleGenerateResource([resourceType])}
                    onGenerateGoogleSlides={() => generateGoogleSlides(formState, contentState)}
                    onRegenerateOutline={() => setUiState(prev => ({ 
                      ...prev, 
                      outlineModalOpen: true,
                      regenerationCount: prev.regenerationCount
                    }))}
                    onContentUpdate={(updatedResources, typeChanged) => {
                      setContentState(prev => ({
                        ...prev,
                        generatedResources: updatedResources,
                        structuredContent: updatedResources?.[typeChanged] || prev.structuredContent
                      }));
                      if (typeChanged) {
                        setResourceStatus(prev => ({
                          ...prev,
                          [typeChanged]: { status: 'pending', message: '' }
                        }));
                      }
                    }}
                  />
                </Suspense>
              </>
            )}
          </Box>
        </Box>

        {/* Auth Modal */}
        <Suspense fallback={null}>
          <LoginModal
            open={showLoginModal}
            onClose={() => setShowLoginModal(false)}
            onSuccess={() => {
              setShowLoginModal(false);
              // Auth context will automatically update after successful login
            }}
          />
        </Suspense>
        
        {/* Modals */}
        <Suspense fallback={null}>
          <ConfirmationModal 
            uiState={{
              ...uiState,
              isLoading: outlineLoading
            }}
            contentState={{
              outlineToConfirm: contentState.outlineToConfirm,
              structuredContent: contentState.structuredContent
            }}
            subscriptionState={{
              isPremium: subscriptionState.isPremium,
              generationsLeft: subscriptionState.generationsLeft,
              resetTime: subscriptionState.resetTime
            }}
            setUiState={setUiState}
            setContentState={setContentState}
            handleRegenerateOutline={handleRegenerateOutline}
            onGenerateResource={handleGenerateResource}
            onFinalize={trackLessonInHistory}
          />
        </Suspense>

        {process.env.NODE_ENV === 'development' && (
          <Suspense fallback={null}>
            <DebugPanel 
              contentState={contentState}
              uiState={{
                ...uiState,
                isLoading: outlineLoading || presentationLoading
              }}
            />
          </Suspense>
        )}
      </Box>
    </Box>
  );
};

export default LessonBuilder;