// src/pages/LessonBuilder/index.js
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography } from '@mui/material';

import Sidebar from '../../components/sidebar/Sidebar';
import FiltersBar from '../../components/filters/FiltersBar';
import CustomizationForm from '../../components/form/CustomizationForm';
import SignInPrompt from '../../components/modals/SignInPrompt';
import UpgradeModal from '../../components/modals/UpgradeModal';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import OutlineDisplay from './components/OutlineDisplay';
import DebugPanel from '../../components/debug/DebugPanel';
import AppFooter from '../../components/common/AppFooter';

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

  // Use auth context instead of hook
  const { user, isAuthenticated, login, logout, isLoading } = useAuth();

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
    // setFormState,
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
    generatePresentation,
    generateGoogleSlides,
  } = usePresentation({
    token: user?.token,
    user,
    isAuthenticated,
    setShowSignInPrompt: () => setUiState(prev => ({ ...prev, showSignInPrompt: true }))
  });

  // Load user settings from session storage instead of local storage
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
        const historyData = {
          title: formState.lessonTopic || formState.subjectFocus || 'Untitled Lesson',
          resourceType: formState.resourceType || 'PRESENTATION',
          lessonData: {
            ...formState,
            structuredContent: contentState.structuredContent,
            finalOutline: contentState.finalOutline
          }
        };
        
        await historyService.saveHistoryItem(historyData);
        
        // Also save to local storage for anonymous users
        if (!isAuthenticated) {
          const localHistoryItem = {
            id: Date.now(), // Use timestamp as ID
            title: historyData.title,
            types: [historyData.resourceType],
            date: 'Today',
            lessonData: historyData.lessonData
          };
          
          historyService.saveLocalHistory(localHistoryItem);
        }
        
        console.log('Lesson saved to history');
      } catch (error) {
        console.error('Error saving to history:', error);
        // Continue even if history saving fails
      }
    }
  }, [formState, contentState, isAuthenticated]);

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
      
      // Method 1: Using individual handleFormChange calls
      // This is the safer approach since we're using a function we know exists
      if (lessonData.resourceType) handleFormChange('resourceType', lessonData.resourceType);
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
      
      // Update content state if structured content is available
      if (lessonData.structuredContent && Array.isArray(lessonData.structuredContent)) {
        setContentState(prev => ({
          ...prev,
          structuredContent: lessonData.structuredContent,
          finalOutline: lessonData.finalOutline || ''
        }));
        
        // Update UI state to show the loaded content
        setUiState(prev => ({
          ...prev,
          outlineConfirmed: true,
          isLoading: false,
          error: ''
        }));
      }
    } catch (error) {
      console.error('Error loading lesson from history:', error);
      setUiState(prev => ({
        ...prev,
        error: 'Failed to load lesson from history'
      }));
    }
  };
  
  // Add this function to track lesson generation in history
  const trackLessonInHistory = async () => {
    // Only track if we have structured content
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

  // Show loading state while auth is being checked
  if (isLoading) {
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
      minHeight: '100vh',
      bgcolor: '#ffffff',
      overflow: 'hidden'
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

      {/* Main Content */}
      <Box 
        component="main"
        sx={{ 
          marginLeft: isSidebarCollapsed ? '20px' : '240px',
          flex: 1,
          minHeight: '100vh',
          transition: 'margin-left 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          pb: '60px' // Space for footer
        }}
      >
        {/* Content Container */}
        <Box sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 4, md: 6 },
          maxWidth: '1200px',
          mx: 'auto',
          width: '100%'
        }}>
          {/* Title */}
          <Typography 
            variant="h1" 
            sx={{ 
              color: '#1e3a8a',
              fontSize: { xs: '2rem', sm: '2.5rem' },
              fontWeight: '300',
              textAlign: 'center',
              mb: 6
            }}
          >
            What would you like to create?
          </Typography>

          {/* Form Section */}
          <Box sx={{ 
            width: '100%',
            maxWidth: '800px',
            display: 'flex',
            flexDirection: 'column',
            gap: 3
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

            {contentState.structuredContent.length > 0 && (
              <OutlineDisplay
                contentState={contentState}
                uiState={{
                  ...uiState,
                  isLoading: presentationLoading
                }}
                subscriptionState={subscriptionState}
                isAuthenticated={isAuthenticated}
                googleSlidesState={googleSlidesState}
                onGeneratePresentation={() => generatePresentation(formState, contentState)}
                onGenerateGoogleSlides={() => generateGoogleSlides(formState, contentState)}
              />
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
          handleDownload={generatePresentation}
          onFinalize={trackLessonInHistory}  // Add this line
        />

        <UpgradeModal 
          open={uiState.showUpgradeModal}
          onClose={() => setUiState(prev => ({ ...prev, showUpgradeModal: false }))}
        />

        <DebugPanel 
          contentState={contentState}
          uiState={{
            ...uiState,
            isLoading: outlineLoading || presentationLoading
          }}
        />

        {/* Footer */}
        <AppFooter />
      </Box>
    </Box>
  );
};

export default LessonBuilder;