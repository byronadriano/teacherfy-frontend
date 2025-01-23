import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Link, 
  List, 
  ListItem, 
  ListItemText 
} from '@mui/material';
import Logo from '../assets/images/Teacherfyoai.png';

const PrivacyPolicy = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Logo Section */}
      <Box 
        component={RouterLink} 
        to="/" 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mb: 4,
          '&:hover': {
            opacity: 0.8
          }
        }}
      >
        <img 
          src={Logo} 
          alt="Teacherfy Logo" 
          style={{ 
            width: '150px', 
            height: 'auto',
            cursor: 'pointer'
          }} 
        />
      </Box>

      <Typography variant="h2" gutterBottom>
        Privacy Policy
      </Typography>

      <Typography variant="body1" paragraph>
        At Teacherfy AI, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information.
      </Typography>

      <Typography variant="h4" sx={{ mt: 3, mb: 2 }}>
        1. Information We Collect
      </Typography>
      <List>
        <ListItem>
          <ListItemText 
            primary="Personal Information" 
            secondary="Name, email address, Google account information" 
          />
        </ListItem>
        <ListItem>
          <ListItemText 
            primary="Usage Data" 
            secondary="IP address, browser type, pages visited, device information" 
          />
        </ListItem>
      </List>

      <Typography variant="h4" sx={{ mt: 3, mb: 2 }}>
        2. How We Use Your Information
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="To provide and maintain our service" />
        </ListItem>
        <ListItem>
          <ListItemText primary="To improve user experience" />
        </ListItem>
        <ListItem>
          <ListItemText primary="To send important updates and notifications" />
        </ListItem>
      </List>

      <Typography variant="h4" sx={{ mt: 3, mb: 2 }}>
        3. Data Protection
      </Typography>
      <Typography variant="body1" paragraph>
        We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction.
      </Typography>

      <Typography variant="h4" sx={{ mt: 3, mb: 2 }}>
        4. Your Rights
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="Right to access your personal data" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Right to correct inaccurate information" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Right to request deletion of your data" />
        </ListItem>
      </List>

      <Typography variant="h4" sx={{ mt: 3, mb: 2 }}>
        5. Contact Us
      </Typography>
      <Typography variant="body1">
        If you have any questions about this Privacy Policy, please contact us at{' '}
        <Link href="mailto:support@teacherfy.ai">support@teacherfy.ai</Link>.
      </Typography>

      <Typography variant="body2" sx={{ mt: 4, color: 'text.secondary' }}>
        Last Updated: {new Date().toLocaleDateString()}
      </Typography>
    </Container>
  );
};

export default PrivacyPolicy;