// src/pages/LessonBuilder/hooks/useForm.js
import { useState, useCallback } from "react";
import { formatOutlineForDisplay, parseOutlineToStructured } from "../../../utils/outlineFormatter";
import { EXAMPLE_FORM_DATA, EXAMPLE_OUTLINE } from "../../../utils/constants";
import { outlineService } from "../../../services";

export default function useForm({ setShowSignInPrompt }) {
  // Initial form state with all required fields
  const [formState, setFormState] = useState({
    resourceType: "",
    gradeLevel: "",
    subjectFocus: "",
    selectedStandards: [],
    language: "",
    lessonTopic: "",
    numSlides: 5,
    includeImages: false,
    customPrompt: ""
  });

  const [uiState, setUiState] = useState({
    isLoading: false,
    error: "",
    outlineModalOpen: false,
    outlineConfirmed: false,
    regenerationCount: 0,
    modifiedPrompt: "",
    generateOutlineClicked: false,
    isExample: false
  });

  const [contentState, setContentState] = useState({
    outlineToConfirm: "",
    finalOutline: "",
    structuredContent: []
  });

  const resetForm = useCallback(() => {
    setFormState({
      resourceType: "Presentation",
      gradeLevel: "",
      subjectFocus: "",
      selectedStandards: [],
      language: "",
      lessonTopic: "",
      numSlides: 5,
      includeImages: false,
      customPrompt: ""
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
      structuredContent: []
    });
  }, []);

  const handleFormChange = useCallback((field, value) => {
    setFormState(prev => {
      // Special handling for resourceType
      if (field === 'resourceType') {
        // Reset numSlides and includeImages when switching from Presentation
        if (prev.resourceType === 'Presentation' && value !== 'Presentation') {
          return {
            ...prev,
            [field]: value,
            numSlides: undefined,
            includeImages: false
          };
        }
        // Set default numSlides when switching to Presentation
        if (value === 'Presentation') {
          return {
            ...prev,
            [field]: value,
            numSlides: 5
          };
        }
      }
      return { ...prev, [field]: value };
    });
  }, []);

  const toggleExample = useCallback((isChecked) => {
    if (isChecked) {
      setFormState(prev => ({
        ...EXAMPLE_FORM_DATA,
        // Preserve any current settings that shouldn't be overwritten
        resourceType: prev.resourceType,
        numSlides: prev.numSlides,
        includeImages: prev.includeImages
      }));
      setUiState(prev => ({ ...prev, isExample: true }));
    } else {
      resetForm();
    }
  }, [resetForm]);

  const handleGenerateOutline = useCallback(async () => {
    // Validate only the essential required fields
    // Note: We're no longer requiring lessonTopic as a separate field
    if (!formState.resourceType || !formState.gradeLevel || !formState.subjectFocus || !formState.language) {
      const missingFields = [
        !formState.resourceType && 'resource type',
        !formState.gradeLevel && 'grade level',
        !formState.subjectFocus && 'subject',
        !formState.language && 'language'
      ].filter(Boolean).join(', ');

      setUiState(prev => ({
        ...prev,
        error: `Please fill in all required fields: ${missingFields}.`
      }));
      return;
    }

    setUiState(prev => ({
      ...prev,
      isLoading: true,
      error: "",
      generateOutlineClicked: true
    }));

    try {
      if (uiState.isExample) {
        // Example workflow code (unchanged)
        console.log('Using example data');
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setContentState({
          outlineToConfirm: formatOutlineForDisplay(EXAMPLE_OUTLINE.structured_content),
          structuredContent: EXAMPLE_OUTLINE.structured_content
        });
        
        setUiState(prev => ({
          ...prev,
          outlineModalOpen: true,
          isLoading: false
        }));
        
        return;
      }
      
      // Regular workflow - make API request
      console.log('Making API request with form data:', {
        resourceType: formState.resourceType,
        gradeLevel: formState.gradeLevel,
        subjectFocus: formState.subjectFocus,
        language: formState.language,
        // Don't log the full request for brevity
      });
      
      try {
        // Build request with all available fields
        // Use subjectFocus as lessonTopic if lessonTopic is empty
        const requestData = {
          resourceType: formState.resourceType,
          gradeLevel: formState.gradeLevel,
          subjectFocus: formState.subjectFocus,
          language: formState.language,
          // Use subject focus as the lesson topic if not explicitly provided
          lessonTopic: formState.lessonTopic || formState.subjectFocus,
          custom_prompt: formState.customPrompt || '',
          selectedStandards: Array.isArray(formState.selectedStandards) 
            ? formState.selectedStandards 
            : [],
          numSlides: formState.numSlides || 5,
          includeImages: Boolean(formState.includeImages)
        };
        
        const data = await outlineService.generate(requestData);
        
        console.log('API request successful:', {
          hasMessages: Boolean(data.messages),
          structuredContentLength: data.structured_content?.length || 0
        });
        
        // Process the response data (unchanged)
        if (!data.messages || !data.structured_content) {
          throw new Error('Invalid response format from server');
        }

        const structuredContent = Array.isArray(data.structured_content) 
          ? data.structured_content 
          : parseOutlineToStructured(data.messages[0], formState.numSlides || 5);

        if (!structuredContent || structuredContent.length === 0) {
          throw new Error('No valid slide content returned from the server');
        }

        setContentState({
          outlineToConfirm: formatOutlineForDisplay(structuredContent),
          structuredContent
        });
        
        setUiState(prev => ({
          ...prev,
          outlineModalOpen: true,
          isLoading: false
        }));
      } catch (apiError) {
        console.error('API request failed:', apiError);
        
        // More comprehensive error handling
        let errorMessage = 'Error generating outline: ';
        
        if (apiError.status === 405) {
          errorMessage += 'The server endpoint is not properly configured. Please try the example instead.';
        } else if (apiError.status === 400) {
          errorMessage += 'Missing required field(s). Please ensure all fields are filled in.';
        } else if (apiError.status === 403) {
          errorMessage += 'You have reached your generation limit. Please try again later.';
        } else if (apiError.error) {
          errorMessage += apiError.error;
        } else {
          errorMessage += 'Unexpected error occurred. Please try again later.';
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error in handleGenerateOutline:", error);
      
      setUiState(prev => ({
        ...prev,
        error: error.message || "Error generating outline. Please try again.",
        isLoading: false
      }));
    }
  }, [formState, uiState.isExample]);
  

  const handleRegenerateOutline = useCallback(async () => {
    if (uiState.regenerationCount >= 3) {
      setUiState(prev => ({
        ...prev,
        error: "Maximum regeneration attempts (3) reached."
      }));
      return;
    }

    setUiState(prev => ({
      ...prev,
      isLoading: true,
      error: "",
      regenerationCount: prev.regenerationCount + 1
    }));

    try {
      const requestData = {
        ...formState,
        regeneration: true,
        regenerationCount: uiState.regenerationCount + 1,
        previous_outline: contentState.outlineToConfirm,
        custom_prompt: uiState.modifiedPrompt
      };

      const data = await outlineService.generate(requestData);
      
      // Ensure we have the expected response structure
      if (!data.messages || !data.structured_content) {
        throw new Error('Invalid response format from server');
      }

      const structuredContent = Array.isArray(data.structured_content) 
        ? data.structured_content 
        : parseOutlineToStructured(data.messages[0]);

      setContentState({
        outlineToConfirm: formatOutlineForDisplay(structuredContent),
        structuredContent
      });

    } catch (error) {
      console.error("Error regenerating outline:", error);
      setUiState(prev => ({
        ...prev,
        error: error.message || "Error regenerating outline. Please try again."
      }));
    } finally {
      setUiState(prev => ({
        ...prev,
        isLoading: false
      }));
    }
  }, [formState, uiState.regenerationCount, uiState.modifiedPrompt, contentState.outlineToConfirm]);

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
    resetForm
  };
}