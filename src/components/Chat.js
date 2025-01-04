import React, { useState, useEffect, useRef, memo } from "react";
import axios from "axios";
import {
  Box, Typography, TextField, Button, CircularProgress, MenuItem,
  FormControl, Select, InputLabel, Snackbar, Alert, Dialog,
  DialogTitle, DialogContent, DialogActions, Collapse, IconButton,
  Paper, Tooltip,
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ClearIcon from "@mui/icons-material/Clear";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import DownloadIcon from "@mui/icons-material/Download";
import Logo from "../assets/Teacherfyoai.png";

const FORM_OPTIONS = {
  grades: [
    "Preschool", "Kindergarten", "1st grade", "2nd grade", "3rd grade", "4th grade",
    "5th grade", "6th grade", "7th grade", "8th grade", "9th grade", "10th grade",
    "11th grade", "12th grade",
  ],
  subjects: [
    "Arts & music", "English language arts", "Holidays/seasonal", "Math",
    "Science", "Social studies", "Specialty", "World languages",
  ],
  languages: [
    "English",
    "Spanish",
    "Chinese (Mandarin)",
    "Tagalog",
    "Vietnamese",
    "Arabic",
    "French",
    "Korean",
    "Russian",
    "Hindi"
  ],
};

const BASE_URL = "https://teacherfy-gma6hncme7cpghda.westus-01.azurewebsites.net";

const FormSection = memo(({ formState, uiState, setUiState, onFormChange, onGenerateOutline }) => (
  <Paper elevation={3} sx={{ mb: 3 }}>
    <Box sx={{ 
      p: 2,
      borderBottom: uiState.isFormExpanded ? '1px solid #e0e0e0' : 'none',
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center"
    }}>
      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
        Lesson Plan Inputs
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {uiState.isLoading && !uiState.outlineModalOpen && (
          <CircularProgress size={24} />
        )}
        <Tooltip title={uiState.isFormExpanded ? "Collapse Form" : "Expand Form"}>
          <IconButton
            onClick={() => setUiState(prev => ({ 
              ...prev, 
              isFormExpanded: !prev.isFormExpanded 
            }))}
          >
            {uiState.isFormExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>

    <Collapse in={uiState.isFormExpanded}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <FormControl fullWidth disabled={uiState.outlineModalOpen}>
            <InputLabel>Language *</InputLabel>
            <Select
              value={formState.language}
              onChange={(e) => onFormChange('language', e.target.value)}
              label="Language *"
            >
              {FORM_OPTIONS.languages.map((language) => (
                <MenuItem key={language} value={language}>{language}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth disabled={uiState.outlineModalOpen}>
            <InputLabel>Grade Level *</InputLabel>
            <Select
              value={formState.gradeLevel}
              onChange={(e) => onFormChange('gradeLevel', e.target.value)}
              label="Grade Level *"
            >
              {FORM_OPTIONS.grades.map((grade) => (
                <MenuItem key={grade} value={grade}>{grade}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth disabled={uiState.outlineModalOpen}>
            <InputLabel>Subject *</InputLabel>
            <Select
              value={formState.subjectFocus}
              onChange={(e) => onFormChange('subjectFocus', e.target.value)}
              label="Subject *"
            >
              {FORM_OPTIONS.subjects.map((subject) => (
                <MenuItem key={subject} value={subject}>{subject}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Lesson Topic"
            value={formState.lessonTopic}
            onChange={(e) => onFormChange('lessonTopic', e.target.value)}
            placeholder="e.g. Equivalent Fractions"
            fullWidth
            disabled={uiState.outlineModalOpen}
          />

          <TextField
            label="District"
            value={formState.district}
            onChange={(e) => onFormChange('district', e.target.value)}
            placeholder="e.g. Denver Public Schools"
            fullWidth
            disabled={uiState.outlineModalOpen}
          />

          <TextField
            label="Additional Requirements"
            multiline
            rows={3}
            value={formState.customPrompt}
            onChange={(e) => onFormChange('customPrompt', e.target.value)}
            placeholder="Add specific requirements..."
            fullWidth
            disabled={uiState.outlineModalOpen}
          />

          <TextField
            label="Number of Slides"
            type="number"
            value={formState.numSlides}
            onChange={(e) => onFormChange('numSlides', e.target.value)}
            inputProps={{ min: 1, max: 10 }}
            sx={{ width: 200 }}
            disabled={uiState.outlineModalOpen}
          />

          <Button
            variant="contained"
            color="primary"
            onClick={onGenerateOutline}
            disabled={!formState.gradeLevel || !formState.subjectFocus || uiState.isLoading || uiState.outlineModalOpen}
          >
            Generate Outline
          </Button>
        </Box>
      </Box>
    </Collapse>
  </Paper>
));

const ConfirmationModal = memo(({ 
  uiState, 
  contentState, 
  setUiState, 
  setContentState, 
  handleRegenerateOutline 
}) => {
  const [localModifiedPrompt, setLocalModifiedPrompt] = useState("");

  const handleModifiedPromptChange = (e) => {
    setLocalModifiedPrompt(e.target.value);
  };
  
  const handleRegenerateClick = () => {
    if (!localModifiedPrompt.trim()) return;
    
    setUiState(prev => ({
      ...prev,
      modifiedPrompt: localModifiedPrompt,
      isLoading: true
    }));
    handleRegenerateOutline();
  };

  return (
    <Dialog 
      open={uiState.outlineModalOpen} 
      onClose={() => setUiState(prev => ({ ...prev, outlineModalOpen: false }))}
      maxWidth="md" 
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Review and Modify Outline
          {uiState.regenerationCount > 0 && (
            <Typography variant="subtitle2" color="text.secondary">
              Regeneration attempts: {uiState.regenerationCount}/3
            </Typography>
          )}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Generated Outline:
          </Typography>
          <Paper sx={{ 
            p: 2, 
            maxHeight: "400px", 
            overflowY: "auto",
            backgroundColor: "#fafafa" 
          }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {contentState.outlineToConfirm}
            </ReactMarkdown>
          </Paper>
        </Box>
        
        {uiState.regenerationCount < 3 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Want to modify the outline? Add your requirements:
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={localModifiedPrompt}
              onChange={handleModifiedPromptChange}
              placeholder="Enter additional requirements or modifications..."
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button 
          onClick={() => setUiState(prev => ({ ...prev, outlineModalOpen: false }))}
          color="inherit"
        >
          Cancel
        </Button>
        {uiState.regenerationCount < 3 && (
          <Button 
            onClick={handleRegenerateClick}
            color="primary"
            disabled={!localModifiedPrompt.trim() || uiState.isLoading}
          >
            {uiState.isLoading ? <CircularProgress size={24} /> : "Regenerate Outline"}
          </Button>
        )}
        <Button 
          onClick={() => {
            setContentState(prev => ({ ...prev, finalOutline: contentState.outlineToConfirm }));
            setUiState(prev => ({ 
              ...prev, 
              outlineConfirmed: true,
              outlineModalOpen: false
            }));
          }}
          variant="contained" 
          color="primary"
        >
          Finalize Outline
        </Button>
      </DialogActions>
    </Dialog>
  );
});

const Chat = () => {
  const [formState, setFormState] = useState({
    lessonTopic: "",
    district: "",
    gradeLevel: "",
    subjectFocus: "",
    language: "",  // Add this line
    customPrompt: "",
    numSlides: 3,
  });

  const [uiState, setUiState] = useState({
    isLoading: false,
    error: "",
    outlineModalOpen: false,
    outlineConfirmed: false,
    isFormExpanded: true,
    regenerationCount: 0,
    modifiedPrompt: "",
  });

  const [contentState, setContentState] = useState({
    outlineToConfirm: "",
    finalOutline: "",
  });

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [contentState.outlineToConfirm]);

  const handleFormChange = React.useCallback((field, value) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const loadExample = React.useCallback(() => {
    setFormState({
      gradeLevel: "4th grade",
      subjectFocus: "Math",
      lessonTopic: "Equivalent Fractions",
      district: "Denver Public Schools",
      language: "English",  // Add this line
      customPrompt: "Create a lesson plan that introduces and reinforces key vocabulary...",
      numSlides: 5,
    });
  }, []);

  const clearAll = React.useCallback(() => {
    setFormState({
      lessonTopic: "",
      district: "",
      gradeLevel: "",
      subjectFocus: "",
      language: "",  // Add this line
      customPrompt: "",
      numSlides: 3,
    });
    setUiState(prev => ({
      ...prev,
      regenerationCount: 0,
      modifiedPrompt: "",
      outlineConfirmed: false,
      isFormExpanded: true,
    }));
    setContentState({
      outlineToConfirm: "",
      finalOutline: "",
    });
  }, []);

  const handleGenerateOutline = React.useCallback(async () => {
    if (!formState.gradeLevel || !formState.subjectFocus || !formState.language) return;
  

    setUiState(prev => ({ 
      ...prev, 
      isLoading: true,
      isFormExpanded: false
    }));

    try {
      const fullPrompt = `
        Grade Level: ${formState.gradeLevel}
        Subject: ${formState.subjectFocus}
        Topic: ${formState.lessonTopic || 'Not specified'}
        District: ${formState.district || 'Not specified'}
        Language: ${formState.language}
        Number of Slides: ${formState.numSlides}
        
        Additional Requirements:
        ${formState.customPrompt || 'None'}
        
        Please create an engaging lesson outline in ${formState.language} with exactly ${formState.numSlides} slides.
        Format each point in a direct teaching style, as if speaking to students directly:
        - The first slide should introduce the topic and set the stage for the learning objective using this as a sentence frame: "Students will be able to... "
        - Start each concept with "•" followed by a teaching point, explanation, or example
        - Use clear, student-friendly language appropriate for ${formState.language} speakers
        - Include direct explanations and examples rather than descriptions of what to teach
        - Make the content interactive and engaging
        - Include real-world examples and analogies that are culturally relevant
        ...
      `.trim();
  
      const { data } = await axios.post(`${BASE_URL}/outline`, {
        grade_level: formState.gradeLevel,
        subject_focus: formState.subjectFocus,
        lesson_topic: formState.lessonTopic || '',
        district: formState.district || '',
        language: formState.language,  // Add this line
        custom_prompt: fullPrompt,
        num_slides: Math.min(Math.max(Number(formState.numSlides) || 3, 1), 10),
      });

      setContentState(prev => ({
        ...prev,
        outlineToConfirm: data.messages[0] || ""
      }));
      setUiState(prev => ({
        ...prev,
        outlineModalOpen: true
      }));
    } catch (error) {
      setUiState(prev => ({
        ...prev,
        error: error.response?.data?.error || "Error generating outline."
      }));
    } finally {
      setUiState(prev => ({ ...prev, isLoading: false }));
    }
  }, [formState]);

  const handleRegenerateOutline = React.useCallback(async () => {
    if (uiState.regenerationCount >= 3) {
      setUiState(prev => ({
        ...prev,
        error: "Maximum regeneration attempts (3) reached."
      }));
      return;
    }
  
    setUiState(prev => ({
      ...prev,
      regenerationCount: prev.regenerationCount + 1,
      isLoading: true
    }));
  
    try {
      const fullPrompt = `
        Grade Level: ${formState.gradeLevel}
        Subject: ${formState.subjectFocus}
        Topic: ${formState.lessonTopic || 'Not specified'}
        District: ${formState.district || 'Not specified'}
        Language: ${formState.language}
        Number of Slides: ${formState.numSlides}
        
        IMPORTANT ADDITIONAL REQUIREMENTS (Must be incorporated):
        ${uiState.modifiedPrompt}
        
        Base Requirements:
        ${formState.customPrompt || 'None'}
        Format each point in a direct teaching style, as if speaking to students directly in ${formState.language}:
        - The first slide should introduce the topic and set the stage for the learning objective using this as a sentence frame: "Students will be able to... "
        - Start each concept with "•" followed by a teaching point, explanation, or example
        - Use clear, student-friendly language appropriate for ${formState.language} speakers
        - Include direct explanations and examples rather than descriptions of what to teach
        - Make the content interactive and engaging
        - Include real-world examples and analogies that are culturally relevant
        - Ensure all content is properly presented in ${formState.language}
        
        Example format for content:
        •Equivalent fractions: These are fractions that look different but have the same value
        •Think of it like sharing a pizza: cutting it into 2 pieces or 4 pieces still gives you the same amount when you take half
        •Let's look at ½ and 2/4 - they're equivalent because...
      
        Each slide should:
        - Teach directly to students in ${formState.language}
        - Include concrete examples
        - Use student-friendly language
        - Focus on one clear concept
        - Build understanding progressively
      `.trim();
  
      const { data } = await axios.post(`${BASE_URL}/outline`, {
        grade_level: formState.gradeLevel,
        subject_focus: formState.subjectFocus,
        lesson_topic: formState.lessonTopic || '',
        district: formState.district || '',
        language: formState.language, // Add the language parameter
        custom_prompt: fullPrompt,
        num_slides: Math.min(Math.max(Number(formState.numSlides) || 3, 1), 10),
      });
  
      setContentState(prev => ({
        ...prev,
        outlineToConfirm: data.messages[0] || ""
      }));
    } catch (error) {
      setUiState(prev => ({
        ...prev,
        error: error.response?.data?.error || "Error regenerating outline."
      }));
    } finally {
      setUiState(prev => ({ ...prev, isLoading: false }));
    }
  }, [formState, uiState.regenerationCount, uiState.modifiedPrompt]);
  
  const generatePresentation = React.useCallback(async () => {
    setUiState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await fetch(`${BASE_URL}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lesson_outline: contentState.finalOutline,
          lesson_topic: formState.lessonTopic,
          district: formState.district,
          grade_level: formState.gradeLevel,
          subject_focus: formState.subjectFocus,
          custom_prompt: formState.customPrompt,
          num_slides: Number(formState.numSlides)
        }),
      });

      if (!response.ok) throw new Error("Failed to generate the presentation. Please try again.");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${formState.lessonTopic || "lesson"}_presentation.pptx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setUiState(prev => ({
        ...prev,
        error: err.message || "Error generating presentation"
      }));
    } finally {
      setUiState(prev => ({ ...prev, isLoading: false }));
    }
  }, [formState, contentState.finalOutline]);

  return (
    <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh", p: 4 }}>
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
          <img src={Logo} alt="Teacherfy Logo" style={{ height: 180 }} />
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mb: 3 }}>
          <Button 
            color="inherit" 
            onClick={clearAll} 
            startIcon={<ClearIcon />}
            disabled={uiState.outlineModalOpen}
          >
            Clear All
          </Button>
          <Button 
            color="inherit" 
            onClick={loadExample}
            disabled={uiState.outlineModalOpen}
          >
            Load Example
          </Button>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <FormSection 
            formState={formState}
            uiState={uiState}
            setUiState={setUiState}
            onFormChange={handleFormChange}
            onGenerateOutline={handleGenerateOutline}
          />

          {uiState.outlineConfirmed && (
            <Paper elevation={3} sx={{ p: 3 }}>
              <Box sx={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                mb: 2 
              }}>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  Lesson Outline
                </Typography>
              </Box>

              <Box sx={{
                maxHeight: 500,
                overflowY: "auto",
                border: "1px solid #e0e0e0",
                borderRadius: 1,
                p: 2,
                mb: 3,
                backgroundColor: "#fafafa"
              }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {contentState.finalOutline}
                </ReactMarkdown>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={generatePresentation}
                  startIcon={<DownloadIcon />}
                  disabled={uiState.isLoading}
                >
                  {uiState.isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Download Presentation"
                  )}
                </Button>
              </Box>
            </Paper>
          )}

          <ConfirmationModal 
            uiState={uiState}
            contentState={contentState}
            setUiState={setUiState}
            setContentState={setContentState}
            handleRegenerateOutline={handleRegenerateOutline}
          />

          <Snackbar 
            open={!!uiState.error} 
            autoHideDuration={6000} 
            onClose={() => setUiState(prev => ({ ...prev, error: "" }))}
          >
            <Alert 
              onClose={() => setUiState(prev => ({ ...prev, error: "" }))}
              severity="error" 
              sx={{ width: "100%" }}
            >
              {uiState.error}
            </Alert>
          </Snackbar>

          <div ref={messagesEndRef} />
        </Box>
      </Box>
    </Box>
  );
};

export default Chat;