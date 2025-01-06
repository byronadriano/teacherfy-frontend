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
import { 
  formatOutlineForDisplay, 
  parseOutlineToStructured, 
  generateRegenerationPrompt,
  OUTLINE_PROMPT_TEMPLATE  // Add this
} from './OutlineFormatter';

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

// Function to generate the complete prompt
const generateFullPrompt = (formState) => {
  return OUTLINE_PROMPT_TEMPLATE
    .replace('{numSlides}', formState.numSlides)
    .replace('{language}', formState.language)
    .replace('{gradeLevel}', formState.gradeLevel)
    .replace('{subject}', formState.subjectFocus)
    .replace('{topic}', formState.lessonTopic || 'Not specified')
    .replace('{district}', formState.district || 'Not specified')
    .replace('{customPrompt}', formState.customPrompt || 'None');
};

export const EXAMPLE_OUTLINE = {
  "messages": [
    "Slide 1: Let's Explore Equivalent Fractions!\nContent:\n- Students will be able to recognize and create equivalent fractions in everyday situations, like sharing cookies, pizza, or our favorite Colorado trail mix.\n- Students will be able to explain why different fractions can show the same amount using pictures and numbers.\n\nTeacher Notes:\n- Begin with students sharing their experiences with fractions in their daily lives\n- Use culturally relevant examples from Denver communities\n\nVisual Elements:\n- Interactive display showing local treats divided into equivalent parts\n- Student-friendly vocabulary cards with pictures"
  ],
  "structured_content": [
    {
      "title": "Let's Explore Equivalent Fractions!",
      "layout": "TITLE_AND_CONTENT",
      "content": [
        "Today we're going on a fraction adventure!",
        "- Students will be able to recognize and create equivalent fractions in everyday situations, like sharing cookies, pizza, or our favorite Colorado trail mix",
        "- Students will be able to explain why different fractions can show the same amount using pictures and numbers",
        "- Let's start by thinking about times when we share things equally!"
      ],
      "teacher_notes": [
        "Begin with students sharing their experiences with fractions in their daily lives",
        "Use culturally relevant examples from Denver communities",
        "Encourage bilingual students to share fraction terms in their home language"
      ],
      "visual_elements": [
        "Interactive display showing local treats divided into equivalent parts",
        "Student-friendly vocabulary cards with pictures"
      ],
      "left_column": [],
      "right_column": []
    },
    {
      "title": "What Are Equivalent Fractions?",
      "layout": "TITLE_AND_CONTENT",
      "content": [
        "Let's learn our fraction vocabulary!",
        "- Imagine sharing a breakfast burrito with your friend - you can cut it in half (1/2) or into four equal pieces and take two (2/4). You get the same amount!",
        "- The top number (numerator) tells us how many pieces we have",
        "- The bottom number (denominator) tells us how many total equal pieces",
        "- When fractions show the same amount, we call them equivalent"
      ],
      "teacher_notes": [
        "Use local food examples familiar to Denver students",
        "Connect math vocabulary to real experiences",
        "Encourage students to create their own examples"
      ],
      "visual_elements": [
        "Animation of a burrito being cut into different equivalent portions",
        "Interactive fraction wall labeled in English and Spanish",
        "Hands-on fraction strips for each student"
      ],
      "left_column": [],
      "right_column": []
    },
    {
      "title": "Finding Equivalent Fractions Together",
      "layout": "TWO_COLUMNS",
      "content": [],
      "teacher_notes": [
        "Use Rocky Mountain National Park trail maps for real-world connections",
        "Encourage peer discussion in preferred language",
        "Model think-aloud strategy"
      ],
      "visual_elements": [
        "Trail map showing different fraction representations",
        "Digital manipulatives for student exploration"
      ],
      "left_column": [
        "Let's practice together!",
        "- When we multiply 1/2 by 2/2, we get 2/4",
        "- It's like taking a hiking trail that's 1/2 mile long and marking it every quarter mile - you'll have 2/4 of the trail at the same spot as 1/2!",
        "- Your turn: Try finding an equivalent fraction for 2/3"
      ],
      "right_column": [
        "Check your understanding:",
        "- Use your fraction strips to show how 1/2 = 2/4",
        "- Draw a picture to prove your answer",
        "- Share your strategy with your partner"
      ]
    },
    {
      "title": "Your Turn to Create!",
      "layout": "TITLE_AND_CONTENT",
      "content": [
        "Time to become fraction experts!",
        "- Work with your partner to create equivalent fraction cards",
        "- Use different colors to show equal parts",
        "- Challenge: Can you find three different fractions that equal 1/2?",
        "- Bonus: Create a story problem using equivalent fractions and your favorite Denver activity"
      ],
      "teacher_notes": [
        "Provide bilingual instruction cards",
        "Allow student choice in examples",
        "Support native language use in discussions"
      ],
      "visual_elements": [
        "Sample fraction cards with local themes",
        "Student workspace organization guide",
        "Visual success criteria"
      ],
      "left_column": [],
      "right_column": []
    },
    {
      "title": "Show What You Know!",
      "layout": "TITLE_AND_CONTENT",
      "content": [
        "Let's celebrate what we learned!",
        "- Create three equivalent fractions for 3/4",
        "- Draw a picture showing how you know they're equal",
        "- Write a story about using equivalent fractions in your neighborhood",
        "- Share your favorite way to remember equivalent fractions"
      ],
      "teacher_notes": [
        "Provide multiple ways to demonstrate understanding",
        "Accept explanations in English or home language",
        "Use exit ticket responses to plan next lesson"
      ],
      "visual_elements": [
        "Culturally responsive exit ticket template",
        "Digital portfolio upload guide",
        "Self-assessment checklist in multiple languages"
      ],
      "left_column": [],
      "right_column": []
    }
  ]
};

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
            disabled={
              !formState.gradeLevel || 
              !formState.subjectFocus || 
              uiState.isLoading || 
              uiState.generateOutlineClicked  // Disable after generate outline is clicked
            }
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

  const handleFinalize = () => {
    if (!contentState.structuredContent?.length) {
      setUiState(prev => ({
        ...prev,
        error: "No valid outline content to finalize"
      }));
      return;
    }
    
    setContentState(prev => ({ 
      ...prev, 
      finalOutline: contentState.outlineToConfirm,
      structuredContent: contentState.structuredContent
    }));
    setUiState(prev => ({ 
      ...prev, 
      outlineConfirmed: true,
      outlineModalOpen: false
    }));
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
          onClick={handleFinalize}
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
    generateOutlineClicked: false,  // Add this line
  });

  const [contentState, setContentState] = useState({
    outlineToConfirm: "",
    finalOutline: "",
    structuredContent: []
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
    // Set form state
    setFormState({
      gradeLevel: "4th grade",
      subjectFocus: "Math",
      lessonTopic: "Equivalent Fractions",
      district: "Denver Public Schools",
      language: "English",
      customPrompt: "Create a lesson plan that introduces and reinforces key vocabulary. Include at least three new terms with definitions and examples. Incorporate a variety of interactive checks for understanding—such as quick formative assessments, short activities, or exit tickets—to ensure students are grasping the concepts throughout the lesson. Finally, suggest opportunities for students to engage in collaborative or hands-on learning to deepen their understanding and retention",
      numSlides: 5,
    });
  
    // Reset UI state, keeping form expanded
    setUiState(prev => ({
      ...prev,
      isFormExpanded: true,  // Keep form expanded
      outlineModalOpen: false,
      outlineConfirmed: false,
      generateOutlineClicked: false,  // Reset generate outline clicked
      regenerationCount: 0
    }));
  
    // Clear previous content
    setContentState({
      outlineToConfirm: "",
      finalOutline: "",
      structuredContent: []
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
      structuredContent: [], // Add this
    });
  }, []);

  const handleGenerateOutline = React.useCallback(async () => {
    if (!formState.gradeLevel || !formState.subjectFocus || !formState.language) return;
    
    setUiState(prev => ({ 
      ...prev, 
      isLoading: true,
      isFormExpanded: false,
      generateOutlineClicked: true
    }));
  
    // Check if this is the exact example configuration
    const isExampleConfiguration = 
      formState.gradeLevel === "4th grade" &&
      formState.subjectFocus === "Math" &&
      formState.lessonTopic === "Equivalent Fractions" &&
      formState.district === "Denver Public Schools" &&
      formState.language === "English";
  
    try {
      let data;
      if (isExampleConfiguration) {
        // Use the predefined example outline directly
        const { structured_content } = EXAMPLE_OUTLINE;
        const displayMarkdown = formatOutlineForDisplay(structured_content);
  
        setContentState(prev => ({
          ...prev,
          outlineToConfirm: displayMarkdown,
          structuredContent: structured_content
        }));
  
        setUiState(prev => ({
          ...prev,
          outlineModalOpen: true
        }));
      } else {
        // Existing API call for non-example outlines
        const fullPrompt = generateFullPrompt(formState);
        
        const response = await axios.post(`${BASE_URL}/outline`, {
          custom_prompt: fullPrompt
        });
        data = response.data;
      
        const structuredContent = parseOutlineToStructured(data.messages[0], formState.numSlides);
        const displayMarkdown = formatOutlineForDisplay(structuredContent);
    
        setContentState(prev => ({
          ...prev,
          outlineToConfirm: displayMarkdown,
          structuredContent: structuredContent
        }));
    
        setUiState(prev => ({
          ...prev,
          outlineModalOpen: true
        }));
      }
    } catch (error) {
      setUiState(prev => ({
        ...prev,
        error: error.response?.data?.error || "Error generating outline."
      }));
    } finally {
      setUiState(prev => ({ 
        ...prev, 
        isLoading: false
      }));
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
      const regenerationPrompt = generateRegenerationPrompt(formState, uiState.modifiedPrompt);
    
      const { data } = await axios.post(`${BASE_URL}/outline`, {
        custom_prompt: regenerationPrompt,
      });
    
      try {
        const structuredContent = parseOutlineToStructured(data.messages[0], formState.numSlides);
        const displayMarkdown = formatOutlineForDisplay(structuredContent);
    
        setContentState(prev => ({
          ...prev,
          outlineToConfirm: displayMarkdown,
          structuredContent: structuredContent
        }));
      } catch (parsingError) {
        setUiState(prev => ({
          ...prev,
          error: "Failed to process the outline format. Please try again."
        }));
        return;
      }
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
          structured_content: contentState.structuredContent,  // Add this line
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
  }, [formState, contentState.finalOutline, contentState.structuredContent]);

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