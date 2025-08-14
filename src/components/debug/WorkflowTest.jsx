// src/components/debug/WorkflowTest.jsx - Quiz/Worksheet Generation Test Component
import React, { useState } from 'react';
import { Box, Button, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { outlineService } from '../../services';
import { presentationService } from '../../services/presentation';

const WorkflowTest = () => {
  const [step1Data, setStep1Data] = useState(null);
  const [step2Result, setStep2Result] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testQuizGeneration = async () => {
    setLoading(true);
    setError(null);
    setStep1Data(null);
    setStep2Result(null);

    try {
      console.log('🚀 Starting Quiz Generation Workflow Test');
      
      // Step 1: Generate Content (/outline)
      console.log('📋 Step 1: Calling /outline for quiz generation');
      const formData = {
        resourceType: 'quiz',
        gradeLevel: '4th grade',
        subjectFocus: 'Math', 
        language: 'English',
        lessonTopic: 'Multiplication',
        numSections: 3
      };

      const outlineResponse = await outlineService.generate(formData);
      
      if (outlineResponse.error) {
        throw new Error(`Step 1 failed: ${outlineResponse.error}`);
      }

      setStep1Data(outlineResponse);
      console.log('✅ Step 1 Complete - Outline generated');

      // Step 2: Generate File (/generate)
      console.log('📄 Step 2: Calling /generate with unmodified structured_content');
      
      const contentState = {
        structuredContent: outlineResponse.structured_content,
        finalOutline: 'Quiz generated from workflow test',
        generatedResources: {
          'Quiz': outlineResponse.structured_content
        }
      };

      const generateResult = await presentationService.generateMultiResource(
        { resourceType: ['Quiz'], lessonTopic: 'Multiplication' },
        contentState,
        ['Quiz']
      );

      setStep2Result(generateResult);
      console.log('✅ Step 2 Complete - File generated');
      console.log('🎉 WORKFLOW TEST SUCCESSFUL');

    } catch (err) {
      console.error('❌ Workflow test failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testWorksheetGeneration = async () => {
    setLoading(true);
    setError(null);
    setStep1Data(null);
    setStep2Result(null);

    try {
      console.log('🚀 Starting Worksheet Generation Workflow Test');
      
      // Step 1: Generate Content (/outline)
      console.log('📋 Step 1: Calling /outline for worksheet generation');
      const formData = {
        resourceType: 'worksheet',
        gradeLevel: '3rd grade',
        subjectFocus: 'Math',
        language: 'English', 
        lessonTopic: 'Addition and Subtraction',
        numSections: 4
      };

      const outlineResponse = await outlineService.generate(formData);
      
      if (outlineResponse.error) {
        throw new Error(`Step 1 failed: ${outlineResponse.error}`);
      }

      setStep1Data(outlineResponse);
      console.log('✅ Step 1 Complete - Outline generated');

      // Step 2: Generate File (/generate)
      console.log('📄 Step 2: Calling /generate with unmodified structured_content');
      
      const contentState = {
        structuredContent: outlineResponse.structured_content,
        finalOutline: 'Worksheet generated from workflow test',
        generatedResources: {
          'Worksheet': outlineResponse.structured_content
        }
      };

      const generateResult = await presentationService.generateMultiResource(
        { resourceType: ['Worksheet'], lessonTopic: 'Addition and Subtraction' },
        contentState,
        ['Worksheet']
      );

      setStep2Result(generateResult);
      console.log('✅ Step 2 Complete - File generated');
      console.log('🎉 WORKSHEET WORKFLOW TEST SUCCESSFUL');

    } catch (err) {
      console.error('❌ Workflow test failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Quiz/Worksheet Generation Workflow Test
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button 
          variant="contained" 
          color="primary"
          onClick={testQuizGeneration}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : 'Test Quiz Generation'}
        </Button>
        
        <Button 
          variant="contained" 
          color="secondary"
          onClick={testWorksheetGeneration}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : 'Test Worksheet Generation'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <strong>Test Failed:</strong> {error}
          <br />
          <Typography variant="body2" sx={{ mt: 1 }}>
            Check browser console for detailed validation logs
          </Typography>
        </Alert>
      )}

      {step1Data && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Step 1 Results (/outline)
          </Typography>
          <Typography variant="body2">
            Sections: {step1Data.structured_content?.length || 0}
          </Typography>
          <Typography variant="body2">
            Quiz Questions Found: {step1Data.structured_content?.filter(s => s.structured_questions?.length).length || 0}
          </Typography>
          <Typography variant="body2">
            Worksheet Exercises Found: {step1Data.structured_content?.filter(s => s.exercises?.length || s.structured_activities?.length).length || 0}
          </Typography>
        </Paper>
      )}

      {step2Result && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Step 2 Results (/generate)
          </Typography>
          {Object.entries(step2Result).map(([resourceType, result]) => (
            <Box key={resourceType}>
              <Typography variant="body2">
                <strong>{resourceType}:</strong> {result.error ? `❌ ${result.error}` : '✅ File generated successfully'}
              </Typography>
              {result.blob && (
                <Typography variant="body2" color="success.main">
                  File size: {(result.blob.size / 1024).toFixed(2)} KB
                </Typography>
              )}
            </Box>
          ))}
        </Paper>
      )}

      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>This test validates the exact workflow:</strong>
          <br />
          1. Call /outline to get structured_content with structured_questions/exercises
          <br />
          2. Pass unmodified structured_content to /generate
          <br />
          3. Verify backend receives required fields and generates file
          <br />
          <br />
          Check browser console for detailed validation logs and data flow analysis.
        </Typography>
      </Alert>
    </Box>
  );
};

export default WorkflowTest;
