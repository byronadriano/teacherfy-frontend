import React, { useMemo, useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Slider,
  TextField,
  Collapse
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';

  const stageLabelMap = {
  starting: 'Initializing',
  analyzing: 'Analyzing requirements',
  generating_outline: 'Generating outline',
  creating_content: 'Creating content',
  formatting_resources: 'Formatting resources',
  finalizing: 'Finalizing',
  completed: 'Completed',
  failed: 'Failed'
};

export default function SleekProgress({
  isLoading,
  progress,
  stage,
  estimatedTime, // seconds total
  elapsed = 0,
  onRunInBackground,
  userEmail,
  setUserEmail,
  bgError,
  bgLoading,
  accentColor = '#0F766E',
  // queries removed; previously used for chips under the progress bar
}) {
  const [notifyOpen, setNotifyOpen] = useState(false);
  const isBackground = stage === 'background';

  const remaining = useMemo(() => {
    if (!estimatedTime && estimatedTime !== 0) return null;
    // keep at least 1s remaining to avoid showing 0s which can feel stuck
    const rem = Math.max(1, estimatedTime - elapsed);
    return rem;
  }, [estimatedTime, elapsed]);

  const formatRemaining = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    if (mins >= 1) return `${mins} minute${mins !== 1 ? 's' : ''} left`;
    return `${secs}s left`;
  };

  // Calculate progress based on elapsed time vs estimated time for better alignment
  const safeProgress = useMemo(() => {
    // If we don't have good time estimates, fall back to backend progress
    if (!estimatedTime || estimatedTime <= 0 || elapsed < 0) {
      return Math.min(99, Math.max(0, Math.round(progress || 0)));
    }
    
    // Calculate progress based on time elapsed vs estimated time
    const timeProgress = Math.min(elapsed / estimatedTime, 0.99); // Cap at 99%
    const timeBasedPercentage = Math.round(timeProgress * 100);
    
    // For multi-resource scenarios with good time estimates, prioritize time-based progress
    // This gives users a more intuitive experience where progress bar matches time remaining
    if (estimatedTime > 60) {
      // Multi-resource: Use time-based progress as it's more accurate
      console.log(`📊 Using time-based progress: ${timeBasedPercentage}% (${elapsed}s / ${estimatedTime}s)`);
      return timeBasedPercentage;
    } else {
      // Single resource: Use backend progress but ensure it doesn't exceed time-based progress
      const backendProgress = Math.min(99, Math.max(0, Math.round(progress || 0)));
      const finalProgress = Math.min(backendProgress, timeBasedPercentage);
      console.log(`📊 Using constrained backend progress: ${finalProgress}% (backend: ${backendProgress}%, time: ${timeBasedPercentage}%)`);
      return finalProgress;
    }
  }, [progress, estimatedTime, elapsed]);
  // If backend reports completed but we haven't emitted final completion yet, keep stage as Finalizing
  const stageKey = stage === 'completed' ? 'finalizing' : stage;
  const currentStage = stageLabelMap[stageKey] || 'Working';

  // Auto-close notify panel when we’ve handed off to background
  useEffect(() => {
    if (isBackground && notifyOpen) setNotifyOpen(false);
  }, [isBackground, notifyOpen]);

  // Keep visible when backgrounded so users don't think it stopped
  if (!isLoading && !isBackground) return null;

  return (
    <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, p: 2.5, bgcolor: '#fff' }}>
      {/* Header row with time left and actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" sx={{ color: '#0f172a', fontWeight: 500 }}>
          {isBackground ? (
            <>Running in background · <span style={{ color: '#64748b' }}>We’ll email you when it’s ready</span></>
          ) : remaining !== null ? (
            <>
              {formatRemaining(remaining)} · <span style={{ color: '#64748b' }}>{currentStage}</span>
            </>
          ) : (
            <>
              Working · <span style={{ color: '#64748b' }}>{currentStage}</span>
            </>
          )}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {/* TEMPORARILY DISABLED: Notify me functionality needs backend work */}
          {false && !isBackground && (
            <Button
              size="small"
              variant="outlined"
              onClick={() => setNotifyOpen((v) => !v)}
              startIcon={<EmailIcon />}
              sx={{ textTransform: 'none' }}
            >
              Notify me
            </Button>
          )}
        </Box>
      </Box>

      {/* Progress bar like slider */}
      <Box sx={{ px: 1, py: 0.5 }}>
        <Slider
          value={safeProgress}
          min={0}
          max={100}
          step={1}
          disabled
          sx={{
            color: accentColor,
            height: 6,
            '& .MuiSlider-rail': { opacity: 0.2 },
            '& .MuiSlider-thumb': { width: 14, height: 14 }
          }}
        />
      </Box>

      {/* Narrative status */}
      <Typography variant="body2" sx={{ color: '#334155', mt: 1 }}>
        {isBackground ? (
          <>Moved to background. We’ll email {userEmail || 'you'} when it’s ready.</>
        ) : (
          <>
            To craft your lesson, I’m {currentStage.toLowerCase()} and organizing materials for clarity and engagement.
            {safeProgress >= 95 && (
              <span style={{ color: '#64748b' }}> · Almost there…</span>
            )}
          </>
        )}
      </Typography>

      {/* Background notify entry (only when not yet backgrounded) - TEMPORARILY DISABLED */}
      {false && !isBackground && (
        <Collapse in={notifyOpen}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 2, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Email to notify when ready"
              value={userEmail || ''}
              onChange={(e) => setUserEmail?.(e.target.value)}
              sx={{ minWidth: 260 }}
              inputProps={{ autoComplete: 'email' }}
            />
            <Button
              size="small"
              variant="contained"
              disabled={bgLoading}
              onClick={() => onRunInBackground?.()}
              sx={{ textTransform: 'none' }}
            >
              {bgLoading ? 'Starting…' : 'Notify me'}
            </Button>
            {bgError && (
              <Typography variant="caption" sx={{ color: '#dc2626' }}>
                {bgError}
              </Typography>
            )}
          </Box>
        </Collapse>
      )}
    </Paper>
  );
}
