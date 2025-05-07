// src/services/outline.js
import { API, handleApiError } from '../utils/constants/api';

export const outlineService = {
  async generate(formData) {
    try {
      console.log('Sending outline request with data:', formData);
      
      // Create a clean request body with proper field naming
      const requestBody = {
        // Required fields - keep as is from form data
        resourceType: formData.resourceType,
        gradeLevel: formData.gradeLevel,
        subjectFocus: formData.subjectFocus,
        language: formData.language,
        
        // Optional fields with appropriate defaults
        lessonTopic: formData.lessonTopic || '',
        
        // Handle both naming conventions for custom prompt
        custom_prompt: formData.custom_prompt || formData.customPrompt || '',
        
        // Standards selection - clean and consistent format
        selectedStandards: Array.isArray(formData.selectedStandards) 
          ? formData.selectedStandards 
          : [],
        
        // Resource type specific options
        ...(formData.resourceType === 'Presentation' && {
          numSlides: parseInt(formData.numSlides || 5, 10),
          includeImages: Boolean(formData.includeImages)
        })
      };

      console.log('Cleaned request body:', requestBody);

      // Set up a timeout for the fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API.TIMEOUT || 30000);

      try {
        const response = await fetch(`${API.BASE_URL}${API.ENDPOINTS.OUTLINE}`, {
          method: 'POST',
          headers: API.HEADERS,
          body: JSON.stringify(requestBody),
          credentials: 'include',
          mode: 'cors',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        // Enhanced error handling for non-OK responses
        if (!response.ok) {
          console.error('Server returned non-OK status:', response.status);
          
          // Create a clone of the response before reading it
          const errorResponseClone = response.clone();
          
          let errorMessage = `HTTP error! status: ${response.status}`;
          try {
            const errorText = await errorResponseClone.text();
            console.error('Error response text:', errorText);
            
            try {
              // Try to parse as JSON
              const errorJson = JSON.parse(errorText);
              errorMessage = errorJson.error || errorMessage;
            } catch (e) {
              // If not JSON, use text
              errorMessage = `${errorMessage}, message: ${errorText.substring(0, 100)}...`;
            }
          } catch (e) {
            console.error('Could not read error response text:', e);
          }
          
          console.error('Final error message:', errorMessage);
          throw new Error(errorMessage);
        }

        // Create a clone of the response before parsing the JSON
        const responseClone = response.clone();
        
        try {
          // Parse JSON response with validation
          const data = await response.json();
          
          console.log('Received response from server:', {
            hasMessages: Boolean(data.messages),
            hasStructuredContent: Boolean(data.structured_content),
            structuredContentLength: data.structured_content?.length || 0
          });

          // Validate response structure
          if (!data.messages || !data.structured_content) {
            console.error('Invalid server response format:', data);
            throw new Error('Invalid response format from server. Expected messages and structured_content.');
          }

          // Validate structured content format
          if (!Array.isArray(data.structured_content) || data.structured_content.length === 0) {
            console.error('Empty or invalid structured_content:', data.structured_content);
            throw new Error('Server returned empty or invalid structured content.');
          }

          // Validate that each slide has minimum required fields
          data.structured_content.forEach((slide, index) => {
            if (!slide.title) {
              console.warn(`Slide ${index} missing title, adding default`);
              slide.title = `Slide ${index + 1}`;
            }
            
            if (!slide.layout) {
              console.warn(`Slide ${index} missing layout, defaulting to TITLE_AND_CONTENT`);
              slide.layout = 'TITLE_AND_CONTENT';
            }
            
            // Ensure arrays exist
            slide.content = Array.isArray(slide.content) ? slide.content : [];
            slide.teacher_notes = Array.isArray(slide.teacher_notes) ? slide.teacher_notes : [];
            slide.visual_elements = Array.isArray(slide.visual_elements) ? slide.visual_elements : [];
          });

          return data;
        } catch (jsonError) {
          console.error('Error parsing JSON response:', jsonError);
          
          // If JSON parsing fails, try to get the text content to see what went wrong
          try {
            const textContent = await responseClone.text();
            console.error('Response was not valid JSON, text content:', textContent.substring(0, 200));
            throw new Error(`Failed to parse server response as JSON: ${jsonError.message}`);
          } catch (textError) {
            console.error('Error reading response text:', textError);
            throw jsonError; // Throw the original JSON parsing error
          }
        }
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      console.error('Outline generation error:', error);
      
      // Return a structured error object
      const errorObj = handleApiError(error);
      console.error('Structured error:', errorObj);
      
      throw errorObj;
    }
  },
  
  // Add a regenerate method for outline regeneration if needed
  async regenerate(formData, modifiedPrompt) {
    // Add regeneration-specific logic here if needed
    return this.generate({
      ...formData,
      customPrompt: modifiedPrompt || formData.customPrompt,
      regeneration: true
    });
  }
};