// components/filters/FilterDropdown.jsx
import React, { useState } from 'react';
import { Dialog, DialogContent, List, ListItem, ListItemButton, ListItemText, Checkbox, FormGroup, FormControlLabel } from '@mui/material';

const ResourceTypeOptions = ({ selectedType, onOptionChange }) => {
  switch (selectedType) {
    case 'Presentation':
      return (
        <FormGroup>
          <FormControlLabel 
            control={<Checkbox />} 
            label="Number of slides" 
            onChange={(e) => onOptionChange('showSlides', e.target.checked)} 
          />
          <FormControlLabel 
            control={<Checkbox />} 
            label="Include images" 
            onChange={(e) => onOptionChange('includeImages', e.target.checked)} 
          />
          {/* Show slides selector if showSlides is checked */}
          {/* Add slide number selector component here */}
        </FormGroup>
      );
    case 'Worksheet':
      return (
        <FormGroup>
          <FormControlLabel 
            control={<Checkbox />} 
            label="Include answer key" 
          />
          <FormControlLabel 
            control={<Checkbox />} 
            label="Include rubric" 
          />
        </FormGroup>
      );
    // Add other resource type options
    default:
      return null;
  }
};

const FilterDropdown = ({ 
  open, 
  onClose, 
  title, 
  options = [], 
  selectedValue,
  onSelect,
  type 
}) => {
  const [selectedType, setSelectedType] = useState(selectedValue);
  const [showOptions, setShowOptions] = useState(false);

  const handleSelect = (option) => {
    setSelectedType(option);
    if (type === 'resourceType') {
      setShowOptions(true);
    } else {
      onSelect(option);
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: {
          width: '100%',
          maxWidth: '400px',
          bgcolor: '#f5f5f5',
          borderRadius: '6px',
          fontFamily: 'Helvetica'
        }
      }}
    >
      <DialogContent>
        <List>
          {options.map((option) => (
            <ListItem key={option} disablePadding>
              <ListItemButton 
                onClick={() => handleSelect(option)}
                selected={option === selectedValue}
              >
                <ListItemText primary={option} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {type === 'resourceType' && showOptions && (
          <ResourceTypeOptions 
            selectedType={selectedType}
            onOptionChange={(option, value) => {
              // Handle resource-specific options
              console.log(option, value);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FilterDropdown;