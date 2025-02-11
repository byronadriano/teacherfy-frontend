import { API } from '../utils/constants';

export const presentationService = {
  async generatePptx(formState, contentState) {
    try {
        console.log('Generating presentation...');
        
        const response = await fetch(`${API.BASE_URL}${API.ENDPOINTS.GENERATE}`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
            },
            body: JSON.stringify({
                lesson_outline: contentState.finalOutline || '',
                structured_content: contentState.structuredContent,
                ...formState,
            })
        });

        if (!response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate presentation');
            }
            throw new Error(`Server error: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/vnd.openxmlformats-officedocument.presentationml.presentation')) {
            throw new Error('Invalid response type received');
        }

        const blob = await response.blob();
        if (blob.size === 0) {
            throw new Error('Received empty file');
        }

        return blob;
    } catch (error) {
        console.error('Presentation generation error:', error);
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