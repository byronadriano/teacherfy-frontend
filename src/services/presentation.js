// src/services/presentation.js - CLEANED VERSION
import { config } from '../utils/config';

/**
 * Normalize resource type to match backend expectations
 */
function normalizeResourceType(resourceType) {
  // Handle array inputs - take the first element if it's an array
  let typeToProcess = Array.isArray(resourceType) ? resourceType[0] : resourceType;
  
  // Ensure we have a string
  if (!typeToProcess || typeof typeToProcess !== 'string') {
    return 'presentation';
  }
  
  const normalized = typeToProcess.toLowerCase();
  
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

/**
 * Create a download link for a blob
 */
function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  
  // Clean up after download
  setTimeout(() => {
    try {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error cleaning up download resources:', err);
    }
  }, 5000);
}

/**
 * Get appropriate file extension based on content type
 */
function getFileExtension(contentType, resourceType) {
  if (contentType?.includes('presentation')) return '.pptx';
  if (contentType?.includes('document')) return '.docx';
  if (contentType?.includes('pdf')) return '.pdf';
  
  // Fallback based on resource type
  return resourceType === 'Presentation' ? '.pptx' : '.docx';
}

export const presentationService = {
  async generateMultiResource(formState, contentState, specificResources = null) {
    try {
      // Determine resource types to generate
      let resourceTypes = specificResources || formState.resourceType;
      
      // Normalize to array
      if (!Array.isArray(resourceTypes)) {
        resourceTypes = resourceTypes ? [resourceTypes] : ['Presentation'];
      }
      
      // Validate resource types are strings
      resourceTypes = resourceTypes.map(type => String(type));

      const results = {};
      
      for (const resourceType of resourceTypes) {
        const structuredContent = 
          contentState.generatedResources?.[resourceType] || 
          contentState.structuredContent;
          
        // Skip if no content available
        if (!structuredContent?.length) {
          results[resourceType] = { error: 'No content available' };
          continue;
        }
        
        try {
          const normalizedResourceType = normalizeResourceType(resourceType);
          
          // Build request data
          const requestData = {
            resource_type: normalizedResourceType,
            lesson_outline: contentState.finalOutline || '',
            structured_content: structuredContent.map((slide, index) => ({
              title: slide.title || `Item ${index + 1}`,
              layout: slide.layout || 'TITLE_AND_CONTENT',
              content: Array.isArray(slide.content) ? slide.content : []
            }))
          };
          
          const response = await fetch(`${config.apiUrl}/generate`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Accept': '*/*'
            },
            body: JSON.stringify(requestData)
          });
          
          if (!response.ok) {
            let errorMessage = `Server error: ${response.status}`;
            try {
              const contentType = response.headers.get('content-type');
              if (contentType?.includes('application/json')) {
                const errorJson = await response.json();
                errorMessage = errorJson.error || errorJson.message || errorMessage;
              }
            } catch (e) {
              // Use default error message
            }
            
            results[resourceType] = { error: errorMessage };
            continue;
          }
          
          // Verify response content type
          const contentType = response.headers.get('content-type');
          const validTypes = [
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/pdf',
            'application/octet-stream'
          ];
          
          if (!contentType || !validTypes.some(type => contentType.includes(type))) {
            results[resourceType] = { 
              error: `Invalid response type from server: ${contentType || 'unknown'}` 
            };
            continue;
          }
          
          const blob = await response.blob();
          
          if (blob.size < 1000) {
            results[resourceType] = { 
              error: 'File returned from server appears to be invalid or incomplete' 
            };
            continue;
          }
          
          // Store result and trigger download
          results[resourceType] = { blob, contentType };
          
          // Create filename and download
          const topicSlug = formState.lessonTopic 
            ? formState.lessonTopic.toLowerCase().replace(/[^a-z0-9]+/g, '_').substring(0, 30)
            : 'lesson';
          const fileExt = getFileExtension(contentType, resourceType);
          const filename = `${topicSlug}_${resourceType.toLowerCase()}${fileExt}`;
          
          downloadBlob(blob, filename);
          
        } catch (resourceError) {
          results[resourceType] = { error: resourceError.message };
        }
      }
      
      return results;
    } catch (error) {
      throw new Error(`Failed to generate resources: ${error.message}`);
    }
  },
  
  // Legacy function for backward compatibility
  async generatePptx(formState, contentState) {
    if (!contentState.structuredContent?.length) {
      throw new Error('No slide content available for presentation generation');
    }
    
    const requestData = {
      resource_type: 'presentation',
      lesson_outline: contentState.finalOutline || '',
      structured_content: contentState.structuredContent.map((slide, index) => ({
        title: slide.title || `Slide ${index + 1}`,
        layout: slide.layout || 'TITLE_AND_CONTENT',
        content: Array.isArray(slide.content) ? slide.content : []
      }))
    };
    
    const response = await fetch(`${config.apiUrl}/generate`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      let errorMessage = `Server error: ${response.status}`;
      try {
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const errorJson = await response.json();
          errorMessage = errorJson.error || errorJson.message || errorMessage;
        }
      } catch (e) {
        // Use default error message
      }
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/vnd.openxmlformats-officedocument.presentationml.presentation')) {
      throw new Error(`Invalid response type from server: ${contentType || 'unknown'}`);
    }

    const blob = await response.blob();
    
    if (blob.size < 1000) {
      throw new Error('File returned from server appears to be invalid or incomplete');
    }
    
    // Create filename and download
    const topicSlug = formState.lessonTopic 
      ? formState.lessonTopic.toLowerCase().replace(/[^a-z0-9]+/g, '_').substring(0, 30)
      : 'lesson';
    const filename = `${topicSlug}_presentation.pptx`;
    
    downloadBlob(blob, filename);
    
    return blob;
  },
  
  async generateGoogleSlides(formState, contentState, token) {
    // Google Slides generation implementation
    console.log("Google Slides generation requested");
    // Implementation here
  }
};