import { useState } from 'react';
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

      alert('Presentation downloaded successfully!');
    } catch (error) {
      console.error('Complete presentation generation error:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      const errorMessage = error.message.includes('Failed to fetch') 
        ? 'Unable to connect to the server. Please check your internet connection or try again later.' 
        : error.message;
      
      alert(`Presentation Generation Error: ${errorMessage}`);
      throw error;
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
    } catch (error) {
      console.error('Error generating Google Slides:', error);
      alert(`Google Slides Generation Error: ${error.message}`);
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
