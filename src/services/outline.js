import { API, handleApiError } from '../utils/constants/api';

export const outlineService = {
  async generate(formData) {
    try {
      console.log('Sending outline request with data:', formData);
      
      const response = await fetch(`${API.BASE_URL}${API.ENDPOINTS.OUTLINE}`, {
        method: 'POST',
        headers: {
          ...API.HEADERS,
          'Authorization': `Bearer ${localStorage.getItem('userToken') || ''}`
        },
        body: JSON.stringify({
          // Use the underscore property as built by the hook.
          custom_prompt: formData.custom_prompt,
          lesson_topic: formData.lessonTopic,
          grade_level: formData.gradeLevel,
          subject_focus: formData.subjectFocus,
          language: formData.language,
          use_example: formData.useExample || false,
          resource_type: formData.resourceType,
          num_slides: formData.numSlides,
          selected_standards: formData.selectedStandards || []
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
      if (!data.messages || !data.structured_content) {
        throw new Error('Invalid response format from server');
      }

      // Validate and normalize structured content
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
        messages: data.messages,
        structured_content: validatedContent
      };
    } catch (error) {
      console.error('Error in outline service:', error);
      throw handleApiError(error);
    }
  },

  async regenerate(formData, modifiedPrompt) {
    try {
      console.log('Sending regeneration request with data:', formData);
      console.log('Modified prompt:', modifiedPrompt);
      
      const response = await fetch(`${API.BASE_URL}${API.ENDPOINTS.OUTLINE}`, {
        method: 'POST',
        headers: {
          ...API.HEADERS,
          'Authorization': `Bearer ${localStorage.getItem('userToken') || ''}`
        },
        body: JSON.stringify({
          ...formData,
          // Use the underscore property here as well.
          custom_prompt: modifiedPrompt,
          regeneration: true,
          previous_outline: formData.outlineToConfirm
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

      if (!data.messages || !data.structured_content) {
        throw new Error('Invalid response format from server');
      }

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
        messages: data.messages,
        structured_content: validatedContent
      };
    } catch (error) {
      console.error('Error in regenerate service:', error);
      throw handleApiError(error);
    }
  },

  async downloadPresentation(contentState) {
    try {
      console.log('Sending presentation request with content:', contentState);
      
      const response = await fetch(`${API.BASE_URL}${API.ENDPOINTS.GENERATE}`, {
        method: 'POST',
        headers: {
          ...API.HEADERS,
          'Accept': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'Authorization': `Bearer ${localStorage.getItem('userToken') || ''}`
        },
        body: JSON.stringify({
          lesson_outline: contentState.messages?.[0] || '',
          structured_content: contentState.structured_content || []
        }),
        credentials: 'include',
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/vnd.openxmlformats-officedocument.presentationml.presentation')) {
        throw new Error('Invalid response type from server');
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
      console.error('Error downloading presentation:', error);
      throw handleApiError(error);
    }
  }
};
