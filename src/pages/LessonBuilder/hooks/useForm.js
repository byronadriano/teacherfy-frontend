// src/pages/LessonBuilder/hooks/useForm.js - FIXED state reset issue
import { useState, useCallback, useEffect } from "react";
import { formatOutlineForDisplay, normalizeStructuredItem } from "../../../utils/outlineFormatter";
import { EXAMPLE_FORM_DATA } from "../../../utils/constants";
import { outlineService } from "../../../services";
import useEnhancedLoading from "../../../hooks/useEnhancedLoading";

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

export default function useForm({ setShowSignInPrompt, subscriptionState, user }) {
  // Enhanced loading hook for better UX
  const enhancedLoading = useEnhancedLoading({
    enableBackgroundProcessing: true,
    enableProgressTracking: true,
    enableEmailNotifications: true,
    autoMinimizeThreshold: 30000
  });

  // If a user is authenticated, populate the enhanced loading email so
  // background processing can use it without requiring manual input.
  useEffect(() => {
    if (user && user.email && typeof enhancedLoading.setUserEmail === 'function') {
      enhancedLoading.setUserEmail(user.email);
    }
  }, [user, enhancedLoading]);
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

  // Helper: attempt to parse a markdown outline (finalOutline/outlineToConfirm)
  // into the expected structured_content array when backend did not provide it.
  const parseStructuredContentFromText = (text) => {
    if (!text || typeof text !== 'string') return [];

    const sections = text.split(/^##\s+/m).map(s => s.trim()).filter(Boolean);
    const parsed = sections.map(sectionText => {
      // First line is the title (until newline)
      const firstNewline = sectionText.indexOf('\n');
      const title = firstNewline > -1 ? sectionText.slice(0, firstNewline).trim() : sectionText;

      // Find the Content block
      const contentMatch = sectionText.match(/###\s*Content[\s\S]*?(?=(\n\n---|\n\n##|$))/i);
      let contentBlock = '';
      if (contentMatch) {
        contentBlock = contentMatch[0];
      } else {
        // Fallback: take text after the title
        contentBlock = firstNewline > -1 ? sectionText.slice(firstNewline + 1) : '';
      }

      // Extract bullet lines (• or -) or plain paragraphs
      const lines = contentBlock.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      const contentItems = [];
      lines.forEach(l => {
        const bullet = l.replace(/^•\s*/,'').replace(/^[-•]\s*/,'').trim();
        if (bullet && !/^###/i.test(bullet) && bullet !== 'Content') {
          // Avoid adding headings
          contentItems.push(bullet);
        }
      });

      return {
        title: title.replace(/^#*/,'').trim(),
        layout: 'TITLE_AND_CONTENT',
        content: contentItems
      };
    });

    return parsed;
  };

  // FIXED: More comprehensive reset function
  const resetForm = useCallback(() => {
    console.log('🔄 Resetting form state completely');
    
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

    setUiState({
      isLoading: false,
      error: "",
      outlineModalOpen: false,
      outlineConfirmed: false,
      regenerationCount: 0,
      modifiedPrompt: "",
      generateOutlineClicked: false,
      isExample: false
    });

    // CRITICAL: Clear content state completely
    setContentState({
      title: "",
      outlineToConfirm: "",
      finalOutline: "",
      structuredContent: [],
      generatedResources: {}
    });

    // Clear any cached data
    sessionStorage.removeItem('lastGeneratedOutline');
    sessionStorage.removeItem('lastContentState');
    
    console.log('✅ Form reset complete');
  }, []);

  const handleFormChange = useCallback((field, value, isMultiSelect = false) => {
    // FIXED: Reset content when form changes significantly
    const significantFields = ['resourceType', 'gradeLevel', 'subjectFocus', 'lessonTopic'];
    
    if (significantFields.includes(field)) {
      console.log(`🔄 Significant field changed: ${field}, clearing content state`);
      setContentState({
        title: "",
        outlineToConfirm: "",
        finalOutline: "",
        structuredContent: [],
        generatedResources: {}
      });
      
      setUiState(prev => ({
        ...prev,
        outlineConfirmed: false,
        error: "",
        regenerationCount: 0
      }));
    }
    
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
      // FIXED: Reset everything before setting example
      setContentState({
        title: "",
        outlineToConfirm: "",
        finalOutline: "",
        structuredContent: [],
        generatedResources: {}
      });
      
      setUiState(prev => ({
        ...prev,
        outlineConfirmed: false,
        error: "",
        regenerationCount: 0,
        isExample: true
      }));
      
      setFormState(prev => ({
        ...EXAMPLE_FORM_DATA,
        resourceType: [EXAMPLE_FORM_DATA.resourceType],
        numSlides: prev.numSlides,
        includeImages: prev.includeImages
      }));
    } else {
      resetForm();
    }
  }, [resetForm]);

  const handleGenerateOutline = useCallback(async () => {
    // FIXED: Clear previous content before generating new
    console.log('🚀 Starting outline generation - clearing previous content');
    
    setContentState({
      title: "",
      outlineToConfirm: "",
      finalOutline: "",
      structuredContent: [],
      generatedResources: {}
    });
    
    setUiState(prev => ({
      ...prev,
      outlineConfirmed: false,
      regenerationCount: 0,
      error: ""
    }));

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

    // Check generation limits before proceeding (unless using example)
    if (!uiState.isExample && subscriptionState) {
      if (!subscriptionState.isPremium && subscriptionState.generationsLeft <= 0) {
        setUiState(prev => ({
          ...prev,
          error: `You've reached your monthly generation limit. Your limit resets ${
            subscriptionState.resetTime ? 
            `on ${new Date(subscriptionState.resetTime).toLocaleDateString()}` : 
            'next month'
          }.`
        }));
        return;
      }
    }

    setUiState(prev => ({
      ...prev,
      isLoading: true,
      error: "",
      generateOutlineClicked: true
    }));

    // Start enhanced loading with progress tracking and context
    enhancedLoading.startLoading('outline_generation', 25, {
      // supply minimal payload the background endpoint may require
      resource_types: Array.isArray(formState.resourceType) ? formState.resourceType : [formState.resourceType || 'Presentation'],
      structured_content: [],
      form_state: {
        gradeLevel: formState.gradeLevel,
        subjectFocus: formState.subjectFocus,
        language: formState.language,
        lessonTopic: formState.lessonTopic || formState.subjectFocus || 'General Learning',
        numSlides: formState.numSlides || 5,
        includeImages: Boolean(formState.includeImages)
      }
    });

    try {
      if (uiState.isExample) {
        console.log('Using clean example data - NOT counting against limits');
        
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
        
        // Stop enhanced loading on success
        enhancedLoading.stopLoading(true);
        return;
      }
      
      // Regular workflow - this WILL count against generation limits
      console.log('Making API request with form data (will count against limits)');
      
      try {
        const resourceTypes = Array.isArray(formState.resourceType) 
          ? formState.resourceType 
          : [formState.resourceType];
          
        let generatedResources = {};
        let primaryContent = null;
        let formattedOutline = "";
        let generatedTitle = "";
        
        // Use new optimized approach for multiple resource types
        const requestData = {
          resourceType: resourceTypes,  // Pass all resource types
          gradeLevel: formState.gradeLevel,
          subjectFocus: formState.subjectFocus,
          language: formState.language,
          lessonTopic: formState.lessonTopic || formState.subjectFocus || "General Learning",
          custom_prompt: formState.customPrompt || '',
          selectedStandards: Array.isArray(formState.selectedStandards) 
            ? formState.selectedStandards 
            : [],
          numSlides: formState.numSlides || 5,
          numSections: 5,
          includeImages: Boolean(formState.includeImages)
        };
        
        // DEBUG: Log request data
        console.log(`📤 API Request for ${resourceTypes.length > 1 ? 'multi-resource' : 'single resource'}:`, {
          resourceTypes,
          isMultiResource: resourceTypes.length > 1,
          requestData
        });
        
        const data = await outlineService.generate(requestData);
        
        // DEBUG: Log the response
        console.log(`📊 API Response received:`, {
          hasError: Boolean(data.error),
          hasStructuredContent: Boolean(data.structured_content),
          hasResources: Boolean(data.resources),
          generationMethod: data.generation_method,
          resourceType: data.resource_type,
          contentLength: data.structured_content?.length || 0,
          resourcesKeys: data.resources ? Object.keys(data.resources) : []
        });
        
        // Handle rate limit errors specifically
        if (data.error === 'RATE_LIMIT_EXCEEDED') {
          setUiState(prev => ({
            ...prev,
            error: 'RATE_LIMIT_EXCEEDED',
            rateLimitInfo: data.rateLimit,
            isLoading: false
          }));
          return;
        }
        
        // Handle other errors
        if (data.error) {
          throw new Error(data.error);
        }
        
        console.log(`✅ API request successful with ${data.generation_method || 'standard'} method`);

        // SAFELY Update subscription state if usage_limits are returned
        if (data.usage_limits) {
          if (subscriptionState) {
            if (typeof subscriptionState.updateSubscriptionFromResponse === 'function') {
              subscriptionState.updateSubscriptionFromResponse(data);
            } else if (typeof subscriptionState === 'object') {
              Object.assign(subscriptionState, {
                generationsLeft: data.usage_limits.generations_left || 0,
                resetTime: data.usage_limits.reset_time,
                isPremium: data.usage_limits.is_premium || false,
                tier: data.usage_limits.user_tier || 'free'
              });
            }
          }
        }
        
        // If structured_content is missing or empty, attempt a robust fallback.
        let structuredContentFromApi = Array.isArray(data.structured_content) ? data.structured_content : [];

        // If API returned structured_content but items are empty arrays, treat as empty as well
        const hasNonEmptyItems = structuredContentFromApi.some(item => Array.isArray(item.content) && item.content.length > 0);

        if (!structuredContentFromApi || structuredContentFromApi.length === 0 || !hasNonEmptyItems) {
          console.warn('API returned empty or incomplete structured_content, attempting to parse from text fields');

          // Try common fallback fields (finalOutline / final_outline / outlineToConfirm)
          const fallbackText = data.finalOutline || data.final_outline || data.outlineToConfirm || data.outline_to_confirm || data.final_outline_text || data.finalOutlineText || '';

          // If backend returned a single markdown string in data.finalOutline or data.outlineToConfirm, parse it
          const parsed = parseStructuredContentFromText(fallbackText || data.finalOutline || data.outlineToConfirm || data.outline_to_confirm || data.generated_text || '');

          if (parsed && parsed.length > 0) {
            structuredContentFromApi = parsed;
            console.log('Parsed structured content from fallback text; parsed sections:', parsed.length);
          } else {
            // As a last resort, try parsing data.finalOutline again using common alias fields
            const altText = data.final_outline || data.outlineToConfirm || data.finalOutline || '';
            const parsedAlt = parseStructuredContentFromText(altText);
            if (parsedAlt && parsedAlt.length > 0) {
              structuredContentFromApi = parsedAlt;
              console.log('Parsed structured content from alternate fallback text; sections:', parsedAlt.length);
            }
          }
        }

  // Clean/normalize the primary structured content (supports quizzes/worksheets)
  const cleanStructuredContent = structuredContentFromApi.map(item => normalizeStructuredItem(item));

        if (!cleanStructuredContent || cleanStructuredContent.length === 0) {
          throw new Error(`No valid content returned from the server`);
        }

        // Handle optimized multi-resource response
        if (data.generation_method === 'optimized_multiple_resources' && data.resources) {
          console.log('🎯 Processing sophisticated multi-resource response');
          
          // The response already contains transformed resources in the expected format
          generatedResources = data.resources;
          
          // Log what we received
          for (const [resourceType, content] of Object.entries(data.resources)) {
            console.log(`💾 Received ${resourceType} content:`, {
              resourceType,
              contentLength: Array.isArray(content) ? content.length : 0,
              hasContent: Array.isArray(content) && content.length > 0,
              firstItemSample: Array.isArray(content) && content[0] ? content[0].title : 'No items'
            });
          }
          
          primaryContent = cleanStructuredContent;
          formattedOutline = formatOutlineForDisplay(cleanStructuredContent);
          generatedTitle = data.title || `${formState.subjectFocus || 'Lesson'} - Multiple Resources`;
          
        } else {
          // Single resource or legacy format
          console.log('🎯 Processing single resource or legacy response');
          
          for (const resourceType of resourceTypes) {
            generatedResources[resourceType] = cleanStructuredContent;
            
            console.log(`💾 Stored ${resourceType} content (single/legacy):`, {
              resourceType,
              contentLength: cleanStructuredContent?.length || 0,
              hasContent: cleanStructuredContent?.length > 0
            });
          }
          
          primaryContent = cleanStructuredContent;
          formattedOutline = formatOutlineForDisplay(cleanStructuredContent);
          generatedTitle = data.title || `${resourceTypes[0]} - ${formState.subjectFocus || 'Lesson'}`;
        }
        
        // FIXED: Set content state with fresh data
        console.log('✅ Setting new content state with:', {
          title: generatedTitle,
          primaryContentLength: primaryContent?.length || 0,
          generatedResourcesKeys: Object.keys(generatedResources),
          generatedResourcesSummary: Object.entries(generatedResources).map(([type, content]) => ({
            type,
            contentLength: content?.length || 0,
            hasItems: Array.isArray(content) && content.length > 0
          }))
        });
        
        setContentState({
          title: generatedTitle,
          outlineToConfirm: formattedOutline,
          finalOutline: formattedOutline,
          structuredContent: primaryContent,
          generatedResources
        });
        
        // Automatically confirm the outline and keep the modal closed by default
        setUiState(prev => ({
          ...prev,
          outlineConfirmed: true,
          outlineModalOpen: false,
          isLoading: false
        }));
        
        // Stop enhanced loading on success
        enhancedLoading.stopLoading(true);
        
      } catch (apiError) {
        console.error('API request failed:', apiError);
        
        let errorMessage = 'Error generating outline: ';
        
        if (apiError.status === 403) {
          errorMessage += 'You have reached your generation limit.';
        } else if (apiError.status === 405) {
          errorMessage += 'Server configuration error. Try the example instead.';
        } else if (apiError.status === 400) {
          errorMessage += 'Missing required field(s).';
        } else if (apiError.message?.includes('Unexpected error')) {
          errorMessage = 'Service temporarily unavailable. Please try again later.';
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
      
      // Stop enhanced loading on error
      enhancedLoading.stopLoading(false, error.message);
    }
  }, [formState, uiState.isExample, subscriptionState, enhancedLoading]);


  const handleRegenerateOutline = useCallback(async () => {
    if (uiState.regenerationCount >= 3) {
      setUiState(prev => ({
        ...prev,
        error: "Maximum regeneration attempts (3) reached."
      }));
      return;
    }

    // Check generation limits for regeneration too
    if (subscriptionState && !subscriptionState.isPremium && subscriptionState.generationsLeft <= 0) {
      setUiState(prev => ({
        ...prev,
        error: `You've reached your monthly generation limit. Your limit resets ${
          subscriptionState.resetTime ? 
          `on ${new Date(subscriptionState.resetTime).toLocaleDateString()}` : 
          'next month'
        }.`
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

      console.log('Making regeneration API request (will count as generation)');

      const data = await outlineService.generate(requestData);
      
      if (!data.structured_content) {
        throw new Error('Invalid response format from server');
      }

      // SAFELY Update subscription state after regeneration
      if (data.usage_limits) {
        if (subscriptionState) {
          if (typeof subscriptionState.updateSubscriptionFromResponse === 'function') {
            subscriptionState.updateSubscriptionFromResponse(data);
          } else if (typeof subscriptionState === 'object') {
            Object.assign(subscriptionState, {
              generationsLeft: data.usage_limits.generations_left || 0,
              resetTime: data.usage_limits.reset_time,
              isPremium: data.usage_limits.is_premium || false,
              tier: data.usage_limits.user_tier || 'free'
            });
          }
        }
      }

      // Clean the structured content
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

      // FIXED: Completely replace content state with new data
      setContentState({
        title: regeneratedTitle,
        outlineToConfirm: formattedOutline,
        finalOutline: formattedOutline,
        structuredContent: cleanStructuredContent,
        generatedResources: updatedResources
      });

    } catch (error) {
      console.error("Error regenerating outline:", error);
      
      let errorMessage = "Error regenerating outline: ";
      
      if (error.status === 403) {
        errorMessage += 'You have reached your generation limit.';
      } else if (error.status === 405) {
        errorMessage += 'Server configuration error. Try the example instead.';
      } else if (error.status === 400) {
        errorMessage += 'Missing required field(s).';
      } else if (error.message?.includes('Unexpected error')) {
        errorMessage = 'Service temporarily unavailable. Please try again later.';
      } else if (error.error) {
        errorMessage += error.error;
      } else {
        errorMessage += 'Unexpected error occurred. Please try again later.';
      }
      
      setUiState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }));
    } finally {
      setUiState(prev => ({
        ...prev,
        isLoading: false
      }));
    }
  }, [formState, uiState.regenerationCount, uiState.modifiedPrompt, contentState.outlineToConfirm, contentState.generatedResources, contentState.title, subscriptionState]);
      
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
    enhancedLoading
  };
}