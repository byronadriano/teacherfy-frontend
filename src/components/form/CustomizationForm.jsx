import React from 'react';
import { Box, TextField, Switch, IconButton, Paper } from '@mui/material';
import { ArrowRight, Sparkles } from 'lucide-react';

const CustomizationForm = ({ 
  value,
  onChange,
  isExample,
  setIsExample,
  onSubmit,
  isLoading 
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        maxWidth: '100%',
        mx: 'auto',
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: 0 }}>
        <TextField
          fullWidth
          multiline
          minRows={3}
          maxRows={6}
          value={value}
          onChange={onChange}
          placeholder="Provide important details to customize your creation..."
          disabled={isLoading}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#FFFFFF',
              fontSize: '1rem',
              lineHeight: '1.5',
              padding: '16px 20px',
              border: 'none',
              '& fieldset': { border: 'none' },
              '&:hover fieldset': { border: 'none' },
              '&.Mui-focused fieldset': { border: 'none' }
            },
            '& .MuiOutlinedInput-input': {
              '&::placeholder': {
                color: '#94A3B8',
                opacity: 1
              }
            }
          }}
        />
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 2.5,
          py: 1.5,
          backgroundColor: '#FFFFFF',
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: 1
        }}>
          <Sparkles size={16} style={{ color: '#2563eb' }} />
          <span style={{ 
            color: '#1E293B',
            fontSize: '0.875rem',
            fontWeight: 500
          }}>
            Try Example
          </span>
          <Switch
            checked={isExample}
            onChange={(e) => setIsExample(e.target.checked)}
            size="small"
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: '#166534'
              },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: '#22C55E'
              }
            }}
          />
        </Box>

        <IconButton
          onClick={onSubmit}
          disabled={isLoading}
          sx={{
            backgroundColor: '#1A2B3B',
            borderRadius: '8px',
            width: 36,
            height: 36,
            color: 'white',
            '&:hover': {
              backgroundColor: '#0F1924'
            },
            '&.Mui-disabled': {
              backgroundColor: '#94A3B8',
              color: 'white'
            }
          }}
        >
          <ArrowRight size={20} />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default CustomizationForm;