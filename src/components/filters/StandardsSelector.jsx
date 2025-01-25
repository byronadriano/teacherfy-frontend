import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Checkbox,
  IconButton,
  Button,
  Select,
  MenuItem,
  TextField,
  Chip,
  Alert
} from '@mui/material';
import { X, Search } from 'lucide-react';
import { FORM } from '../../utils/constants/form';

const StandardsModal = ({ 
  open, 
  onClose,
  selectedStandards = [],
  onStandardsChange,
  maxStandards = 3
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('Kindergarten');
  const [activeSubject, setActiveSubject] = useState('ELA');

  // Handle standard selection/deselection
  const handleStandardSelect = (standardCode) => {
    const isSelected = selectedStandards.includes(standardCode);
    
    if (isSelected) {
      onStandardsChange(selectedStandards.filter(code => code !== standardCode));
    } else if (selectedStandards.length < maxStandards) {
      onStandardsChange([...selectedStandards, standardCode]);
    }
  };

  // Get current grade's standards
  const getCurrentGradeStandards = () => {
    const standards = FORM.STANDARDS.COMMON_CORE_STANDARDS[selectedGrade]?.[activeSubject] || {};
    
    return Object.entries(standards).reduce((acc, [section, items]) => {
      // Filter based on search term if present
      const filteredItems = items.filter(item => 
        searchTerm === '' || 
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      if (filteredItems.length > 0) {
        acc[section] = filteredItems;
      }
      return acc;
    }, {});
  };

  const currentStandards = getCurrentGradeStandards();

  const handleConfirm = () => {
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { maxHeight: '90vh' }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: '1px solid #E2E8F0',
        p: 3
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" sx={{ mb: 0.5 }}>Standards</Typography>
            <Typography variant="body2" color="text.secondary">
              All standards are based on Common Core State Standards (CCSS)
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <X size={20} />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Search and Grade Selection */}
      <Box sx={{ 
        px: 3, 
        py: 2, 
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        gap: 2,
        alignItems: 'center'
      }}>
        <TextField
          placeholder="Search standards..."
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search size={18} style={{ marginRight: 8, color: '#64748B' }} />
          }}
          sx={{ flex: 1 }}
        />
        <Select
          size="small"
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(e.target.value)}
          sx={{ width: 160 }}
        >
          {Object.keys(FORM.STANDARDS.COMMON_CORE_STANDARDS).map((grade) => (
            <MenuItem key={grade} value={grade}>
              {grade.replace('Grade', 'Grade ')}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* Subject Toggle */}
      <Box sx={{ 
        px: 3, 
        py: 2, 
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        gap: 2
      }}>
        <Button
          variant={activeSubject === 'ELA' ? 'contained' : 'outlined'}
          onClick={() => setActiveSubject('ELA')}
          sx={{ flex: 1 }}
        >
          ELA Standards
        </Button>
        <Button
          variant={activeSubject === 'Mathematics' ? 'contained' : 'outlined'}
          onClick={() => setActiveSubject('Mathematics')}
          sx={{ flex: 1 }}
        >
          Math Standards
        </Button>
      </Box>

      <DialogContent sx={{ p: 0 }}>
        {/* Selected Standards Display */}
        {selectedStandards.length > 0 && (
          <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #E2E8F0' }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Selected standards ({selectedStandards.length}/{maxStandards})
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {selectedStandards.map((code) => (
                <Chip
                  key={code}
                  label={code}
                  onDelete={() => handleStandardSelect(code)}
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Standards List */}
        <Box sx={{ py: 2 }}>
          {Object.entries(currentStandards).map(([section, standards]) => (
            <Box key={section} sx={{ mb: 3 }}>
              <Typography
                sx={{
                  px: 3,
                  py: 2,
                  bgcolor: '#F8FAFC',
                  color: '#1E293B',
                  fontWeight: 600,
                  fontSize: '0.875rem'
                }}
              >
                {section}
              </Typography>
              {standards.map((standard) => (
                <Box
                  key={standard.code}
                  sx={{
                    px: 3,
                    py: 2,
                    display: 'flex',
                    alignItems: 'flex-start',
                    borderBottom: '1px solid #F1F5F9',
                    '&:hover': {
                      bgcolor: '#F8FAFC'
                    }
                  }}
                >
                  <Checkbox
                    checked={selectedStandards.includes(standard.code)}
                    onChange={() => handleStandardSelect(standard.code)}
                    disabled={
                      !selectedStandards.includes(standard.code) && 
                      selectedStandards.length >= maxStandards
                    }
                    sx={{
                      '&.Mui-checked': {
                        color: '#2563EB'
                      }
                    }}
                  />
                  <Box sx={{ ml: 2 }}>
                    <Typography sx={{ fontWeight: 500, mb: 0.5 }}>
                      {standard.code}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748B' }}>
                      {standard.description}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid #E2E8F0' }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={handleConfirm}
          variant="contained"
          disabled={selectedStandards.length === 0}
        >
          Apply Standards
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StandardsModal;