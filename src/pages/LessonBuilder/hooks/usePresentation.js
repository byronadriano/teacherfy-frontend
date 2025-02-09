// src/pages/LessonBuilder/hooks/usePresentation.js
import { useState } from 'react';
import { presentationService } from '../../../services';

const usePresentation = ({ token, user, isAuthenticated, setShowSignInPrompt }) => {
  const [googleSlidesState, setGoogleSlidesState] = useState({ isGenerating: false });
  const [isLoading, setIsLoading] = useState(false);
  
  // This can be updated to fetch from your backend
  const [subscriptionState] = useState({ 
    isPremium: isAuthenticated && user?.isPremium, 
    downloadCount: 0 
  });

  const generatePresentation = async (formState, contentState) => {
    try {
      setIsLoading(true);
      console.log('Generating presentation with:', {
        formState,
        contentState: {
          finalOutline: contentState.finalOutline,
          structuredContentLength: contentState.structuredContent.length
        }
      });
  
      // Log structured content details
      contentState.structuredContent.forEach((slide, index) => {
        console.log(`Slide ${index + 1}:`, {
          title: slide.title,
          layout: slide.layout,
          contentLength: slide.content.length,
          teacherNotesLength: slide.teacher_notes.length
        });
      });
  
      const blob = await presentationService.generatePptx(formState, contentState);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'lesson_presentation.pptx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
  
      // Optional: Show success message
      alert('Presentation downloaded successfully!');
    } catch (error) {
      console.error('Complete presentation generation error:', error);
      
      // Show user-friendly error message
      alert(`Failed to generate presentation: ${error.message}`);
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const generateGoogleSlides = async (formState, contentState) => {
    try {
      // Only Google Slides needs authentication
      if (!isAuthenticated) {
        setShowSignInPrompt();
        return;
      }

      setGoogleSlidesState(prev => ({ ...prev, isGenerating: true }));
      await presentationService.generateGoogleSlides(formState, contentState, token);
    } catch (error) {
      console.error('Error generating Google Slides:', error);
      throw error;
    } finally {
      setGoogleSlidesState(prev => ({ ...prev, isGenerating: false }));
    }
  };

  return {
    isLoading,
    googleSlidesState,
    subscriptionState,
    generatePresentation,
    generateGoogleSlides,
  };
};

export default usePresentation;