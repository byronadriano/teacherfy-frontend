// src/components/background/BackgroundJobsPanel.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  IconButton,
  LinearProgress,
  Collapse,
  Alert,
  Fab,
  Badge
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Work as WorkIcon,
  Download as DownloadIcon,
  Error as ErrorIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { backgroundProcessor } from '../../services/backgroundProcessor';

const BackgroundJobsPanel = ({ 
  jobs = [], 
  onJobCancel,
  className = '',
  minimized = false,
  onToggleMinimize 
}) => {
  const [expanded, setExpanded] = useState(!minimized);
  const [activeJobs, setActiveJobs] = useState([]);

  // Update active jobs periodically
  useEffect(() => {
    const updateJobs = () => {
      const currentJobs = backgroundProcessor.getActiveJobs();
      setActiveJobs(currentJobs);
    };

    updateJobs();
    const interval = setInterval(updateJobs, 3000);
    return () => clearInterval(interval);
  }, []);

  const allJobs = [...jobs, ...activeJobs];
  const activeJobsCount = allJobs.filter(job => 
    job.status === 'queued' || job.status === 'processing'
  ).length;

  if (allJobs.length === 0) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'cancelled': return 'warning';
      case 'processing': return 'primary';
      case 'queued': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckIcon fontSize="small" />;
      case 'failed': return <ErrorIcon fontSize="small" />;
      case 'processing': return <WorkIcon fontSize="small" />;
      default: return null;
    }
  };

  const formatElapsedTime = (startTime) => {
    if (!startTime) return '';
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  if (minimized) {
    return (
      <Fab
        size="medium"
        color="primary"
        className={className}
        onClick={onToggleMinimize}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000
        }}
      >
        <Badge badgeContent={activeJobsCount} color="error">
          <WorkIcon />
        </Badge>
      </Fab>
    );
  }

  return (
    <Paper
      elevation={3}
      className={className}
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        width: 400,
        maxHeight: 500,
        zIndex: 1000,
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          bgcolor: 'primary.main',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer'
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WorkIcon />
          <Typography variant="subtitle1" fontWeight="medium">
            Background Jobs ({allJobs.length})
          </Typography>
          {activeJobsCount > 0 && (
            <Chip
              label={`${activeJobsCount} active`}
              size="small"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontSize: '0.75rem'
              }}
            />
          )}
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton size="small" onClick={onToggleMinimize} sx={{ color: 'white' }}>
            <CancelIcon />
          </IconButton>
          <IconButton size="small" sx={{ color: 'white' }}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>

      {/* Content */}
      <Collapse in={expanded}>
        <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
          {allJobs.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No background jobs
              </Typography>
            </Box>
          ) : (
            allJobs.map((job) => (
              <Box
                key={job.id}
                sx={{
                  p: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:last-child': { borderBottom: 'none' }
                }}
              >
                {/* Job Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getStatusIcon(job.status)}
                    <Typography variant="body2" fontWeight="medium">
                      {job.resourceTypes?.join(', ') || 'Resource Generation'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={job.status}
                      size="small"
                      color={getStatusColor(job.status)}
                      variant="outlined"
                    />
                    {job.status === 'processing' && onJobCancel && (
                      <IconButton 
                        size="small" 
                        onClick={() => onJobCancel(job.id)}
                        color="error"
                      >
                        <CancelIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </Box>

                {/* Progress Bar */}
                {(job.status === 'processing' || job.status === 'queued') && (
                  <Box sx={{ mb: 1 }}>
                    <LinearProgress
                      variant={job.progress > 0 ? "determinate" : "indeterminate"}
                      value={job.progress || 0}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                    {job.progress > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        {Math.round(job.progress)}% complete
                      </Typography>
                    )}
                  </Box>
                )}

                {/* Job Details */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    {job.startTime && `Started ${formatElapsedTime(job.startTime)} ago`}
                  </Typography>
                  
                  {job.email && (
                    <Chip
                      icon={<EmailIcon />}
                      label="Email notification"
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  )}
                </Box>

                {/* Error Message */}
                {job.status === 'failed' && job.error && (
                  <Alert severity="error" sx={{ mt: 1, py: 0 }}>
                    <Typography variant="caption">
                      {job.error}
                    </Typography>
                  </Alert>
                )}

                {/* Download Link */}
                {job.status === 'completed' && job.downloadUrl && (
                  <Box sx={{ mt: 1 }}>
                    <IconButton
                      size="small"
                      color="primary"
                      href={job.downloadUrl}
                      download
                    >
                      <DownloadIcon />
                    </IconButton>
                    <Typography variant="caption" color="primary" sx={{ ml: 1 }}>
                      Download ready
                    </Typography>
                  </Box>
                )}
              </Box>
            ))
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default BackgroundJobsPanel;