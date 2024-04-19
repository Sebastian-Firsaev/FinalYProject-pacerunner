import React, { useState } from 'react';
import { Box, Typography, Button, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import SportsMartialArtsIcon from '@mui/icons-material/SportsMartialArts'; // Icon for training plan
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun'; // Runner icon
const Header = ({ user, firstname, onMenuItemClick, onTrainingDialogOpen, setup}) => {
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
    userId && (
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        padding="10px"
        sx={{ backgroundColor: '#20232a' }}
      >
        <Box display="flex" alignItems="center">
          <Typography variant="h5" color="common.white" mr={2}>
            Welcome, {firstname || user.displayName}!
          </Typography>
          <Button
            variant="contained"
            startIcon={<DirectionsRunIcon/>}
            onClick={handleTrainingPlanClick}
            sx={{ color: 'common.white', borderColor: 'blue', '&:hover': { borderColor: 'common.white', backgroundColor: 'blue' } }}
          >
            Training Plan
          </Button>
        </Box>

        <Box>
          <Button
            variant="contained"
            startIcon={<MenuIcon />}
            onClick={handleMenuClick}
            sx={{ marginRight: 1, borderColor: 'blue', '&:hover': { borderColor: 'common.white', backgroundColor: 'blue'  } }}
          >
            Options
          </Button>
          <Button
            variant="contained"
            startIcon={<LogoutIcon />}
            onClick={handleSignOut}
            sx={{ backgroundColor: 'red', '&:hover': { backgroundColor: 'darkred' } }}
          >
            Sign Out
          </Button>
          <Menu
            id="simple-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
            PaperProps={{
              style: {
                backgroundColor: '#282c34',
                color: 'white',
              }
            }}
          >
            <MenuItem onClick={() => handleMenuItemClick('addRunnerDetails')}>Add Runner Details</MenuItem>
            <MenuItem onClick={() => handleMenuItemClick('resetTrainingDay')}>Reset Training Day</MenuItem>
            <MenuItem onClick={() => handleMenuItemClick('decrementTrainingDay')}>Go Back A Day</MenuItem>
            <MenuItem onClick={() => handleMenuItemClick('setup')}>First time setup</MenuItem>
          </Menu>
        </Box>
      </Box>
    )
  );
};

export default Header;

