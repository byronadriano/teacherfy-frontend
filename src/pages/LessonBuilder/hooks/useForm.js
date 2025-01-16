// src/pages/LessonBuilder/hooks/useForm.js
import { useState, useCallback } from "react";
import {
  formatOutlineForDisplay,
  parseOutlineToStructured,
  generateRegenerationPrompt,
  generateFullPrompt,
} from "../../../utils/outlineFormatter";
import { FORM, EXAMPLE_FORM_DATA, EXAMPLE_OUTLINE, isExampleConfig } from "../../../utils/constants";
import { outlineService, analyticsService } from "../../../services";

export default function useForm({
  token,
  user,
  setShowSignInPrompt,
}) {
  const [formState, setFormState] = useState({
    lessonTopic: "",
    district: "",
    gradeLevel: "",
    subjectFocus: "",
    language: "",
    customPrompt: "",
    numSlides: FORM.DEFAULT_SLIDES || 3,
  });

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

  const [contentState, setContentState] = useState({
    outlineToConfirm: "",
    finalOutline: "",
    structuredContent: [],
  });

  const handleFormChange = useCallback((field, value) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const loadExample = useCallback(() => {
    setFormState(EXAMPLE_FORM_DATA);
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

  const handleGenerateOutline = useCallback(async () => {
    if (!token) {
      setShowSignInPrompt(true);
      return;
    }

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
      // Check if current form matches example configuration
      if (isExampleConfig(formState)) {
        console.log("Using example configuration");
        setContentState((prev) => ({
          ...prev,
          outlineToConfirm: formatOutlineForDisplay(EXAMPLE_OUTLINE.structured_content),
          structuredContent: EXAMPLE_OUTLINE.structured_content,
        }));
      } else {
        console.log("Generating new outline");
        const fullPrompt = generateFullPrompt(formState);
        const data = await outlineService.generate({
          ...formState,
          custom_prompt: fullPrompt
        }, token);

        const structuredContent = parseOutlineToStructured(
          data.messages[0],
          formState.numSlides
        );

        setContentState((prev) => ({
          ...prev,
          outlineToConfirm: formatOutlineForDisplay(structuredContent),
          structuredContent,
        }));
      }

      setUiState((prev) => ({
        ...prev,
        outlineModalOpen: true,
      }));

      await analyticsService.trackActivity("Generated Outline", user, token, {
        prompt: formState,
      });
    } catch (error) {
      console.error("Error generating outline:", error);
      setUiState((prev) => ({
        ...prev,
        error: error.message || "Error generating outline. Please try again.",
      }));
    } finally {
      setUiState((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  }, [formState, token, user, setShowSignInPrompt]);

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
      
      const data = await outlineService.regenerate(
        formState,
        token,
        regenerationPrompt
      );

      const structuredContent = parseOutlineToStructured(
        data.messages[0],
        formState.numSlides
      );
      
      setContentState((prev) => ({
        ...prev,
        outlineToConfirm: formatOutlineForDisplay(structuredContent),
        structuredContent,
      }));

      await analyticsService.trackActivity("Regenerated Outline", user, token, {
        prompt: formState,
        regeneration_count: uiState.regenerationCount + 1,
      });
      
    } catch (error) {
      setUiState((prev) => ({
        ...prev,
        error: error.message || "Error regenerating outline.",
      }));
    } finally {
      setUiState((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  }, [
    token,
    formState,
    uiState.regenerationCount,
    uiState.modifiedPrompt,
    setShowSignInPrompt,
    user
  ]);


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