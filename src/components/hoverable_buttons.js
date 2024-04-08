import React, { useState } from 'react';
import { Box, Button, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';

const HoverableButtons = ({ start, setup, handleUpdateLastRun, handleTriggerButtonClick, loading }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  const containerStyle = {
    border: '2px solid #3f51b5',
    borderRadius: '8px',
    boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.15)',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  };

  const buttonStyle = {
    borderRadius: '8px',
    padding: '12px 24px',
    backgroundColor: '#3f51b5',
    color: 'white',
    cursor: 'pointer',
    outline: 'none',
    border: 'none',
    fontFamily: 'inherit',
    fontSize: '16px',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const hoverStyle = {
    transform: 'translateY(-2px)',
    boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.3)',
  };

  return (
    <Box  display="flex" flexDirection="column" alignItems="center">
      <motion.div
        style={{ ...containerStyle, visibility: isOpen ? 'visible' : 'hidden' }}
        animate={{ opacity: isOpen ? 1 : 0, scale: isOpen ? 1 : 0.5 }}
      >
        <motion.button
          style={{ ...buttonStyle, ...hoverStyle }}
          onClick={start}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Start'}
        </motion.button>
        <motion.button
          style={{ ...buttonStyle, ...hoverStyle }}
          onClick={setup}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Setup'}
        </motion.button>
        <motion.button
          style={{ ...buttonStyle, ...hoverStyle }}
          onClick={handleUpdateLastRun}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Update Last Run'}
        </motion.button>
        <motion.button
          style={{ ...buttonStyle, ...hoverStyle }}
          onClick={handleTriggerButtonClick}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Trigger Comparison and Storage'}
        </motion.button>
      </motion.div>
      <motion.div
        style={{ ...buttonStyle, ...containerStyle, cursor: 'pointer' }}
        whileHover={{ backgroundColor: isOpen ? '#ff5722' : '#3f51b5' }}
        onClick={handleClick}
      >
        {isOpen ? '-' : '+'}
      </motion.div>
    </Box>
  );
};

export default HoverableButtons;
