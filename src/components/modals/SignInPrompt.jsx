import React from 'react';
import {
  Box,
  Typography,
  Modal
} from "@mui/material";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import Logo from '../../assets/images/Teacherfyoai.png';


const SignInPrompt = ({ open, onClose, onSuccess, clientId }) => {
  // Early return if the client ID is missing
  if (!clientId) {
    console.error("Google Client ID is not defined!");
    return (
      <Modal open={open} onClose={onClose}>
        <Box sx={{ p: 2 }}>
          <Typography color="error" variant="h6">
            Error: Google Client ID not found.
          </Typography>
        </Box>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="signin-modal-title"
      aria-describedby="signin-modal-description"
      className="signin-prompt"
      sx={{
        display: "flex",
        alignItems: "stretch",
        justifyContent: "stretch",
      }}
    >
      <Box
        className="signin-dialog"
        sx={{
          width: "100vw",
          height: "100vh",
          bgcolor: "#f5f5f5",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 4,
        }}
      >
        <Box sx={{ mb: 3 }}>
          <img
            src={Logo}  // Updated to use imported Logo
            alt="Teacherfy AI Logo"
            style={{ maxWidth: "150px", height: "auto" }}
          />
        </Box>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Welcome to Teacherfy AI
        </Typography>
        <Typography sx={{ mb: 3 }}>
          Please sign in with your Google account to create personalized lesson plans.
        </Typography>

        <GoogleOAuthProvider clientId={clientId}>
          <GoogleLogin
            onSuccess={onSuccess}
            onError={() => alert("Login Failed")}
            theme="filled_blue"
            shape="pill"
            size="large"
            width="100%"
          />
        </GoogleOAuthProvider>
      </Box>
    </Modal>
  );
};

export default SignInPrompt;