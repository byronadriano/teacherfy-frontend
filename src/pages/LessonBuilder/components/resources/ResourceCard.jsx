import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Chip,
  CircularProgress
} from '@mui/material';
import { 
  Presentation, 
  BookOpen, 
  FileText, 
  FileQuestion, 
  Download, 
  CheckCircle, 
  AlertCircle
} from 'lucide-react';

const ResourceCard = ({ 
  resourceType, 
  status = 'pending', // 'pending', 'generating', 'success', 'error'
  message = '',
  onGenerate,
  isDisabled = false
}) => {
  // Determine icon based on resource type
  const getIcon = () => {
    switch(resourceType) {
      case 'Presentation':
        return <Presentation size={24} />;
      case 'Lesson Plan':
        return <BookOpen size={24} />;
      case 'Quiz/Test':
        return <FileQuestion size={24} />;
      case 'Worksheet':
        return <FileText size={24} />;
      default:
        return <FileText size={24} />;
    }
  };

  const handleDownload = () => {
    if (status === 'success' && onGenerate) {
      onGenerate(resourceType);
    }
  };
  
  // Determine status chip color and icon
  const getStatusChip = () => {
    switch(status) {
      case 'success':
        return (
          <Chip 
            icon={<CheckCircle size={14} />} 
            label="Generated" 
            size="small"
            sx={{ 
              bgcolor: '#dcfce7', 
              color: '#166534',
              '& .MuiChip-icon': {
                color: '#16a34a'
              }
            }}
          />
        );
      case 'error':
        return (
          <Chip 
            icon={<AlertCircle size={14} />} 
            label="Failed" 
            size="small"
            sx={{ 
              bgcolor: '#fee2e2', 
              color: '#b91c1c',
              '& .MuiChip-icon': {
                color: '#dc2626'
              }
            }}
          />
        );
      case 'generating':
        return (
          <Chip 
            icon={<CircularProgress size={12} />} 
            label="Generating..." 
            size="small"
            sx={{ 
              bgcolor: '#e0f2fe', 
              color: '#0369a1',
            }}
          />
        );
      default:
        return (
          <Chip 
            label="Pending" 
            size="small"
            sx={{ 
              bgcolor: '#f1f5f9', 
              color: '#64748b' 
            }}
          />
        );
    }
  };
  
  // Get appropriate file extension based on resource type
  const getFileExtension = () => {
    switch(resourceType) {
      case 'Presentation':
        return '.pptx';
      case 'Lesson Plan':
      case 'Worksheet':
      case 'Quiz/Test':
        return '.docx';
      default:
        return '.docx';
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        gap: 2,
        mb: 2,
        bgcolor: status === 'success' ? '#f0fdf4' : '#ffffff',
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
        '&:after': status === 'success' ? {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '4px',
          height: '100%',
          backgroundColor: '#22c55e'
        } : {}
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ 
          p: 1.5, 
          borderRadius: '8px',
          bgcolor: '#f8fafc', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#3b82f6'
        }}>
          {getIcon()}
        </Box>
        <Box>
          <Typography sx={{ 
            fontSize: '1rem',
            fontWeight: 600,
            color: '#1e293b',
            mb: 0.5
          }}>
            {resourceType}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getStatusChip()}
            {status === 'error' && message && (
              <Typography sx={{ fontSize: '0.75rem', color: '#ef4444' }}>
                {message.length > 35 ? message.substring(0, 35) + '...' : message}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
      
      <Button
        variant={status === 'success' ? 'outlined' : 'contained'}
        startIcon={status === 'generating' ? <CircularProgress size={16} /> : <Download size={16} />}
        disabled={isDisabled || status === 'generating'} 
        onClick={handleDownload}
        sx={{
          textTransform: 'none',
          borderRadius: '6px',
          px: 2,
          fontSize: '0.875rem'
        }}
      >
        {status === 'success' 
          ? `Download ${getFileExtension()}` 
          : status === 'generating'
            ? 'Generating...'
            : status === 'error'
              ? 'Retry' 
              : 'Generate'}
      </Button>
    </Paper>
  );
};

export default ResourceCard;