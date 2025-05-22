// src/pages/LessonBuilder/index.js - Updated with logo and clean footer logic
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
import Logo from '../../assets/images/Teacherfyoai.png';

const LessonBuilder = ({ onSidebarToggle, sidebarCollapsed }) => {
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
    generateMultiResource,
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
  }, []);

  const handleSettingsChange = (newSettings) => {
    setUserSettings(newSettings);
    sessionStorage.setItem('userSettings', JSON.stringify(newSettings));
  };

  const handleInputChange = (e) => {
    handleFormChange('customPrompt', e.target.value);
  };

  // Save lesson to history after successful generation
  const saveToHistory = useCallback(async () => {
    if (contentState.structuredContent?.length > 0) {
      try {
        console.log('Saving lesson to history...');
        
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
        
        const cleanGeneratedResources = {};
        
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
        
        const enhancedContentState = {
          title: contentState.title,
          structuredContent: cleanStructuredContent,
          finalOutline: contentState.finalOutline || '',
          generatedResources: cleanGeneratedResources
        };
        
        await historyService.trackLessonGeneration(cleanFormState, enhancedContentState);
        
        console.log('Lesson successfully saved to history with title:', contentState.title);
      } catch (error) {
        console.error('Error saving to history:', error);
        
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

  // Check if we should show the initial state (logo, title, form)
  const showInitialState = !uiState.outlineConfirmed || contentState.structuredContent.length === 0;

  // Communicate footer visibility to parent (App.js)
  useEffect(() => {
    // Set a flag in sessionStorage that App.js can read
    sessionStorage.setItem('hideFooter', (!showInitialState).toString());
  }, [showInitialState]);

  // Handle history item selection
  const handleHistoryItemSelect = (historyItem) => {
    if (!historyItem || !historyItem.lessonData) {
      console.error('Invalid history item selected:', historyItem);
      return;
    }
    
    console.log('Loading lesson from history:', historyItem.title);
    
    try {
      const { lessonData } = historyItem;
      
      if (lessonData.resourceType) {
        const resourceType = Array.isArray(lessonData.resourceType) 
          ? lessonData.resourceType 
          : (typeof lessonData.resourceType === 'string' ? [lessonData.resourceType] : []);
          
        handleFormChange('resourceType', resourceType, true);
      }
      
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
      
      const contentUpdate = {
        title: lessonData.generatedTitle || historyItem.title || 'Loaded Lesson',
        finalOutline: lessonData.finalOutline || ''
      };
      
      if (lessonData.generatedResources && typeof lessonData.generatedResources === 'object') {
        contentUpdate.generatedResources = lessonData.generatedResources;
        
        const primaryType = Object.keys(lessonData.generatedResources)[0];
        if (primaryType) {
          contentUpdate.structuredContent = lessonData.generatedResources[primaryType];
        }
      } else if (lessonData.structuredContent && Array.isArray(lessonData.structuredContent)) {
        contentUpdate.structuredContent = lessonData.structuredContent;
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
  
  const trackLessonInHistory = async () => {
    if (!contentState.structuredContent || contentState.structuredContent.length === 0) {
      return;
    }
    
    try {
      await historyService.trackLessonGeneration(formState, contentState);
      console.log('Lesson tracked in history');
    } catch (error) {
      console.error('Failed to track lesson in history:', error);
    }
  };

  const handleGenerateResource = async (specificResourceTypes = null) => {
    try {
      setUiState(prev => ({
        ...prev,
        isLoading: true
      }));
      
      const resourcesToGenerate = specificResourceTypes 
        ? (Array.isArray(specificResourceTypes) ? specificResourceTypes : [specificResourceTypes])
        : (Array.isArray(formState.resourceType) ? formState.resourceType : [formState.resourceType]);
      
      const pendingResources = resourcesToGenerate.filter(type => 
        resourceStatus[type]?.status !== 'success'
      );
      
      if (pendingResources.length === 0) {
        console.log('No new resources to generate, skipping API call');
        setUiState(prev => ({ ...prev, isLoading: false }));
        return;
      }
      
      const newStatus = { ...resourceStatus };
      pendingResources.forEach(type => {
        newStatus[type] = { status: 'generating' };
      });
      setResourceStatus(newStatus);
      
      const results = await generateMultiResource(formState, contentState, pendingResources);
      
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
      
      saveToHistory();
    } catch (error) {
      console.error('Error generating resources:', error);
      
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
        user={user}
        handleLogout={logout}
        handleLoginSuccess={handleLoginSuccess}
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
          pt: showInitialState ? 0 : { xs: 3, md: 4 },
          pb: showInitialState ? '120px' : '40px', // Extra padding for footer only in initial state
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
            {/* Initial State: Logo + Title + Form */}
            {showInitialState && (
              <>
                {/* Logo - Perplexity style */}
                <Box sx={{ 
                  mb: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img
                    src={Logo}
                    alt="Teacherfy AI Logo"
                    style={{ 
                      width: '80px',
                      height: '80px',
                      borderRadius: '16px',
                      objectFit: 'contain'
                    }}
                  />
                </Box>

                {/* Title */}
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
                subscriptionState={{
                  isPremium: subscriptionState.isPremium,
                  generationsLeft: subscriptionState.generationsLeft,
                  resetTime: subscriptionState.resetTime
                }}
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
                    isPremium={true}
                    downloadsRemaining={999}
                  />
                ) : (
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
          subscriptionState={{
            isPremium: subscriptionState.isPremium,
            generationsLeft: subscriptionState.generationsLeft,
            resetTime: subscriptionState.resetTime
          }}
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