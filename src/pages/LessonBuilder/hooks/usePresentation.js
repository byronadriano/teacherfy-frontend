// src/pages/LessonBuilder/hooks/usePresentation.js
import { useState, useCallback } from 'react';
import { presentationService } from '../../../services';
import { API } from '../../../utils/constants';

const usePresentation = ({ token, user, isAuthenticated, setShowSignInPrompt }) => {
  const [googleSlidesState, setGoogleSlidesState] = useState({ isGenerating: false });
  const [isLoading, setIsLoading] = useState(false);
  
  // Example subscription state—adjust as needed.
  const [subscriptionState] = useState({ 
    isPremium: isAuthenticated && user?.isPremium, 
    downloadCount: 0 
  });

  // Generate a single presentation (legacy support)
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
          teacherNotesLength: slide.teacher_notes.length
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

  // Generate multiple resources
  const generateMultiResource = async (formState, contentState) => {
    try {
      setIsLoading(true);
      
      // Check if we have valid content
      if (!contentState.structuredContent?.length) {
        throw new Error('No content available to generate resources');
      }
      
      // Check for authentication if needed
      if (!isAuthenticated && subscriptionState.downloadCount >= 5) {
        setShowSignInPrompt();
        throw new Error('Download limit reached. Please sign in or upgrade.');
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
      
      // Call the service to generate resources
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