// src/components/filters/StandardsSelector.jsx
import React, { useMemo } from 'react';
import { 
  Box,
  Checkbox,
  Typography,
  Alert,
  Tooltip
} from '@mui/material';
import { FORM } from '../../utils/constants/form';

const StandardsSection = ({ title, children }) => (
  <Box sx={{ mb: 2 }}>
    <Typography
      variant="h6"
      sx={{
        px: 3,
        py: 2,
        bgcolor: '#F8FAFC',
        color: '#1E293B',
        fontSize: '0.875rem',
        fontWeight: 600,
        borderBottom: '1px solid #E2E8F0'
      }}
    >
      {title}
    </Typography>
    {children}
  </Box>
);

const StandardItem = ({ standard, isSelected, onSelect, disabled }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'flex-start',
      px: 3,
      py: 1.5,
      borderBottom: '1px solid #F1F5F9',
      '&:hover': {
        bgcolor: '#F8FAFC'
      }
    }}
  >
    <Tooltip title={disabled && !isSelected ? "Maximum 3 standards allowed" : ""}>
      <Box>  {/* Wrapping Checkbox in Box because Tooltip needs non-disabled element */}
        <Checkbox
          checked={isSelected}
          disabled={disabled && !isSelected}
          onChange={() => onSelect(standard.code)}
          sx={{
            mt: 0.5,
            '&.Mui-checked': {
              color: '#2563EB'
            }
          }}
        />
      </Box>
    </Tooltip>
    <Box sx={{ ml: 1 }}>
      <Typography 
        sx={{ 
          fontSize: '0.875rem',
          fontWeight: 500,
          color: '#1E293B',
          mb: 0.5
        }}
      >
        {standard.code}
      </Typography>
      <Typography 
        sx={{ 
          fontSize: '0.8125rem',
          color: '#64748B',
          lineHeight: 1.4
        }}
      >
        {standard.description}
      </Typography>
    </Box>
  </Box>
);

const StandardsSelector = ({ 
  gradeLevel, 
  subjectFocus,
  selectedStandards = [],
  onStandardsChange 
}) => {
  const { domains, hasStandards } = useMemo(() => {
    if (!gradeLevel || !subjectFocus) {
      return { domains: [], hasStandards: false };
    }
    
    const gradeKey = gradeLevel === "Kindergarten" ? "Kindergarten" : 
                     gradeLevel.match(/(\d+)/)?.[0] ? `Grade${gradeLevel.match(/(\d+)/)[0]}` : null;
    
    if (!gradeKey) return { domains: [], hasStandards: false };

    const standards = FORM.STANDARDS.COMMON_CORE_STANDARDS[gradeKey];
    if (!standards) return { domains: [], hasStandards: false };

    const category = subjectFocus === "English language arts" ? "ELA" :
                    subjectFocus === "Math" ? "Mathematics" : null;
    
    if (!category || !standards[category]) return { domains: [], hasStandards: false };

    const groupedStandards = Object.entries(standards[category]).map(([domain, items]) => ({
      name: domain,
      standards: items.map(item => ({
        code: item.code,
        description: item.description
      }))
    }));

    return { 
      domains: groupedStandards,
      hasStandards: groupedStandards.length > 0
    };
  }, [gradeLevel, subjectFocus]);

  const handleStandardSelect = (standardCode) => {
    const isCurrentlySelected = selectedStandards.includes(standardCode);
    
    if (isCurrentlySelected) {
      // Remove standard if it's already selected
      onStandardsChange(selectedStandards.filter(code => code !== standardCode));
    } else if (selectedStandards.length < 3) {
      // Add standard only if we haven't reached the limit
      onStandardsChange([...selectedStandards, standardCode]);
    }
  };

  if (!gradeLevel || !subjectFocus) {
    return (
      <Alert severity="info" sx={{ mx: 3, my: 2 }}>
        Please select a grade level and subject first
      </Alert>
    );
  }

  if (!hasStandards) {
    return (
      <Alert severity="info" sx={{ mx: 3, my: 2 }}>
        No standards available for the selected grade and subject
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ 
        px: 3, 
        py: 2, 
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography sx={{ 
          fontSize: '0.875rem',
          fontWeight: 500,
          color: '#1E293B'
        }}>
          Select up to 3 standards to focus on
        </Typography>
        <Typography sx={{ 
          fontSize: '0.75rem',
          color: '#64748B'
        }}>
          {selectedStandards.length}/3 selected
        </Typography>
      </Box>

      <Box sx={{ 
        maxHeight: '60vh',
        overflowY: 'auto',
        pb: 2
      }}>
        {domains.map((domain) => (
          <StandardsSection key={domain.name} title={domain.name}>
            {domain.standards.map((standard) => (
              <StandardItem
                key={standard.code}
                standard={standard}
                isSelected={selectedStandards.includes(standard.code)}
                onSelect={handleStandardSelect}
                disabled={selectedStandards.length >= 3}
              />
            ))}
          </StandardsSection>
        ))}
      </Box>
    </Box>
  );
};

export default StandardsSelector;