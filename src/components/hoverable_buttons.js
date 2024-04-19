import React, { useState } from 'react';
import { Box, Button, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import TouchAppIcon from '@mui/icons-material/TouchApp';

const HoverableButtons = ({ start, setup, handleUpdateLastRun, handleTriggerButtonClick, loading, handleRestOrCross }) => {
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
    padding: '16px 30px', // Increased padding
    backgroundColor: '#3f51b5',
    color: 'white',
    cursor: 'pointer',
    outline: 'none',
    border: 'none',
    fontFamily: 'inherit',
    fontSize: '20px', // Increased font size
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
    <Box display="flex" flexDirection="column" alignItems="center">
<motion.div
  style={buttonStyle}
  whileHover={{ backgroundColor: '#ff5722' }}
  onClick={handleClick}
>
  {isOpen ? (
    <><span></span><TouchAppIcon sx={{ marginLeft: 1 }} /></>
  ) : (
    <><span>Start and upload runs</span><TouchAppIcon sx={{ marginLeft: 1 }} /></>
  )}
</motion.div>
      <motion.div
        style={{ ...containerStyle, visibility: isOpen ? 'visible' : 'hidden' }}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: isOpen ? 0 : -20, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.button
          style={{ ...buttonStyle }}
          whileHover={{ ...hoverStyle }}
          onClick={start}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Start'}
        </motion.button>
        <motion.button
          style={{ ...buttonStyle }}
          whileHover={{ ...hoverStyle }}
          onClick={handleRestOrCross}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Rest Or Cross'}
        </motion.button>
        <motion.button
          style={{ ...buttonStyle }}
          whileHover={{ ...hoverStyle }}
          onClick={handleUpdateLastRun}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Update Last Run'}
        </motion.button>

      </motion.div>
    </Box>
  );
};

export default HoverableButtons;
