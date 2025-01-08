// Chat.js
import React, { useState, useEffect, useRef, memo } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Collapse,
  IconButton,
  Paper,
  Tooltip,
  Modal
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import DownloadIcon from "@mui/icons-material/Download";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { GoogleOAuthProvider, GoogleLogin, googleLogout } from '@react-oauth/google';
import Logo from "../../assets/images/Teacherfyoai.png";
import { 
  formatOutlineForDisplay, 
  parseOutlineToStructured, 
  generateRegenerationPrompt,
  generateFullPrompt
} from '../../utils/outlineFormatter';

import { 
  FORM_OPTIONS, 
  GOOGLE_CLIENT_ID, 
  BASE_URL, 
  EXAMPLE_OUTLINE 
} from '../../utils/constants';

import "./styles.css";  // Import your CSS file here to apply styles.


// FormSection Component
const FormSection = memo(({ formState, uiState, setUiState, onFormChange, onGenerateOutline }) => (
  <Paper elevation={0} className="form-paper">
    <Box sx={{ 
      borderBottom: uiState.isFormExpanded ? '1px solid #e0e0e0' : 'none',
      pb: 2,
      mb: 2,
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center"
    }}>
      <Typography variant="h6" sx={{ 
        fontWeight: "600",
        fontSize: '1.25rem',
        color: '#111827'
      }}>
        Lesson Plan Inputs
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {uiState.isLoading && !uiState.outlineModalOpen && (
          <CircularProgress size={20} />
        )}
        <Tooltip title={uiState.isFormExpanded ? "Collapse Form" : "Expand Form"}>
          <IconButton
            size="small"
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
      <Box>
        <FormControl fullWidth sx={{ mb: 2 }} disabled={uiState.outlineModalOpen}>
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

        <FormControl fullWidth sx={{ mb: 2 }} disabled={uiState.outlineModalOpen}>
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

        <FormControl fullWidth sx={{ mb: 2 }} disabled={uiState.outlineModalOpen}>
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
          label="Lesson Topic *"
          value={formState.lessonTopic}
          onChange={(e) => onFormChange('lessonTopic', e.target.value)}
          placeholder="e.g. Equivalent Fractions"
          fullWidth
          sx={{ mb: 2 }}
          disabled={uiState.outlineModalOpen}
        />

        <TextField
          label="District"
          value={formState.district}
          onChange={(e) => onFormChange('district', e.target.value)}
          placeholder="e.g. Denver Public Schools"
          fullWidth
          sx={{ mb: 2 }}
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
          sx={{ mb: 2 }}
          disabled={uiState.outlineModalOpen}
        />

        <Box className="number-slides-container">
          <FormControl fullWidth disabled={uiState.outlineModalOpen}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: '#4b5563' }}>
              Number of Slides
            </Typography>
            <TextField
              type="number"
              value={formState.numSlides}
              onChange={(e) => onFormChange('numSlides', e.target.value)}
              inputProps={{ 
                min: 1, 
                max: 10,
                style: { 
                  height: '24px',
                  padding: '12px',
                  backgroundColor: '#ffffff'
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '6px'
                }
              }}
            />
          </FormControl>
        </Box>

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
          className="generate-button"
          sx={{
            backgroundColor: "#2563eb",
            '&:hover': {
              backgroundColor: "#1d4ed8"
            },
            '&.Mui-disabled': {
              backgroundColor: '#9ca3af'
            }
          }}
        >
          {uiState.isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Generate Outline"
          )}
        </Button>
      </Box>
    </Collapse>
  </Paper>
));

