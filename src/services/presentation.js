//src/services/presentation.js
import { config } from '../utils/config';

/**
 * Normalize resource type to match backend expectations
 * @param {string} resourceType - The resource type to normalize
 * @return {string} - Normalized resource type
 */
function normalizeResourceType(resourceType) {
  // First convert to lowercase
  const normalized = resourceType.toLowerCase();
  
  // Handle special cases
  if (normalized.includes('quiz') || normalized.includes('test')) {
    return 'quiz';
  } else if (normalized.includes('lesson') && normalized.includes('plan')) {
    return 'lesson_plan';
  } else if (normalized.includes('worksheet')) {
    return 'worksheet';
  } else if (normalized.includes('presentation') || normalized.includes('slide')) {
    return 'presentation';
  }
  
  // Default fallback - replace spaces and slashes
  return normalized.replace(/\s+/g, '_').replace('/', '_');
}

export const presentationService = {
  async generateMultiResource(formState, contentState, specificResources = null) {
    try {
      // Get resources to generate - either specified or from form state
      const resourceTypes = specificResources || 
        (Array.isArray(formState.resourceType) ? formState.resourceType : [formState.resourceType]);
      
      console.log('Generating multiple resources with:', {
        resourceTypes,
        formState: {
          resourceType: formState.resourceType,
          gradeLevel: formState.gradeLevel,
          subjectFocus: formState.subjectFocus,
          language: formState.language
        },
        contentState: {
          hasStructuredContent: Boolean(contentState.structuredContent),
          resourcesGenerated: Object.keys(contentState.generatedResources || {})
        }
      });
      
      // For each resource type, generate the file
      const results = {};
      
      for (const resourceType of resourceTypes) {
        const structuredContent = 
          contentState.generatedResources?.[resourceType] || 
          contentState.structuredContent;
          
        // Skip if no content available
        if (!structuredContent || !Array.isArray(structuredContent) || structuredContent.length === 0) {
          console.warn(`No content available for ${resourceType}, skipping generation`);
          results[resourceType] = { error: 'No content available' };
          continue;
        }
        
        try {
          // Build request data for this resource type
          const requestData = {
            // Use the normalized resource type to ensure backend compatibility
            resource_type: normalizeResourceType(resourceType),
            lesson_outline: contentState.finalOutline || '',
            structured_content: structuredContent.map((slide, index) => ({
              title: slide.title || `Item ${index + 1}`,
              layout: slide.layout || 'TITLE_AND_CONTENT',
              content: Array.isArray(slide.content) ? slide.content : []
            }))
          };
          
          // Determine API URL
          const apiUrl = config.apiUrl || 
            (window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://teacherfy.ai');
          
          console.log(`Sending request to generate ${resourceType} to: ${apiUrl}/generate`);
          
          const response = await fetch(`${apiUrl}/generate`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Accept': '*/*'
            },
            body: JSON.stringify(requestData)
          });
          
          console.log(`${resourceType} response status:`, response.status);
          
          if (!response.ok) {
            console.error(`Server returned error for ${resourceType}:`, response.status);
            let errorMessage = `Server error: ${response.status}`;
            
            try {
              const contentType = response.headers.get('content-type');
              if (contentType && contentType.includes('application/json')) {
                const errorJson = await response.json();
                errorMessage = errorJson.error || errorJson.message || errorMessage;
              } else {
                const errorText = await response.text();
                errorMessage = `${errorMessage}. Details: ${errorText.substring(0, 150)}...`;
              }
            } catch (e) {
              console.error('Failed to parse error response:', e);
            }
            
            results[resourceType] = { error: errorMessage };
            continue;
          }
          
          // Verify response content type
          const contentType = response.headers.get('content-type');
          
          // Different content types for different resources
          const validTypes = [
            'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PPTX
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',  // DOCX
            'application/pdf', // PDF
            'application/octet-stream' // Generic binary
          ];
          
          if (!contentType || !validTypes.some(type => contentType.includes(type))) {
            console.warn(`Unexpected content type for ${resourceType}:`, contentType);
            
            try {
              const textContent = await response.text();
              console.error(`Unexpected response content for ${resourceType} (first 200 chars):`, textContent.substring(0, 200));
            } catch (err) {
              console.error('Could not read response content:', err);
            }
            
            results[resourceType] = { 
              error: `Invalid response type from server: ${contentType || 'unknown'}` 
            };
            continue;
          }
          
          // Get the blob and store it in results
          const blob = await response.blob();
          console.log(`Got blob for ${resourceType} of size:`, blob.size);
          
          if (blob.size < 1000) {  // Files should be at least a few KB
            console.error(`Received file for ${resourceType} is suspiciously small:`, blob.size, 'bytes');
            results[resourceType] = { 
              error: 'File returned from server appears to be invalid or incomplete' 
            };
            continue;
          }
          
          // Add the blob to results
          results[resourceType] = { blob, contentType };
          
          // Generate appropriate file extension
          let fileExt = '.bin';
          if (contentType.includes('presentation')) fileExt = '.pptx';
          else if (contentType.includes('document')) fileExt = '.docx';
          else if (contentType.includes('pdf')) fileExt = '.pdf';
          
          // Create and trigger download
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
            
          // Create a meaningful filename
          const topicSlug = formState.lessonTopic 
            ? formState.lessonTopic.toLowerCase().replace(/[^a-z0-9]+/g, '_').substring(0, 30)
            : 'lesson';
              
          a.download = `${topicSlug}_${resourceType.toLowerCase()}${fileExt}`;
          document.body.appendChild(a);
            
          console.log(`Triggering download for ${resourceType} with filename:`, a.download);
          a.click();
            
          // Clean up with longer timeout and better error handling
          setTimeout(() => {
            try {
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
              console.log(`Download complete for ${resourceType} and resources cleaned up`);
            } catch (err) {
              console.error('Error cleaning up download resources:', err);
            }
          }, 5000);
        } catch (resourceError) {
          console.error(`Error generating ${resourceType}:`, resourceError);
          results[resourceType] = { error: resourceError.message };
        }
      }
      
      return results;
    } catch (error) {
      console.error('Multi-resource generation error:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      throw new Error(`Failed to generate resources: ${error.message}`);
    }
  },
  
  // For backward compatibility, maintain the original function
  async generatePptx(formState, contentState) {
    try {
      console.log('Using legacy generatePptx function');
      
      // Validate content before sending to server
      if (!contentState.structuredContent || !Array.isArray(contentState.structuredContent) || contentState.structuredContent.length === 0) {
        console.error('Invalid content state:', contentState);
        throw new Error('No slide content available for presentation generation');
      }
      
      // Build a clean request object with only what the backend needs
      const requestData = {
        resource_type: 'presentation',
        lesson_outline: contentState.finalOutline || '',
        structured_content: contentState.structuredContent.map((slide, index) => ({
          title: slide.title || `Slide ${index + 1}`,
          layout: slide.layout || 'TITLE_AND_CONTENT',
          content: Array.isArray(slide.content) ? slide.content : []
        }))
      };
      
      // Determine API URL
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
  
  // Google Slides generation function
  async generateGoogleSlides(formState, contentState, token) {
    // Implementation remains unchanged
    console.log("Google Slides generation requested");
    // Your Google Slides implementation here
  }
};