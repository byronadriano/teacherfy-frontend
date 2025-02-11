// src/pages/LessonBuilder/hooks/useOutline.js
import { useState } from 'react';
import { outlineService } from '../../../services/outline';
// Import only the formatter functions that are used in this file.
import { generateFullPrompt, generateRegenerationPrompt } from '../../../utils/outlineFormatter';

const useOutline = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [outlineData, setOutlineData] = useState(null);

  const generateOutline = async (formData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Generating outline with data:', formData);
      
      // Generate a full detailed prompt using the formatter.
      const fullPrompt = generateFullPrompt(formData);
      console.log('Generated full prompt:', fullPrompt);

      // Build request data with the custom prompt.
      const requestData = {
        grade_level: formData.gradeLevel,
        subject_focus: formData.subjectFocus,
        lesson_topic: formData.lessonTopic,
        district: formData.district, // If no longer used, you can remove this field.
        language: formData.language,
        custom_prompt: fullPrompt,  // Notice we use custom_prompt (with underscore) here.
        resource_type: formData.resourceType,
        num_slides: formData.numSlides,
        selected_standards: formData.selectedStandards || []
      };

      const data = await outlineService.generate(requestData);
      console.log('Received outline data:', data);
      
      if (!data || !data.structured_content || !Array.isArray(data.structured_content)) {
        throw new Error('Invalid response format from server');
      }
      
      // Validate each slide's structure.
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

  const regenerateOutline = async (formData, modifiedPrompt) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Generate a regeneration prompt using the formatter.
      const regenPrompt = generateRegenerationPrompt(formData, modifiedPrompt);
      console.log('Generated regeneration prompt:', regenPrompt);

      const requestData = {
        grade_level: formData.gradeLevel,
        subject_focus: formData.subjectFocus,
        lesson_topic: formData.lessonTopic,
        district: formData.district, // Remove this if not needed.
        language: formData.language,
        custom_prompt: regenPrompt, // use the regenerated prompt
        resource_type: formData.resourceType,
        num_slides: formData.numSlides,
        selected_standards: formData.selectedStandards || [],
        outlineToConfirm: formData.outlineToConfirm // if available
      };

      const data = await outlineService.regenerate(requestData, regenPrompt);
      
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

export default useOutline;
