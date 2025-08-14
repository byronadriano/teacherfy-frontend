// src/services/presentation.js - CLEANED VERSION
import { config } from '../utils/config';
import { validateQuizWorksheetFlow } from '../utils/validationHelper';

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

// Convert simple content arrays into resource-specific structured fields
function convertContentForResource(mappedItem, normalizedResourceType) {
  // If it's a quiz and structured_questions is missing, convert content strings into question objects
  if (normalizedResourceType === 'quiz') {
    if (!mappedItem.structured_questions || mappedItem.structured_questions.length === 0) {
      if (Array.isArray(mappedItem.content) && mappedItem.content.length > 0) {
        mappedItem.structured_questions = mappedItem.content.map((c, idx) => ({
          question: typeof c === 'string' ? c : String(c),
          type: 'short_answer',
          options: [],
          answer: null,
          explanation: ''
        }));
        // remove generic content to avoid duplication
        delete mappedItem.content;
      }
    }
  }

  // If it's a worksheet and exercises/structured_activities missing, convert content strings into exercises
  if (normalizedResourceType === 'worksheet') {
    if ((!mappedItem.exercises || mappedItem.exercises.length === 0) && (!mappedItem.structured_activities || mappedItem.structured_activities.length === 0)) {
      if (Array.isArray(mappedItem.content) && mappedItem.content.length > 0) {
        mappedItem.exercises = mappedItem.content.map((c, idx) => ({
          prompt: typeof c === 'string' ? c : String(c),
          answer: null,
          hints: []
        }));
        delete mappedItem.content;
      }
    }
  }

  return mappedItem;
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
          
          // Build request data - preserve all fields for different resource types
          const requestData = {
            resource_type: normalizedResourceType,
            lesson_outline: contentState.finalOutline || '',
            // Include form data fields
            grade_level: formState.gradeLevel || '',
            subject: formState.subject || '',
            topic: formState.lessonTopic || formState.subjectFocus || '',
            language: formState.language || 'English',
            custom_prompt: formState.customPrompt || '',
            num_slides: parseInt(formState.numSlides || 5, 10),
            include_images: Boolean(formState.includeImages),
            selected_standards: Array.isArray(formState.selectedStandards) ? formState.selectedStandards : [],
            structured_content: structuredContent.map((item, index) => {
              // Base structure
              const mappedItem = {
                title: item.title || `Item ${index + 1}`,
                layout: item.layout || 'TITLE_AND_CONTENT'
              };
              
              // Preserve resource-specific fields based on type
              if (normalizedResourceType === 'quiz' && item.structured_questions) {
                // Quiz/Test specific fields
                mappedItem.structured_questions = item.structured_questions;
                mappedItem.teacher_notes = item.teacher_notes || [];
                mappedItem.differentiation_tips = item.differentiation_tips || [];
              } else if (normalizedResourceType === 'worksheet') {
                // Worksheet specific fields - preserve all possible worksheet fields
                if (item.structured_activities) mappedItem.structured_activities = item.structured_activities;
                if (item.worksheet_sections) mappedItem.worksheet_sections = item.worksheet_sections;
                if (item.exercises) mappedItem.exercises = item.exercises;
                if (item.problems) mappedItem.problems = item.problems;
                if (item.instructions) mappedItem.instructions = item.instructions;
                if (item.teacher_notes) mappedItem.teacher_notes = item.teacher_notes;
                // Also include standard content if present
                if (item.content) mappedItem.content = Array.isArray(item.content) ? item.content : [];
              } else if (normalizedResourceType === 'lesson_plan') {
                // Lesson Plan specific fields
                if (item.objectives) mappedItem.objectives = item.objectives;
                if (item.materials) mappedItem.materials = item.materials;
                if (item.procedures) mappedItem.procedures = item.procedures;
                if (item.activities) mappedItem.activities = item.activities;
                if (item.assessment) mappedItem.assessment = item.assessment;
                if (item.homework) mappedItem.homework = item.homework;
                if (item.standards) mappedItem.standards = item.standards;
                if (item.teacher_notes) mappedItem.teacher_notes = item.teacher_notes;
                // Also include standard content if present
                if (item.content) mappedItem.content = Array.isArray(item.content) ? item.content : [];
              } else {
                // For presentations and other resources, use standard content field
                mappedItem.content = Array.isArray(item.content) ? item.content : [];
              }
              
              // Preserve any additional fields that might be present
              Object.keys(item).forEach(key => {
                if (!mappedItem.hasOwnProperty(key) && key !== 'title' && key !== 'layout') {
                  mappedItem[key] = item[key];
                }
              });

              // Convert generic content into resource-specific fields if necessary
              return convertContentForResource(mappedItem, normalizedResourceType);
            })
          };
          
          if (process.env.NODE_ENV === 'development') {
            console.log(`📤 Download request for ${resourceType} (${normalizedResourceType}):`, {
              resourceType,
              normalizedResourceType,
              contentItems: contentState.structuredContent?.length || 0,
              firstItemSample: contentState.structuredContent?.[0] || null,
              contentTypes: Object.keys(requestData.structured_content?.[0] || {}),
              includeImages: requestData.include_images,
              numSlides: requestData.num_slides,
              gradeLevel: requestData.grade_level,
              fullRequestData: requestData
            });
          }          // 🔍 CRITICAL VALIDATION - Verify data integrity before sending
          const validation = validateQuizWorksheetFlow.validateGeneratePayload(requestData, normalizedResourceType);
          validateQuizWorksheetFlow.logValidation('Step 2: Generate Payload', resourceType, requestData, validation);
          
          if (!validation.willSucceed && process.env.NODE_ENV === 'development') {
            console.error('🚨 PAYLOAD VALIDATION FAILED - This will likely cause "no structured questions found" error');
            console.error('Backend will skip sections because required fields are missing');
          }
          
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
      // Include form data fields
      grade_level: formState.gradeLevel || '',
      subject: formState.subject || '',
      topic: formState.lessonTopic || formState.subjectFocus || '',
      language: formState.language || 'English',
      custom_prompt: formState.customPrompt || '',
      num_slides: parseInt(formState.numSlides || 5, 10),
      include_images: Boolean(formState.includeImages),
      selected_standards: Array.isArray(formState.selectedStandards) ? formState.selectedStandards : [],
      structured_content: contentState.structuredContent.map((item, index) => {
        // Base structure
        const mappedItem = {
          title: item.title || `Slide ${index + 1}`,
          layout: item.layout || 'TITLE_AND_CONTENT'
        };
        
        // Preserve resource-specific fields based on content structure
        if (item.structured_questions) {
          // Quiz/Test content
          mappedItem.structured_questions = item.structured_questions;
          mappedItem.teacher_notes = item.teacher_notes || [];
          mappedItem.differentiation_tips = item.differentiation_tips || [];
        } else if (item.structured_activities || item.exercises || item.problems) {
          // Worksheet content
          if (item.structured_activities) mappedItem.structured_activities = item.structured_activities;
          if (item.worksheet_sections) mappedItem.worksheet_sections = item.worksheet_sections;
          if (item.exercises) mappedItem.exercises = item.exercises;
          if (item.problems) mappedItem.problems = item.problems;
          if (item.instructions) mappedItem.instructions = item.instructions;
          if (item.teacher_notes) mappedItem.teacher_notes = item.teacher_notes;
          if (item.content) mappedItem.content = Array.isArray(item.content) ? item.content : [];
        } else if (item.objectives || item.procedures || item.activities) {
          // Lesson Plan content
          if (item.objectives) mappedItem.objectives = item.objectives;
          if (item.materials) mappedItem.materials = item.materials;
          if (item.procedures) mappedItem.procedures = item.procedures;
          if (item.activities) mappedItem.activities = item.activities;
          if (item.assessment) mappedItem.assessment = item.assessment;
          if (item.homework) mappedItem.homework = item.homework;
          if (item.standards) mappedItem.standards = item.standards;
          if (item.teacher_notes) mappedItem.teacher_notes = item.teacher_notes;
          if (item.content) mappedItem.content = Array.isArray(item.content) ? item.content : [];
        } else {
          // Standard presentation content
          mappedItem.content = Array.isArray(item.content) ? item.content : [];
        }
        
        // Preserve any additional fields
        Object.keys(item).forEach(key => {
          if (!mappedItem.hasOwnProperty(key) && key !== 'title' && key !== 'layout') {
            mappedItem[key] = item[key];
          }
        });

        // Convert generic content into resource-specific fields if necessary
        return convertContentForResource(mappedItem, 'presentation');
      })
    };
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📤 generatePptx request data:', {
        includeImages: requestData.include_images,
        numSlides: requestData.num_slides,
        gradeLevel: requestData.grade_level,
        fullRequestData: requestData
      });
    }
    
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
    if (process.env.NODE_ENV === 'development') {
      console.log("Google Slides generation requested");
    }
    // Implementation here
  }
};