const SignInPrompt = ({ open, onClose, onSuccess }) => {
  // Early return if the client ID is missing
  if (!GOOGLE_CLIENT_ID) {
    console.error("Google Client ID is not defined!");
    return (
      <Modal open={open} onClose={onClose}>
        <Box sx={{ p: 2 }}>
          <Typography color="error" variant="h6">
            Error: Google Client ID not found.
          </Typography>
        </Box>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="signin-modal-title"
      aria-describedby="signin-modal-description"
      className="signin-prompt"
      // optional: make it fullscreen
      sx={{
        display: "flex",
        alignItems: "stretch",
        justifyContent: "stretch",
      }}
    >
      <Box
        className="signin-dialog"
        // optional: fill entire screen
        sx={{
          width: "100vw",
          height: "100vh",
          bgcolor: "#f5f5f5",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 4,
        }}
      >
          {/* Logo */}
        <Box sx={{ mb: 3 }}>
          <img
            src={Logo}
            alt="Teacherfy AI Logo"
            style={{ maxWidth: "150px", height: "auto" }}
          />
        </Box>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Welcome to Teacherfy AI
        </Typography>
        <Typography sx={{ mb: 3 }}>
          Please sign in with your Google account to create personalized lesson plans.
        </Typography>

        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <GoogleLogin
            onSuccess={onSuccess}
            onError={() => alert("Login Failed")}
            theme="filled_blue"
            shape="pill"
            size="large"
            width="100%"
          />
        </GoogleOAuthProvider>
      </Box>
    </Modal>
  );
};

const ConfirmationModal = memo(({ 
  uiState, 
  contentState,
  subscriptionState, 
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
        generateOutlineClicked: false
      }))}
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
          disabled={!localModifiedPrompt.trim() || uiState.isLoading || (!subscriptionState.isPremium && subscriptionState.downloadCount >= 5)}
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

const UpgradeModal = ({ open, onClose }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>Upgrade to Premium</DialogTitle>
    <DialogContent>
      <Typography variant="body1" sx={{ mb: 2 }}>
        You've reached your monthly limit of 5 free presentations. Upgrade to Premium for:
      </Typography>
      <Box sx={{ pl: 2 }}>
        <Typography>• 50 presentations per month</Typography>
        <Typography>• Priority support</Typography>
        <Typography>• Advanced customization options</Typography>
      </Box>
      <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
        $20/month
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="inherit">Cancel</Button>
      <Button 
        variant="contained" 
        color="primary"
        onClick={() => {
          // Add your payment processing logic here
          window.location.href = 'your-stripe-checkout-url';
        }}
      >
        Upgrade Now
      </Button>
    </DialogActions>
  </Dialog>
);

const Chat = () => {
const [user, setUser] = useState(null);

// Auth & User State first
const [isAuthenticated, setIsAuthenticated] = useState(false);
const [token, setToken] = useState(null);
const [showSignInPrompt, setShowSignInPrompt] = useState(true);

// Then subscription state
const [subscriptionState, setSubscriptionState] = useState({
  downloadCount: 0,
  isPremium: false,
  showUpgradeModal: false
});

  // Form & UI State
  const [formState, setFormState] = useState({
    lessonTopic: "",
    district: "",
    gradeLevel: "",
    subjectFocus: "",
    language: "",
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
    generateOutlineClicked: false,
  });

  const [contentState, setContentState] = useState({
    outlineToConfirm: "",
    finalOutline: "",
    structuredContent: []
  });

  const messagesEndRef = useRef(null);

  // Auth Handlers
  const handleLoginSuccess = (credentialResponse) => {
    setToken(credentialResponse.credential);
    setIsAuthenticated(true);
    const userInfo = JSON.parse(atob(credentialResponse.credential.split(".")[1]));
    setUser(userInfo);
    setShowSignInPrompt(false);
  };

  const handleLogout = () => {
    googleLogout();
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    setShowSignInPrompt(true);
  };

  // Form Handlers
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
      language: "English",
      customPrompt: "Create a lesson plan that introduces and reinforces key vocabulary. Include at least three new terms with definitions and examples. Incorporate a variety of interactive checks for understanding—such as quick formative assessments, short activities, or exit tickets—to ensure students are grasping the concepts throughout the lesson. Finally, suggest opportunities for students to engage in collaborative or hands-on learning to deepen their understanding and retention",
      numSlides: 5,
    });

    setUiState(prev => ({
      ...prev,
      isFormExpanded: true,
      outlineModalOpen: false,
      outlineConfirmed: false,
      generateOutlineClicked: false,
      regenerationCount: 0
    }));

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
      language: "",
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
      structuredContent: [],
    });
  }, []);

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
  
// API Handlers
// For tracking activities
const trackUserActivity = React.useCallback(async (activity) => {
  await fetch('/track_activity', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      activity,
      email: user?.email,
      name: user?.name,
      given_name: user?.given_name,
      family_name: user?.family_name
    })
  });
}, [token, user]);

