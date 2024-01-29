import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer = () => {
  return (
    <footer className="App-footer">
      <Box mt={4} textAlign="center">
        <Typography variant="body2" color="textSecondary">
          &copy; 2023 PaceRunner
        </Typography>
      </Box>
    </footer>
  );
};

export default Footer;
