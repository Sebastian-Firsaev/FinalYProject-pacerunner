import React, { useState } from 'react';
import { Paper, Box, Typography, TextField, Button } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import SuccessToast from '../components/success_toast';
import ErrorToast from '../components/error_toast';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const history = useNavigate();

  const handleSignUp = async () => {
    try {
      const auth = getAuth();
      await createUserWithEmailAndPassword(auth, email, password);
      SuccessToast('Done!');
      history('/');
    } catch (error) {
      ErrorToast('Error Signing up!: ' + error.message);
      console.error('Error signing up:', error.message);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
    >
      <Paper elevation={3} sx={{ padding: '16px', width: '50%', backgroundColor: 'orange' }}>
        <Box textAlign="center">
          <Typography variant="h5" color="white" gutterBottom>
            Sign Up
          </Typography>
          <TextField
            type="email"
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            type="password"
            label="Password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button variant="contained" color="primary" onClick={handleSignUp}>
            Sign Up
          </Button>
          <Typography variant="body2" color="white" mt={2}>
            Already have an account? <Link to="/login">Log In</Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Signup;
