//src/services/presentation.js
import { config } from '../utils/config';

export const presentationService = {
  async generatePptx(formState, contentState) {
    try {
      console.log('Generating presentation with:', {
        formState: {
          resourceType: formState.resourceType,
          gradeLevel: formState.gradeLevel,
          subjectFocus: formState.subjectFocus,
          language: formState.language
        },
        contentState: {
          hasStructuredContent: Boolean(contentState.structuredContent),
          slidesCount: contentState.structuredContent?.length || 0
        }
      });
      
      // Validate content before sending to server
      if (!contentState.structuredContent || !Array.isArray(contentState.structuredContent) || contentState.structuredContent.length === 0) {
        console.error('Invalid content state:', contentState);
        throw new Error('No slide content available for presentation generation');
      }
      
      // Validate each slide has required properties
      contentState.structuredContent.forEach((slide, index) => {
        if (!slide.title) {
          console.warn(`Slide ${index} missing title`);
        }
        if (!slide.layout) {
          console.warn(`Slide ${index} missing layout`);
        }
        // Validate content arrays
        if (!Array.isArray(slide.content)) {
          console.warn(`Slide ${index} content is not an array`);
        }
        if (!Array.isArray(slide.teacher_notes)) {
          console.warn(`Slide ${index} teacher_notes is not an array`);
        }
      });
      
      // Build a clean request object with only what the backend needs
      const requestData = {
        lesson_outline: contentState.finalOutline || '',
        structured_content: contentState.structuredContent.map((slide, index) => ({
          title: slide.title || `Slide ${index + 1}`,
          layout: slide.layout || 'TITLE_AND_CONTENT',
          content: Array.isArray(slide.content) ? slide.content : [],
          teacher_notes: Array.isArray(slide.teacher_notes) ? slide.teacher_notes : [],
          visual_elements: Array.isArray(slide.visual_elements) ? slide.visual_elements : [],
          left_column: Array.isArray(slide.left_column) ? slide.left_column : [],
          right_column: Array.isArray(slide.right_column) ? slide.right_column : []
        }))
      };
      
      console.log('Sending presentation request with data:', {
        outline_length: requestData.lesson_outline?.length || 0,
        slides_count: requestData.structured_content?.length || 0
      });
      
      // Determine API URL - use config if available, or construct from known pattern
      const apiUrl = config.apiUrl || 
        (window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://teacherfy.ai');
      
      console.log('Sending request to:', `${apiUrl}/generate`);
      
      const response = await fetch(`${apiUrl}/generate`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        },
        body: JSON.stringify(requestData)
      });
  
      console.log('Presentation response status:', response.status);
      console.log('Response headers:', Object.fromEntries([...response.headers.entries()]));
      
      if (!response.ok) {
        console.error('Server returned error status:', response.status);
        
        let errorMessage = `Server error: ${response.status}`;
        try {
          // Try to get more details about the error
          const contentType = response.headers.get('content-type');
          
          if (contentType && contentType.includes('application/json')) {
            const errorJson = await response.json();
            console.error('Error response JSON:', errorJson);
            errorMessage = errorJson.error || errorJson.message || errorMessage;
          } else {
            const errorText = await response.text();
            console.error('Error response text:', errorText);
            errorMessage = `${errorMessage}. Details: ${errorText.substring(0, 150)}...`;
          }
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }
        
        throw new Error(errorMessage);
      }
  
      // Verify response content type
      const contentType = response.headers.get('content-type');
      console.log('Response content type:', contentType);
      
      if (!contentType || !contentType.includes('application/vnd.openxmlformats-officedocument.presentationml.presentation')) {
        console.warn('Unexpected content type:', contentType);
        
        // Try to log content for debugging
        try {
          const textContent = await response.text();
          console.error('Unexpected response content (first 200 chars):', textContent.substring(0, 200));
        } catch (err) {
          console.error('Could not read response content:', err);
        }
        
        throw new Error(`Invalid response type from server: ${contentType || 'unknown'}`);
      }
  
      // Get the blob and create a download link
      const blob = await response.blob();
      console.log('Got blob of size:', blob.size);
      
      if (blob.size < 1000) {  // PPTX files should be at least a few KB
        console.error('Received file is suspiciously small:', blob.size, 'bytes');
        throw new Error('File returned from server appears to be invalid or incomplete');
      }
      
      // Create and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      
      // Create a meaningful filename
      const topicSlug = formState.lessonTopic 
        ? formState.lessonTopic.toLowerCase().replace(/[^a-z0-9]+/g, '_').substring(0, 30)
        : 'lesson';
        
      a.download = `${topicSlug}_presentation.pptx`;
      document.body.appendChild(a);
      
      console.log('Triggering download with filename:', a.download);
      a.click();
      
      // Clean up
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        console.log('Download complete and resources cleaned up');
      }, 1000);
      
      return blob;
    } catch (error) {
      console.error('Presentation generation error:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      // Re-throw with a user-friendly message
      throw new Error(`Failed to generate presentation: ${error.message}`);
    }
  },
  
  // Add additional methods if needed for Google Slides, etc.
};