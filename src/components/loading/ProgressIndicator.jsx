// src/components/loading/ProgressIndicator.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  CircularProgress,
  Paper,
  Button,
  Chip,
  IconButton,
  Collapse,
  Alert
} from '@mui/material';
import {
  Cancel as CancelIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Minimize as MinimizeIcon,
  Maximize as MaximizeIcon,
  Email as EmailIcon
} from '@mui/icons-material';

const ProgressIndicator = ({
  isLoading = false,
  progress = 0,
  stage = 'starting',
  estimatedTime = null,
  canCancel = false,
  canRunInBackground = false,
  onCancel,
  onRunInBackground,
  jobs = [],
  compact = false,
  className = '',
  accentColor = null
}) => {
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [minimized, setMinimized] = useState(false);

  // Stage configurations
  const stages = {
    starting: { label: 'Initializing...', color: '#2196f3' },
    analyzing: { label: 'Analyzing requirements', color: '#ff9800' },
    generating_outline: { label: 'Generating outline', color: '#ff9800' },
    creating_content: { label: 'Creating content', color: '#ff9800' },
    formatting_resources: { label: 'Formatting resources', color: '#ff9800' },
    finalizing: { label: 'Finalizing', color: '#4caf50' },
    completed: { label: 'Completed', color: '#4caf50' },
    failed: { label: 'Failed', color: '#f44336' }
  };

  const currentStage = stages[stage] || stages.starting;
  const borderColor = accentColor || currentStage.color;

  // Update elapsed time
  useEffect(() => {
    if (isLoading && !startTime) {
      setStartTime(Date.now());
    }

    if (!isLoading) {
      setStartTime(null);
      setElapsed(0);
      return;
    }

    const interval = setInterval(() => {
      if (startTime) {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoading, startTime]);

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  // Calculate remaining time
  const getRemainingTime = () => {
    if (!estimatedTime || elapsed >= estimatedTime) return null;
    return estimatedTime - elapsed;
  };

  if (!isLoading && jobs.length === 0) return null;

  if (compact) {
    return (
      <Box className={className} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size={20} />
        <Typography variant="body2" color="text.secondary">
          {currentStage.label}
        </Typography>
        {progress > 0 && (
          <Typography variant="body2" color="text.secondary">
            {Math.min(99, Math.round(progress))}%
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Paper 
      elevation={3} 
      className={className}
      sx={{ 
        p: 2, 
        mb: 2, 
        borderRadius: 2,
        border: `2px solid ${borderColor}`,
        position: 'relative'
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {stage === 'completed' ? (
            <CheckIcon sx={{ color: 'success.main' }} />
          ) : stage === 'failed' ? (
            <ErrorIcon sx={{ color: 'error.main' }} />
          ) : (
            <CircularProgress size={20} />
          )}
          <Typography variant="h6" sx={{ color: borderColor }}>
            {currentStage.label}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {canCancel && (
            <IconButton size="small" onClick={onCancel} color="error">
              <CancelIcon />
            </IconButton>
          )}
          <IconButton 
            size="small" 
            onClick={() => setMinimized(!minimized)}
          >
            {minimized ? <MaximizeIcon /> : <MinimizeIcon />}
          </IconButton>
        </Box>
      </Box>

      <Collapse in={!minimized}>
        {/* Progress Bar with playful accent */}
        {isLoading && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress 
              variant={progress > 0 ? "determinate" : "indeterminate"}
              value={Math.min(99, progress)}
              sx={{ 
                height: 8, 
                borderRadius: 4,
                backgroundColor: '#f5f5f5'
              }}
            />
            {progress > 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {Math.min(99, Math.round(progress))}% complete
              </Typography>
            )}
            {/* Fun educational accent - rocket/book emoji */}
            <Typography variant="caption" sx={{ color: borderColor }}>
              {stage === 'generating_outline' || stage === 'creating_content' ? '🚀 Launching ideas' : stage === 'formatting_resources' ? '📚 Organizing your lesson' : stage === 'finalizing' ? '✨ Polishing' : ''}
            </Typography>
          </Box>
        )}

        {/* Time Information */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Elapsed: {formatTime(elapsed)}
          </Typography>
          {getRemainingTime() && (
            <Typography variant="body2" color="text.secondary">
              ~{formatTime(getRemainingTime())} remaining
            </Typography>
          )}
        </Box>

        {/* Background Processing Option */}
    {canRunInBackground && isLoading && elapsed > 15 && (
          <Alert 
            severity="info" 
            sx={{ mb: 2 }}
            action={
              <Button 
                size="small" 
                startIcon={<EmailIcon />}
      onClick={onRunInBackground}
                sx={{ textTransform: 'none' }}
              >
                Continue in Background
              </Button>
            }
          >
            This is taking longer than expected. You can continue in the background and we'll email you when it's ready.
          </Alert>
        )}

        {/* Background Jobs Display */}
        {jobs.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Background Jobs ({jobs.length})
            </Typography>
            {jobs.map((job) => (
              <Box 
                key={job.id} 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  p: 1,
                  bgcolor: 'background.default',
                  borderRadius: 1,
                  mb: 1
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip 
                    label={job.status} 
                    size="small" 
                    color={job.status === 'completed' ? 'success' : 
                           job.status === 'failed' ? 'error' : 'primary'}
                  />
                  <Typography variant="body2">
                    {job.resourceTypes?.join(', ')} - {job.progress || 0}%
                  </Typography>
                </Box>
                
                {job.email && (
                  <Chip 
                    icon={<EmailIcon />} 
                    label="Email notification" 
                    size="small" 
                    variant="outlined"
                  />
                )}
              </Box>
            ))}
          </Box>
        )}

        {/* Stage Progress Steps */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {Object.entries(stages).slice(0, -2).map(([key, stageInfo], index) => {
            const isActive = key === stage;
            const isCompleted = Object.keys(stages).indexOf(key) < Object.keys(stages).indexOf(stage);
            
            return (
                <Chip
                key={key}
                label={stageInfo.label}
                size="small"
                variant={isActive ? "filled" : "outlined"}
                color={isCompleted ? "success" : isActive ? "primary" : "default"}
                sx={{ 
                  opacity: isCompleted || isActive ? 1 : 0.5,
                  fontSize: '0.75rem'
                }}
              />
            );
          })}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default ProgressIndicator;