// src/pages/LessonBuilder/hooks/usePresentation.js
import { useState, useCallback } from "react";
import { presentationService } from "../../../services";

export default function usePresentation({
  isAuthenticated,
  setShowSignInPrompt,
}) {
  const [googleSlidesState, setGoogleSlidesState] = useState({
    isGenerating: false,
    error: null,
  });

  const [subscriptionState, setSubscriptionState] = useState({
    downloadCount: 0,
    isPremium: false,
    showUpgradeModal: false,
  });

  const generatePresentation = useCallback(
    async (formState, contentState) => {
      try {
        setGoogleSlidesState(prev => ({ ...prev, isGenerating: true }));
        
        const blob = await presentationService.generatePptx(formState, contentState);
        
        // Verify we have a valid blob
        if (!(blob instanceof Blob)) {
          throw new Error('Invalid response format');
        }

        // Create the download URL
        const url = window.URL.createObjectURL(blob);
        
        // Create and trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = `${formState.lessonTopic || "lesson"}_presentation.pptx`;
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        // Update download count
        setSubscriptionState(prev => ({
          ...prev,
          downloadCount: prev.downloadCount + 1,
        }));
      } catch (err) {
        console.error("Error generating presentation:", err);
        throw new Error(err.message || "Error generating presentation");
      } finally {
        setGoogleSlidesState(prev => ({ ...prev, isGenerating: false }));
      }
    },
    []
  );

  const generateGoogleSlides = useCallback(
    async (formState, contentState) => {
      if (!isAuthenticated) {
        setShowSignInPrompt(true);
        return;
      }

      setGoogleSlidesState((prev) => ({ ...prev, isGenerating: true, error: null }));

      try {
        const data = await presentationService.generateGoogleSlides(formState, contentState);

        if (data.presentation_url) {
          window.open(data.presentation_url, "_blank");
        } else {
          throw new Error("Failed to get presentation URL");
        }
      } catch (err) {
        setGoogleSlidesState((prev) => ({
          ...prev,
          error: err.message || "Error generating Google Slides",
        }));
        throw err;
      } finally {
        setGoogleSlidesState((prev) => ({ ...prev, isGenerating: false }));
      }
    },
    [isAuthenticated, setShowSignInPrompt]
  );

  return {
    googleSlidesState,
    setGoogleSlidesState,
    subscriptionState,
    setSubscriptionState,
    generatePresentation,
    generateGoogleSlides,
  };
}