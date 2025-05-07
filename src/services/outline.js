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
        
        // FIXED: Force lessonTopic to be the subjectFocus if empty
        // This ensures we always have a lessonTopic
        lessonTopic: formData.lessonTopic || formData.subjectFocus || "General Learning",
        
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

      // Double-check to make sure lessonTopic is not empty
      if (!requestBody.lessonTopic) {
        requestBody.lessonTopic = requestBody.subjectFocus || "General Learning";
      }

      console.log('Cleaned request body:', requestBody);

      // Create controller for timeout functionality - use a longer timeout
      // OpenAI API calls can take 30+ seconds, especially on first request
      const controller = new AbortController();
      const timeout = API.TIMEOUT || 120000; // Use 120 seconds (2 minutes) as fallback
      console.log(`Setting request timeout to ${timeout/1000} seconds`);
      
      const timeoutId = setTimeout(() => {
        console.warn(`Request timed out after ${timeout/1000} seconds`);
        controller.abort();
      }, timeout);

      try {
        const response = await fetch(`${API.BASE_URL}${API.ENDPOINTS.OUTLINE}`, {
          method: 'POST',
          headers: {
            ...API.HEADERS,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          credentials: 'include',
          mode: 'cors',
          signal: controller.signal
        });
        
        // Clear timeout once response is received
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
              
              // Add appropriate status code to the error object
              return {
                error: errorMessage,
                status: response.status,
                details: errorJson.details || 'No additional details available'
              };
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
      } catch (fetchError) {
        // Clear timeout to prevent multiple aborts
        clearTimeout(timeoutId);
        
        console.error('Fetch error:', fetchError);
        
        // Handle aborted requests (timeout)
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timeout - the server is taking too long to respond. This may be because the OpenAI API is slow. Try using the example feature instead.');
        }
        
        throw fetchError;
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      console.error('Outline generation error:', error);
      
      // Return a structured error object
      const errorObj = handleApiError(error);
      console.error('Structured error:', errorObj);
      
      return errorObj; // Return the error object instead of throwing
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