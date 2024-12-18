import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Snackbar,
  Alert,
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ClearIcon from "@mui/icons-material/Clear";

import Logo from "../assets/Teacherfyoai.png";

const gradeOptions = [
  "Preschool", "Kindergarten", "1st grade", "2nd grade", "3rd grade", "4th grade",
  "5th grade", "6th grade", "7th grade", "8th grade", "9th grade", "10th grade",
  "11th grade", "12th grade",
];

const subjectOptions = [
  "Arts & music",
  "English language arts",
  "Holidays/seasonal",
  "Math",
  "Science",
  "Social studies",
  "Specialty",
  "World languages",
];

const Chat = () => {
  const [lessonTopic, setLessonTopic] = useState("");
  const [district, setDistrict] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [subjectFocus, setSubjectFocus] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [numSlides, setNumSlides] = useState(3);

  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [outlineToConfirm, setOutlineToConfirm] = useState("");
  const [finalOutline, setFinalOutline] = useState("");
  const [outlineModalOpen, setOutlineModalOpen] = useState(false);
  const [outlineConfirmed, setOutlineConfirmed] = useState(false);

  const messagesEndRef = useRef(null);
  const BASE_URL = "https://teacherfy-gma6hncme7cpghda.westus-01.azurewebsites.net";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleGenerateOutline = async () => {
    if (!gradeLevel || !subjectFocus) return;

    setIsLoading(true);
    try {
      const requestBody = {
        grade_level: gradeLevel,
        subject_focus: subjectFocus,
        custom_prompt: customPrompt,
        num_slides: Number(numSlides),
      };

      const { data } = await axios.post(`${BASE_URL}/outline`, requestBody);
      const botResponses = data.messages || [];

      setMessages((prev) => [
        ...prev,
        { role: "user", content: `Generate an outline for a ${gradeLevel} ${subjectFocus} lesson.` },
      ]);

      botResponses.forEach((botResponse) => {
        setMessages((prev) => [...prev, { role: "bot", content: botResponse }]);
      });

      if (botResponses.length > 0) {
        const lastBotMessage = botResponses[botResponses.length - 1];
        setOutlineToConfirm(lastBotMessage);
        setOutlineModalOpen(true);
      }
    } catch (error) {
      console.error("Error generating outline:", error);
      const errorMessage = error.response?.data?.error || "Sorry, there was an error generating the outline.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmOutline = () => {
    setFinalOutline(outlineToConfirm);
    setOutlineConfirmed(true);
    setOutlineModalOpen(false);
  };

  const handleCloseModal = () => setOutlineModalOpen(false);
  const handleSnackbarClose = () => setError("");

  const generatePresentation = async () => {
    try {
      const response = await fetch(`${BASE_URL}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lesson_topic: lessonTopic,
          district: district,
          grade_level: gradeLevel,
          subject_focus: subjectFocus,
          custom_prompt: customPrompt,
          num_slides: Number(numSlides),
          lesson_outline: finalOutline,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate the presentation. Please try again.");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${lessonTopic || "lesson"}_lesson.pptx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadExample = () => {
    setGradeLevel("4th grade");
    setSubjectFocus("Math");
    setLessonTopic("Equivalent Fractions");
    setDistrict("Denver Public Schools");
    setCustomPrompt(
      "Create a lesson plan that introduces and reinforces key vocabulary. Include at least three new terms with definitions and examples. Incorporate a variety of interactive checks for understanding—such as quick formative assessments, short activities, or exit tickets—to ensure students are grasping the concepts throughout the lesson. Finally, suggest opportunities for students to engage in collaborative or hands-on learning to deepen their understanding and retention"
    );
    setNumSlides(5);
  };

  const clearInputs = () => {
    setGradeLevel("");
    setSubjectFocus("");
    setLessonTopic("");
    setDistrict("");
    setCustomPrompt("");
    setNumSlides(3);
    setMessages([]);
    setOutlineConfirmed(false);
    setFinalOutline("");
  };

  const canGenerateOutline = gradeLevel && subjectFocus;

  return (
    <Box sx={{ backgroundColor: "#e5e2dd", minHeight: "100vh", px: { xs: 2, md: 4 }, py: 4 }}>
      {/* Logo */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
        <img src={Logo} alt="Teacherfy Logo" style={{ height: 200 }} />
      </Box>

      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button color="inherit" onClick={clearInputs} startIcon={<ClearIcon />}>
            Clear Inputs
          </Button>
          <Button color="inherit" onClick={loadExample}>
            Load Example
          </Button>
        </Box>
      </Box>

      {/* Form */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, backgroundColor: "#ffffff", p: 3, borderRadius: 2, mb: 4 }}>
        <FormControl variant="filled" sx={{ minWidth: 200 }}>
          <InputLabel>Grade Level *</InputLabel>
          <Select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}>
            {gradeOptions.map((g) => (
              <MenuItem key={g} value={g}>
                {g}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl variant="filled" sx={{ minWidth: 200 }}>
          <InputLabel>Subject *</InputLabel>
          <Select value={subjectFocus} onChange={(e) => setSubjectFocus(e.target.value)}>
            {subjectOptions.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          variant="filled"
          label="Lesson Topic"
          placeholder="e.g. Equivalent Fractions"
          value={lessonTopic}
          onChange={(e) => setLessonTopic(e.target.value)}
          fullWidth
        />

        <TextField
          variant="filled"
          label="District"
          placeholder="e.g. Denver Public Schools"
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          fullWidth
        />

        <TextField
          variant="filled"
          label="Additional Criteria / Prompt"
          placeholder="Add more detail..."
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          multiline
          rows={3}
          fullWidth
        />

        <TextField
          variant="filled"
          type="number"
          label="Number of Slides (1-10)"
          value={numSlides}
          onChange={(e) => setNumSlides(e.target.value)}
          inputProps={{ min: 1, max: 10 }}
          sx={{ maxWidth: 200 }}
        />

        <Button
          variant="contained"
          color="primary"
          onClick={handleGenerateOutline}
          disabled={!canGenerateOutline || isLoading || outlineConfirmed}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : "Generate Outline"}
        </Button>
      </Box>

      {/* Outline */}
      <Box sx={{ backgroundColor: "#ffffff", p: 3, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
          Final Outline
        </Typography>
        <Box
          sx={{
            maxHeight: 300,
            overflowY: "auto",
            border: "1px solid #aaa",
            padding: 2,
            marginBottom: 2,
            borderRadius: 1,
            backgroundColor: "#f4f2ef",
          }}
        >
          {outlineConfirmed ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{finalOutline}</ReactMarkdown>
          ) : (
            <>
              {messages.map((msg, i) => (
                <Typography key={i} sx={{ marginBottom: 1, whiteSpace: "pre-wrap", fontSize: "0.95rem" }}>
                  <strong>{msg.role}:</strong> {msg.content}
                </Typography>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </Box>

        <Button
          variant="contained"
          color="primary"
          onClick={generatePresentation}
          disabled={!outlineConfirmed}
        >
          Download Presentation
        </Button>
      </Box>

      {/* Modal */}
      <Dialog open={outlineModalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle>Confirm Outline</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Review the generated outline. Confirm to enable the "Generate Presentation" option.
          </DialogContentText>
          <Box sx={{ marginTop: 2 }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{outlineToConfirm}</ReactMarkdown>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleConfirmOutline} variant="contained" color="primary">
            Confirm Outline
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: "100%" }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Chat;
