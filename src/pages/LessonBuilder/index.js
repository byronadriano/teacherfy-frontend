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

import useAuth from './hooks/useAuth';
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

  // Hooks
  const {
    user,
    isAuthenticated,
    handleLoginSuccess,
    handleLogout
  } = useAuth();

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

  // Effects
  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      setUserSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Handlers
  const handleSettingsChange = (newSettings) => {
    setUserSettings(newSettings);
    localStorage.setItem('userSettings', JSON.stringify(newSettings));
  };

  const handleInputChange = (e) => {
    handleFormChange('customPrompt', e.target.value);
  };

  return (
    <Box sx={{ 
      display: 'flex',
      minHeight: '100vh',
      bgcolor: '#ffffff',
      overflow: 'hidden'
    }}>
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        user={user}
        handleLogout={handleLogout}
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
          position: 'relative'
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

        {/* Debug Panel */}
        <DebugPanel 
          contentState={contentState}
          uiState={{
            ...uiState,
            isLoading: outlineLoading || presentationLoading
          }}
        />
      </Box>
    </Box>
  );
};

export default LessonBuilder;