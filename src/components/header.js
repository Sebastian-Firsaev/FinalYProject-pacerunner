import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Header = ({ user, firstname }) => {
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
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Typography variant="h5" color="white" mb={2}>
        Welcome, {firstname || user.displayName }!
      </Typography>
      <Button variant="contained" color="primary" onClick={handleSignOut}>
        Sign Out
      </Button>
    </Box>
  );
};

export default Header;

