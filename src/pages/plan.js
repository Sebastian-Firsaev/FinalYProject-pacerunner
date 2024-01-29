import React, { useEffect, useState } from 'react';
import { Box, Button, CircularProgress, Paper, Dialog, DialogTitle, DialogContent } from '@mui/material';
import TrainingData from '../components/training_data';
import StravaApi from '../service/strava_api';
import { useNavigate } from 'react-router-dom';
import { getDatabase, onValue, ref } from 'firebase/database';
import Header from '../components/header';
import Footer from '../components/footer'; 
import { exampleTrainingData, exampleTrainingPlan, iconMapping } from '../constants/constant';
import UserHealthForm from './UserHealthForm'; 

const Plan = () => {
  const storedCode = localStorage.getItem('code');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [trainingData, setTrainingData] = useState(null);
  const [trainingPlan, setTrainingPlan] = useState(null);
  const [user, setUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false); // State for dialog control

  const combinedTrainingData = exampleTrainingData.map(data => ({
    ...data,
    icon: iconMapping[data.label],
  }));

  const fetchLastData = async () => {
    setLoading(true);
    try {
      await StravaApi.exchangeAuthorizationCode(
        process.env.REACT_APP_CLIENT_ID,
        process.env.REACT_APP_CLIENT_SECRET,
        storedCode
      );
    } finally {
      setLoading(false);
    }
  };

  const getLatestActivity = async () => {
    setLoading(true);
    try {
      const id = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");
      await StravaApi.getLatestActivity(id, accessToken);
    } catch (error) {
      console.log("error retrieving latest activity: ", error);
    } finally {
      setLoading(false);
    }
  }

  const getLatestPlan = async () => {
    setLoading(true);
    try {
      const id = localStorage.getItem("userId");
      await StravaApi.getTrainingPlan(id);
    } catch (error) {
      console.log("error retrieving latest plan: ", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!storedCode) {
      navigate('/');
      return;
    }
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setUser(storedUser.providerData[0]);

    const userId = localStorage.getItem("userId");
    const userRef = ref(getDatabase(), `users/${userId}`);

    const unsubscribe = onValue(userRef, (snapshot) => {
      const userData = snapshot.val();
      setTrainingData(userData?.activity || []);
      setTrainingPlan(userData?.trainingPlan || {});
    });

    return () => {
      unsubscribe();
    };
  }, [navigate, storedCode]);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <>
      {user && (
        <Paper elevation={3} sx={{ padding: '16px', marginBottom: '20px', backgroundColor: 'orange' }}>
          <Header user={user} />
        </Paper>
      )}

      <Footer />

      <Box display="flex" flexDirection="column" alignItems="center" marginBottom={20}>
        <TrainingData trainingData={trainingData || combinedTrainingData} trainingPlan={trainingPlan || exampleTrainingPlan} />

        <Button variant="contained" color="primary" onClick={handleOpenDialog}>
          Add Runner Details
        </Button>

        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>Add Runner Details</DialogTitle>
          <DialogContent>
            <UserHealthForm />
          </DialogContent>
        </Dialog>

        {storedCode && (
          <Box mt={2} display="flex" gap={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={fetchLastData}
              disabled={loading}
              sx={{ marginRight: '8px' }}
            >
              {loading ? <CircularProgress size={24} /> : 'Update Run Data'}
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={getLatestActivity}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Upload Last Run'}
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={getLatestPlan}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Start Training Plan 1'}
            </Button>
          </Box>
        )}
      </Box>
    </>
  );
};

export default Plan;


