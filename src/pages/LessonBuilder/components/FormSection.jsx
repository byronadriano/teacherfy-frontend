// src/pages/LessonBuilder/components/FormSection.jsx
import React, { memo } from 'react';
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
  Collapse,
  IconButton,
  Paper,
  Tooltip
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { FORM } from '../../../utils/constants';

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
        fontWeight: "200",
        fontSize: '2rem',
        color: '#111827',
        textAlign: 'center', // Center the text
        width: '100%' // Ensure the text takes the full width
      }}>
        What do you want to teach?
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
            {FORM.LANGUAGES.map((language) => (
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
            {FORM.GRADES.map((grade) => (
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
            {FORM.SUBJECTS.map((subject) => (
              <MenuItem key={subject} value={subject}>{subject}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {formState.subjectFocus === 'Other (specify)' && (
          <TextField
            label="Custom Subject *"
            value={formState.customSubject || ''}
            onChange={(e) => {
              // Allow only letters, spaces, hyphens, apostrophes, and common academic abbreviations
              const sanitizedValue = e.target.value
                .replace(/[^a-zA-Z\s\-'&().]/g, '') // Remove special chars except basic punctuation
                .slice(0, 50); // Limit to 50 characters
              onFormChange('customSubject', sanitizedValue);
            }}
            placeholder="e.g. AP Biology, Creative Writing, STEAM"
            fullWidth
            sx={{ mb: 2 }}
            disabled={uiState.outlineModalOpen}
            slotProps={{ htmlInput: { maxLength: 50 } }}
            helperText={`${(formState.customSubject || '').length}/50 characters. Only letters, spaces, and basic punctuation allowed.`}
            error={formState.customSubject && !/^[a-zA-Z\s\-'&().]+$/.test(formState.customSubject)}
          />
        )}

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
              slotProps={{ 
                htmlInput: {
                  min: 1, 
                  max: 10,
                  style: { 
                    height: '24px',
                    padding: '12px',
                    backgroundColor: '#ffffff'
                  }
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

export default FormSection;