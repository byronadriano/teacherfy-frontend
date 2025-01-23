// src/pages/LessonBuilder/hooks/usePresentation.js
import { useState, useCallback } from "react";
import { presentationService, analyticsService } from "../../../services";

export default function usePresentation({
  token,
  user,
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
        const blob = await presentationService.generatePptx(formState, contentState);

        // Download the file
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `${formState.lessonTopic || "lesson"}_presentation.pptx`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        // Only update usage count if user is signed in
        if (user?.email) {
          const newCount = subscriptionState.downloadCount + 1;
          localStorage.setItem(`downloadCount_${user.email}`, newCount.toString());
          setSubscriptionState((prev) => ({
            ...prev,
            downloadCount: newCount,
          }));
        }

        // Only track analytics if user is signed in
        if (token && user) {
          await analyticsService.trackActivity("Downloaded Presentation", user, token, {
            prompt: formState,
            outline: contentState.finalOutline,
            structured_content: contentState.structuredContent,
          });
        }
      } catch (err) {
        console.error("Error generating presentation:", err);
        throw new Error(err.message || "Error generating presentation");
      }
    },
    [token, user, subscriptionState.downloadCount]
  );

  const generateGoogleSlides = useCallback(
    async (formState, contentState) => {
      // Google Slides generation requires authentication
      if (!isAuthenticated) {
        setShowSignInPrompt(true);
        return;
      }

      setGoogleSlidesState((prev) => ({ ...prev, isGenerating: true, error: null }));

      try {
        const { response, data } = await presentationService.generateGoogleSlides(
          formState, 
          contentState, 
          token
        );

        if (response.status === 401 && data.needsAuth) {
          // Handle authorization flow
          localStorage.setItem(
            "pendingSlideGeneration",
            JSON.stringify({
              structured_content: contentState.structuredContent,
              meta: {
                lesson_topic: formState.lessonTopic,
                district: formState.district,
                grade_level: formState.gradeLevel,
                subject_focus: formState.subjectFocus,
              },
            })
          );

          const authWindow = window.open(
            data.authUrl,
            "Google Authorization",
            "width=600,height=800,scrollbars=yes"
          );

          const checkAuth = setInterval(() => {
            if (authWindow.closed) {
              clearInterval(checkAuth);
              // Rest of your auth flow...
            }
          }, 500);
          
          return;
        }

        if (data.presentation_url) {
          window.open(data.presentation_url, "_blank");
          
          if (token && user) {
            await analyticsService.trackActivity("Generated Google Slides", user, token, {
              prompt: formState,
              outline: contentState.finalOutline,
              structured_content: contentState.structuredContent,
            });
          }
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
    [isAuthenticated, token, user, setShowSignInPrompt]
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