// src/services/presentation.js
import { API } from '../utils/constants';

export const presentationService = {
  async generatePptx(formData, contentState) {
    try {
      const response = await fetch(`${API.BASE_URL}${API.ENDPOINTS.GENERATE}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        },
        body: JSON.stringify({
          lesson_outline: contentState.finalOutline,
          structured_content: contentState.structuredContent,
          ...formData,
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Check for PowerPoint-like content type
      const contentType = response.headers.get('content-type');
      if (contentType && (
        contentType.includes('application/vnd.openxmlformats-officedocument') ||
        contentType.includes('application/octet-stream') ||
        contentType.includes('application/binary')
      )) {
        return await response.blob();
      }

      // If we get here, try to get the blob anyway
      try {
        return await response.blob();
      } catch (e) {
        throw new Error('Failed to get presentation data');
      }
    } catch (error) {
      console.error('Error generating presentation:', error);
      throw error;
    }
  },

  async generateGoogleSlides(formData, contentState, token) {
    if (!token) {
      throw new Error('Authentication required for Google Slides generation');
    }

    try {
      const response = await fetch(`${API.BASE_URL}${API.ENDPOINTS.GENERATE_SLIDES}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          structured_content: contentState.structuredContent,
          meta: {
            lesson_topic: formData.lessonTopic,
            district: formData.district,
            grade_level: formData.gradeLevel,
            subject_focus: formData.subjectFocus,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error generating Google Slides:', error);
      throw error;
    }
  }
};