// src/pages/LessonBuilder/hooks/useOutline.js
import { useState } from 'react';
import { outlineService } from '../../../services/outline';
// Import only the formatter functions that are used in this file.
import { generateFullPrompt, generateRegenerationPrompt } from '../../../utils/outlineFormatter';
import { log, error as logError } from '../../../utils/logger';

const useOutline = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [outlineData, setOutlineData] = useState(null);

  const generateOutline = async (formData) => {
    setIsLoading(true);
    setError(null);
    
    try {
  log('Generating outline with data:', formData);
      
      // Generate a full detailed prompt using the formatter.
      const fullPrompt = generateFullPrompt(formData);
  log('Generated full prompt:', fullPrompt);

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
      
      if (process.env.NODE_ENV === 'development') {
        log('🎯 Generated content structure:', {
          resourceType: formData.resourceType,
          sectionsCount: data.structured_content?.length,
          firstSectionFields: data.structured_content?.[0] ? Object.keys(data.structured_content[0]) : [],
          hasModernStructure: data.structured_content?.[0] ? 
            ('structured_activities' in data.structured_content[0] || 
             'structured_questions' in data.structured_content[0] ||
             'objectives' in data.structured_content[0]) : false
        });
      }
      
      if (!data || !data.structured_content || !Array.isArray(data.structured_content)) {
        throw new Error('Invalid response format from server');
      }
      
      // Preserve the actual structure from the server response without forcing obsolete fields
      const validatedContent = data.structured_content.map((slide, index) => {
        const validSlide = {
          title: slide.title || `Section ${index + 1}`,
          layout: slide.layout || 'TITLE_AND_CONTENT'
        };
        
        // Only include fields that actually exist in the response
        Object.keys(slide).forEach(key => {
          if (key !== 'title' && key !== 'layout') {
            if (Array.isArray(slide[key])) {
              validSlide[key] = [...slide[key]];
            } else if (slide[key] !== undefined && slide[key] !== null) {
              validSlide[key] = slide[key];
            }
          }
        });
        
        return validSlide;
      });

      setOutlineData({
        messages: Array.isArray(data.messages) ? data.messages : [],
        structured_content: validatedContent
      });

      return {
        messages: data.messages,
        structured_content: validatedContent
      };
    } catch (err) {
  logError('Error generating outline:', err);
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
  log('Generated regeneration prompt:', regenPrompt);

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
