// src/pages/LessonBuilder/hooks/usePresentation.js
import { useState } from 'react';
import { outlineService } from '../../../services/outline';

const usePresentation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [outlineData, setOutlineData] = useState(null);

  const generateOutline = async (formData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Generating outline with data:', formData);
      const data = await outlineService.generate(formData);
      console.log('Received outline data:', data);
      
      if (!data || !data.structured_content || !Array.isArray(data.structured_content)) {
        throw new Error('Invalid response format from server');
      }
      
      // Validate the response structure
      const validatedContent = data.structured_content.map((slide, index) => ({
        title: slide.title || `Slide ${index + 1}`,
        layout: slide.layout || 'TITLE_AND_CONTENT',
        content: Array.isArray(slide.content) ? slide.content : [],
        teacher_notes: Array.isArray(slide.teacher_notes) ? slide.teacher_notes : [],
        visual_elements: Array.isArray(slide.visual_elements) ? slide.visual_elements : [],
        left_column: Array.isArray(slide.left_column) ? slide.left_column : [],
        right_column: Array.isArray(slide.right_column) ? slide.right_column : []
      }));

      setOutlineData({
        messages: Array.isArray(data.messages) ? data.messages : [],
        structured_content: validatedContent
      });

      return {
        messages: data.messages,
        structured_content: validatedContent
      };
    } catch (err) {
      console.error('Error generating outline:', err);
      setError(err.message || 'Failed to generate outline');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateOutline = async (formData, regenerationPrompt) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await outlineService.regenerate(formData, regenerationPrompt);
      
      if (!data || !data.structured_content) {
        throw new Error('Invalid response format from server');
      }
      
      setOutlineData(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to regenerate outline');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    outlineData,
    generateOutline,
    regenerateOutline,
    setError
  };
};

export default usePresentation;