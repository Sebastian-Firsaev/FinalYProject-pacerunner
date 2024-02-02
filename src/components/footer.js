import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      localStorage.removeItem("user");
      localStorage.removeItem("code");
      localStorage.removeItem("userId");
      localStorage.removeItem("accessToken");
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <footer className="App-footer">
      <Box mt={4} textAlign="center">
        <Typography variant="body2" color="textSecondary">
          &copy; 2023 PaceRunner
        </Typography>
        <Box mt={2}>
          <Button variant="contained" color="primary" onClick={handleSignOut}>
            Sign Out
          </Button>
        </Box>
      </Box>
    </footer>
  );
};

export default Footer;

