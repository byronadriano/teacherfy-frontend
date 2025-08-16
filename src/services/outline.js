// src/services/outline.js - IMPROVED with better error handling
import { API, handleApiError } from '../utils/constants/api';
import { validateQuizWorksheetFlow } from '../utils/validationHelper';

export const outlineService = {
  async generate(formData, options = {}) {
    try {
      console.log('Sending outline request with data:', formData);
      
      // Check if this is a multi-resource request
      const isMultiResource = Array.isArray(formData.resourceType) && formData.resourceType.length > 1;
      
      if (isMultiResource) {
        // Use the sophisticated multi-resource endpoint
        console.log('🚀 Multi-resource detected, using sophisticated endpoint');
        return this.generateMultipleResources(formData, options);
      }
      
      // Single resource - create a clean request body with proper field naming
      const singleResourceType = Array.isArray(formData.resourceType) 
        ? formData.resourceType[0] 
        : formData.resourceType;
        
      const requestBody = {
        resourceType: singleResourceType,
        gradeLevel: formData.gradeLevel,
        subjectFocus: formData.subjectFocus,
        language: formData.language,
        lessonTopic: formData.lessonTopic || formData.subjectFocus || "General Learning",
        custom_prompt: formData.custom_prompt || formData.customPrompt || '',
        selectedStandards: Array.isArray(formData.selectedStandards) 
          ? formData.selectedStandards 
          : [],
        ...(singleResourceType === 'Presentation' && {
          numSlides: parseInt(formData.numSlides || 5, 10),
          includeImages: Boolean(formData.includeImages)
        })
      };

      // Double-check to make sure lessonTopic is not empty
      if (!requestBody.lessonTopic) {
        requestBody.lessonTopic = requestBody.subjectFocus || "General Learning";
      }

      console.log('Cleaned request body:', requestBody);

      // Use provided abort signal or create a new one for timeout
      const userController = options.signal ? null : new AbortController();
      const controller = options.signal ? { signal: options.signal } : userController;
      
      const timeout = API.TIMEOUT || 120000;
      console.log(`Setting request timeout to ${timeout/1000} seconds`);
      
      const timeoutId = setTimeout(() => {
        console.warn(`Request timed out after ${timeout/1000} seconds`);
        if (userController) {
          userController.abort();
        }
      }, timeout);

      try {
        const response = await fetch(`${API.BASE_URL}${API.ENDPOINTS.OUTLINE}`, {
          method: 'POST',
          headers: {
            ...API.HEADERS,
            'Content-Type': 'application/json'
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
          
          // IMPROVED: Handle monthly generation limit errors (403)
          if (response.status === 403) {
            try {
              const errorJson = await response.json();
              console.log('Monthly limit response:', errorJson);
              
              return {
                error: 'MONTHLY_LIMIT_REACHED',
                monthlyLimit: {
                  monthlyLimit: errorJson.monthly_limit || 10,
                  generationsUsed: errorJson.generations_used || 10,
                  generationsLeft: errorJson.generations_left || 0,
                  resetTime: errorJson.reset_time || '2025-02-01T00:00:00',
                  userTier: errorJson.user_tier || 'free',
                  requireUpgrade: errorJson.require_upgrade || true,
                  trackingMethod: errorJson.tracking_method || 'ip_address',
                  message: errorJson.message || 'Monthly generation limit reached'
                }
              };
            } catch (e) {
              return {
                error: 'MONTHLY_LIMIT_REACHED',
                monthlyLimit: {
                  monthlyLimit: 10,
                  generationsUsed: 10,
                  generationsLeft: 0,
                  resetTime: '2025-02-01T00:00:00',
                  userTier: 'free',
                  requireUpgrade: true,
                  trackingMethod: 'ip_address',
                  message: 'You have used all of your free monthly generations. Upgrade to premium for unlimited access.'
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

          if (!data.structured_content) {
            console.error('Invalid server response format:', data);
            throw new Error('Invalid response format from server. Expected structured_content.');
          }

          if (!Array.isArray(data.structured_content) || data.structured_content.length === 0) {
            console.error('Empty or invalid structured_content:', data.structured_content);
            throw new Error('Server returned empty or invalid structured content.');
          }

          // 🔍 STEP 1 VALIDATION - Critical for quiz/worksheet success
          const resourceType = Array.isArray(formData.resourceType) ? formData.resourceType[0] : formData.resourceType;
          const validation = validateQuizWorksheetFlow.validateOutlineResponse(data, resourceType);
          validateQuizWorksheetFlow.logValidation('Step 1: Outline Response', resourceType, data, validation);
          
          if (!validation.isReadyForGeneration) {
            console.warn('🚨 OUTLINE VALIDATION WARNING:', validation.readinessReason);
            console.warn('This may cause issues in Step 2 (file generation)');
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
          // Check if this was a user-initiated cancellation vs timeout
          if (options.signal && options.signal.aborted) {
            throw new Error('Operation cancelled by user');
          } else {
            throw new Error('Request timeout - the server is taking too long to respond. This may be because the OpenAI API is slow. Try using the example feature instead.');
          }
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
  
  async generateMultipleResources(formData, options = {}) {
    try {
      console.log('🚀 Using multi-resource endpoint for:', formData.resourceType);
      
      // Normalize resource types to match backend expectations
      const resourceTypes = formData.resourceType.map(type => {
        const normalized = type.toLowerCase();
        if (normalized.includes('quiz') || normalized.includes('test')) return 'quiz';
        if (normalized.includes('worksheet')) return 'worksheet';
        if (normalized.includes('presentation')) return 'presentation';
        if (normalized.includes('lesson') && normalized.includes('plan')) return 'lesson_plan';
        return normalized.replace(/\s+/g, '_');
      });
      
      const requestBody = {
        lessonTopic: formData.lessonTopic || formData.subjectFocus || "General Learning",
        subjectFocus: formData.subjectFocus,
        gradeLevel: formData.gradeLevel,
        language: formData.language,
        selectedStandards: Array.isArray(formData.selectedStandards) 
          ? formData.selectedStandards 
          : [],
        custom_prompt: formData.custom_prompt || formData.customPrompt || '',
        resourceTypes: resourceTypes,  // KEY: Multiple types
        numSlides: parseInt(formData.numSlides || 5, 10),
        includeImages: Boolean(formData.includeImages)
      };
      
      console.log('📤 Multi-resource request body:', requestBody);

      // Use provided abort signal or create a new one for timeout
      const userController = options.signal ? null : new AbortController();
      const controller = options.signal ? { signal: options.signal } : userController;
      
      const timeout = 300000; // 5 minutes for sophisticated multi-resource generation
      console.log(`Setting sophisticated multi-resource timeout to ${timeout/1000} seconds`);
      
      const timeoutId = setTimeout(() => {
        console.warn(`Sophisticated multi-resource request timed out after ${timeout/1000} seconds`);
        if (userController) {
          userController.abort();
        }
      }, timeout);

      try {
        const response = await fetch(`${API.BASE_URL}/generate-multiple-resources`, {
          method: 'POST',
          headers: {
            ...API.HEADERS,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody),
          credentials: 'include',
          mode: 'cors',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          console.error('Sophisticated multi-resource server returned non-OK status:', response.status);
          
          // Handle rate limit errors specifically
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
          
          // IMPROVED: Handle monthly generation limit errors (403)
          if (response.status === 403) {
            try {
              const errorJson = await response.json();
              console.log('Monthly limit response:', errorJson);
              
              return {
                error: 'MONTHLY_LIMIT_REACHED',
                monthlyLimit: {
                  monthlyLimit: errorJson.monthly_limit || 10,
                  generationsUsed: errorJson.generations_used || 10,
                  generationsLeft: errorJson.generations_left || 0,
                  resetTime: errorJson.reset_time || '2025-02-01T00:00:00',
                  userTier: errorJson.user_tier || 'free',
                  requireUpgrade: errorJson.require_upgrade || true,
                  trackingMethod: errorJson.tracking_method || 'ip_address',
                  message: errorJson.message || 'Monthly generation limit reached'
                }
              };
            } catch (e) {
              return {
                error: 'MONTHLY_LIMIT_REACHED',
                monthlyLimit: {
                  monthlyLimit: 10,
                  generationsUsed: 10,
                  generationsLeft: 0,
                  resetTime: '2025-02-01T00:00:00',
                  userTier: 'free',
                  requireUpgrade: true,
                  trackingMethod: 'ip_address',
                  message: 'You have used all of your free monthly generations. Upgrade to premium for unlimited access.'
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
          
          console.log('📊 Multi-resource response received:', {
            hasSuccess: Boolean(data.success),
            hasStructuredContent: Boolean(data.structured_content),
            generationMethod: data.generation_method,
            resourceTypes: data.resource_types || [],
            message: data.message
          });

          // Handle the correct backend response format
          if (data.success && data.structured_content) {
            console.log('✅ Using optimized multi-resource format');
            
            // The backend returns structured_content as an object with each resource type
            const structuredContentByType = data.structured_content;
            
            // Use the first requested resource type as primary for outline display
            const primaryResourceType = resourceTypes[0];
            const normalizedPrimaryType = primaryResourceType.toLowerCase();
            
            // Find the primary content
            let primaryContent = structuredContentByType[normalizedPrimaryType] || 
                               structuredContentByType[primaryResourceType] ||
                               Object.values(structuredContentByType)[0];
            
            if (!primaryContent || !Array.isArray(primaryContent)) {
              throw new Error('No valid structured content found in multi-resource response');
            }
            
            // Transform the structured_content object to our expected resources format
            const transformedResources = {};
            for (const [backendType, content] of Object.entries(structuredContentByType)) {
              // Map backend types to frontend types
              let frontendType = resourceTypes.find(rt => 
                rt.toLowerCase() === backendType.toLowerCase() ||
                rt.toLowerCase().includes(backendType.toLowerCase()) ||
                backendType.toLowerCase().includes(rt.toLowerCase())
              ) || backendType;
              
              transformedResources[frontendType] = Array.isArray(content) ? content : [];
            }
            
            return {
              structured_content: primaryContent,
              title: `${formData.subjectFocus || 'Lesson'} - Multiple Resources`,
              generation_method: data.generation_method || 'optimized_multiple_resources',
              resource_type: 'multiple',
              resources: transformedResources,
              resource_types: data.resource_types || resourceTypes,
              usage_limits: data.usage_limits
            };
            
          } else {
            console.error('❌ Invalid multi-resource response format:', data);
            throw new Error('Invalid multi-resource response format from server');
          }
          
        } catch (jsonError) {
          console.error('Error parsing multi-resource JSON response:', jsonError);
          
          try {
            const textContent = await responseClone.text();
            console.error('Multi-resource response was not valid JSON, text content:', textContent.substring(0, 200));
            throw new Error(`Failed to parse multi-resource server response as JSON: ${jsonError.message}`);
          } catch (textError) {
            console.error('Error reading multi-resource response text:', textError);
            throw jsonError;
          }
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        console.error('Multi-resource fetch error:', fetchError);
        
        if (fetchError.name === 'AbortError') {
          // Check if this was a user-initiated cancellation vs timeout
          if (options.signal && options.signal.aborted) {
            throw new Error('Operation cancelled by user');
          } else {
            throw new Error('Sophisticated multi-resource generation timed out after 5 minutes. The system is creating aligned content across multiple resource types, which requires more processing time. Please try again or reduce the number of resource types.');
          }
        }
        
        throw fetchError;
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      console.error('Multi-resource generation error:', error);
      
      // Return a structured error object instead of throwing
      const errorObj = handleApiError(error);
      console.error('Structured multi-resource error:', errorObj);
      
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