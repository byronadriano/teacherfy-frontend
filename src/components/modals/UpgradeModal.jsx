// src/components/modals/UpgradeModal.jsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button
} from "@mui/material";

const UpgradeModal = ({ open = false, onClose }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>Upgrade to Premium</DialogTitle>
    <DialogContent>
      <Typography variant="body1" sx={{ mb: 2 }}>
        You've reached your monthly limit of 5 free presentations. Upgrade to Premium for:
      </Typography>
      <Box sx={{ pl: 2 }}>
        <Typography>• 50 presentations per month</Typography>
        <Typography>• Priority support</Typography>
        <Typography>• Advanced customization options</Typography>
      </Box>
      <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
        $20/month
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="inherit">Cancel</Button>
      <Button 
        variant="contained" 
        color="primary"
        onClick={() => {
          // Add your payment processing logic here
          window.location.href = 'your-stripe-checkout-url';
        }}
      >
        Upgrade Now
      </Button>
    </DialogActions>
  </Dialog>
);

export default UpgradeModal;