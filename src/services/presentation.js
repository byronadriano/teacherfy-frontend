//src/services/presentation.js
import { config } from '../utils/config';

export const presentationService = {
  async generatePptx(formState, contentState) {
    try {
      console.log('Generating presentation with form state:', formState);
      console.log('Generating presentation with content state:', {
        outline: contentState.finalOutline ? contentState.finalOutline.substring(0, 100) + '...' : 'None',
        structuredContentLength: contentState.structuredContent ? contentState.structuredContent.length : 0
      });
      
      // Build a clean request object with only what the backend needs
      const requestData = {
        lesson_outline: contentState.finalOutline || '',
        structured_content: contentState.structuredContent || []
      };
      
      console.log('Sending presentation request to:', `${config.apiUrl}/generate`);
      
      const response = await fetch(`${config.apiUrl}/generate`, {
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
        // Try to get detailed error message
        try {
          const errorJson = await response.json();
          throw new Error(`Server error: ${response.status}. Message: ${errorJson.error || 'Unknown error'}`);
        } catch (parseError) {
          throw new Error(`Server error: ${response.status}. Could not parse error details.`);
        }
      }

      const contentType = response.headers.get('content-type');
      console.log('Response content type:', contentType);
      
      if (!contentType || !contentType.includes('application/vnd.openxmlformats-officedocument.presentationml.presentation')) {
        console.warn('Unexpected content type:', contentType);
        // Try to log the content for debugging
        try {
          const textContent = await response.text();
          console.log('Response content (first 500 chars):', textContent.substring(0, 500));
          throw new Error(`Invalid response type from server: ${contentType}`);
        } catch (textError) {
          throw new Error(`Invalid response type from server: ${contentType}`);
        }
      }

      // Get the blob and create a download link
      const blob = await response.blob();
      console.log('Got blob of size:', blob.size);
      
      // Create and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'lesson_presentation.pptx';
      document.body.appendChild(a);
      
      console.log('Triggering download...');
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log('Download complete!');
      return blob;
    } catch (error) {
      console.error('Complete presentation generation error:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  },
  
  // Add additional methods if needed for Google Slides, etc.
};