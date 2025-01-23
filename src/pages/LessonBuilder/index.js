import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

import Sidebar from '../../components/sidebar/Sidebar';
import FiltersBar from '../../components/filters/FiltersBar';
import CustomizationForm from '../../components/form/CustomizationForm';
import SignInPrompt from '../../components/modals/SignInPrompt';
import UpgradeModal from '../../components/modals/UpgradeModal';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import OutlineDisplay from './components/OutlineDisplay';

import useAuth from './hooks/useAuth';
import useForm from './hooks/useForm';
import usePresentation from './hooks/usePresentation';

const LessonBuilder = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [userSettings, setUserSettings] = useState({
    defaultGrade: '',
    defaultSubject: '',
    defaultLanguage: '',
    defaultSlides: 5,
    alwaysIncludeImages: false
});
useEffect(() => {
  // Load saved settings
  const savedSettings = localStorage.getItem('userSettings');
  if (savedSettings) {
      setUserSettings(JSON.parse(savedSettings));
  }
}, []);
const handleSettingsChange = (newSettings) => {
  setUserSettings(newSettings);
  // Optionally save to localStorage or your backend
  localStorage.setItem('userSettings', JSON.stringify(newSettings));
};
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
  } = useForm({
    token: user?.token,
    user,
    setShowSignInPrompt: () => setUiState(prev => ({ ...prev, showSignInPrompt: true }))
  });

  const {
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

  const handleInputChange = (e) => {
    handleFormChange('customPrompt', e.target.value);
  };
  
  return (
    <Box sx={{ 
      display: 'flex',
      minHeight: '100vh',
      bgcolor: '#f9fafb',
      overflow: 'hidden'
    }}>
<Sidebar
    isCollapsed={isSidebarCollapsed}
    toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
    user={user}
    handleLogout={handleLogout}
    handleLoginSuccess={handleLoginSuccess}
    defaultSettings={userSettings}
    onSettingsChange={handleSettingsChange}
/>

      <Box 
        component="main"
        sx={{ 
          marginLeft: isSidebarCollapsed ? '20px' : '280px',
          flex: 1,
          height: '100vh',
          overflow: 'auto',
          transition: 'margin-left 0.3s ease',
        }}
      >
        <Box sx={{ 
          minHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: contentState.structuredContent.length > 0 ? 'flex-start' : 'center',
          p: { xs: 2, sm: 4, md: 6 },
        }}>
          <Box sx={{ 
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            pb: contentState.structuredContent.length > 0 ? 8 : 0
          }}>
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

            <Box sx={{ 
              width: '100%',
              maxWidth: '1000px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3
            }}>
              <FiltersBar 
                formState={formState}
                handleFormChange={handleFormChange}
              />

              <Box sx={{ 
                width: '100%',
                maxWidth: '800px'
              }}>
                <CustomizationForm 
                  value={formState.customPrompt}
                  onChange={handleInputChange}
                  isExample={uiState.isExample}
                  setIsExample={(isChecked) => toggleExample(isChecked)}
                  onSubmit={handleGenerateOutline}
                  isLoading={uiState.isLoading}
                />
              </Box>

              {contentState.structuredContent.length > 0 && (
                <OutlineDisplay
                  contentState={contentState}
                  uiState={uiState}
                  subscriptionState={subscriptionState}
                  isAuthenticated={isAuthenticated}
                  googleSlidesState={googleSlidesState}
                  onGeneratePresentation={() => generatePresentation(formState, contentState)}
                  onGenerateGoogleSlides={() => generateGoogleSlides(formState, contentState)}
                />
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      <SignInPrompt
        open={uiState.showSignInPrompt}
        onClose={() => setUiState(prev => ({ ...prev, showSignInPrompt: false }))}
        onSuccess={handleLoginSuccess}
      />

      <ConfirmationModal 
        uiState={uiState}
        contentState={contentState}
        subscriptionState={subscriptionState}
        setUiState={setUiState}
        setContentState={setContentState}
        handleRegenerateOutline={handleRegenerateOutline}
      />

      <UpgradeModal 
        open={uiState.showUpgradeModal}
        onClose={() => setUiState(prev => ({ ...prev, showUpgradeModal: false }))}
      />
    </Box>
  );
};

export default LessonBuilder;