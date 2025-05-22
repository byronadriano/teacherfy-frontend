// src/pages/LessonBuilder/hooks/useForm.js - CLEANED VERSION
import { useState, useCallback } from "react";
import { formatOutlineForDisplay } from "../../../utils/outlineFormatter";
import { EXAMPLE_FORM_DATA } from "../../../utils/constants";
import { outlineService } from "../../../services";

// Clean example outline structure
const CLEAN_EXAMPLE_OUTLINE = {
  title: "Equivalent Fractions Lesson",
  structured_content: [
    {
      title: "Let's Explore Equivalent Fractions!",
      layout: "TITLE_AND_CONTENT",
      content: [
        "Students will be able to recognize and create equivalent fractions in everyday situations, like sharing cookies, pizza, or our favorite Colorado trail mix",
        "Students will be able to explain why different fractions can show the same amount using pictures and numbers"
      ]
    },
    {
      title: "What Are Equivalent Fractions?",
      layout: "TITLE_AND_CONTENT",
      content: [
        "Let's learn our fraction vocabulary!",
        "Imagine sharing a breakfast burrito with your friend - you can cut it in half (1/2) or into four equal pieces and take two (2/4). You get the same amount!",
        "The top number (numerator) tells us how many pieces we have",
        "The bottom number (denominator) tells us how many total equal pieces",
        "When fractions show the same amount, we call them equivalent"
      ]
    }
  ]
};

export default function useForm({ setShowSignInPrompt }) {
  const [formState, setFormState] = useState({
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
    title: "",
    outlineToConfirm: "",
    finalOutline: "",
    structuredContent: [],
    generatedResources: {}
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
      title: "",
      outlineToConfirm: "",
      finalOutline: "",
      structuredContent: [],
      generatedResources: {}
    });
  }, []);

  const handleFormChange = useCallback((field, value, isMultiSelect = false) => {
    setFormState(prev => {
      if (field === 'resourceType' && isMultiSelect) {
        let newResourceTypes;
        
        if (Array.isArray(prev.resourceType)) {
          if (prev.resourceType.includes(value)) {
            newResourceTypes = prev.resourceType.filter(type => type !== value);
          } else {
            newResourceTypes = [...prev.resourceType, value];
          }
        } else if (prev.resourceType) {
          if (prev.resourceType === value) {
            newResourceTypes = [];
          } else {
            newResourceTypes = [prev.resourceType, value];
          }
        } else {
          newResourceTypes = [value];
        }
        
        if (newResourceTypes.length === 0) {
          return { ...prev, [field]: [] };
        }
        
        if (newResourceTypes.includes('Presentation') && !prev.numSlides) {
          return { 
            ...prev, 
            [field]: newResourceTypes,
            numSlides: 5 
          };
        }
        
        return { ...prev, [field]: newResourceTypes };
      }
      
      return { ...prev, [field]: value };
    });
  }, []);

  const toggleExample = useCallback((isChecked) => {
    if (isChecked) {
      setFormState(prev => ({
        ...EXAMPLE_FORM_DATA,
        resourceType: [EXAMPLE_FORM_DATA.resourceType],
        numSlides: prev.numSlides,
        includeImages: prev.includeImages
      }));
      setUiState(prev => ({ ...prev, isExample: true }));
    } else {
      resetForm();
    }
  }, [resetForm]);

  const handleGenerateOutline = useCallback(async () => {
    // Validate required fields
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
        console.log('Using clean example data');
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const displayText = formatOutlineForDisplay(CLEAN_EXAMPLE_OUTLINE.structured_content);
        
        setContentState({
          title: CLEAN_EXAMPLE_OUTLINE.title,
          outlineToConfirm: displayText,
          finalOutline: displayText,
          structuredContent: CLEAN_EXAMPLE_OUTLINE.structured_content,
          generatedResources: {
            'Presentation': CLEAN_EXAMPLE_OUTLINE.structured_content
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
        const resourceTypes = Array.isArray(formState.resourceType) 
          ? formState.resourceType 
          : [formState.resourceType];
          
        const generatedResources = {};
        let primaryContent = null;
        let formattedOutline = "";
        let generatedTitle = "";
        
        // Generate outline for each resource type
        for (const resourceType of resourceTypes) {
          const requestData = {
            resourceType: resourceType,
            gradeLevel: formState.gradeLevel,
            subjectFocus: formState.subjectFocus,
            language: formState.language,
            lessonTopic: formState.lessonTopic || formState.subjectFocus || "General Learning",
            custom_prompt: formState.customPrompt || '',
            selectedStandards: Array.isArray(formState.selectedStandards) 
              ? formState.selectedStandards 
              : [],
            numSlides: formState.numSlides || 5,
            numSections: 5, // For non-presentation resources
            includeImages: Boolean(formState.includeImages)
          };
          
          const data = await outlineService.generate(requestData);
          
          console.log(`API request for ${resourceType} successful:`, {
            hasMessages: Boolean(data.messages),
            hasTitle: Boolean(data.title),
            structuredContentLength: data.structured_content?.length || 0
          });
          
          if (!data.messages || !data.structured_content) {
            throw new Error(`Invalid response format from server for ${resourceType}`);
          }

          // Clean the structured content - SIMPLIFIED structure
          const cleanStructuredContent = data.structured_content.map(item => ({
            title: item.title || 'Untitled',
            layout: item.layout || 'TITLE_AND_CONTENT',
            content: Array.isArray(item.content) ? item.content : []
          }));

          if (!cleanStructuredContent || cleanStructuredContent.length === 0) {
            throw new Error(`No valid content returned from the server for ${resourceType}`);
          }

          // Store in generatedResources
          generatedResources[resourceType] = cleanStructuredContent;
          
          // Use first resource as primary
          if (!primaryContent) {
            primaryContent = cleanStructuredContent;
            formattedOutline = formatOutlineForDisplay(cleanStructuredContent);
            generatedTitle = data.title || `${resourceType} - ${formState.subjectFocus || 'Lesson'}`;
          }
        }
        
        // Set content state
        setContentState({
          title: generatedTitle,
          outlineToConfirm: formattedOutline,
          finalOutline: formattedOutline,
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
      const resourceTypes = Array.isArray(formState.resourceType) 
        ? formState.resourceType 
        : [formState.resourceType];
        
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
      
      if (!data.messages || !data.structured_content) {
        throw new Error('Invalid response format from server');
      }

      // Clean the structured content - SIMPLIFIED structure
      const cleanStructuredContent = data.structured_content.map(item => ({
        title: item.title || 'Untitled',
        layout: item.layout || 'TITLE_AND_CONTENT',
        content: Array.isArray(item.content) ? item.content : []
      }));
        
      const formattedOutline = formatOutlineForDisplay(cleanStructuredContent);
      
      const regeneratedTitle = data.title || contentState.title || `${primaryResourceType} - ${formState.subjectFocus || 'Lesson'}`;
        
      // Update the generatedResources with the new content
      const updatedResources = {
        ...contentState.generatedResources,
        [primaryResourceType]: cleanStructuredContent
      };

      setContentState({
        title: regeneratedTitle,
        outlineToConfirm: formattedOutline,
        finalOutline: formattedOutline,
        structuredContent: cleanStructuredContent,
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
  }, [formState, uiState.regenerationCount, uiState.modifiedPrompt, contentState.outlineToConfirm, contentState.generatedResources, contentState.title]);
    
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