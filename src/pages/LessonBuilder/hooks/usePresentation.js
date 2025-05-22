import { useState, useEffect } from 'react';
import { presentationService } from '../../../services';
import { API } from '../../../utils/constants';

const usePresentation = ({ token, user, isAuthenticated, setShowSignInPrompt }) => {
  const [googleSlidesState, setGoogleSlidesState] = useState({ isGenerating: false });
  const [isLoading, setIsLoading] = useState(false);
  
  // Update to track generation limits (not download limits)
  const [subscriptionState, setSubscriptionState] = useState({ 
    isPremium: isAuthenticated && user?.isPremium, 
    generationsUsed: 0,
    generationsLeft: 5,
    resetTime: null
  });

  // Add useEffect to fetch the latest generation limits
  useEffect(() => {
    const fetchGenerationLimits = async () => {
      try {
        const response = await fetch(`${API.BASE_URL}/auth/check`, {
          method: 'GET',
          credentials: 'include',
          headers: API.HEADERS
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.usage_limits) {
            setSubscriptionState(prev => ({
              ...prev,
              generationsUsed: 5 - (data.usage_limits.generations_left || 0),
              generationsLeft: data.usage_limits.generations_left || 0,
              resetTime: data.usage_limits.reset_time || null
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching generation limits:', error);
      }
    };
    
    fetchGenerationLimits();
  }, [isAuthenticated]);

  // Generate a single presentation (legacy support) - NO LIMITS CHECKED HERE
  const generatePresentation = async (formState, contentState) => {
    try {
      setIsLoading(true);
      console.log('Generating presentation with:', {
        baseUrl: API.BASE_URL,
        formState,
        contentState: {
          finalOutline: contentState.finalOutline,
          structuredContentLength: contentState.structuredContent.length
        }
      });

      // Log each slide's details for debugging.
      contentState.structuredContent.forEach((slide, index) => {
        console.log(`Slide ${index + 1}:`, {
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
      console.error('Complete presentation generation error:', {
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
  const generateMultiResource = async (formState, contentState) => {
    try {
      setIsLoading(true);
      
      // Check if we have valid content
      if (!contentState.structuredContent?.length) {
        throw new Error('No content available to generate resources');
      }
      
      // Log generation details
      console.log('Generating multiple resources with:', {
        resourceTypes: formState.resourceType,
        contentState: {
          hasStructuredContent: Boolean(contentState.structuredContent),
          structuredContentLength: contentState.structuredContent?.length || 0,
          generatedResourcesCount: Object.keys(contentState.generatedResources || {}).length
        }
      });
      
      // Call the service to generate resources - NO LIMIT CHECKS
      const results = await presentationService.generateMultiResource(formState, contentState);
      
      return results;
    } catch (error) {
      console.error('Multi-resource generation error:', {
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
      console.error('Error generating Google Slides:', error);
      
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
  };
};

export default usePresentation;