import React, { useState } from 'react';
import { Paper, Box, Typography, TextField, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref, set } from 'firebase/database';

const UserHealthForm = () => {
  const [age, setAge] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [marathonPace, setMarathonPace] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    const userId = localStorage.getItem("userId");
    const db = getDatabase();
    const userHealthRef = ref(db, `users/${userId}/healthInfo`);

    try {
      await set(userHealthRef, { age, restingHeartRate: heartRate, marathonPace });
      alert('Health information updated successfully!');
      navigate('/'); 
    } catch (error) {
      alert('Failed to update health information. Error: ' + error.message);
      console.error('Error updating health information:', error);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100%"
      width="100%"
      padding="16px"
      sx={{
        backgroundColor: 'orange', 
      }}
    >
      <Paper elevation={6} sx={{
        width: '100%', 
        height: '100%', 
        padding: '24px',
        backgroundColor: 'rgba(255, 165, 0, 0.85)', 
        borderRadius: '10px', 
      }}>
        <Box textAlign="center">
          <Typography variant="h5" color="white" gutterBottom>
            Enter Your Health Details
          </Typography>
          <TextField
            type="number"
            label="Age"
            variant="outlined"
            fullWidth
            margin="normal"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            InputLabelProps={{ style: { color: 'white' } }} 
            InputProps={{ 
              style: {
                color: 'white',
                borderColor: 'white'
              }
            }}
          />
          <TextField
            type="number"
            label="Resting Heart Rate"
            variant="outlined"
            fullWidth
            margin="normal"
            value={heartRate}
            onChange={(e) => setHeartRate(e.target.value)}
            InputLabelProps={{ style: { color: 'white' } }} 
            InputProps={{ 
              style: {
                color: 'white',
                borderColor: 'white'
              }
            }}
          />
          <TextField
            type="text"
            label="Marathon Pace"
            variant="outlined"
            fullWidth
            margin="normal"
            value={marathonPace}
            onChange={(e) => setMarathonPace(e.target.value)}
            InputLabelProps={{ style: { color: 'white' } }} 
            InputProps={{ 
              style: {
                color: 'white',
                borderColor: 'white'
              }
            }}
          />
          <Button 
            variant="contained" 
            sx={{
              backgroundColor: '#blue'
            }} 
            onClick={handleSubmit}>
            Submit
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default UserHealthForm;
