// src/pages/LessonBuilder/hooks/useForm.js
import { useState, useCallback } from "react";
import {
  formatOutlineForDisplay,
  parseOutlineToStructured,
  generateRegenerationPrompt,
  generateFullPrompt,
} from "../../../utils/outlineFormatter";
import { EXAMPLE_FORM_DATA, EXAMPLE_OUTLINE } from "../../../utils/constants";
import { outlineService } from "../../../services";

export default function useForm({
  setShowSignInPrompt,
}) {
  // Initial form state
  const [formState, setFormState] = useState({
    resourceType: "",
    gradeLevel: "",
    subjectFocus: "",
    selectedStandards: [],
    language: "",
    customPrompt: "",
    numSlides: 5
  });

  const [uiState, setUiState] = useState({
    isLoading: false,
    error: "",
    outlineModalOpen: false,
    outlineConfirmed: false,
    regenerationCount: 0,
    modifiedPrompt: "",
    generateOutlineClicked: false,
    isExample: false,
    showSignInPrompt: false,
    showUpgradeModal: false
  });

  const [contentState, setContentState] = useState({
    outlineToConfirm: "",
    finalOutline: "",
    structuredContent: [],
  });

  const resetForm = useCallback(() => {
    console.log("Resetting form...");
    
    setFormState({
      resourceType: "",
      gradeLevel: "",
      subjectFocus: "",
      selectedStandards: [],
      language: "",
      customPrompt: "",
      numSlides: 5
    });

    setUiState(prev => ({
      ...prev,
      isLoading: false,
      error: "",
      outlineModalOpen: false,
      outlineConfirmed: false,
      regenerationCount: 0,
      modifiedPrompt: "",
      generateOutlineClicked: false,
      isExample: false
    }));

    setContentState({
      outlineToConfirm: "",
      finalOutline: "",
      structuredContent: [],
    });
  }, []);

  const handleFormChange = useCallback((field, value) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const toggleExample = useCallback((isChecked) => {
    if (isChecked) {
      setFormState(EXAMPLE_FORM_DATA);
      setUiState(prev => ({
        ...prev,
        isExample: true
      }));
    } else {
      setFormState({
        resourceType: "",
        gradeLevel: "",
        subjectFocus: "",
        selectedStandards: [],
        language: "",
        customPrompt: "",
        numSlides: 5
      });
      setUiState(prev => ({
        ...prev,
        isExample: false
      }));
    }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleGenerateOutline = useCallback(async () => {
    if (
      !formState.resourceType ||
      !formState.gradeLevel ||
      !formState.subjectFocus ||
      !formState.language
    ) {
      setUiState(prev => ({
        ...prev,
        error: "Please fill in all required fields."
      }));
      return;
    }

    setUiState((prev) => ({
      ...prev,
      isLoading: true,
      error: "",
    }));

    try {
      if (uiState.isExample) {
        setContentState({
          outlineToConfirm: formatOutlineForDisplay(EXAMPLE_OUTLINE.structured_content),
          structuredContent: EXAMPLE_OUTLINE.structured_content,
        });
      } else {
        const data = await outlineService.generate({
          ...formState,
          custom_prompt: generateFullPrompt(formState)
        });

        const structuredContent = parseOutlineToStructured(
          data.messages[0],
          formState.numSlides
        );

        setContentState({
          outlineToConfirm: formatOutlineForDisplay(structuredContent),
          structuredContent,
        });
      }

      setUiState(prev => ({
        ...prev,
        outlineModalOpen: true
      }));

    } catch (error) {
      console.error("Error generating outline:", error);
      setUiState(prev => ({
        ...prev,
        error: error.message || "Error generating outline. Please try again."
      }));
    } finally {
      setUiState(prev => ({
        ...prev,
        isLoading: false
      }));
    }
  }, [formState, uiState.isExample]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleRegenerateOutline = useCallback(async () => {
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
        regenerationPrompt
      );

      const structuredContent = parseOutlineToStructured(
        data.messages[0],
        formState.numSlides
      );
      
      setContentState({
        outlineToConfirm: formatOutlineForDisplay(structuredContent),
        structuredContent,
      });

    } catch (error) {
      setUiState((prev) => ({
        ...prev,
        error: error.message || "Error regenerating outline.",
      }));
    } finally {
      setUiState((prev) => ({
        ...prev,
        isLoading: false
      }));
    }
  }, [formState, uiState.regenerationCount, uiState.modifiedPrompt]);

  return {
    formState,
    uiState,
    contentState,
    setUiState,
    setContentState,
    handleFormChange,
    toggleExample,
    handleGenerateOutline,
    handleRegenerateOutline,
    resetForm,
  };
}