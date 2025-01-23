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

const TermsOfService = () => {
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
        Terms of Service
      </Typography>

      <Typography variant="body1" paragraph>
        Welcome to Teacherfy AI. By accessing or using our service, you agree to these Terms of Service.
      </Typography>

      <Typography variant="h4" sx={{ mt: 3, mb: 2 }}>
        1. Service Description
      </Typography>
      <Typography variant="body1" paragraph>
        Teacherfy AI provides an AI-powered platform for educators to generate lesson plans, presentations, and educational resources.
      </Typography>

      <Typography variant="h4" sx={{ mt: 3, mb: 2 }}>
        2. User Accounts
      </Typography>
      <List>
        <ListItem>
          <ListItemText 
            primary="Account Responsibility" 
            secondary="Users are responsible for maintaining account confidentiality" 
          />
        </ListItem>
        <ListItem>
          <ListItemText 
            primary="Accurate Information" 
            secondary="Users must provide current and complete registration information" 
          />
        </ListItem>
      </List>

      <Typography variant="h4" sx={{ mt: 3, mb: 2 }}>
        3. User Conduct
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="Do not use the service for illegal purposes" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Do not attempt to hack or disrupt the service" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Respect intellectual property rights" />
        </ListItem>
      </List>

      <Typography variant="h4" sx={{ mt: 3, mb: 2 }}>
        4. Intellectual Property
      </Typography>
      <Typography variant="body1" paragraph>
        Content generated through Teacherfy AI is for educational use. Users retain ownership of original input, while Teacherfy AI retains rights to AI-generated content.
      </Typography>

      <Typography variant="h4" sx={{ mt: 3, mb: 2 }}>
        5. Limitation of Liability
      </Typography>
      <Typography variant="body1" paragraph>
        Teacherfy AI is provided "as is" without warranties. We are not liable for direct or indirect damages resulting from service use.
      </Typography>

      <Typography variant="h4" sx={{ mt: 3, mb: 2 }}>
        6. Contact Us
      </Typography>
      <Typography variant="body1">
        For questions about these Terms, contact us at{' '}
        <Link href="mailto:support@teacherfy.ai">support@teacherfy.ai</Link>.
      </Typography>

      <Typography variant="body2" sx={{ mt: 4, color: 'text.secondary' }}>
        Last Updated: {new Date().toLocaleDateString()}
      </Typography>
    </Container>
  );
};

export default TermsOfService;