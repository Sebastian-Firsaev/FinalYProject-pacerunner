import React, { useState } from 'react';
import { Box, Typography, Button, Menu, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';

const Header = ({ user, firstname, onMenuItemClick, onTrainingDialogOpen }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const userId = localStorage.getItem("userId");

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


  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (action) => {
    handleClose();
    onMenuItemClick(action);
  };

  const handleTrainingPlanClick = () => {
    onTrainingDialogOpen();
  };

  return (
    (userId && (
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        color="white"
        padding="10px"
      >
        <Box>
          <Typography variant="h5" component="span" mr={2}>
            Welcome, {firstname || user.displayName}!
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleTrainingPlanClick}
            style={{ marginLeft: '10px' }}
          >
            Training Plan
          </Button>
        </Box>

        <div>
          <Button variant="contained" color="primary" onClick={handleMenuClick}>
            Options
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSignOut}
            sx={{ backgroundColor: 'red', marginLeft: '10px' }} // Change background color to red
          >
            Sign Out
          </Button>
          <Menu
            id="simple-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={() => handleMenuItemClick('addRunnerDetails')}>Add Runner Details</MenuItem>
            <MenuItem onClick={() => handleMenuItemClick('resetTrainingDay')}>Reset Training Day</MenuItem>
          </Menu>
        </div>
      </Box>
    ))
  );
};

export default Header;
