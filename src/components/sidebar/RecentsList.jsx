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
  // First type determines primary icon
  const primaryType = types[0];
  const resourceType = RESOURCE_TYPES[primaryType] || { icon: FileText, color: '#4b5563' };
  const Icon = resourceType.icon;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 2,
        p: 2,
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: '#f3f4f6'
        }
      }}
    >
      <Icon size={18} color={resourceType.color} />
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ 
          fontSize: '0.875rem',
          color: '#374151',
          fontWeight: '500',
          mb: 1
        }}>
          {title}
        </Typography>
        <Box sx={{ 
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          mb: 1
        }}>
          {types.map((type, index) => (
            <Chip
              key={index}
              label={RESOURCE_TYPES[type].label}
              size="small"
              sx={{
                backgroundColor: `${RESOURCE_TYPES[type].color}15`,
                color: RESOURCE_TYPES[type].color,
                fontWeight: '500',
                fontSize: '0.75rem'
              }}
            />
          ))}
        </Box>
        <Typography sx={{ 
          fontSize: '0.75rem',
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
    <Box sx={{ mt: 4, px: 2 }}>
      <Typography 
        variant="h6" 
        sx={{ 
          mb: 2,
          px: 2,
          color: '#4b5563',
          fontSize: '1rem',
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