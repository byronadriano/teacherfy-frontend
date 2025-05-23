// src/components/common/IntegratedFooter.jsx
// This replaces your separate website footer and integrates into main content
import React from 'react';
import { Box, Typography, Link } from '@mui/material';

const IntegratedFooter = ({ className = '', sx = {} }) => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Terms of Service', href: '/terms-of-service' }
  ];

  return (
    <Box
      className={className}
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'center', sm: 'flex-start' },
        justifyContent: 'space-between',
        gap: 2,
        py: 3,
        px: 2,
        mt: 4,
        // borderTop: '1px solid #e2e8f0',
        backgroundColor: 'transparent',
        ...sx
      }}
    >
      {/* Copyright */}
      <Typography
        sx={{
          fontSize: '0.875rem',
          color: '#64748b',
          order: { xs: 2, sm: 1 }
        }}
      >
        © {currentYear} Teacherfy AI
      </Typography>

      {/* Links */}
      <Box
        sx={{
          display: 'flex',
          gap: 3,
          order: { xs: 1, sm: 2 }
        }}
      >
        {footerLinks.map((link, index) => (
          <Link
            key={link.label}
            href={link.href}
            sx={{
              fontSize: '0.875rem',
              color: '#64748b',
              textDecoration: 'none',
              transition: 'color 0.2s ease',
              '&:hover': {
                color: '#374151',
                textDecoration: 'underline'
              }
            }}
          >
            {link.label}
          </Link>
        ))}
      </Box>
    </Box>
  );
};

export default IntegratedFooter;