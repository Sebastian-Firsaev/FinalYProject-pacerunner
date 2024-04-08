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
import ErrorToast from '../components/error_toast';
import TrainingCalendar from '../components/training_plan';
import HoverableButtons from '../components/hoverable_buttons';
import DataInfo from '../components/data_info';

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
  const [nextRunPaces, setNextRunPaces] = useState({});

  const [openTrainingDialog, setOpenTrainingDialog] = useState(false);

  const handleTrainingDialogOpen = () => {
    setOpenTrainingDialog(true);
  };

  const handleTrainingDialogClose = () => {
    setOpenTrainingDialog(false);
  };

  const fetchStravaInfo = async () => {
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
    console.log("User id is:", userId, " and the value !userId is: ", userId)
    // if (!userId) {
    //   navigate('/');
    // }

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
  // Function to load NextRun paces from Firebase
  const loadNextRunPaces = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    const db = getDatabase();
    const nextRunRef = ref(db, `users/${userId}/NextRun`);

    onValue(nextRunRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setNextRunPaces(data);
      }
    }, { onlyOnce: true });
  };

  useEffect(() => {
    if (!localStorage.getItem('code')) {
      navigate('/');
      return;
    }
    loadNextRunPaces();
  }, [navigate]);

  const updateCurrentDay = async () => {
    const userId = localStorage.getItem("userId");
    const newDayIndex = currentDayIndex + 1;
    setCurrentDayIndex(newDayIndex);

    // Save the updated index to Firebase
    const db = getDatabase();
    await update(ref(db, `users/${userId}`), { currentDayIndex: newDayIndex });
  };

  const handleUpdateLastRun = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      // 1. Update the current day 
      await updateCurrentDay();

      // 2. Fetch and process the latest activity data
      await getLatestActivity();

      // 3. Fetch the latest pacing details potentially after latest activity has been processed
      await fetchLatestAcPace();

      // 4. Calculate overall pace based on new data
      await calculateOverallPace(userId);

      // 5. Compare and store next run paces, based on latest calculations and data
      await compareAndStoreNextRunPaces(userId);

      // 6. Load updated NextRun paces to reflect in UI
      await loadNextRunPaces();

      console.log('Update Last Run operations and latest activity paces fetched successfully.');
    } catch (error) {
      console.error('Failed to update last run and fetch latest activity paces:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaceRecommendations = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      if (userId == null) {
        ErrorToast("No userId found!, Can't fetch Pace recommendations");
        return;
      }
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
      setLoading(true); 
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
    try {
      setLoading(true);
      const id = localStorage.getItem("userId");
      await StravaApi.getTrainingPlan(id);
    } catch (error) {
      console.log("error retrieving latest plan: ", error);
    }
    finally {
      setLoading(false);
    }
  }

  const start = async () => {
    // 0. Get UserId first and setup Strava Account
    await fetchStravaInfo();
    window.location.reload();
  }

  const setup = async () => {


    // 1. Start training plan
    await startTrainingPlan1();

    // 2. Fetch & Save Activity / Laps then save it to DB
    await fetchActivityAndLaps();

    // 3. Get Pace Recommendations
    await fetchPaceRecommendations();

    // 4. Calculate overall price (AveragePaces)
    await calculateOverallPace(localStorage.getItem("userId"));
  }

  const handleOpenDialog = () => setOpenDialog(true);

  const handleCloseDialog = () => setOpenDialog(false);

  const handleHeaderMenuAction = (action) => {
    switch (action) {
      case 'addRunnerDetails':
        handleOpenDialog();
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
          <Header user={user} firstname={user.firstname} onMenuItemClick={handleHeaderMenuAction} onTrainingDialogOpen={handleTrainingDialogOpen} />
        </Paper>
      )}

      <DataInfo averagePaces={averagePaces} recommendedPaceNextRun={recommendedPaceNextRun} currentDayIndex={currentDayIndex} setCurrentDayIndex={setCurrentDayIndex}
        startingPace={startingPace} corePace={corePace} finishingPace={finishingPace} getImageUrlForActivity={getImageUrlForActivity}
        nextRunPaces={nextRunPaces} openDialog={openDialog} handleCloseDialog={handleCloseDialog} start={start}
        setup={setup} handleUpdateLastRun={handleUpdateLastRun} handleTriggerButtonClick={handleTriggerButtonClick}
        loading={loading} trainingPlan={trainingPlan} openTrainingDialog={openTrainingDialog} onCloseTrainingDialog={handleTrainingDialogClose} />
      <Footer />
    </>
  );

};
//from here
export default Plan;