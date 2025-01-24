import React, { useState, useMemo } from 'react';
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
  Chip  // <-- Import Chip from MUI
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
  const [selectedGrade, setSelectedGrade] = useState('Grade2');
  const [localSelectedStandards, setLocalSelectedStandards] = useState(selectedStandards);
  const [activeSubject, setActiveSubject] = useState('ELA');

  React.useEffect(() => {
    if (open) {
      setLocalSelectedStandards(selectedStandards);
    }
  }, [open, selectedStandards]);

  const currentStandards = useMemo(() => {
    const gradeStandards = FORM.STANDARDS.COMMON_CORE_STANDARDS[selectedGrade];
    if (!gradeStandards) return { ELA: [], Mathematics: [] };

    return {
      ELA: Object.entries(gradeStandards.ELA || {}).reduce((acc, [domain, standards]) => {
        return [...acc, ...standards.map(s => ({ ...s, domain, grade: selectedGrade }))];
      }, []),
      Mathematics: Object.entries(gradeStandards.Mathematics || {}).reduce((acc, [domain, standards]) => {
        return [...acc, ...standards.map(s => ({ ...s, domain, grade: selectedGrade }))];
      }, [])
    };
  }, [selectedGrade]);

  const allStandards = useMemo(() => {
    // Combine ELA + Math into a single array for quick lookups by code
    return [...currentStandards.ELA, ...currentStandards.Mathematics];
  }, [currentStandards]);

  const filteredStandards = useMemo(() => {
    const filterBySearch = (standards) => {
      return standards.filter(standard => 
        standard.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        standard.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        standard.domain.toLowerCase().includes(searchTerm.toLowerCase())
      );
    };

    return {
      ELA: filterBySearch(currentStandards.ELA),
      Mathematics: filterBySearch(currentStandards.Mathematics)
    };
  }, [currentStandards, searchTerm]);

  const standardsByDomain = useMemo(() => {
    const standards = filteredStandards[activeSubject];
    return standards.reduce((acc, standard) => {
      if (!acc[standard.domain]) {
        acc[standard.domain] = [];
      }
      acc[standard.domain].push(standard);
      return acc;
    }, {});
  }, [filteredStandards, activeSubject]);

  const handleStandardToggle = (standard) => {
    setLocalSelectedStandards(prev => {
      const isSelected = prev.includes(standard.code);
      if (isSelected) {
        return prev.filter(code => code !== standard.code);
      } else if (prev.length < maxStandards) {
        return [...prev, standard.code];
      }
      return prev;
    });
  };

  const handleConfirm = () => {
    onStandardsChange(localSelectedStandards);
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
            <MenuItem key={grade} value={grade}>{grade.replace('Grade', 'Grade ')}</MenuItem>
          ))}
        </Select>
      </Box>

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
        {/* Add a row of chips showing the currently selected standards */}
        <Box sx={{ px: 3, pt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Selected standards ({localSelectedStandards.length}/{maxStandards})
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            {localSelectedStandards.map((code) => {
              const standard = allStandards.find(s => s.code === code);
              if (!standard) return null; // In case there's no matching standard
              return (
                <Chip
                  key={code}
                  label={code}
                  onDelete={() => handleStandardToggle(standard)}
                  variant="outlined"
                />
              );
            })}
          </Box>
        </Box>

        <Box sx={{ py: 2 }}>
          {Object.entries(standardsByDomain).map(([domain, standards]) => (
            <Box key={domain} sx={{ mb: 3 }}>
              <Typography
                sx={{
                  px: 3,
                  py: 1,
                  backgroundColor: '#F8FAFC',
                  color: '#1E293B',
                  fontWeight: 600,
                  fontSize: '0.875rem'
                }}
              >
                {domain}
              </Typography>
              {standards.map((standard) => (
                <Box
                  key={standard.code}
                  sx={{
                    px: 3,
                    py: 2,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 2,
                    borderBottom: '1px solid #F1F5F9',
                    '&:hover': {
                      backgroundColor: '#F8FAFC'
                    }
                  }}
                >
                  <Checkbox
                    checked={localSelectedStandards.includes(standard.code)}
                    onChange={() => handleStandardToggle(standard)}
                    disabled={
                      !localSelectedStandards.includes(standard.code) && 
                      localSelectedStandards.length >= maxStandards
                    }
                  />
                  <Box>
                    <Typography sx={{ fontWeight: 500, mb: 0.5 }}>
                      {standard.code}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
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
          disabled={localSelectedStandards.length === 0}
        >
          Apply Standards
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StandardsModal;
