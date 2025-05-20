// src/pages/LessonBuilder/components/EditableContentSection.jsx
// Create a new file with this content

import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton
} from '@mui/material';
import { Edit, Save, Plus, Trash2 } from 'lucide-react';

const EditableContentSection = ({ 
  title, 
  items = [], 
  color = '#2563eb', 
  onUpdate,
  sectionIndex,
  sectionKey
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localItems, setLocalItems] = useState([...items]);
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleSave = () => {
    setIsEditing(false);
    if (onUpdate) {
      onUpdate(sectionIndex, sectionKey, localItems);
    }
  };
  
  const handleItemChange = (index, value) => {
    const newItems = [...localItems];
    newItems[index] = value;
    setLocalItems(newItems);
  };
  
  const handleAddItem = () => {
    setLocalItems([...localItems, '']);
  };
  
  const handleRemoveItem = (index) => {
    const newItems = [...localItems];
    newItems.splice(index, 1);
    setLocalItems(newItems);
  };
  
  if (!items || items.length === 0 && !isEditing) return null;
  
  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 1
      }}>
        <Typography
          sx={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: color,
          }}
        >
          {title}
        </Typography>
        
        <Button
          size="small"
          startIcon={isEditing ? <Save size={16} /> : <Edit size={16} />}
          onClick={isEditing ? handleSave : handleEdit}
          sx={{ 
            minWidth: 0, 
            p: 0.5,
            textTransform: 'none'
          }}
        >
          {isEditing ? 'Save' : 'Edit'}
        </Button>
      </Box>
      
      {isEditing ? (
        <Box sx={{ pl: 2 }}>
          {localItems.map((item, i) => (
            <Box key={i} sx={{ display: 'flex', mb: 1, gap: 1 }}>
              <TextField
                fullWidth
                value={item}
                onChange={(e) => handleItemChange(i, e.target.value)}
                variant="outlined"
                size="small"
              />
              <IconButton 
                onClick={() => handleRemoveItem(i)}
                size="small"
                sx={{ color: '#ef4444' }}
              >
                <Trash2 size={16} />
              </IconButton>
            </Box>
          ))}
          
          <Button
            startIcon={<Plus size={16} />}
            onClick={handleAddItem}
            size="small"
            sx={{ mt: 1, textTransform: 'none' }}
          >
            Add Item
          </Button>
        </Box>
      ) : (
        localItems.map((item, i) => (
          <Typography
            key={i}
            sx={{
              fontSize: '0.875rem',
              color: '#475569',
              pl: 2,
              mb: 0.75,
              position: 'relative',
              '&:before': {
                content: '"•"',
                position: 'absolute',
                left: '4px'
              }
            }}
          >
            {item}
          </Typography>
        ))
      )}
    </Box>
  );
};

export default EditableContentSection;