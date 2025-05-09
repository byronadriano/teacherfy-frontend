import React, { useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography, CircularProgress } from '@mui/material';
import { Trash2 } from 'lucide-react';
import { historyService } from '../../services';

const ClearHistoryButton = ({ onHistoryCleared }) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleClearHistory = async () => {
    setIsClearing(true);
    try {
      await historyService.clearHistory();
      setIsConfirmOpen(false);
      if (onHistoryCleared) {
        onHistoryCleared();
      }
    } catch (error) {
      console.error('Error clearing history:', error);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, mb: 2 }}>
        <Button
          variant="outlined"
          color="error"
          startIcon={<Trash2 size={16} />}
          onClick={() => setIsConfirmOpen(true)}
          size="small"
          sx={{
            fontSize: '0.75rem',
            textTransform: 'none',
            borderColor: '#f87171',
            color: '#ef4444',
            '&:hover': {
              borderColor: '#ef4444',
              bgcolor: 'rgba(239, 68, 68, 0.04)'
            }
          }}
        >
          Clear History
        </Button>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog
        open={isConfirmOpen}
        onClose={() => !isClearing && setIsConfirmOpen(false)}
      >
        <DialogTitle>Clear History?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to clear your history? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setIsConfirmOpen(false)} 
            disabled={isClearing}
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleClearHistory} 
            color="error" 
            disabled={isClearing}
            variant="contained"
            startIcon={isClearing ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {isClearing ? 'Clearing...' : 'Clear History'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ClearHistoryButton;