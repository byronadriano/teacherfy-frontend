import { API } from '../utils/constants';

export const presentationService = {
  async generatePptx(formState, contentState) {
    try {
      console.log('Generating presentation with URL:', `${API.BASE_URL}${API.ENDPOINTS.GENERATE}`);
      
      const response = await fetch(`${API.BASE_URL}${API.ENDPOINTS.GENERATE}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        },
        body: JSON.stringify({
          lesson_outline: contentState.finalOutline || '',
          structured_content: contentState.structuredContent,
          ...formState,
        })
      });

      // Detailed error handling for non-OK responses
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      // Check content type
      const contentType = response.headers.get('content-type');
      console.log('Response Content-Type:', contentType);

      if (!contentType || !contentType.includes('application/vnd.openxmlformats-officedocument.presentationml.presentation')) {
        throw new Error(`Unexpected content type: ${contentType}`);
      }

      // Convert response to Blob
      const blob = await response.blob();

      // Validate Blob
      if (!(blob instanceof Blob)) {
        throw new Error('Response is not a valid Blob');
      }

      // Log Blob details
      console.log('Blob details:', {
        size: blob.size,
        type: blob.type
      });

      return blob;
    } catch (error) {
      console.error('Detailed fetch error:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
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
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Origin': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
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
        const errorData = await response.json().catch(() => ({ 
          message: response.statusText || 'Failed to generate Google Slides' 
        }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Validate response data
      if (!data || !data.presentation_url) {
        throw new Error('Invalid response from Google Slides generation');
      }

      // Open Google Slides in new tab
      window.open(data.presentation_url, '_blank');

      return data;
    } catch (error) {
      console.error('Error generating Google Slides:', error);
      // Add more descriptive error message
      if (error.message.includes('401')) {
        throw new Error('Authentication expired. Please sign in again.');
      }
      if (error.message.includes('403')) {
        throw new Error('You do not have permission to create Google Slides. Please check your Google account settings.');
      }
      throw error;
    }
  },

  // Helper method to handle errors
  handleError(error) {
    console.error('Presentation service error:', error);
    if (error.message.includes('limit reached')) {
      return {
        error: 'You have reached your daily limit. Please upgrade to continue.',
        requireUpgrade: true
      };
    }
    return {
      error: error.message || 'An error occurred while generating the presentation',
      requireUpgrade: false
    };
  }
};