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
        // Example workflow - this part works correctly
        setContentState({
          outlineToConfirm: formatOutlineForDisplay(EXAMPLE_OUTLINE.structured_content),
          structuredContent: EXAMPLE_OUTLINE.structured_content
        });
      } else {
        // FIX: Ensure proper construction of request data for custom inputs
        // Build request with all available fields, using defaults for optional fields
        const requestData = {
          resourceType: formState.resourceType,
          gradeLevel: formState.gradeLevel,
          subjectFocus: formState.subjectFocus,
          language: formState.language,
          
          // Optional fields with defaults
          lessonTopic: formState.lessonTopic || '',
          custom_prompt: formState.customPrompt || '',
          
          // Resource-specific options
          ...(formState.resourceType === 'Presentation' && {
            numSlides: formState.numSlides || 5,
            includeImages: Boolean(formState.includeImages)
          }),
          
          // Standards selection - properly formatted for the API
          selectedStandards: Array.isArray(formState.selectedStandards) 
            ? formState.selectedStandards 
            : []
        };
        
        console.log('Sending outline request with data:', requestData);
  
        const data = await outlineService.generate(requestData);
        
        console.log('Received outline data:', data);
        
        if (!data.messages || !data.structured_content) {
          throw new Error('Invalid response format from server');
        }
  
        // Ensure structured_content is properly parsed and formatted
        const structuredContent = Array.isArray(data.structured_content) 
          ? data.structured_content 
          : parseOutlineToStructured(data.messages[0], formState.numSlides || 5);
  
        // Add validation for structured content
        if (!structuredContent || structuredContent.length === 0) {
          throw new Error('No valid slide content returned from the server');
        }
  
        // Log structured content for debugging
        console.log('Parsed structured content:', 
          structuredContent.map(slide => ({
            title: slide.title,
            contentLength: slide.content?.length || 0,
            notesLength: slide.teacher_notes?.length || 0
          }))
        );
  
        setContentState({
          outlineToConfirm: formatOutlineForDisplay(structuredContent),
          structuredContent
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