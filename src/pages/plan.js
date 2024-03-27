import React, { useEffect, useState } from 'react';
import { Box, Button, CircularProgress, Paper, Dialog, DialogTitle, DialogContent, Typography } from '@mui/material';
import TrainingData from '../components/training_data';
import SwipeableViews from 'react-swipeable-views';
import StravaApi from '../service/strava_api';
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import Header from '../components/header';
import Footer from '../components/footer';
import { exampleTrainingData, iconMapping } from '../constants/constant';
import UserHealthForm from './UserHealthForm';
import { generatePace } from '../utils/generatePace';
import compareAndStoreNextRunPaces from '../utils/nextPace';
import { paperStyle, addButtonStyle } from '../components/styles';
import roadImage from '../constants/road.png';
import getPaceRecommendations from '../utils/PaceRecommendation';
import calculateOverallPace from '../utils/calculateAndSaveRecommendedPaces';
import getactivityRecommendations from '../utils/getactivityRecommendations';
const Plan = () => {
  const storedCode = localStorage.getItem('code');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [trainingData, setTrainingData] = useState(null);
  const [trainingPlan, setTrainingPlan] = useState({});
  const [user, setUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [recommendedPace, setRecommendedPace] = useState('');
  const [recommendedPaceNextRun, setRecommendedPaceNextRun] = useState('');
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [paceRecommendations, setPaceRecommendations] = useState(null);
  const [startingPace, setStartingPace] = useState('');
  const [corePace, setCorePace] = useState('');
  const [finishingPace, setFinishingPace] = useState('');
  const [averagePaces, setAveragePaces] = useState({ startingPace: '', corePace: '', finishingPace: '' });

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
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      navigate('/');
      return;
    }

    const fetchAveragePaces = async () => {
      const db = getDatabase();
      const averagePacesRef = ref(db, `users/${userId}/AveragePaces`);

      onValue(averagePacesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setAveragePaces({
            startingPace: data.averageStartingPace || '',
            corePace: data.averageCorePace || '',
            finishingPace: data.averageFinishingPace || '',
          });
        }
      }, { onlyOnce: true });
    };

    fetchAveragePaces();
  }, [navigate]);

  const fetchPaceRecommendations = async () => {
      setLoading(true);
      try {
        const userId = localStorage.getItem("userId");
        const db = getDatabase();
        const activitiesRef = ref(db, `users/${userId}/activities`);
    
        onValue(activitiesRef, async (snapshot) => {
          const activities = snapshot.val();
          if (!activities) {
            throw new Error("No activities found");
          }
    
          // Extract all activity IDs
          const activityIds = Object.keys(activities);
    
          // Check for any activity IDs
          if (activityIds.length === 0) {
            throw new Error("No activity IDs found");
          }
    
          // Generate pace recommendations for each activity
          const paceRecommendationsPromises = activityIds.map(activityId => getPaceRecommendations(userId, activityId));
    
          // Wait 
          const allPaceRecommendations = await Promise.all(paceRecommendationsPromises);

          const { startingPace, corePace, finishingPace } = allPaceRecommendations[allPaceRecommendations.length - 1];
          // Set paces from the last activity
          setStartingPace(startingPace);
          setCorePace(corePace);
          setFinishingPace(finishingPace);
    
        }, { onlyOnce: true });
      } catch (error) {
        console.error("Failed to fetch pace recommendations:", error);
      } finally {
        setLoading(false);
      }
    };
    const handleTriggerButtonClick = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
          console.error('User ID not found');
          return;
      }
      try {
          setLoading(true); // Assuming you have a setLoading state to show a loading indicator
          await compareAndStoreNextRunPaces(userId);
          console.log('Next run paces have been successfully compared and stored.');
      } catch (error) {
          console.error('Failed to compare and store next run paces:', error);
      } finally {
          setLoading(false);
      }
  };
  
    const fetchLatestAcPace = async () => {
      setLoading(true);
      try {
        const userId = localStorage.getItem("userId");
        const db = getDatabase();
        const activityRef = ref(db, `users/${userId}/activity`);
  
        onValue(activityRef, async (snapshot) => {
          const activity = snapshot.val();
          if (!activity) {
            throw new Error("No activity found");
          }
  
         
          const { startingPace, corePace, finishingPace } = await getactivityRecommendations(userId);
  
          // Set paces from the activity
          setStartingPace(startingPace);
          setCorePace(corePace);
          setFinishingPace(finishingPace);
  
        }, { onlyOnce: true });
      } catch (error) {
        console.error("Failed to fetch pace recommendations:", error);
      } finally {
        setLoading(false);
      }
  };
  const updateCurrentDay = async () => {
    setLoading(true);
    try {
      await getLatestActivity(); 
      await fetchLatestAcPace();
      const newDayIndex = currentDayIndex + 1;
      setCurrentDayIndex(newDayIndex);
      // Save the updated index to Firebase
      const userId = localStorage.getItem("userId");
      const userRef = ref(getDatabase(), `users/${userId}`);
      await update(userRef, { currentDayIndex: newDayIndex });
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
      } else if (lastActivityPace < parseFloat(recommendedPace)) {
        const newPace = recommendedPace * 0.98;
        setRecommendedPaceNextRun(newPace.toFixed(2));
      } else {
        setRecommendedPaceNextRun(recommendedPace);
      }
    } catch (error) {
      console.log("error retrieving latest activity: ", error);
    } finally {
      setLoading(false);
    }
  };
  const resetTrainingDay = async () => {
    setLoading(true);
    try {
      // Reset the current day index to 0
      setCurrentDayIndex(0);
  
      // Update the currentDayIndex in Firebase
      const userId = localStorage.getItem("userId");
      const userRef = ref(getDatabase(), `users/${userId}`);
      await update(userRef, { currentDayIndex: 0 });
  
      console.log("Training plan has been reset to day 1.");
    } catch (error) {
      console.error("Error resetting the training day:", error);
    } finally {
      setLoading(false);
    }
  };
  const fetchActivityAndLaps = async () => {
      setLoading(true); 
      try {
        const accessToken = localStorage.getItem("accessToken");
        const userId = localStorage.getItem("userId");
        const activities = await StravaApi.getAllActivities(accessToken);
    
        for (const activity of activities) {
          const lapsData = await StravaApi.getActivityLaps(activity.id, accessToken);
          if (lapsData && lapsData.length > 0) {
            // Convert lapsData array into an object with indices keys
            const lapsDataObject = lapsData.reduce((obj, lap, index) => {
              obj[index] = lap;
              return obj;
            }, {});
    
            // Save each activity's laps data in Firebase
            const db = getDatabase();
            const lapsDataRef = ref(db, `users/${userId}/activities/${activity.id}/laps`);
            await update(lapsDataRef, lapsDataObject);
    
            console.log(`Laps data added to DB for activity ${activity.id}:`, lapsData);
          }
        }
      } catch (error) {
        console.error("Error fetching activities and laps:", error);
      } finally {
        setLoading(false);
      }
    };
  

  const getImageUrlForActivity = (activityDescription) => {
    return roadImage;
  };

  const getLatestPlan = async () => {
    setLoading(true);
    try {
      console.log("Fetching latest training plan");
    } catch (error) {
      console.error("Error retrieving latest plan:", error);
    } finally {
      setLoading(false);
    }
  };

  const startTrainingPlan1 = async () => {
    setLoading(true);
    try {
      console.log("Starting new training plan");
    } catch (error) {
      console.error("Error starting Training Plan:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => setOpenDialog(true);

  const handleCloseDialog = () => setOpenDialog(false);

  const handleHeaderMenuAction = (action) => {
    switch (action) {
      case 'addRunnerDetails':
        handleOpenDialog();
        break;
      case 'startTrainingPlan':
        startTrainingPlan1();
        break;
      case 'fetchAndSaveActivity':
        fetchActivityAndLaps();
        break;
      case 'resetTrainingDay':
        resetTrainingDay();
        break;
      default:
        console.log("Unhandled action:", action);
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

      // Initialize the currentDayIndex from Firebase
      const storedDayIndex = userData?.currentDayIndex || 0;
      setCurrentDayIndex(storedDayIndex);

      if (userData?.healthInfo?.age && userData?.healthInfo?.restingHeartRate) {
        const pace = generatePace(userData.healthInfo.age, userData.healthInfo.restingHeartRate);
        setRecommendedPace(pace);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [navigate, storedCode]);

  return (
    <>
      {user && (
        <Paper elevation={3} sx={{ padding: '16px', marginBottom: '20px', backgroundColor: 'orange' }}>
          <Header user={user} firstname={user.firstname} onMenuItemClick={handleHeaderMenuAction} />
        </Paper>
      )}
  
      <Footer />
  
      <Box display="flex" flexDirection="column" alignItems="center" marginBottom={20}>
        {averagePaces.startingPace && averagePaces.corePace && averagePaces.finishingPace && (
          <Paper className="average-paces-box" sx={{ ...paperStyle }}>
            <Typography variant="h5">
              Your Standard Pace:
            </Typography>
            <Typography>
              Starting Pace: {averagePaces.startingPace}
            </Typography>
            <Typography>
              Core Pace: {averagePaces.corePace}
            </Typography>
            <Typography>
              Finishing Pace: {averagePaces.finishingPace}
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
        
        {startingPace && corePace && finishingPace && (
          <Paper className="pace-recommendations-box" sx={{ ...paperStyle }}>
            <Typography variant="h5">
              Starting Pace: {startingPace} per mile
            </Typography>
            <Typography variant="h5">
              Core Pace: {corePace} per mile
            </Typography>
            <Typography variant="h5">
              Finishing Pace: {finishingPace} per mile
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
          <Paper elevation={3} sx={{ ...paperStyle, width: '100%', overflow: 'hidden', backgroundColor: 'orange' }}>
            <SwipeableViews
              index={currentDayIndex}
              onChangeIndex={(index) => setCurrentDayIndex(index)}
              enableMouseEvents
            >
              {Object.keys(trainingPlan).map((week, weekIndex) =>
                trainingPlan[week].days ? trainingPlan[week].days.map((day, dayIndex) => (
                  <Box key={`${weekIndex}-${dayIndex}`} p={2} textAlign="center">
                    <Typography variant="h6">Week: {weekIndex + 1} Day: {dayIndex + 1}</Typography>
                    <Typography>Activity: {day.activity}</Typography>
                    <Typography>Pace: {day.pace} per mile</Typography>
                    <img src={getImageUrlForActivity(day.activity)} alt="Activity" style={{ maxWidth: '100%', height: 'auto' }} />
                  </Box>
                )) : null
              )}
            </SwipeableViews>
          </Paper>
        )}
  
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
            onClick={updateCurrentDay}
            disabled={loading}
            sx={addButtonStyle}
          >
            {loading ? <CircularProgress size={24} /> : 'Update Last Run'}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={fetchPaceRecommendations}
            disabled={loading}
            sx={addButtonStyle}
          >
            {loading ? <CircularProgress size={24} /> : 'Get Pace Recommendations'}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => calculateOverallPace(localStorage.getItem("userId"))}
            disabled={loading}
            sx={addButtonStyle}
          >
            {loading ? <CircularProgress size={24} /> : 'Calculate Overall Pace'}
          </Button>
          <Button variant="contained" color="primary" onClick={handleTriggerButtonClick} disabled={loading}>
    {loading ? <CircularProgress size={24} /> : 'Trigger Comparison and Storage'}
</Button>
        </Box>
      </Box>
    </>
  );
  
};

export default Plan;