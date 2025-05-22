// src/pages/LessonBuilder/index.js
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button } from '@mui/material';

import Sidebar from '../../components/sidebar/Sidebar';
import FiltersBar from '../../components/filters/FiltersBar';
import CustomizationForm from '../../components/form/CustomizationForm';
import SignInPrompt from '../../components/modals/SignInPrompt';
import UpgradeModal from '../../components/modals/UpgradeModal';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import OutlineDisplay from './components/OutlineDisplay';
import ResourceManager from './components/resources/ResourceManager';
import DebugPanel from '../../components/debug/DebugPanel';

import { useAuth } from '../../contexts/AuthContext';
import useForm from './hooks/useForm';
import useOutline from './hooks/useOutline';
import usePresentation from './hooks/usePresentation';
import { historyService } from '../../services';

const LessonBuilder = () => {
  // States
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [userSettings, setUserSettings] = useState({
    defaultGrade: '',
    defaultSubject: '',
    defaultLanguage: '',
    defaultSlides: 5,
    alwaysIncludeImages: false
  });
  
  // Resource status tracking
  const [resourceStatus, setResourceStatus] = useState({});
  const [showResourceManager, setShowResourceManager] = useState(false);

  // Use auth context instead of hook
  const { user, isAuthenticated, login, logout, isLoading: authLoading } = useAuth();

  const handleLoginSuccess = (credentialResponse) => {
    const credential = credentialResponse.credential;
    const userInfo = JSON.parse(atob(credential.split('.')[1]));
    login(userInfo, credential);
  };

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
    resetForm
  } = useForm({
    token: user?.token,
    user,
    setShowSignInPrompt: () => setUiState(prev => ({ ...prev, showSignInPrompt: true }))
  });

  const { isLoading: outlineLoading } = useOutline();

  const {
    isLoading: presentationLoading,
    googleSlidesState,
    subscriptionState,
    // generatePresentation,
    generateMultiResource, // New method for generating multiple resources
    generateGoogleSlides,
  } = usePresentation({
    token: user?.token,
    user,
    isAuthenticated,
    setShowSignInPrompt: () => setUiState(prev => ({ ...prev, showSignInPrompt: true }))
  });

  // Load user settings from session storage
  useEffect(() => {
    const savedSettings = sessionStorage.getItem('userSettings');
    if (savedSettings) {
      setUserSettings(JSON.parse(savedSettings));
    }

    // Restore sidebar collapsed state
    const storedSidebarState = localStorage.getItem('sidebarCollapsed') === 'true';
    setIsSidebarCollapsed(storedSidebarState);
  }, []);

  const handleSettingsChange = (newSettings) => {
    setUserSettings(newSettings);
    sessionStorage.setItem('userSettings', JSON.stringify(newSettings));
  };

  const handleInputChange = (e) => {
    handleFormChange('customPrompt', e.target.value);
  };

  // Toggle sidebar and persist state
  const toggleSidebar = () => {
    const newCollapsedState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newCollapsedState);
    localStorage.setItem('sidebarCollapsed', newCollapsedState.toString());
  };

  // Save lesson to history after successful generation
  const saveToHistory = useCallback(async () => {
    if (contentState.structuredContent?.length > 0) {
      try {
        console.log('Saving lesson to history...');
        
        // Create a clean version of the form state to save
        const cleanFormState = {
          resourceType: formState.resourceType,
          gradeLevel: formState.gradeLevel || '',
          subjectFocus: formState.subjectFocus || '',
          language: formState.language || '',
          lessonTopic: formState.lessonTopic || formState.subjectFocus || 'Untitled Lesson',
          numSlides: formState.numSlides || 5,
          includeImages: Boolean(formState.includeImages),
          customPrompt: formState.customPrompt || '',
          selectedStandards: Array.isArray(formState.selectedStandards) ? [...formState.selectedStandards] : []
        };
        
        // Create a clean version of the structured content and generatedResources
        const cleanGeneratedResources = {};
        
        // Clean up each resource type
        if (contentState.generatedResources) {
          Object.entries(contentState.generatedResources).forEach(([type, content]) => {
            cleanGeneratedResources[type] = content.map(slide => ({
              title: slide.title || 'Untitled Slide',
              layout: slide.layout || 'TITLE_AND_CONTENT',
              content: Array.isArray(slide.content) ? [...slide.content] : [],
              teacher_notes: Array.isArray(slide.teacher_notes) ? [...slide.teacher_notes] : [],
              visual_elements: Array.isArray(slide.visual_elements) ? [...slide.visual_elements] : [],
              left_column: Array.isArray(slide.left_column) ? [...slide.left_column] : [],
              right_column: Array.isArray(slide.right_column) ? [...slide.right_column] : []
            }));
          });
        }
        
        const cleanStructuredContent = contentState.structuredContent.map(slide => ({
          title: slide.title || 'Untitled Slide',
          layout: slide.layout || 'TITLE_AND_CONTENT',
          content: Array.isArray(slide.content) ? [...slide.content] : [],
          teacher_notes: Array.isArray(slide.teacher_notes) ? [...slide.teacher_notes] : [],
          visual_elements: Array.isArray(slide.visual_elements) ? [...slide.visual_elements] : [],
          left_column: Array.isArray(slide.left_column) ? [...slide.left_column] : [],
          right_column: Array.isArray(slide.right_column) ? [...slide.right_column] : []
        }));
        
        // NEW: Enhanced content state with title for tracking
        const enhancedContentState = {
          title: contentState.title,  // Include the generated title
          structuredContent: cleanStructuredContent,
          finalOutline: contentState.finalOutline || '',
          generatedResources: cleanGeneratedResources
        };
        
        // Use the trackLessonGeneration method with enhanced content state
        await historyService.trackLessonGeneration(cleanFormState, enhancedContentState);
        
        console.log('Lesson successfully saved to history with title:', contentState.title);
      } catch (error) {
        console.error('Error saving to history:', error);
        
        // If the server call fails, save directly to local storage
        try {
          // NEW: Use the generated title for local storage fallback
          const lessonTitle = contentState.title || 
                            formState.lessonTopic || 
                            formState.subjectFocus || 
                            'Untitled Lesson';
          
          const localHistoryItem = {
            id: Date.now(),
            title: lessonTitle,  // Use enhanced title
            types: Array.isArray(formState.resourceType) ? formState.resourceType : [formState.resourceType || 'Presentation'],
            date: 'Today',
            lessonData: {
              ...formState,
              generatedTitle: contentState.title,  // Include generated title
              structuredContent: contentState.structuredContent,
              finalOutline: contentState.finalOutline,
              generatedResources: contentState.generatedResources
            }
          };
          
          historyService.saveLocalHistory(localHistoryItem);
          console.log('Lesson saved to local history as fallback with title:', lessonTitle);
        } catch (localError) {
          console.error('Failed to save to local history:', localError);
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

  // Handle history item selection
  const handleHistoryItemSelect = (historyItem) => {
    // Check if the history item has valid lesson data
    if (!historyItem || !historyItem.lessonData) {
      console.error('Invalid history item selected:', historyItem);
      return;
    }
    
    console.log('Loading lesson from history:', historyItem.title);
    
    try {
      const { lessonData } = historyItem;
      
      // For resource type, handle both array and string formats
      if (lessonData.resourceType) {
        const resourceType = Array.isArray(lessonData.resourceType) 
          ? lessonData.resourceType 
          : (typeof lessonData.resourceType === 'string' ? [lessonData.resourceType] : []);
          
        handleFormChange('resourceType', resourceType, true);
      }
      
      // Handle other fields
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
      
      // Update content state with structured content
      const contentUpdate = {
        title: lessonData.generatedTitle || historyItem.title || 'Loaded Lesson',  // NEW: Use generated title
        finalOutline: lessonData.finalOutline || ''
      };
      
      // Handle both generatedResources and structuredContent
      if (lessonData.generatedResources && typeof lessonData.generatedResources === 'object') {
        contentUpdate.generatedResources = lessonData.generatedResources;
        
        // Get first resource type for structuredContent
        const primaryType = Object.keys(lessonData.generatedResources)[0];
        if (primaryType) {
          contentUpdate.structuredContent = lessonData.generatedResources[primaryType];
        }
      } else if (lessonData.structuredContent && Array.isArray(lessonData.structuredContent)) {
        contentUpdate.structuredContent = lessonData.structuredContent;
        // Create generatedResources with a single entry
        const resourceType = Array.isArray(lessonData.resourceType) 
          ? lessonData.resourceType[0] 
          : (lessonData.resourceType || 'Presentation');
          
        contentUpdate.generatedResources = {
          [resourceType]: lessonData.structuredContent
        };
      }
      
      setContentState(prev => ({
        ...prev,
        ...contentUpdate
      }));
      
      // Update UI state to show the loaded content
      setUiState(prev => ({
        ...prev,
        outlineConfirmed: true,
        isLoading: false,
        error: ''
      }));
      
      console.log('Lesson loaded from history with title:', contentUpdate.title);
    } catch (error) {
      console.error('Error loading lesson from history:', error);
      setUiState(prev => ({
        ...prev,
        error: 'Failed to load lesson from history'
      }));
    }
  };
  
  // Track lesson generation in history
  const trackLessonInHistory = async () => {
    if (!contentState.structuredContent || contentState.structuredContent.length === 0) {
      return;
    }
    
    try {
      await historyService.trackLessonGeneration(formState, contentState);
      console.log('Lesson tracked in history');
    } catch (error) {
      console.error('Failed to track lesson in history:', error);
      // Continue without failing the main flow
    }
  };

  // Handler for generating resources - can generate specific type or all
  const handleGenerateResource = async (specificResourceTypes = null) => {
    try {
      setUiState(prev => ({
        ...prev,
        isLoading: true
      }));
      
      // Only process resources that were explicitly selected
      const resourcesToGenerate = specificResourceTypes 
        ? (Array.isArray(specificResourceTypes) ? specificResourceTypes : [specificResourceTypes])
        : (Array.isArray(formState.resourceType) ? formState.resourceType : [formState.resourceType]);
      
      // Filter out already generated resources to avoid hitting the API unnecessarily
      const pendingResources = resourcesToGenerate.filter(type => 
        resourceStatus[type]?.status !== 'success'
      );
      
      if (pendingResources.length === 0) {
        console.log('No new resources to generate, skipping API call');
        setUiState(prev => ({ ...prev, isLoading: false }));
        return;
      }
      
      // Mark pending resources as generating
      const newStatus = { ...resourceStatus };
      pendingResources.forEach(type => {
        newStatus[type] = { status: 'generating' };
      });
      setResourceStatus(newStatus);
      
      // Only generate resources that need to be generated
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
      
      // Save to history after generation
      saveToHistory();
    } catch (error) {
      console.error('Error generating resources:', error);
      
      // Mark all resources as error
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
      
      // Set UI error
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
      overflow: 'hidden', // Hide overflow at the root level
      position: 'relative'
    }}>
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
        user={user}
        handleLogout={logout}
        handleLoginSuccess={handleLoginSuccess}
        defaultSettings={userSettings}
        onSettingsChange={handleSettingsChange}
        onLogoReset={resetForm}
        onHistoryItemSelect={handleHistoryItemSelect}
      />

      {/* Main Content - Single scrollable container */}
      <Box 
        component="main"
        sx={{ 
          marginLeft: isSidebarCollapsed ? '20px' : '240px',
          flex: 1,
          height: '100vh',
          transition: 'margin-left 0.3s ease',
          display: 'flex', 
          flexDirection: 'column',
          position: 'relative',
          overflowY: 'auto', // Only this should scroll
          overflowX: 'hidden',
          paddingBottom: '80px', // Add padding for footer
        }}
      >
        {/* Center all content vertically when no content is displayed */}
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: contentState.structuredContent.length > 0 ? 'flex-start' : 'center',
          minHeight: contentState.structuredContent.length > 0 ? 'auto' : '100%',
          width: '100%',
          pt: contentState.structuredContent.length > 0 ? { xs: 3, md: 4 } : 0,
        }}>
          {/* Content wrapper - centers horizontally */}
          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            maxWidth: '1200px',
            mx: 'auto', // Center horizontally
            px: { xs: 2, sm: 4, md: 6 },
          }}>
            {/* Title */}
            {!contentState.structuredContent.length > 0 && (
              <Typography 
                variant="h1" 
                sx={{ 
                  color: '#1e3a8a',
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                  fontWeight: '300',
                  textAlign: 'center',
                  mb: { xs: 3, sm: 4, md: 6 },
                }}
              >
                What would you like to create?
              </Typography>
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
              />
            </Box>

            {/* Resource Manager and Content Display */}
            {contentState.structuredContent.length > 0 && (
              <>
                {/* Toggle button between resources and content */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  mb: 3,
                  gap: 2
                }}>
                  <Button 
                    variant={showResourceManager ? "contained" : "outlined"}
                    onClick={() => setShowResourceManager(true)}
                    sx={{ 
                      minWidth: '150px',
                      textTransform: 'none'
                    }}
                  >
                    Manage Resources
                  </Button>
                  <Button 
                    variant={!showResourceManager ? "contained" : "outlined"}
                    onClick={() => setShowResourceManager(false)}
                    sx={{ 
                      minWidth: '150px',
                      textTransform: 'none'
                    }}
                  >
                    View Content
                  </Button>
                </Box>

                {/* Show either ResourceManager or OutlineDisplay based on state */}
                {showResourceManager ? (
                  <ResourceManager
                    formState={formState}
                    contentState={contentState}
                    resourceStatus={resourceStatus}
                    isLoading={presentationLoading}
                    onGenerateResource={handleGenerateResource}
                    downloadLimit={5}
                    isPremium={subscriptionState.isPremium}
                    downloadsRemaining={subscriptionState.isPremium ? 999 : (subscriptionState.downloadCount >= 5 ? 0 : 5 - subscriptionState.downloadCount)}
                  />
                ) : (
                  <OutlineDisplay
                    contentState={contentState}
                    uiState={{
                      ...uiState,
                      isLoading: presentationLoading
                    }}
                    subscriptionState={subscriptionState}
                    isAuthenticated={isAuthenticated}
                    googleSlidesState={googleSlidesState}
                    resourceStatus={resourceStatus}
                    onGeneratePresentation={() => handleGenerateResource()}
                    onGenerateGoogleSlides={() => generateGoogleSlides(formState, contentState)}
                    onRegenerateOutline={() => setUiState(prev => ({ 
                      ...prev, 
                      outlineModalOpen: true,
                      regenerationCount: prev.regenerationCount
                    }))}
                  />
                )}
              </>
            )}
          </Box>
        </Box>
        
        {/* Modals */}
        <SignInPrompt
          open={uiState.showSignInPrompt}
          onClose={() => setUiState(prev => ({ ...prev, showSignInPrompt: false }))}
          onSuccess={handleLoginSuccess}
        />

        <ConfirmationModal 
          uiState={{
            ...uiState,
            isLoading: outlineLoading
          }}
          contentState={{
            outlineToConfirm: contentState.outlineToConfirm,
            structuredContent: contentState.structuredContent
          }}
          subscriptionState={subscriptionState}
          setUiState={setUiState}
          setContentState={setContentState}
          handleRegenerateOutline={handleRegenerateOutline}
          handleDownload={handleGenerateResource}
          onFinalize={trackLessonInHistory}
        />

        <UpgradeModal 
          open={uiState.showUpgradeModal}
          onClose={() => setUiState(prev => ({ ...prev, showUpgradeModal: false }))}
        />

        {process.env.NODE_ENV === 'development' && (
          <DebugPanel 
            contentState={contentState}
            uiState={{
              ...uiState,
              isLoading: outlineLoading || presentationLoading
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default LessonBuilder;