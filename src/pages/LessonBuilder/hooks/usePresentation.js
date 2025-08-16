//src/pages/LessonBuilder/hooks/usePresentation.js
import { useState, useEffect } from 'react';
import { presentationService } from '../../../services';
import { log, error as logError } from '../../../utils/logger';
import { API } from '../../../utils/constants';

const usePresentation = ({ token, user, isAuthenticated, setShowSignInPrompt }) => {
  const [googleSlidesState, setGoogleSlidesState] = useState({ isGenerating: false });
  const [isLoading, setIsLoading] = useState(false);
  
  // FIXED: Track subscription state properly
  const [subscriptionState, setSubscriptionState] = useState({ 
    isPremium: false,
    tier: 'free',
    generationsUsed: 0,
    generationsLeft: 10,  // Default for free tier
    resetTime: null
  });

  // FIXED: Fetch the latest generation limits when user changes
  useEffect(() => {
    const fetchGenerationLimits = async () => {
      if (!isAuthenticated) {
        // Set anonymous user limits
        setSubscriptionState({
          isPremium: false,
          tier: 'free',
          generationsUsed: 0,
          generationsLeft: 10,
          resetTime: null
        });
        return;
      }

      try {
        const response = await fetch(`${API.BASE_URL}/auth/check`, {
          method: 'GET',
          credentials: 'include',
          headers: API.HEADERS
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // FIXED: Extract subscription info from auth response
          const userInfo = data.user || {};
          const usageLimits = data.usage_limits || {};
          
          setSubscriptionState({
            isPremium: userInfo.is_premium || false,
            tier: userInfo.subscription_tier || 'free',
            generationsUsed: usageLimits.current_usage?.generations_used || 0,
            generationsLeft: usageLimits.generations_left || (userInfo.is_premium ? 999999 : 10),
            resetTime: usageLimits.reset_time || null
          });
          
          log('Updated subscription state:', {
            isPremium: userInfo.is_premium || false,
            tier: userInfo.subscription_tier || 'free',
            generationsLeft: usageLimits.generations_left || (userInfo.is_premium ? 999999 : 10)
          });
        }
      } catch (error) {
  logError('Error fetching generation limits:', error);
        // Default to free tier on error
        setSubscriptionState({
          isPremium: false,
          tier: 'free',
          generationsUsed: 0,
          generationsLeft: 10,
          resetTime: null
        });
      }
    };
    
    fetchGenerationLimits();
  }, [isAuthenticated, user?.email]); // Re-fetch when auth state changes

  // FIXED: Update subscription state when usage limits are returned from API calls
  const updateSubscriptionFromResponse = (responseData) => {
    if (responseData?.usage_limits) {
      const limits = responseData.usage_limits;
      setSubscriptionState(prev => ({
        ...prev,
        isPremium: limits.is_premium || false,
        tier: limits.user_tier || 'free',
        generationsUsed: limits.current_usage?.generations_used || prev.generationsUsed,
        generationsLeft: limits.generations_left || (limits.is_premium ? 999999 : 10),
        resetTime: limits.reset_time || prev.resetTime
      }));
    }
  };

  // Generate a single presentation (legacy support) - NO LIMITS CHECKED HERE
  const generatePresentation = async (formState, contentState) => {
    try {
      setIsLoading(true);
  log('Generating presentation with:', {
        baseUrl: API.BASE_URL,
        formState,
        contentState: {
          finalOutline: contentState.finalOutline,
          structuredContentLength: contentState.structuredContent.length
        }
      });

      // Log each slide's details for debugging.
      contentState.structuredContent.forEach((slide, index) => {
  log(`Slide ${index + 1}:`, {
          title: slide.title,
          layout: slide.layout,
          contentLength: slide.content.length,
          teacherNotesLength: slide.teacher_notes?.length || 0
        });
      });

      const blob = await presentationService.generatePptx(formState, contentState);
      
      // Create and click a download link for the generated presentation.
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${formState.lessonTopic || 'lesson'}_presentation.pptx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);

      return { status: 'success' };
    } catch (error) {
  logError('Complete presentation generation error:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      const errorMessage = error.message.includes('Failed to fetch') 
        ? 'Unable to connect to the server. Please check your internet connection or try again later.' 
        : error.message;
      
      return { 
        status: 'error',
        message: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Generate multiple resources - NO LIMITS CHECKED HERE (limits checked on outline generation)
  const generateMultiResource = async (formState, contentState, specificResourceTypes = null) => {
    try {
      setIsLoading(true);
      
      // Check if we have valid content
      if (!contentState.structuredContent?.length) {
        throw new Error('No content available to generate resources');
      }
      
      // Log generation details
  log('Generating resources with:', {
        originalResourceTypes: formState.resourceType,
        specificResourceTypes,
        contentState: {
          hasStructuredContent: Boolean(contentState.structuredContent),
          structuredContentLength: contentState.structuredContent?.length || 0,
          generatedResourcesCount: Object.keys(contentState.generatedResources || {}).length
        }
      });
      
      // Call the service to generate resources - pass specific types if provided
      const results = await presentationService.generateMultiResource(formState, contentState, specificResourceTypes);
      
      return results;
    } catch (error) {
  logError('Multi-resource generation error:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      throw new Error(`Failed to generate resources: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const generateGoogleSlides = async (formState, contentState) => {
    try {
      if (!isAuthenticated) {
        setShowSignInPrompt();
        return;
      }

      setGoogleSlidesState(prev => ({ ...prev, isGenerating: true }));
      await presentationService.generateGoogleSlides(formState, contentState, token);
      
      return { status: 'success' };
    } catch (error) {
  logError('Error generating Google Slides:', error);
      
      return { 
        status: 'error',
        message: `Google Slides Generation Error: ${error.message}`
      };
    } finally {
      setGoogleSlidesState(prev => ({ ...prev, isGenerating: false }));
    }
  };

  return {
    isLoading,
    googleSlidesState,
    subscriptionState,
    generatePresentation,
    generateMultiResource,
    generateGoogleSlides,
    updateSubscriptionFromResponse, // Export this for use in other hooks
  };
};

export default usePresentation;