import React, { useState } from 'react';
import { Paper, Box, Typography, TextField, Button } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import SuccessToast from '../components/success_toast';
import ErrorToast from '../components/error_toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const history = useNavigate();

  const handleLogin = async () => {
    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
      SuccessToast('Welcome!');
      history('/');
    } catch (error) {
      ErrorToast(error.message);
      console.error('Error logging in:', error.message);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      sx={{
        backgroundImage: 'linear-gradient(120deg, #89f7fe 0%, #66a6ff 100%)'
      }}
    >
      <Paper elevation={3} sx={{ padding: '16px', width: '50%', backgroundColor: 'orange' }}>
        <Box textAlign="center">
          <Typography variant="h5" color="white" gutterBottom>
            Welcome to PaceRunner <br></br>
            Log In
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
          <Button variant="contained" color="primary" onClick={handleLogin}>
            Log In
          </Button>
          <Typography variant="body2" color="white" mt={2}>
            Or click to  <Link to="/signup">Sign Up</Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
