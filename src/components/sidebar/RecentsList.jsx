import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { FileText, Presentation, BookOpen, FileQuestion, FileSpreadsheet, Files } from 'lucide-react';

const RESOURCE_TYPES = {
  PRESENTATION: {
    icon: Presentation,
    color: '#2563eb',
    label: 'Presentation'
  },
  QUIZ: {
    icon: FileQuestion,
    color: '#dc2626',
    label: 'Quiz'
  },
  LESSON_PLAN: {
    icon: BookOpen,
    color: '#059669',
    label: 'Lesson Plan'
  },
  WORKSHEET: {
    icon: FileSpreadsheet,
    color: '#7c3aed',
    label: 'Worksheet'
  },
  ALL_OPTIONS: {
    icon: Files,
    color: '#d97706',
    label: 'All Options'
  }
};

const RecentItem = ({ title, types, date }) => {
  const primaryType = types[0];
  const resourceType = RESOURCE_TYPES[primaryType] || { icon: FileText, color: '#4b5563' };
  const Icon = resourceType.icon;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,  // Reduced gap
        p: 1.5,    // Reduced padding
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: '#f3f4f6'
        }
      }}
    >
      <Icon size={16} color={resourceType.color} />
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ 
          fontSize: '0.75rem',  // Reduced font size
          color: '#374151',
          fontWeight: '500',
          mb: 0.5  // Reduced margin
        }}>
          {title}
        </Typography>
        <Box sx={{ 
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0.5,  // Reduced gap
          mb: 0.5   // Reduced margin
        }}>
          {types.map((type, index) => (
            <Chip
              key={index}
              label={RESOURCE_TYPES[type].label}
              size="small"
              sx={{
                height: '20px',  // Smaller chip height
                fontSize: '0.625rem',  // Smaller font size
                backgroundColor: `${RESOURCE_TYPES[type].color}15`,
                color: RESOURCE_TYPES[type].color,
                fontWeight: '500'
              }}
            />
          ))}
        </Box>
        <Typography sx={{ 
          fontSize: '0.625rem',  // Reduced font size
          color: '#6b7280'
        }}>
          {date}
        </Typography>
      </Box>
    </Box>
  );
};

const RecentsList = () => {
  const recentItems = [
    { 
      title: 'Equivalent Fractions',
      types: ['PRESENTATION', 'WORKSHEET'],
      date: 'Today'
    },
    { 
      title: 'Adding Mixed Fractions',
      types: ['QUIZ', 'WORKSHEET', 'LESSON_PLAN'],
      date: 'Yesterday'
    },
    { 
      title: 'Fractions Introduction',
      types: ['LESSON_PLAN'],
      date: '2 days ago'
    }
  ];

  return (
    <Box sx={{ mt: 2, px: 1 }}>  {/* Reduced top margin and side padding */}
      <Typography 
        variant="h6" 
        sx={{ 
          mb: 1,  // Reduced margin
          px: 1.5,  // Reduced padding
          color: '#4b5563',
          fontSize: '0.875rem',  // Slightly smaller font
          fontWeight: '600'
        }}
      >
        Recent Resources
      </Typography>
      {recentItems.map((item, index) => (
        <RecentItem key={index} {...item} />
      ))}
    </Box>
  );
};

export default RecentsList;