// Update handleGenerateOutline
const handleGenerateOutline = React.useCallback(async () => {
  if (!token) {
    setShowSignInPrompt(true);
    return;
  }

  if (!formState.gradeLevel || !formState.subjectFocus || !formState.language || !formState.lessonTopic) {
    alert("Please fill in all required fields.");
    return;
  }

  setUiState(prev => ({ 
    ...prev, 
    isLoading: true,
    isFormExpanded: false,
    generateOutlineClicked: true
  }));

  try {
    let data;
    
    if (isExampleConfiguration(formState)) {
      const { structured_content } = EXAMPLE_OUTLINE;
      setContentState(prev => ({
        ...prev,
        outlineToConfirm: formatOutlineForDisplay(structured_content),
        structuredContent: structured_content
      }));
      setUiState(prev => ({
        ...prev,
        outlineModalOpen: true
      }));
    } else {
      const fullPrompt = generateFullPrompt(formState);
      const response = await axios.post(`${BASE_URL}/outline`, {
        grade_level: formState.gradeLevel,
        subject_focus: formState.subjectFocus,
        lesson_topic: formState.lessonTopic,
        district: formState.district,
        language: formState.language,
        custom_prompt: fullPrompt,
        num_slides: Math.min(Math.max(Number(formState.numSlides) || 3, 1), 10)
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      data = response.data;
      const rawOutlineText = response.data.messages[0];
      const structuredContent = parseOutlineToStructured(rawOutlineText, formState.numSlides);
              
      setContentState(prev => ({
        ...prev,
        outlineToConfirm: formatOutlineForDisplay(structuredContent, data.messages[0]),
        structuredContent: structuredContent
      }));
      
      setUiState(prev => ({
        ...prev,
        outlineModalOpen: true
      }));

      await trackUserActivity('Generated Outline');
    }
  } catch (error) {
    setUiState(prev => ({
      ...prev,
      error: error.response?.data?.error || "Error generating outline. Please try again."
    }));
  } finally {
    setUiState(prev => ({ 
      ...prev, 
      isLoading: false
    }));
  }
}, [formState, token, trackUserActivity]);

useEffect(() => {
  if (!user?.email) return;
  
  const lastResetDate = localStorage.getItem(`lastResetDate_${user.email}`);
  const currentDate = new Date();
  
  if (!lastResetDate || new Date(lastResetDate).getMonth() !== currentDate.getMonth()) {
    localStorage.setItem(`downloadCount_${user.email}`, '0');
    localStorage.setItem(`lastResetDate_${user.email}`, currentDate.toISOString());
    setSubscriptionState(prev => ({
      ...prev,
      downloadCount: 0
    }));
  }
}, [user?.email]);

// Update generatePresentation
const generatePresentation = React.useCallback(async () => {
  if (!token) {
    setShowSignInPrompt(true);
    return;
  }
  if (!subscriptionState.isPremium && subscriptionState.downloadCount >= 5) {
    setSubscriptionState(prev => ({
      ...prev,
      showUpgradeModal: true
    }));
    return;
  }
  setUiState(prev => ({ ...prev, isLoading: true }));
  
  try {
    const response = await fetch(`${BASE_URL}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        lesson_outline: contentState.finalOutline,
        structured_content: contentState.structuredContent,
        lesson_topic: formState.lessonTopic,
        district: formState.district,
        grade_level: formState.gradeLevel,
        subject_focus: formState.subjectFocus,
        custom_prompt: formState.customPrompt,
        num_slides: Number(formState.numSlides)
      }),
    });

    if (!response.ok) throw new Error("Failed to generate presentation");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${formState.lessonTopic || "lesson"}_presentation.pptx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    if (!subscriptionState.isPremium) {
      const newCount = subscriptionState.downloadCount + 1;
      localStorage.setItem(`downloadCount_${user.email}`, newCount.toString());
      setSubscriptionState(prev => ({
        ...prev,
        downloadCount: newCount
      }));
    }

    await trackUserActivity('Downloaded Presentation');
  } catch (err) {
    setUiState(prev => ({
      ...prev,
      error: err.message || "Error generating presentation"
    }));
  } finally {
    setUiState(prev => ({ ...prev, isLoading: false }));
  }
}, [formState, token, contentState.finalOutline, contentState.structuredContent, trackUserActivity, subscriptionState, user?.email]);

const handleRegenerateOutline = React.useCallback(async () => {
  if (!token) {
    setShowSignInPrompt(true);
    return;
  }

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
      num_slides: formState.numSlides
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const structuredContent = parseOutlineToStructured(data.messages[0], formState.numSlides);
    const displayMarkdown = formatOutlineForDisplay(structuredContent);

    setContentState(prev => ({
      ...prev,
      outlineToConfirm: displayMarkdown,
      structuredContent: structuredContent
    }));
  } catch (error) {
    setUiState(prev => ({
      ...prev,
      error: error.response?.data?.error || "Error regenerating outline."
    }));
  } finally {
    setUiState(prev => ({ ...prev, isLoading: false }));
  }
}, [formState, uiState.regenerationCount, uiState.modifiedPrompt, token]);

// const generatePresentation = React.useCallback(async () => {
//   if (!token) {
//     setShowSignInPrompt(true);
//     return;
//   }
  
//   if (!contentState.finalOutline || !contentState.structuredContent?.length) {
//     setUiState(prev => ({
//       ...prev,
//       error: "Please finalize the outline before generating a presentation"
//     }));
//     return;
//   }
  
//   setUiState(prev => ({ ...prev, isLoading: true }));
  
//   try {
//     const response = await fetch(`${BASE_URL}/generate`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`
//       },
//       body: JSON.stringify({
//         lesson_outline: contentState.finalOutline,
//         structured_content: contentState.structuredContent,
//         lesson_topic: formState.lessonTopic,
//         district: formState.district,
//         grade_level: formState.gradeLevel,
//         subject_focus: formState.subjectFocus,
//         custom_prompt: formState.customPrompt,
//         num_slides: Number(formState.numSlides)
//       }),
//     });

//     if (!response.ok) throw new Error("Failed to generate presentation");

//     const blob = await response.blob();
//     const url = window.URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.href = url;
//     link.setAttribute("download", `${formState.lessonTopic || "lesson"}_presentation.pptx`);
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     window.URL.revokeObjectURL(url);
//   } catch (err) {
//     setUiState(prev => ({
//       ...prev,
//       error: err.message || "Error generating presentation"
//     }));
//   } finally {
//     setUiState(prev => ({ ...prev, isLoading: false }));
//   }
// }, [formState, token, contentState.finalOutline, contentState.structuredContent]);

// Effects
useEffect(() => {
  if (!isAuthenticated) {
    setShowSignInPrompt(true);
  }
}, [isAuthenticated]);

useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [contentState.outlineToConfirm]);

// Add the new effect here
useEffect(() => {
  if (user?.email) {
    setSubscriptionState(prev => ({
      ...prev,
      downloadCount: parseInt(localStorage.getItem(`downloadCount_${user.email}`) || '0')
    }));
  }
}, [user?.email]);
return (
  <>
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar Section */}
      <Box className="sidebar">
        <Box sx={{ mb: 4 }}>
          <img 
            src={Logo} 
            alt="Teacherfy Logo" 
            style={{ 
              width: '200px',
              height: 'auto',
              marginBottom: '24px'
            }} 
          />
        </Box>

        {isAuthenticated ? (
          <Box sx={{ 
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                color: '#374151',
                textAlign: 'center',
                fontSize: '0.875rem'
              }}
            >
              Signed in as {user?.name}
            </Typography>
            <Button 
              variant="outlined"
              color="inherit" 
              onClick={handleLogout}
              startIcon={<ClearIcon />}
              sx={{
                borderColor: '#d1d5db',
                color: '#374151',
                width: '100%',
                '&:hover': {
                  borderColor: '#9ca3af',
                  backgroundColor: '#f9fafb'
                }
              }}
            >
              Logout
            </Button>
          </Box>
        ) : (
          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <GoogleLogin 
              onSuccess={handleLoginSuccess} 
              onError={() => alert("Login Failed")} 
              width="100%"
            />
          </GoogleOAuthProvider>
        )}
      </Box>

      {/* Main Content Section */}
      <Box className="main-content">
        <Box className="content-container">
          {/* Top Action Buttons - Centered */}
          <Box className="action-buttons">
              <Button 
                  variant="text"
                  onClick={loadExample}
                  disabled={uiState.outlineModalOpen}
                  className="action-button"
                  startIcon={<PlayArrowIcon />}
                  sx={{ color: '#2563eb' }}
              >
                  Load Example
              </Button>
              <Button 
                  variant="text"
                  onClick={clearAll} 
                  disabled={uiState.outlineModalOpen}
                  className="action-button"
                  startIcon={<ClearIcon />}
                  sx={{ color: '#dc2626' }}
              >
                  Clear All
              </Button>
          </Box>
          {/* Form and Content */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <FormSection 
              formState={formState}
              uiState={uiState}
              setUiState={setUiState}
              onFormChange={handleFormChange}
              onGenerateOutline={handleGenerateOutline}
            />
            <UpgradeModal 
              open={subscriptionState.showUpgradeModal}
              onClose={() => setSubscriptionState(prev => ({ ...prev, showUpgradeModal: false }))}
            />
            {/* Outline Display and Presentation Buttons */}
            {uiState.outlineConfirmed && (
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3,
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              >
                <Box sx={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  mb: 2 
                }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: "600",
                    color: '#111827'
                  }}>
                    Lesson Outline
                  </Typography>
                </Box>

                <Box sx={{
                  maxHeight: 500,
                  overflowY: "auto",
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  p: 3,
                  mb: 3,
                  backgroundColor: "#f9fafb"
                }}>
                  {contentState.structuredContent.map((slide, index) => (
                    <Box key={index} sx={{ mb: index < contentState.structuredContent.length - 1 ? 4 : 0 }}>
                      <Typography variant="h6" sx={{ 
                        fontWeight: '600', 
                        mb: 2,
                        color: '#111827'
                      }}>
                        Slide {index + 1}: {slide.title}
                      </Typography>

                      <Typography variant="subtitle1" sx={{ 
                        fontWeight: '600', 
                        mt: 2,
                        color: '#374151'
                      }}>
                        Content:
                      </Typography>
                      {slide.content.map((item, i) => (
                        <Typography key={i} sx={{ 
                          pl: 2, 
                          mb: 0.5,
                          color: '#4b5563'
                        }}>
                          • {item}
                        </Typography>
                      ))}

                      <Typography variant="subtitle1" sx={{ 
                        fontWeight: '600', 
                        mt: 2,
                        color: '#374151'
                      }}>
                        Teacher Notes:
                      </Typography>
                      {slide.teacher_notes.map((note, i) => (
                        <Typography key={i} sx={{ 
                          pl: 2, 
                          mb: 0.5,
                          color: '#4b5563'
                        }}>
                          • {note}
                        </Typography>
                      ))}

                      <Typography variant="subtitle1" sx={{ 
                        fontWeight: '600', 
                        mt: 2,
                        color: '#374151'
                      }}>
                        Visual Elements:
                      </Typography>
                      {slide.visual_elements.length > 0 ? (
                        slide.visual_elements.map((element, i) => (
                          <Typography key={i} sx={{ 
                            pl: 2, 
                            mb: 0.5,
                            color: '#4b5563'
                          }}>
                            • {element}
                          </Typography>
                        ))
                      ) : (
                        <Typography sx={{ 
                          pl: 2, 
                          mb: 0.5,
                          color: '#6b7280'
                        }}>
                          • (None provided)
                        </Typography>
                      )}

                      {index < contentState.structuredContent.length - 1 && (
                        <Box sx={{ 
                          my: 3, 
                          borderBottom: '1px solid #e5e7eb' 
                        }} />
                      )}
                    </Box>
                  ))}
                </Box>

                {/* Presentation Generation Buttons */}
              <Button
                variant="contained"
                onClick={generatePresentation}
                disabled={uiState.isLoading || (!subscriptionState.isPremium && subscriptionState.downloadCount >= 5)}
                startIcon={<DownloadIcon />}
                sx={{
                  backgroundColor: "#2563eb",
                  '&:hover': {
                    backgroundColor: "#1d4ed8"
                  },
                  '&:disabled': {
                    backgroundColor: "#9ca3af"
                  }
                }}
              >
                {uiState.isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  <>
                    Open in PowerPoint
                    {!subscriptionState.isPremium && (
                      <Typography 
                        variant="caption" 
                        sx={{ ml: 1, opacity: 0.8 }}
                      >
                        ({5 - subscriptionState.downloadCount} remaining)
                      </Typography>
                    )}
                  </>
                )}
              </Button>
              </Paper>
            )}

            <ConfirmationModal 
              uiState={uiState}
              contentState={contentState}
              subscriptionState={subscriptionState}
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
    </Box>

    {/* Sign In Prompt Modal */}
    <SignInPrompt 
      open={showSignInPrompt && !isAuthenticated}
      onClose={() => setShowSignInPrompt(false)}
      onSuccess={handleLoginSuccess}
    />
  </>
);
};

export default Chat;