// src/pages/LessonBuilder/hooks/useForm.js
import { useState, useCallback } from "react";
import { formatOutlineForDisplay, parseOutlineToStructured } from "../../../utils/outlineFormatter";
import { EXAMPLE_FORM_DATA, EXAMPLE_OUTLINE } from "../../../utils/constants";
import { outlineService } from "../../../services";

export default function useForm({ setShowSignInPrompt }) {
  // Initial form state with all required fields
  const [formState, setFormState] = useState({
    resourceType: [], // Changed to array for multiple selections
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
    structuredContent: [],
    generatedResources: {} // New field to store multiple resource outputs
  });

  const resetForm = useCallback(() => {
    setFormState({
      resourceType: [],
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
      structuredContent: [],
      generatedResources: {}
    });
  }, []);

  const handleFormChange = useCallback((field, value, isMultiSelect = false) => {
    setFormState(prev => {
      // Special handling for resourceType multi-select
      if (field === 'resourceType' && isMultiSelect) {
        let newResourceTypes;
        
        // If resourceType is already an array
        if (Array.isArray(prev.resourceType)) {
          if (prev.resourceType.includes(value)) {
            // Remove the value if it already exists
            newResourceTypes = prev.resourceType.filter(type => type !== value);
          } else {
            // Add the value if it doesn't exist
            newResourceTypes = [...prev.resourceType, value];
          }
        } else if (prev.resourceType) {
          // If there's a single value already, create an array with both values
          if (prev.resourceType === value) {
            newResourceTypes = [];
          } else {
            newResourceTypes = [prev.resourceType, value];
          }
        } else {
          // If no value exists yet, create an array with the new value
          newResourceTypes = [value];
        }
        
        // Handle empty array - convert back to empty string
        if (newResourceTypes.length === 0) {
          return { ...prev, [field]: "" };
        }
        
        // Special handling for Presentation type
        if (newResourceTypes.includes('Presentation') && !prev.numSlides) {
          return { 
            ...prev, 
            [field]: newResourceTypes,
            numSlides: 5 
          };
        }
        
        return { ...prev, [field]: newResourceTypes };
      }
      
      // Regular single-value handling
      return { ...prev, [field]: value };
    });
  }, []);

  const toggleExample = useCallback((isChecked) => {
    if (isChecked) {
      setFormState(prev => ({
        ...EXAMPLE_FORM_DATA,
        // For multi-select compatibility, convert to array 
        resourceType: [EXAMPLE_FORM_DATA.resourceType],
        // Preserve any current settings that shouldn't be overwritten
        numSlides: prev.numSlides,
        includeImages: prev.includeImages
      }));
      setUiState(prev => ({ ...prev, isExample: true }));
    } else {
      resetForm();
    }
  }, [resetForm]);

  const handleGenerateOutline = useCallback(async () => {
    // Validate the essential required fields
    if (!formState.resourceType || (Array.isArray(formState.resourceType) && formState.resourceType.length === 0) || 
        !formState.gradeLevel || !formState.subjectFocus || !formState.language) {
      const missingFields = [
        (!formState.resourceType || (Array.isArray(formState.resourceType) && formState.resourceType.length === 0)) && 'resource type',
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
          structuredContent: EXAMPLE_OUTLINE.structured_content,
          generatedResources: {
            'Presentation': EXAMPLE_OUTLINE.structured_content
          }
        });
        
        setUiState(prev => ({
          ...prev,
          outlineModalOpen: true,
          isLoading: false
        }));
        
        return;
      }
      
      // Regular workflow - handle multiple resource types
      console.log('Making API request with form data:', {
        resourceType: formState.resourceType,
        gradeLevel: formState.gradeLevel,
        subjectFocus: formState.subjectFocus,
        language: formState.language,
      });
      
      try {
        // Normalize resourceType to array
        const resourceTypes = Array.isArray(formState.resourceType) 
          ? formState.resourceType 
          : [formState.resourceType];
          
        const generatedResources = {};
        
        // For each resource type, generate an outline
        for (const resourceType of resourceTypes) {
          // Build request with all available fields
          const requestData = {
            resourceType: resourceType,
            gradeLevel: formState.gradeLevel,
            subjectFocus: formState.subjectFocus,
            language: formState.language,
            // Use subject focus as the lesson topic if not explicitly provided
            lessonTopic: formState.lessonTopic || formState.subjectFocus || "General Learning",
            custom_prompt: formState.customPrompt || '',
            selectedStandards: Array.isArray(formState.selectedStandards) 
              ? formState.selectedStandards 
              : [],
            numSlides: formState.numSlides || 5,
            includeImages: Boolean(formState.includeImages)
          };
          
          const data = await outlineService.generate(requestData);
          
          console.log(`API request for ${resourceType} successful:`, {
            hasMessages: Boolean(data.messages),
            structuredContentLength: data.structured_content?.length || 0
          });
          
          // Process the response data
          if (!data.messages || !data.structured_content) {
            throw new Error(`Invalid response format from server for ${resourceType}`);
          }

          const structuredContent = Array.isArray(data.structured_content) 
            ? data.structured_content 
            : parseOutlineToStructured(data.messages[0], formState.numSlides || 5);

          if (!structuredContent || structuredContent.length === 0) {
            throw new Error(`No valid slide content returned from the server for ${resourceType}`);
          }

          // Store in the generatedResources object
          generatedResources[resourceType] = structuredContent;
        }
        
        // Set the primary resource type for display
        const primaryResourceType = resourceTypes[0];
        const primaryContent = generatedResources[primaryResourceType];
        
        setContentState({
          outlineToConfirm: formatOutlineForDisplay(primaryContent),
          structuredContent: primaryContent,
          generatedResources
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
      // Normalize resourceType to array
      const resourceTypes = Array.isArray(formState.resourceType) 
        ? formState.resourceType 
        : [formState.resourceType];
        
      // For now, only regenerate the primary resource type
      const primaryResourceType = resourceTypes[0];
      
      const requestData = {
        ...formState,
        resourceType: primaryResourceType,
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
        
      // Update the generatedResources with the new content
      const updatedResources = {
        ...contentState.generatedResources,
        [primaryResourceType]: structuredContent
      };

      setContentState({
        outlineToConfirm: formatOutlineForDisplay(structuredContent),
        structuredContent,
        generatedResources: updatedResources
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
  }, [formState, uiState.regenerationCount, uiState.modifiedPrompt, contentState.outlineToConfirm, contentState.generatedResources]);

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