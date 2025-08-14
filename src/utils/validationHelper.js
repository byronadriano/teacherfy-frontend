// src/utils/validationHelper.js - Quiz/Worksheet Generation Flow Validator
export const validateQuizWorksheetFlow = {
  // Step 1: Validate outline response structure
  validateOutlineResponse: (data, resourceType) => {
    const checks = {
      hasStructuredContent: Boolean(data.structured_content),
      structuredContentIsArray: Array.isArray(data.structured_content),
      contentLength: data.structured_content?.length || 0,
      sectionsWithQuestions: 0,
      sectionsWithExercises: 0,
      sectionsWithContent: 0,
      validSections: []
    };

    if (data.structured_content) {
      data.structured_content.forEach((section, index) => {
        const sectionValidation = {
          index,
          title: section.title || `Section ${index + 1}`,
          hasTitle: Boolean(section.title),
          hasStructuredQuestions: Boolean(section.structured_questions?.length),
          hasExercises: Boolean(section.exercises?.length || section.structured_activities?.length),
          hasContent: Boolean(section.content?.length),
          questionCount: section.structured_questions?.length || 0,
          exerciseCount: (section.exercises?.length || 0) + (section.structured_activities?.length || 0),
          contentCount: section.content?.length || 0
        };

        checks.validSections.push(sectionValidation);
        
        if (sectionValidation.hasStructuredQuestions) checks.sectionsWithQuestions++;
        if (sectionValidation.hasExercises) checks.sectionsWithExercises++;
        if (sectionValidation.hasContent) checks.sectionsWithContent++;
      });
    }

    // Resource-specific validation
    const isQuiz = resourceType?.toLowerCase().includes('quiz') || resourceType?.toLowerCase().includes('test');
    const isWorksheet = resourceType?.toLowerCase().includes('worksheet');

    checks.isReadyForGeneration = false;
    checks.readinessReason = '';

    if (isQuiz && checks.sectionsWithQuestions > 0) {
      checks.isReadyForGeneration = true;
      checks.readinessReason = `Quiz ready: ${checks.sectionsWithQuestions} sections with structured_questions`;
    } else if (isWorksheet && checks.sectionsWithExercises > 0) {
      checks.isReadyForGeneration = true; 
      checks.readinessReason = `Worksheet ready: ${checks.sectionsWithExercises} sections with exercises/activities`;
    } else if (checks.sectionsWithContent > 0) {
      checks.isReadyForGeneration = true;
      checks.readinessReason = `Content available: ${checks.sectionsWithContent} sections with content (will be converted)`;
    } else {
      checks.readinessReason = `Not ready: no structured_questions, exercises, or content found`;
    }

    return checks;
  },

  // Step 2: Validate generate request payload
  validateGeneratePayload: (payload, resourceType) => {
    const checks = {
      hasResourceType: Boolean(payload.resource_type),
      hasStructuredContent: Boolean(payload.structured_content),
      structuredContentIsArray: Array.isArray(payload.structured_content),
      contentLength: payload.structured_content?.length || 0,
      sectionsWithRequiredFields: 0,
      invalidSections: [],
      validSections: []
    };

    const isQuiz = resourceType?.toLowerCase().includes('quiz') || resourceType?.toLowerCase().includes('test');
    const isWorksheet = resourceType?.toLowerCase().includes('worksheet');

    if (payload.structured_content) {
      payload.structured_content.forEach((section, index) => {
        const sectionCheck = {
          index,
          title: section.title,
          hasTitle: Boolean(section.title),
          hasStructuredQuestions: Boolean(section.structured_questions?.length),
          hasExercises: Boolean(section.exercises?.length || section.structured_activities?.length),
          hasContent: Boolean(section.content?.length),
          questionCount: section.structured_questions?.length || 0,
          exerciseCount: (section.exercises?.length || 0) + (section.structured_activities?.length || 0)
        };

        let hasRequiredFields = false;
        if (isQuiz && sectionCheck.hasStructuredQuestions) hasRequiredFields = true;
        if (isWorksheet && sectionCheck.hasExercises) hasRequiredFields = true;
        if (!isQuiz && !isWorksheet && sectionCheck.hasContent) hasRequiredFields = true;

        sectionCheck.hasRequiredFields = hasRequiredFields;

        if (hasRequiredFields) {
          checks.sectionsWithRequiredFields++;
          checks.validSections.push(sectionCheck);
        } else {
          checks.invalidSections.push(sectionCheck);
        }
      });
    }

    checks.willSucceed = checks.sectionsWithRequiredFields > 0;
    checks.prediction = checks.willSucceed 
      ? `SUCCESS: ${checks.sectionsWithRequiredFields} sections will generate content`
      : `FAILURE: No sections have required fields for ${resourceType}`;

    return checks;
  },

  // Console logger for debugging (only in development)
  logValidation: (step, resourceType, data, validation) => {
    if (process.env.NODE_ENV !== 'development') return;
    
    console.group(`🔍 ${step} Validation - ${resourceType}`);
    console.log('📋 Validation Results:', validation);
    
    if (step === 'Step 1: Outline Response') {
      console.log('📊 Section Summary:');
      validation.validSections.forEach(section => {
        console.log(`  Section ${section.index + 1}: ${section.title}`);
        console.log(`    ✅ Questions: ${section.questionCount}, Exercises: ${section.exerciseCount}, Content: ${section.contentCount}`);
      });
      
      if (validation.isReadyForGeneration) {
        console.log(`✅ READY FOR GENERATION: ${validation.readinessReason}`);
      } else {
        console.warn(`❌ NOT READY: ${validation.readinessReason}`);
      }
    }
    
    if (step === 'Step 2: Generate Payload') {
      console.log('📤 Payload Summary:');
      validation.validSections.forEach(section => {
        console.log(`  ✅ Section ${section.index + 1}: ${section.title} (${section.questionCount} questions, ${section.exerciseCount} exercises)`);
      });
      
      if (validation.invalidSections.length > 0) {
        console.warn('❌ Invalid Sections:');
        validation.invalidSections.forEach(section => {
          console.warn(`  Section ${section.index + 1}: ${section.title} - Missing required fields`);
        });
      }
      
      console.log(`🎯 PREDICTION: ${validation.prediction}`);
    }
    
    console.groupEnd();
  }
};

// Enhanced logging wrapper for API calls
export const withValidation = (originalFunction, step, resourceType) => {
  return async (...args) => {
    const result = await originalFunction(...args);
    
    if (step === 'outline') {
      const validation = validateQuizWorksheetFlow.validateOutlineResponse(result, resourceType);
      validateQuizWorksheetFlow.logValidation('Step 1: Outline Response', resourceType, result, validation);
    }
    
    if (step === 'generate') {
      const [payload] = args;
      const validation = validateQuizWorksheetFlow.validateGeneratePayload(payload, resourceType);
      validateQuizWorksheetFlow.logValidation('Step 2: Generate Payload', resourceType, payload, validation);
    }
    
    return result;
  };
};
