import React, { useEffect, useState } from 'react';
import { Box, Button, CircularProgress, Paper, Dialog, DialogTitle, DialogContent } from '@mui/material';
import TrainingData from '../components/training_data';
import StravaApi from '../service/strava_api';
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref, get, onValue, update } from 'firebase/database';
import Header from '../components/header';
import Footer from '../components/footer'; 
import { exampleTrainingData, exampleTrainingPlan, iconMapping } from '../constants/constant';
import UserHealthForm from './UserHealthForm'; 
import { generatePace } from '../utils/generatePace'; 
const Plan = () => {
  const storedCode = localStorage.getItem('code');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [trainingData, setTrainingData] = useState(null);
  const [trainingPlan, setTrainingPlan] = useState(null);
  const [user, setUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false); 
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
  };

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
  };

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
      const firstname = userData?.stravaData?.firstname; 
      setUser({...storedUser.providerData[0], firstname}); 
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

// Function to update the training plan with calculated pace 
const startTrainingPlan1 = async () => {
  setLoading(true);
  try {
    const userId = localStorage.getItem("userId");
    const db = getDatabase();

    await getLatestPlan();

    const userHealthRef = ref(db, `users/${userId}/healthInfo`);
    const userHealthData = await (await get(userHealthRef)).val();

    if (!userHealthData || !userHealthData.restingHeartRate || !userHealthData.age) {
      throw new Error('Required health information is missing');
    }

    const averageTPace = generatePace(userHealthData.age, userHealthData.restingHeartRate);
    const numberOfWeeks = 1; 
    const daysPerWeek = 7;   
    for (let week = 1; week <= numberOfWeeks; week++) {
      for (let day = 1; day <= daysPerWeek; day++) {
        const trainingPlanRef = ref(db, `users/${userId}/trainingPlan/Week${week}_Day${day}`);
        await update(trainingPlanRef, { pace: averageTPace });
      }
    }
  } catch (error) {
    console.error('Error starting Training Plan 1:', error);
  } finally {
    setLoading(false);
  }
};

  

  return (
    <>
     {user && (
  <Paper elevation={3} sx={{ padding: '16px', marginBottom: '20px', backgroundColor: 'orange' }}>
    <Header user={user} firstname={user.firstname} />
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
              {loading ? <CircularProgress size={24} /> : 'upload Run from Strava'}
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={getLatestActivity}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'update Last Run'}
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={startTrainingPlan1}
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