import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer = () => {

  return (
    <footer className="App-footer">
      <Box textAlign="center">
        <Typography variant="body2" color="white">
          &copy; 2023 PaceRunner
        </Typography>
        
      </Box>
    </footer>
  );
};

export default Footer;
