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
      height="100vh"
    >
      <Paper elevation={3} sx={{ padding: '16px', width: '50%', backgroundColor: 'orange' }}>
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
          />
          <TextField
            type="number"
            label="Resting Heart Rate"
            variant="outlined"
            fullWidth
            margin="normal"
            value={heartRate}
            onChange={(e) => setHeartRate(e.target.value)}
          />
          <TextField
            type="text"
            label="Marathon Pace"
            variant="outlined"
            fullWidth
            margin="normal"
            value={marathonPace}
            onChange={(e) => setMarathonPace(e.target.value)}
          />
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Submit
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default UserHealthForm;
