import React from 'react';
import { Box, TextField, Switch, Paper, Button } from '@mui/material';
import { Rocket, Sparkles } from 'lucide-react';
// import { styled } from '@mui/system';

// const CreateButton = styled(Button)(({ theme }) => ({
//   backgroundColor: '#035073',
//   color: '#FFFFFF',
//   borderRadius: '8px',
//   textTransform: 'none',       // no ALL CAPS
//   fontWeight: 500,
//   padding: '6px 16px',
//   transition: 'transform 0.15s ease-in-out',
//   '&:hover': {
//     backgroundColor: 'rgb(45, 147, 249)',
//     transform: 'translateY(-2px)',
//     boxShadow: '0 4px 12px rgba(69, 162, 244, 0.1)',
//   },
//   '&.Mui-disabled': {
//     backgroundColor: '#94A3B8',
//     color: '#FFFFFF',
//     boxShadow: 'none',
//     transform: 'none',
//   },
// }));

const CustomizationForm = ({ 
  value,
  onChange,
  isExample,
  setIsExample,
  onSubmit,
  isLoading 
}) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    
    try {
      console.log('Form submitted with value:', value);
      await onSubmit();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
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

        <Button 
          type="submit"
          disabled={isLoading}
          variant="contained"
          endIcon={<Rocket size={20} />}
          sx={{
            backgroundColor: '#035073',
            color: '#FFFFFF',
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 500,
            padding: '6px 16px',
            transition: 'all 0.15s ease-in-out',
            '&:hover': {
              backgroundColor: 'rgb(45, 147, 249)',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(69, 162, 244, 0.1)'
            },
            '&.Mui-disabled': {
              backgroundColor: '#94A3B8',
              color: '#FFFFFF',
              boxShadow: 'none',
              transform: 'none'
            }
          }}
        >
          {isLoading ? 'Creating...' : 'Create'}
        </Button>
      </Box>
    </Paper>
  );
};

export default CustomizationForm;

