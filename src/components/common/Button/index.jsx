// src/components/common/Button/index.jsx - CLEANED VERSION
import React from 'react';
import { Button as MuiButton } from '@mui/material';

const Button = ({ 
  children, 
  variant = 'contained',
  color = 'primary',
  isLoading = false,
  ...props 
}) => {
  return (
    <MuiButton
      variant={variant}
      color={color}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {children}
    </MuiButton>
  );
};

export default Button;