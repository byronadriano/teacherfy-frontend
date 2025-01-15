// src/pages/LessonBuilder/hooks/useForm.js
import { useState, useCallback } from "react";
import {
  formatOutlineForDisplay,
  parseOutlineToStructured,
  generateRegenerationPrompt,
  generateFullPrompt,
} from "../../../utils/outlineFormatter";
import { EXAMPLE_OUTLINE } from "../../../utils/constants";

// Import services
import { getOutline, regenerateOutline, trackUserActivity } from "../../../services/api";

export default function useForm({
  token,
  user, // if you need user info for logging
  isExampleConfiguration,
  setShowSignInPrompt,
}) {
  // Form-related state
  const [formState, setFormState] = useState({
    lessonTopic: "",
    district: "",
    gradeLevel: "",
    subjectFocus: "",
    language: "",
    customPrompt: "",
    numSlides: 3,
  });

  // UI-related state (loading, error, etc.)
  const [uiState, setUiState] = useState({
    isLoading: false,
    error: "",
    outlineModalOpen: false,
    outlineConfirmed: false,
    isFormExpanded: true,
    regenerationCount: 0,
    modifiedPrompt: "",
    generateOutlineClicked: false,
  });

  // Outline content
  const [contentState, setContentState] = useState({
    outlineToConfirm: "",
    finalOutline: "",
    structuredContent: [],
  });

  // Handle form field changes
  const handleFormChange = useCallback((field, value) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Load example configuration
  const loadExample = useCallback(() => {
    setFormState({
      gradeLevel: "4th grade",
      subjectFocus: "Math",
      lessonTopic: "Equivalent Fractions",
      district: "Denver Public Schools",
      language: "English",
      customPrompt:
        "Create a lesson plan that introduces and reinforces key vocabulary. Include at least three new terms with definitions and examples. Incorporate a variety of interactive checks for understanding—such as quick formative assessments, short activities, or exit tickets—to ensure students are grasping the concepts throughout the lesson. Finally, suggest opportunities for students to engage in collaborative or hands-on learning to deepen their understanding and retention",
      numSlides: 5,
    });
    setUiState((prev) => ({
      ...prev,
      isFormExpanded: true,
      outlineModalOpen: false,
      outlineConfirmed: false,
      generateOutlineClicked: false,
      regenerationCount: 0,
    }));
    setContentState({
      outlineToConfirm: "",
      finalOutline: "",
      structuredContent: [],
    });
  }, []);

  // Clear all form fields and reset
  const clearAll = useCallback(() => {
    setFormState({
      lessonTopic: "",
      district: "",
      gradeLevel: "",
      subjectFocus: "",
      language: "",
      customPrompt: "",
      numSlides: 3,
    });
    setUiState((prev) => ({
      ...prev,
      regenerationCount: 0,
      modifiedPrompt: "",
      outlineConfirmed: false,
      isFormExpanded: true,
    }));
    setContentState({
      outlineToConfirm: "",
      finalOutline: "",
      structuredContent: [],
    });
  }, []);

  // Generate outline
  const handleGenerateOutline = useCallback(async () => {
    if (!token) {
      setShowSignInPrompt(true);
      return;
    }

    // Validate required fields
    if (
      !formState.gradeLevel ||
      !formState.subjectFocus ||
      !formState.language ||
      !formState.lessonTopic
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    setUiState((prev) => ({
      ...prev,
      isLoading: true,
      isFormExpanded: false,
      generateOutlineClicked: true,
    }));

    try {
      // If using example
      if (isExampleConfiguration(formState)) {
        const { structured_content } = EXAMPLE_OUTLINE;
        setContentState((prev) => ({
          ...prev,
          outlineToConfirm: formatOutlineForDisplay(structured_content),
          structuredContent: structured_content,
        }));
        setUiState((prev) => ({
          ...prev,
          outlineModalOpen: true,
        }));
      } else {
        // Otherwise, call API
        const fullPrompt = generateFullPrompt(formState);
        const data = await getOutline(formState, token, fullPrompt);

        const rawOutlineText = data.messages[0];
        const structuredContent = parseOutlineToStructured(
          rawOutlineText,
          formState.numSlides
        );

        setContentState((prev) => ({
          ...prev,
          outlineToConfirm: formatOutlineForDisplay(
            structuredContent,
            rawOutlineText
          ),
          structuredContent,
        }));
        setUiState((prev) => ({
          ...prev,
          outlineModalOpen: true,
        }));

        // Track the activity directly here
        await trackUserActivity("Generated Outline", user, token, {
          prompt: formState,
          // ...other data if you want
        });
      }
    } catch (error) {
      setUiState((prev) => ({
        ...prev,
        error:
          error.response?.data?.error || "Error generating outline. Please try again.",
      }));
    } finally {
      setUiState((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  }, [
    token,
    user,
    formState,
    isExampleConfiguration,
    setShowSignInPrompt,
  ]);

  // Regenerate Outline
  const handleRegenerateOutline = useCallback(async () => {
    if (!token) {
      setShowSignInPrompt(true);
      return;
    }

    if (uiState.regenerationCount >= 3) {
      setUiState((prev) => ({
        ...prev,
        error: "Maximum regeneration attempts (3) reached.",
      }));
      return;
    }

    setUiState((prev) => ({
      ...prev,
      regenerationCount: prev.regenerationCount + 1,
      isLoading: true,
    }));

    try {
      const regenerationPrompt = generateRegenerationPrompt(
        formState,
        uiState.modifiedPrompt
      );
      const data = await regenerateOutline(formState, token, regenerationPrompt);

      const structuredContent = parseOutlineToStructured(
        data.messages[0],
        formState.numSlides
      );
      const displayMarkdown = formatOutlineForDisplay(structuredContent);

      setContentState((prev) => ({
        ...prev,
        outlineToConfirm: displayMarkdown,
        structuredContent,
      }));

      // If you'd like to track that a user regenerated an outline:
      await trackUserActivity("Regenerated Outline", user, token, {
        prompt: formState,
      });
    } catch (error) {
      setUiState((prev) => ({
        ...prev,
        error:
          error.response?.data?.error || "Error regenerating outline.",
      }));
    } finally {
      setUiState((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  }, [token, user, uiState.regenerationCount, uiState.modifiedPrompt, formState, setShowSignInPrompt]);

  return {
    formState,
    uiState,
    contentState,
    setFormState,
    setUiState,
    setContentState,
    handleFormChange,
    loadExample,
    clearAll,
    handleGenerateOutline,
    handleRegenerateOutline,
  };
}
