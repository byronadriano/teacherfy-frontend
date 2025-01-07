// chat.js
import React, { useState, useEffect, useRef, memo } from "react";
import axios from "axios";
import {
  Box, Typography, TextField, Button, CircularProgress, MenuItem,
  FormControl, Select, InputLabel, Snackbar, Alert, Dialog,
  DialogTitle, DialogContent, DialogActions, Collapse, IconButton,
  Paper, Tooltip,
} from "@mui/material";
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";
import ClearIcon from "@mui/icons-material/Clear";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
// import DownloadIcon from "@mui/icons-material/Download";
import Logo from "../assets/Teacherfyoai.png";
import { 
  formatOutlineForDisplay, 
  parseOutlineToStructured, 
  generateRegenerationPrompt,
  generateFullPrompt
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

export const EXAMPLE_OUTLINE = {
  "messages": [
    `Slide 1: Let's Explore Equivalent Fractions!
Content:
- Students will be able to recognize and create equivalent fractions in everyday situations, like sharing cookies, pizza, or our favorite Colorado trail mix.
- Students will be able to explain why different fractions can show the same amount using pictures and numbers.

Teacher Notes:
- ENGAGEMENT: Begin with students sharing their experiences with fractions in their daily lives.
- ASSESSMENT: Ask questions about daily fraction use and note which students grasp the concept.
- DIFFERENTIATION: Use culturally relevant examples from Denver communities, and encourage bilingual students to share fraction terms in their home language.

Visual Elements:
- Interactive display showing local treats divided into equivalent parts
- Student-friendly vocabulary cards with pictures


Slide 2: What Are Equivalent Fractions?
Content:
- Let's learn our fraction vocabulary!
- Imagine sharing a breakfast burrito with your friend - you can cut it in half (1/2) or into four equal pieces and take two (2/4). You get the same amount!
- The top number (numerator) tells us how many pieces we have
- The bottom number (denominator) tells us how many total equal pieces
- When fractions show the same amount, we call them equivalent

Teacher Notes:
- ENGAGEMENT: Use local food examples (burritos, pizza) familiar to Denver students.
- ASSESSMENT: Connect math vocabulary to real experiences; gauge student responses.
- DIFFERENTIATION: Encourage students to create their own examples or use fraction strips.

Visual Elements:
- Animation of a burrito being cut into different equivalent portions
- Interactive fraction wall labeled in English and Spanish
- Hands-on fraction strips for each student


Slide 3: Finding Equivalent Fractions Together
Content:
- When we multiply 1/2 by 2/2, we get 2/4
- It's like taking a hiking trail that's 1/2 mile long and marking it every quarter mile - you'll have 2/4 of the trail at the same spot as 1/2!
- Your turn: Try finding an equivalent fraction for 2/3

Teacher Notes:
- ENGAGEMENT: Use Rocky Mountain National Park trail maps for real-world connections; encourage peer discussion in preferred language.
- ASSESSMENT: Model think-aloud strategy and ask students to share their reasoning.
- DIFFERENTIATION: Provide scaffolds like step-by-step multiplication visuals; advanced learners can find multiple equivalent fractions (e.g., 2/3 = 4/6 = 6/9).

Visual Elements:
- Trail map showing different fraction representations
- Digital manipulatives for student exploration


Slide 4: Your Turn to Create!
Content:
- Time to become fraction experts!
- Work with your partner to create equivalent fraction cards
- Use different colors to show equal parts
- Challenge: Can you find three different fractions that equal 1/2?
- Bonus: Create a story problem using equivalent fractions and your favorite Denver activity

Teacher Notes:
- ENGAGEMENT: Provide bilingual instruction cards; allow student choice in examples.
- ASSESSMENT: Check each pair’s fraction cards and see if they are correct matches.
- DIFFERENTIATION: Offer visual support or partially completed fraction cards for struggling students; challenge advanced learners to create multi-step word problems.

Visual Elements:
- Sample fraction cards with local themes
- Student workspace organization guide
- Visual success criteria


Slide 5: Show What You Know!
Content:
- Let's celebrate what we learned!
- Create three equivalent fractions for 3/4
- Draw a picture showing how you know they're equal
- Write a story about using equivalent fractions in your neighborhood
- Share your favorite way to remember equivalent fractions

Teacher Notes:
- ENGAGEMENT: Have students explain their fractions to a partner or small group.
- ASSESSMENT: Provide multiple ways to demonstrate understanding; accept explanations in English or home language.
- DIFFERENTIATION: Use exit ticket responses to plan next lesson; advanced students can convert any improper fraction results to mixed numbers.

Visual Elements:
- Culturally responsive exit ticket template
- Digital portfolio upload guide
- Self-assessment checklist in multiple languages`
  ],
  "structured_content": [
    {
      "title": "Let's Explore Equivalent Fractions!",
      "layout": "TITLE_AND_CONTENT",
      "content": [
        "Students will be able to recognize and create equivalent fractions in everyday situations, like sharing cookies, pizza, or our favorite Colorado trail mix",
        "Students will be able to explain why different fractions can show the same amount using pictures and numbers"
      ],
      "teacher_notes": [
        "ENGAGEMENT: Begin with students sharing their experiences with fractions in their daily lives",
        "ASSESSMENT: Ask questions about daily fraction use and note which students grasp the concept",
        "DIFFERENTIATION: Use culturally relevant examples from Denver communities; encourage bilingual students to share fraction terms in their home language"
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
        "Imagine sharing a breakfast burrito with your friend - you can cut it in half (1/2) or into four equal pieces and take two (2/4). You get the same amount!",
        "The top number (numerator) tells us how many pieces we have",
        "The bottom number (denominator) tells us how many total equal pieces",
        "When fractions show the same amount, we call them equivalent"
      ],
      "teacher_notes": [
        "ENGAGEMENT: Use local food examples (burritos, pizza) familiar to Denver students",
        "ASSESSMENT: Connect math vocabulary to real experiences; gauge student responses",
        "DIFFERENTIATION: Encourage students to create their own examples or use fraction strips"
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
        "ENGAGEMENT: Use Rocky Mountain National Park trail maps for real-world connections; encourage peer discussion in preferred language",
        "ASSESSMENT: Model think-aloud strategy and ask students to share their reasoning",
        "DIFFERENTIATION: Provide step-by-step multiplication visuals for extra support; advanced learners can find multiple equivalents"
      ],
      "visual_elements": [
        "Trail map showing different fraction representations",
        "Digital manipulatives for student exploration"
      ],
      "left_column": [
        "Let's practice together!",
        "When we multiply 1/2 by 2/2, we get 2/4",
        "It's like taking a hiking trail that's 1/2 mile long and marking it every quarter mile - you'll have 2/4 of the trail at the same spot as 1/2!",
        "Your turn: Try finding an equivalent fraction for 2/3"
      ],
      "right_column": [
        "Check your understanding:",
        "Use your fraction strips to show how 1/2 = 2/4",
        "Draw a picture to prove your answer",
        "Share your strategy with your partner"
      ]
    },
    {
      "title": "Your Turn to Create!",
      "layout": "TITLE_AND_CONTENT",
      "content": [
        "Time to become fraction experts!",
        "Work with your partner to create equivalent fraction cards",
        "Use different colors to show equal parts",
        "Challenge: Can you find three different fractions that equal 1/2?",
        "Bonus: Create a story problem using equivalent fractions and your favorite Denver activity"
      ],
      "teacher_notes": [
        "ENGAGEMENT: Provide bilingual instruction cards; allow student choice in examples",
        "ASSESSMENT: Check each pair’s fraction cards for correctness",
        "DIFFERENTIATION: Offer visual support or partially completed fraction cards for struggling students; challenge advanced learners with multi-step word problems"
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
        "Create three equivalent fractions for 3/4",
        "Draw a picture showing how you know they're equal",
        "Write a story about using equivalent fractions in your neighborhood",
        "Share your favorite way to remember equivalent fractions"
      ],
      "teacher_notes": [
        "ENGAGEMENT: Have students explain their fractions to a partner or small group",
        "ASSESSMENT: Provide multiple ways to demonstrate understanding; accept explanations in English or home language",
        "DIFFERENTIATION: Use exit ticket responses to plan next lesson; advanced students can convert any improper results to mixed numbers"
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
              !formState.language ||
              !formState.lessonTopic ||
              uiState.isLoading || 
              uiState.generateOutlineClicked
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
        onClose={() => setUiState(prev => ({ 
          ...prev, 
          outlineModalOpen: false,
          generateOutlineClicked: false  // Allow generating again
        }))}
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
      {contentState.structuredContent.map((slide, index) => (
        <Box key={index} sx={{ mb: index < contentState.structuredContent.length - 1 ? 4 : 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            Slide {index + 1}: {slide.title}
          </Typography>

          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
            Content:
          </Typography>
          {slide.content.map((item, i) => (
            <Typography key={i} sx={{ pl: 2, mb: 0.5 }}>
              • {item}
            </Typography>
          ))}

          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
            Teacher Notes:
          </Typography>
          {slide.teacher_notes.map((note, i) => (
            <Typography key={i} sx={{ pl: 2, mb: 0.5 }}>
              • {note}
            </Typography>
          ))}

          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
            Visual Elements:
          </Typography>
          {slide.visual_elements.length > 0 ? (
            slide.visual_elements.map((element, i) => (
              <Typography key={i} sx={{ pl: 2, mb: 0.5 }}>
                • {element}
              </Typography>
            ))
          ) : (
            <Typography sx={{ pl: 2, mb: 0.5 }}>
              • (None provided)
            </Typography>
          )}

          {index < contentState.structuredContent.length - 1 && (
            <Box sx={{ my: 3, borderBottom: '1px solid #e0e0e0' }} />
          )}
        </Box>
      ))}
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
          onClick={() => setUiState(prev => ({ 
            ...prev, 
            outlineModalOpen: false,
            generateOutlineClicked: false
          }))}
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
          disabled={uiState.isLoading}
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
    // Check if this is the exact example configuration
  const isExampleConfiguration = (formState) => {
    return (
      formState.gradeLevel === "4th grade" &&
      formState.subjectFocus === "Math" &&
      formState.lessonTopic === "Equivalent Fractions" &&
      formState.district === "Denver Public Schools" &&
      formState.language === "English" &&
      formState.customPrompt === "Create a lesson plan that introduces and reinforces key vocabulary. Include at least three new terms with definitions and examples. Incorporate a variety of interactive checks for understanding—such as quick formative assessments, short activities, or exit tickets—to ensure students are grasping the concepts throughout the lesson. Finally, suggest opportunities for students to engage in collaborative or hands-on learning to deepen their understanding and retention" &&
      formState.numSlides === 5
    );
  };
  
  const handleGenerateOutline = React.useCallback(async () => {
    if (!formState.gradeLevel || !formState.subjectFocus || !formState.language || !formState.lessonTopic) return;
    
    setUiState(prev => ({ 
      ...prev, 
      isLoading: true,
      isFormExpanded: false,
      generateOutlineClicked: true
    }));
  
    try {
      let data;
      if (isExampleConfiguration(formState)) {
        // Use the predefined example outline directly
        const { structured_content } = EXAMPLE_OUTLINE;
        
        setContentState(prev => ({
          ...prev,
          outlineToConfirm: formatOutlineForDisplay(
            structured_content
          ),
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
          grade_level: formState.gradeLevel,
          subject_focus: formState.subjectFocus,
          lesson_topic: formState.lessonTopic,
          district: formState.district,
          language: formState.language,
          custom_prompt: fullPrompt,
          num_slides: Math.min(Math.max(Number(formState.numSlides) || 3, 1), 10)
        });
        data = response.data;
      
        const rawOutlineText = response.data.messages[0];
        
        console.log("DEBUG: Here's the EXACT raw text from AI:", rawOutlineText);
        
        const structuredContent = parseOutlineToStructured(rawOutlineText, formState.numSlides);
                
        setContentState(prev => ({
          ...prev,
          outlineToConfirm: formatOutlineForDisplay(
            structuredContent, 
            data.messages[0]
          ),
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
        grade_level: formState.gradeLevel,
        subject_focus: formState.subjectFocus,
        lesson_topic: formState.lessonTopic,
        district: formState.district,
        language: formState.language,
        custom_prompt: formState.customPrompt,
        regeneration_prompt: regenerationPrompt,
        num_slides: Math.min(Math.max(Number(formState.numSlides) || 3, 1), 10)
      });
    
      try {
        console.log("DEBUG: AI raw outline text =>", data.messages[0]);

        const structuredContent = parseOutlineToStructured(data.messages[0], formState.numSlides);
        
        console.log("DEBUG: structuredContent =>", JSON.stringify(structuredContent, null, 2));
        
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
    if (!contentState.finalOutline || !contentState.structuredContent?.length) {
      setUiState(prev => ({
        ...prev,
        error: "Please finalize the outline before generating presentation"
      }));
      return;
    }
    
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
                {contentState.structuredContent.map((slide, index) => (
                  <Box key={index} sx={{ mb: index < contentState.structuredContent.length - 1 ? 4 : 0 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Slide {index + 1}: {slide.title}
                    </Typography>

                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
                      Content:
                    </Typography>
                    {slide.content.map((item, i) => (
                      <Typography key={i} sx={{ pl: 2, mb: 0.5 }}>
                        • {item}
                      </Typography>
                    ))}

                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
                      Teacher Notes:
                    </Typography>
                    {slide.teacher_notes.map((note, i) => (
                      <Typography key={i} sx={{ pl: 2, mb: 0.5 }}>
                        • {note}
                      </Typography>
                    ))}

                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
                      Visual Elements:
                    </Typography>
                    {slide.visual_elements.length > 0 ? (
                      slide.visual_elements.map((element, i) => (
                        <Typography key={i} sx={{ pl: 2, mb: 0.5 }}>
                          • {element}
                        </Typography>
                      ))
                    ) : (
                      <Typography sx={{ pl: 2, mb: 0.5 }}>
                        • (None provided)
                      </Typography>
                    )}

                    {index < contentState.structuredContent.length - 1 && (
                      <Box sx={{ my: 3, borderBottom: '1px solid #e0e0e0' }} />
                    )}
                  </Box>
                ))}
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => window.open(`${BASE_URL}/authorize`, "_blank")}
            >
                Open in Google Slides
            </Button>

            <Button
                variant="contained"
                color="secondary"
                onClick={generatePresentation}
            >
                Open in PowerPoint
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