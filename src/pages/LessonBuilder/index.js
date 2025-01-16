// src/pages/LessonBuilder/index.js
import React, { useEffect, useRef } from "react";
import { Box, Typography, Button, Snackbar, Alert } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

import Logo from "../../assets/images/Teacherfyoai.png";
import useAuth from "./hooks/useAuth";

// Hooks
import useForm from "./hooks/useForm";
import usePresentation from "./hooks/usePresentation";

import { GOOGLE_CLIENT_ID } from "../../utils/constants";
import "./styles.css";

import SignInPrompt from "../../components/modals/SignInPrompt";
import UpgradeModal from "../../components/modals/UpgradeModal";
import ConfirmationModal from "../../components/modals/ConfirmationModal";
import FormSection from "./components/FormSection";
import OutlineDisplay from "./components/OutlineDisplay";

const Chat = () => {
  const {
    user,
    isAuthenticated,
    token,
    showSignInPrompt,
    setShowSignInPrompt,
    handleLoginSuccess,
    handleLogout,
  } = useAuth();

  // Helper function to detect if the form is configured with the example
  const isExampleConfiguration = (formState) => {
    return (
      formState.gradeLevel === "4th grade" &&
      formState.subjectFocus === "Math" &&
      formState.lessonTopic === "Equivalent Fractions" &&
      formState.district === "Denver Public Schools" &&
      formState.language === "English" &&
      formState.customPrompt ===
        "Create a lesson plan that introduces and reinforces key vocabulary. Include at least three new terms with definitions and examples. Incorporate a variety of interactive checks for understanding—such as quick formative assessments, short activities, or exit tickets—to ensure students are grasping the concepts throughout the lesson. Finally, suggest opportunities for students to engage in collaborative or hands-on learning to deepen their understanding and retention" &&
      formState.numSlides === 5
    );
  };

  // Presentation logic
  const {
    googleSlidesState,
    subscriptionState,
    setSubscriptionState,
    generatePresentation,
    generateGoogleSlides,
  } = usePresentation({
    token,
    user,
    isAuthenticated,
    setShowSignInPrompt,
  });

  // Form (outline) logic
  const {
    formState,
    uiState,
    contentState,
    setUiState,
    setContentState,
    handleFormChange,
    loadExample,
    clearAll,
    handleGenerateOutline,
    handleRegenerateOutline,
  } = useForm({
    token,
    user, // pass user if we want to log activity with user info
    isExampleConfiguration,
    setShowSignInPrompt,
  });

  const messagesEndRef = useRef(null);

  // Prompt user to sign in if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setShowSignInPrompt(true);
    }
  }, [isAuthenticated, setShowSignInPrompt]);

  // Scroll to bottom when outline updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [contentState.outlineToConfirm]);

  // Initialize subscription usage from localStorage
  useEffect(() => {
    if (user?.email) {
      setSubscriptionState((prev) => ({
        ...prev,
        downloadCount: parseInt(
          localStorage.getItem(`downloadCount_${user.email}`) || "0"
        ),
      }));
    }
  }, [user?.email, setSubscriptionState]);

  // Wrap the PPTX generation in try/catch to handle UI state
  const handleGeneratePresentation = async () => {
    setUiState((prev) => ({ ...prev, isLoading: true, error: "" }));
    try {
      await generatePresentation(formState, contentState);
    } catch (err) {
      setUiState((prev) => ({ ...prev, error: err.message }));
    } finally {
      setUiState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Wrap the Google Slides generation in try/catch
  const handleGenerateGoogleSlides = async () => {
    setUiState((prev) => ({ ...prev, isLoading: true, error: "" }));
    try {
      await generateGoogleSlides(formState, contentState);
    } catch (err) {
      setUiState((prev) => ({ ...prev, error: err.message }));
    } finally {
      setUiState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <>
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        {/* Sidebar Section */}
        <Box className="sidebar">
          <Box sx={{ mb: 4 }}>
            <img
              src={Logo}
              alt="Teacherfy Logo"
              style={{
                width: "200px",
                height: "auto",
                marginBottom: "24px",
              }}
            />
          </Box>

          {isAuthenticated ? (
            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  color: "#374151",
                  textAlign: "center",
                  fontSize: "0.875rem",
                }}
              >
                Signed in as {user?.name}
              </Typography>
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleLogout}
                startIcon={<ClearIcon />}
                sx={{
                  borderColor: "#d1d5db",
                  color: "#374151",
                  width: "100%",
                  "&:hover": {
                    borderColor: "#9ca3af",
                    backgroundColor: "#f9fafb",
                  },
                }}
              >
                Logout
              </Button>
            </Box>
          ) : (
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
              <Box sx={{ width: "240px", margin: "0 auto" }}>
                <GoogleLogin
                  onSuccess={handleLoginSuccess}
                  onError={() => alert("Login Failed")}
                  // Avoid width: "100%" to prevent GSI_LOGGER warnings
                />
              </Box>
            </GoogleOAuthProvider>
          )}
        </Box>

        {/* Main Content */}
        <Box className="main-content">
          <Box className="content-container">
            {/* Top Action Buttons */}
            <Box className="action-buttons">
              <Button
                variant="text"
                onClick={loadExample}
                disabled={uiState.outlineModalOpen}
                className="action-button"
                startIcon={<PlayArrowIcon />}
                sx={{ color: "#2563eb" }}
              >
                Load Example
              </Button>
              <Button
                variant="text"
                onClick={clearAll}
                disabled={uiState.outlineModalOpen}
                className="action-button"
                startIcon={<ClearIcon />}
                sx={{ color: "#dc2626" }}
              >
                Clear All
              </Button>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Form Section */}
              <FormSection
                formState={formState}
                uiState={uiState}
                setUiState={setUiState}
                onFormChange={handleFormChange}
                onGenerateOutline={handleGenerateOutline}
              />

              {/* Upgrade Modal */}
              <UpgradeModal
                open={subscriptionState.showUpgradeModal}
                onClose={() =>
                  setSubscriptionState((prev) => ({
                    ...prev,
                    showUpgradeModal: false,
                  }))
                }
              />

              {/* Outline Display */}
              <OutlineDisplay
                contentState={contentState}
                uiState={uiState}
                subscriptionState={subscriptionState}
                isAuthenticated={isAuthenticated}
                googleSlidesState={googleSlidesState}
                onGeneratePresentation={handleGeneratePresentation}
                onGenerateGoogleSlides={handleGenerateGoogleSlides}
              />

              {/* Confirmation Modal (for regenerating or confirming outline) */}
              <ConfirmationModal
                uiState={uiState}
                contentState={contentState}
                subscriptionState={subscriptionState}
                setUiState={setUiState}
                setContentState={setContentState}
                handleRegenerateOutline={handleRegenerateOutline}
              />

              {/* Error Snackbar */}
              <Snackbar
                open={!!uiState.error}
                autoHideDuration={6000}
                onClose={() => setUiState((prev) => ({ ...prev, error: "" }))}
              >
                <Alert
                  onClose={() => setUiState((prev) => ({ ...prev, error: "" }))}
                  severity="error"
                  sx={{ width: "100%" }}
                >
                  {uiState.error}
                </Alert>
              </Snackbar>

              <div ref={messagesEndRef} />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Sign In Prompt Modal */}
      <SignInPrompt
        open={showSignInPrompt && !isAuthenticated}
        onClose={() => setShowSignInPrompt(false)}
        onSuccess={handleLoginSuccess}
        clientId={GOOGLE_CLIENT_ID}
      />
    </>
  );
};

export default Chat;
