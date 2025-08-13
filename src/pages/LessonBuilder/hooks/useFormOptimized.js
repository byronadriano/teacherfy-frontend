// src/pages/LessonBuilder/hooks/useFormOptimized.js - Modern, streamlined hook
import { useState, useCallback } from "react";
import { formatOutlineForDisplay } from "../../../utils/outlineFormatter";
import { EXAMPLE_FORM_DATA } from "../../../utils/constants";
import { outlineService } from "../../../services";

// Simple example data for demonstration
const EXAMPLE_CONTENT = {
  title: "Equivalent Fractions Lesson",
  structured_content: [
    {
      title: "Learning Objectives",
      layout: "TITLE_AND_CONTENT",
      content: [
        "Students will recognize equivalent fractions in real-world contexts",
        "Students will explain why different fractions represent the same amount"
      ]
    },
    {
      title: "What Are Equivalent Fractions?",
      layout: "TITLE_AND_CONTENT", 
      content: [
        "Fractions that represent the same amount or value",
        "Example: 1/2 = 2/4 = 4/8 (all represent half)",
        "The numerator and denominator change, but the value stays the same"
      ]
    }
  ]
};

export default function useFormOptimized({ setShowSignInPrompt, subscriptionState }) {
  // Form state - simplified structure
  const [formState, setFormState] = useState({
    resourceType: [],
    gradeLevel: "",
    subjectFocus: "",
    language: "English",
    lessonTopic: "",
    customPrompt: "",
    selectedStandards: [],
    numSlides: 5,
    includeImages: false
  });

  // UI state
  const [uiState, setUiState] = useState({
    isLoading: false,
    error: "",
    isExample: false,
    outlineModalOpen: false,
    regenerationCount: 0,
    modifiedPrompt: ""
  });

  // Content state - simplified for new backend format
  const [contentState, setContentState] = useState({
    title: "",
    structuredContent: [],
    generatedResources: {},
    outlineToConfirm: "",
    finalOutline: ""
  });

  // Reset everything to initial state
  const resetForm = useCallback(() => {
    console.log('🔄 Resetting form completely');
    
    setFormState({
      resourceType: [],
      gradeLevel: "",
      subjectFocus: "",
      language: "English", 
      lessonTopic: "",
      customPrompt: "",
      selectedStandards: [],
      numSlides: 5,
      includeImages: false
    });

    setUiState({
      isLoading: false,
      error: "",
      isExample: false,
      outlineModalOpen: false,
      regenerationCount: 0,
      modifiedPrompt: ""
    });

    setContentState({
      title: "",
      structuredContent: [],
      generatedResources: {},
      outlineToConfirm: "",
      finalOutline: ""
    });

    // Clear any cached data
    sessionStorage.removeItem('lastGeneratedOutline');
    sessionStorage.removeItem('lastContentState');
  }, []);

  // Handle form field changes
  const handleFormChange = useCallback((field, value, isMultiSelect = false) => {
    // Clear content on significant changes
    const significantFields = ['resourceType', 'gradeLevel', 'subjectFocus', 'lessonTopic'];
    
    if (significantFields.includes(field)) {
      console.log(`🔄 Significant field changed: ${field}, clearing content`);
      setContentState({
        title: "",
        structuredContent: [],
        generatedResources: {},
        outlineToConfirm: "",
        finalOutline: ""
      });
    }

    setFormState(prev => {
      if (isMultiSelect) {
        const currentValues = Array.isArray(prev[field]) ? prev[field] : [];
        const newValues = currentValues.includes(value)
          ? currentValues.filter(item => item !== value)
          : [...currentValues, value];
        return { ...prev, [field]: newValues };
      }
      return { ...prev, [field]: value };
    });
  }, []);

  // Toggle example mode
  const toggleExample = useCallback((isChecked) => {
    if (isChecked) {
      setFormState(EXAMPLE_FORM_DATA);
      setUiState(prev => ({ ...prev, isExample: true }));
    } else {
      resetForm();
    }
  }, [resetForm]);

  // Process API response into consistent format
  const processApiResponse = useCallback((data) => {
    let primaryContent, title, resources;

    if (data.isMultiResource && data.resources) {
      // Multi-resource response
      const resourceEntries = Object.entries(data.resources);
      const [, firstResource] = resourceEntries[0];
      
      primaryContent = firstResource.structured_content;
      title = data.title || `Multi-Resource Package`;
      
      // Map all resources with proper key conversion
      resources = {};
      resourceEntries.forEach(([backendKey, resourceData]) => {
        const frontendKey = backendKey === 'lesson_plan' ? 'Lesson Plan' : 
                           backendKey === 'presentation' ? 'Presentation' :
                           backendKey === 'worksheet' ? 'Worksheet' :
                           backendKey === 'quiz' ? 'Quiz/Test' : backendKey;
        
        resources[frontendKey] = resourceData.structured_content;
      });
      
    } else if (data.structured_content) {
      // Single resource response
      primaryContent = data.structured_content;
      title = data.title || `${formState.resourceType[0] || 'Resource'} - ${formState.subjectFocus}`;
      resources = { [formState.resourceType[0] || 'Presentation']: primaryContent };
      
    } else {
      throw new Error('Invalid response format');
    }

    const displayText = formatOutlineForDisplay(primaryContent);

    return {
      title,
      structuredContent: primaryContent,
      generatedResources: resources,
      outlineToConfirm: displayText,
      finalOutline: displayText
    };
  }, [formState.resourceType, formState.subjectFocus]);

  // Generate outline - main API call
  const handleGenerateOutline = useCallback(async () => {
    console.log('🚀 Starting outline generation');

    // Validation
    if (!formState.gradeLevel || !formState.subjectFocus) {
      setUiState(prev => ({ ...prev, error: "Please fill in all required fields" }));
      return;
    }

    // Check subscription limits
    if (!uiState.isExample && subscriptionState && !subscriptionState.isPremium && subscriptionState.generationsLeft <= 0) {
      setShowSignInPrompt(true);
      return;
    }

    setUiState(prev => ({ ...prev, isLoading: true, error: "" }));

    try {
      let result;

      if (uiState.isExample) {
        // Example mode - no API call
        console.log('📝 Using example data');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
        
        const displayText = formatOutlineForDisplay(EXAMPLE_CONTENT.structured_content);
        result = {
          title: EXAMPLE_CONTENT.title,
          structuredContent: EXAMPLE_CONTENT.structured_content,
          generatedResources: { 'Presentation': EXAMPLE_CONTENT.structured_content },
          outlineToConfirm: displayText,
          finalOutline: displayText
        };
        
      } else {
        // Real API call
        console.log('🌐 Making API request');
        
        const apiData = await outlineService.generate({
          resourceTypes: formState.resourceType.length > 0 ? formState.resourceType : ['Presentation'],
          gradeLevel: formState.gradeLevel,
          subjectFocus: formState.subjectFocus,
          language: formState.language,
          lessonTopic: formState.lessonTopic || formState.subjectFocus,
          custom_prompt: formState.customPrompt,
          selectedStandards: formState.selectedStandards,
          numSlides: formState.numSlides,
          includeImages: formState.includeImages
        });

        // Handle rate limiting
        if (apiData.error === 'RATE_LIMIT_EXCEEDED') {
          setUiState(prev => ({
            ...prev,
            error: 'RATE_LIMIT_EXCEEDED',
            rateLimitInfo: apiData.rateLimit,
            isLoading: false
          }));
          return;
        }

        result = processApiResponse(apiData);

        // Update subscription state if provided
        if (apiData.usage_limits && subscriptionState?.updateSubscriptionFromResponse) {
          subscriptionState.updateSubscriptionFromResponse(apiData);
        }
      }

      // Set content and show modal
      setContentState(result);
      setUiState(prev => ({ 
        ...prev, 
        isLoading: false, 
        outlineModalOpen: true,
        generateOutlineClicked: true
      }));

      console.log('✅ Generation successful');

    } catch (error) {
      console.error('❌ Generation failed:', error);
      
      setUiState(prev => ({
        ...prev,
        error: error.message.includes('rate limit') ? 'RATE_LIMIT_EXCEEDED' : error.message,
        isLoading: false
      }));
    }
  }, [formState, uiState.isExample, subscriptionState, setShowSignInPrompt, processApiResponse]);

  // Regenerate outline with modifications
  const handleRegenerateOutline = useCallback(async () => {
    if (uiState.regenerationCount >= 3) {
      setUiState(prev => ({ ...prev, error: "Maximum regeneration attempts reached" }));
      return;
    }

    if (!subscriptionState?.isPremium && subscriptionState?.generationsLeft <= 0) {
      setShowSignInPrompt(true);
      return;
    }

    setUiState(prev => ({ ...prev, isLoading: true, error: "" }));

    try {
      console.log('🔄 Regenerating with modifications');

      const apiData = await outlineService.generate({
        resourceTypes: formState.resourceType.length > 0 ? formState.resourceType : ['Presentation'],
        gradeLevel: formState.gradeLevel,
        subjectFocus: formState.subjectFocus,
        language: formState.language,
        lessonTopic: formState.lessonTopic || formState.subjectFocus,
        custom_prompt: uiState.modifiedPrompt || formState.customPrompt,
        selectedStandards: formState.selectedStandards,
        numSlides: formState.numSlides,
        includeImages: formState.includeImages,
        regeneration: true,
        regenerationCount: uiState.regenerationCount + 1,
        previous_outline: contentState.outlineToConfirm
      });

      const result = processApiResponse(apiData);

      // Update content state
      setContentState(result);
      setUiState(prev => ({
        ...prev,
        isLoading: false,
        regenerationCount: prev.regenerationCount + 1,
        modifiedPrompt: ""
      }));

      console.log('✅ Regeneration successful');

    } catch (error) {
      console.error('❌ Regeneration failed:', error);
      
      setUiState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false
      }));
    }
  }, [formState, uiState.regenerationCount, uiState.modifiedPrompt, contentState.outlineToConfirm, subscriptionState, setShowSignInPrompt, processApiResponse]);

  return {
    formState,
    uiState,
    contentState,
    setUiState,
    setContentState,
    handleFormChange,
    handleGenerateOutline,
    handleRegenerateOutline,
    toggleExample,
    resetForm
  };
}