import React, { useState } from 'react';
import { Box, Typography, Button, Menu, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Header = ({ user, firstname, onMenuItemClick }) => {
  const [anchorEl, setAnchorEl] = useState(null);

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

  return (
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Typography variant="h5" color="white" mb={2}>
        Welcome, {firstname || user.displayName}!
      </Typography>

      <div>
        <Button variant="contained" color="primary" onClick={handleMenuClick}>
          Options
        </Button>
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={() => handleMenuItemClick('addRunnerDetails')}>Add Runner Details</MenuItem>
          <MenuItem onClick={() => handleMenuItemClick('startTrainingPlan')}>Start Training Plan</MenuItem>
          <MenuItem onClick={() => handleMenuItemClick('fetchAndSaveActivity')}>Fetch and Save Activity & Laps</MenuItem>
          <MenuItem onClick={() => handleMenuItemClick('resetTrainingDay')}>Reset Training Day</MenuItem>
        </Menu>
      </div>
    </Box>
  );
};

export default Header;


