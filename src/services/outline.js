// src/services/outline.js
import { API } from '../utils/constants/api';

export const outlineService = {
  async generate(formData) {
    try {
      console.log('Sending outline request with data:', formData);
      
      const response = await fetch(`${API.BASE_URL}${API.ENDPOINTS.OUTLINE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          custom_prompt: formData.customPrompt,
          lesson_topic: formData.lessonTopic,
          grade_level: formData.gradeLevel,
          subject_focus: formData.subjectFocus,
          language: formData.language,
          use_example: formData.useExample || false,
          resource_type: formData.resourceType,
          num_slides: formData.numSlides
        }),
        credentials: 'include',
        mode: 'cors'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received response from server:', data);

      // Validate response data
      if (!data.structured_content || !Array.isArray(data.structured_content)) {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response format from server');
      }

      // Ensure each slide has the required properties
      const validatedContent = data.structured_content.map((slide, index) => ({
        title: slide.title || `Slide ${index + 1}`,
        layout: slide.layout || 'TITLE_AND_CONTENT',
        content: Array.isArray(slide.content) ? slide.content : [],
        teacher_notes: Array.isArray(slide.teacher_notes) ? slide.teacher_notes : [],
        visual_elements: Array.isArray(slide.visual_elements) ? slide.visual_elements : [],
        left_column: Array.isArray(slide.left_column) ? slide.left_column : [],
        right_column: Array.isArray(slide.right_column) ? slide.right_column : []
      }));

      return {
        messages: Array.isArray(data.messages) ? data.messages : [],
        structured_content: validatedContent
      };
    } catch (error) {
      console.error('Error in outline service:', error);
      throw error;
    }
  },

  async regenerate(formData) {
    try {
      console.log('Sending regeneration request with data:', formData);
      
      const response = await fetch(`${API.BASE_URL}${API.ENDPOINTS.OUTLINE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          regeneration: true
        }),
        credentials: 'include',
        mode: 'cors'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received regeneration response:', data);

      return {
        messages: Array.isArray(data.messages) ? data.messages : [],
        structured_content: Array.isArray(data.structured_content) ? data.structured_content : []
      };
    } catch (error) {
      console.error('Error in regenerate service:', error);
      throw error;
    }
  },

  async downloadPresentation(contentState) {
    try {
      console.log('Sending download request with content:', contentState);
      
      const response = await fetch(`${API.BASE_URL}${API.ENDPOINTS.GENERATE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        },
        body: JSON.stringify({
          lesson_outline: contentState.messages?.[0] || '',
          structured_content: contentState.structured_content || []
        }),
        credentials: 'include',
        mode: 'cors'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'lesson_presentation.pptx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return true;
    } catch (error) {
      console.error('Error in download service:', error);
      throw error;
    }
  }
};