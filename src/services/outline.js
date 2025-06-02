// src/services/outline.js - IMPROVED with better error handling
import { API, handleApiError } from '../utils/constants/api';

export const outlineService = {
  async generate(formData) {
    try {
      console.log('Sending outline request with data:', formData);
      
      // Create a clean request body with proper field naming
      const requestBody = {
        resourceType: formData.resourceType,
        gradeLevel: formData.gradeLevel,
        subjectFocus: formData.subjectFocus,
        language: formData.language,
        lessonTopic: formData.lessonTopic || formData.subjectFocus || "General Learning",
        custom_prompt: formData.custom_prompt || formData.customPrompt || '',
        selectedStandards: Array.isArray(formData.selectedStandards) 
          ? formData.selectedStandards 
          : [],
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

      const controller = new AbortController();
      const timeout = API.TIMEOUT || 120000;
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
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          console.error('Server returned non-OK status:', response.status);
          
          // IMPROVED: Handle rate limit errors specifically
          if (response.status === 429) {
            try {
              const errorJson = await response.json();
              console.log('Rate limit response:', errorJson);
              
              return {
                error: 'RATE_LIMIT_EXCEEDED',
                rateLimit: {
                  hourlyLimit: errorJson.hourly_limit || 3,
                  hourlyUsed: errorJson.hourly_used || 3,
                  resetTime: errorJson.reset_time || '1 hour',
                  userTier: errorJson.user_tier || 'free',
                  message: errorJson.message || 'Rate limit exceeded'
                }
              };
            } catch (e) {
              return {
                error: 'RATE_LIMIT_EXCEEDED',
                rateLimit: {
                  hourlyLimit: 3,
                  hourlyUsed: 3,
                  resetTime: '1 hour',
                  userTier: 'free',
                  message: 'You have reached your hourly generation limit.'
                }
              };
            }
          }
          
          // Handle other error statuses
          const errorResponseClone = response.clone();
          let errorMessage = `HTTP error! status: ${response.status}`;
          
          try {
            const errorText = await errorResponseClone.text();
            console.log('Error response text:', errorText);
            
            try {
              const errorJson = JSON.parse(errorText);
              errorMessage = errorJson.error || errorMessage;
              
              return {
                error: errorMessage,
                status: response.status,
                details: errorJson.details || 'No additional details available'
              };
            } catch (e) {
              errorMessage = `${errorMessage}, message: ${errorText.substring(0, 100)}...`;
            }
          } catch (e) {
            console.error('Could not read error response text:', e);
          }
          
          throw new Error(errorMessage);
        }

        const responseClone = response.clone();
        
        try {
          const data = await response.json();
          
          console.log('Received response from server:', {
            hasMessages: Boolean(data.messages),
            hasStructuredContent: Boolean(data.structured_content),
            structuredContentLength: data.structured_content?.length || 0
          });

          if (!data.messages || !data.structured_content) {
            console.error('Invalid server response format:', data);
            throw new Error('Invalid response format from server. Expected messages and structured_content.');
          }

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
          
          try {
            const textContent = await responseClone.text();
            console.error('Response was not valid JSON, text content:', textContent.substring(0, 200));
            throw new Error(`Failed to parse server response as JSON: ${jsonError.message}`);
          } catch (textError) {
            console.error('Error reading response text:', textError);
            throw jsonError;
          }
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        console.error('Fetch error:', fetchError);
        
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timeout - the server is taking too long to respond. This may be because the OpenAI API is slow. Try using the example feature instead.');
        }
        
        throw fetchError;
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      console.error('Outline generation error:', error);
      
      // Return a structured error object instead of throwing
      const errorObj = handleApiError(error);
      console.error('Structured error:', errorObj);
      
      return errorObj;
    }
  },
  
  async regenerate(formData, modifiedPrompt) {
    return this.generate({
      ...formData,
      customPrompt: modifiedPrompt || formData.customPrompt,
      regeneration: true
    });
  }
};