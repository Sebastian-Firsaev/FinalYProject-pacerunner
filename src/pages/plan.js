import React, { useEffect, useState } from 'react';
import { Box, Button, CircularProgress, Paper, Dialog, DialogTitle, DialogContent, Typography } from '@mui/material';
import TrainingData from '../components/training_data';
import SwipeableViews from 'react-swipeable-views';
import StravaApi from '../service/strava_api';
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref, get, onValue, update } from 'firebase/database';
import Header from '../components/header';
import Footer from '../components/footer'; 
import { exampleTrainingData, exampleTrainingPlan, iconMapping } from '../constants/constant';
import UserHealthForm from './UserHealthForm'; 
import { generatePace } from '../utils/generatePace'; 
import { paperStyle, addButtonStyle} from '../components/styles';
import TrainingPlan from '../service/training_plan';

const Plan = () => {
  const storedCode = localStorage.getItem('code');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [trainingData, setTrainingData] = useState(null);
  const [trainingPlan, setTrainingPlan] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0); // State to track the current index for swipe view
  const [user, setUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [recommendedPace, setRecommendedPace] = useState('');
  const [recommendedPaceNextRun, setRecommendedPaceNextRun] = useState('');


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
  const fetchActivityAndLaps = async () => {
    setLoading(true);
    try {
      const id = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");
      
      // Fetch the latest activity
      const latestActivity = await StravaApi.getLatestActivity(id, accessToken);

      if (latestActivity) {
        // Fetch the laps for the latest activity
        const lapsData = await StravaApi.getActivityLaps(latestActivity.id, accessToken);
        await TrainingPlan.addLapsInfoToDb(id, latestActivity.id, lapsData);

        
      }
    } catch (error) {
      console.error("Error fetching activity and laps: ", error);
    } finally {
      setLoading(false);
    }
  };

  const getLatestActivity = async () => {
    setLoading(true);
    try {
      const id = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");
      const latestActivity = await StravaApi.getLatestActivity(id, accessToken);
      
     
      const lastActivityPace = parseFloat(latestActivity.average_speed);
  
      if (lastActivityPace > parseFloat(recommendedPace)) {
        const newPace = recommendedPace * 1.02;
        setRecommendedPaceNextRun(newPace.toFixed(2));
      } if (lastActivityPace < parseFloat(recommendedPace)) {
        const newPace = recommendedPace * 0.98;
        setRecommendedPaceNextRun(newPace.toFixed(2));
      }else {
        setRecommendedPaceNextRun(recommendedPace);
      }
  
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
      setUser({ ...storedUser.providerData[0], firstname });

      if (userData?.healthInfo?.age && userData?.healthInfo?.restingHeartRate) {
        const pace = generatePace(userData.healthInfo.age, userData.healthInfo.restingHeartRate);
        setRecommendedPace(pace);
      }
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

  const startTrainingPlan1 = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      const db = getDatabase();
  
      await getLatestPlan();
  
      
      const numericRecommendedPace = parseFloat(recommendedPace);
      if (isNaN(numericRecommendedPace)) {
        throw new Error('Recommended pace is not a valid number');
      }
  
      // Fetch current training plan
      const trainingPlanRef = ref(db, `users/${userId}/trainingPlan`);
      const snapshot = await get(trainingPlanRef);
      const currentTrainingPlan = snapshot.val();
  
      Object.keys(currentTrainingPlan).forEach(async (week) => {
        currentTrainingPlan[week].days.forEach(async (day, index) => {
          let adjustedPace = numericRecommendedPace; // Use numericRecommendedPace here
  
          // Adjust pace based on the type of run
          if (day.activity.includes('easy run')) {
            adjustedPace *= 1.05; // Slightly slower for easy runs
          } else if (day.activity.includes('tempo')) {
            adjustedPace *= 0.95; // Slightly faster for tempo runs
          } else if (day.activity.includes('long run')) {
            adjustedPace *= 1.02; // Adjust for long runs
          }
  
          // Update the pace for each day in Firebase
          const dayRef = ref(db, `users/${userId}/trainingPlan/${week}/days/${index}`);
          await update(dayRef, { ...day, pace: adjustedPace.toFixed(2) });
        });
      });
  
    } catch (error) {
      console.error('Error starting Training Plan:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleHeaderMenuAction = (action) => {
    switch (action) {
      case 'addRunnerDetails':
        handleOpenDialog(); 
        break;
      case 'startTrainingPlan':
        startTrainingPlan1();
      case 'fetchAndSaveActivity':
        fetchActivityAndLaps(); 
        break;
      
    }
  };

  return (
    <>
      {user && (
        <Paper elevation={3} sx={{ padding: '16px', marginBottom: '20px', backgroundColor: 'orange' }}>
          <Header user={user} firstname={user.firstname} onMenuItemClick={handleHeaderMenuAction} />
        </Paper>
      )}

      <Footer />

      <Box display="flex" flexDirection="column" alignItems="center" marginBottom={20}>
        
        <Paper className="activity-details-box" sx={{ ...paperStyle }}> 
          <TrainingData trainingData={trainingData || exampleTrainingData.map(data => ({
            ...data,
            icon: iconMapping[data.label],
          }))} />
        </Paper>

        {recommendedPace && (
          <Paper className="recommended-pace-box" sx={{ ...paperStyle }}> 
            <Typography variant="h5">
              Your Standard Pace: {recommendedPace} per mile
            </Typography>
          </Paper>
        )}

        {recommendedPaceNextRun && (
          <Paper className="recommended-pace-next-run-box" sx={{ ...paperStyle }}>
            <Typography variant="h5">
              Recommended pace for next run: {recommendedPaceNextRun} per mile
            </Typography>
          </Paper>
        )}

        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>Add Runner Details</DialogTitle>
          <DialogContent>
            <UserHealthForm />
          </DialogContent>
        </Dialog>

        
        {Object.keys(trainingPlan).length > 0 && (
          <Paper elevation={3} sx={{ ...paperStyle, width: '100%', overflow: 'hidden' }}> 
            <SwipeableViews
              index={currentIndex}
              onChangeIndex={(index) => setCurrentIndex(index)}
              enableMouseEvents
            >
              {Object.keys(trainingPlan).map((week) =>
                trainingPlan[week].days.map((day, index) => (
                  <Box key={index} p={2} textAlign="center">
                    <Typography variant="h6">Day: {index + 1}</Typography>
                    <Typography>Activity: {day.activity}</Typography>
                    <Typography>Pace: {day.pace} per mile</Typography>
                  </Box>
                ))
              )}
            </SwipeableViews>
          </Paper>
        )}

        
        <Box mt={2}>
          <Button
            variant="contained"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(currentIndex - 1)}
            sx={{ mr: 1 }}
          >
            Previous
          </Button>
          <Button
            variant="contained"
            disabled={currentIndex === Object.keys(trainingPlan).reduce((acc, week) => acc + trainingPlan[week].days.length, 0) - 1}
            onClick={() => setCurrentIndex(currentIndex + 1)}
          >
            Next
          </Button>
        </Box>

        
        <Box mt={2} display="flex" flexDirection="column" alignItems="center" gap={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={fetchLastData}
            disabled={loading}
            sx={addButtonStyle}
          >
            {loading ? <CircularProgress size={24} /> : 'Upload Run from Strava'}
          </Button>

          <Button
            variant="contained"
            color="primary"
            onClick={getLatestActivity}
            disabled={loading}
            sx={addButtonStyle}
          >
            {loading ? <CircularProgress size={24} /> : 'Update Last Run'}
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default Plan;