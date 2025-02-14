// src/pages/LessonBuilder/index.js
import React, { useState, useEffect } from 'react';
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