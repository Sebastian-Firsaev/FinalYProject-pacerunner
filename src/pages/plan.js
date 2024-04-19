import React, { useEffect, useState } from 'react';
import { Box, Button, CircularProgress, Paper, Dialog, DialogTitle, DialogContent, Typography } from '@mui/material';
import StravaApi from '../service/strava_api';
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref, onValue, update, set, get} from 'firebase/database';
import Header from '../components/header';
import Footer from '../components/footer';
import { generatePace } from '../utils/generatePace';
import compareAndStoreNextRunPaces from '../utils/nextPace';
import getPaceRecommendations from '../utils/PaceRecommendation';
import calculateOverallPace from '../utils/calculateAndSaveRecommendedPaces';
import getactivityRecommendations from '../utils/getactivityRecommendations';
import ErrorToast from '../components/error_toast';
import DataInfo from '../components/data_info';
import {quotes} from '../constants/constant';
import roadImage from '../constants/road.png';
import longroad from '../constants/longroad.png';
import restroad from '../constants/restroad.png';
import temporoad from '../constants/temporaod.png';
import crossroad from '../constants/crossroad.png';
import runrun from '../constants/runrun.png';

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
  const [randomQuote, setRandomQuote] = useState(''); 
  const [feedbackMessage, setFeedbackMessage] = useState("");
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

  const fetchRandomQuote = async () => {
    const userId = localStorage.getItem("userId");
    const db = getDatabase();
    const quotesRef = ref(db, `users/${userId}/motivationalQuotes`);
  
    onValue(quotesRef, (snapshot) => {
      const quotesData = snapshot.val();
      if (quotesData) {  
        const allQuotes = Object.values(quotesData);
        if (allQuotes.length > 0) { 
          const randomIndex = Math.floor(Math.random() * allQuotes.length);
          setRandomQuote(allQuotes[randomIndex]);
        } else {
          console.log("No quotes available");
          setRandomQuote("No motivational quotes available at the moment.");
        }
      } else {
        console.log("No quotes found in database.");
        setRandomQuote("No motivational quotes available at the moment.");
      }
    }, { onlyOnce: true });
  };

  useEffect(() => {
    fetchRandomQuote();  
    const userId = localStorage.getItem("userId");

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

    if (userId) {
      fetchAveragePaces();
    } else {
   //   navigate('/');
    }
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



  // Helper function to convert meters to miles
  const metersToMiles = (meters) => {
    const miles = meters * 0.000621371;
    return parseFloat(miles.toFixed(2)); // Round to 2 decimal places for precision
  };
  
  const giveFeedbackOnActivityDistance = async (userId, currentDayIndex, db) => {
    // Calculate which week and day to access based on the currentDayIndex
    const weekIndex = Math.floor(currentDayIndex / 7);
    const dayIndex = currentDayIndex % 7;
  
    const trainingPlanRef = ref(db, `users/${userId}/trainingPlan/${weekIndex}/days/${dayIndex}`);
    const activityRef = ref(db, `users/${userId}/activity/activity`);
    
    // Fetch training plan for the current day
    const trainingPlanSnapshot = await get(trainingPlanRef);
    const trainingPlanDay = trainingPlanSnapshot.val();
    const plannedDistanceMiles = parseFloat(trainingPlanDay.distance);
  
    // Fetch latest activity
    const activitySnapshot = await get(activityRef);
    const latestActivity = activitySnapshot.val();
    const activityDistanceMiles = metersToMiles(latestActivity.distance);
  
    // Define thresholds
    const thresholds = {
      aBitLess: 0.25, // miles
      moderateLess: 0.75, // miles
      hugeLess: 1.5, // miles
      onTarget: 0.1, // miles
      aBitMore: 0.25, // miles
      aLotMore: 0.75, // miles
      tooMuch: 1.5, // miles
    };
  
    // Calculate the difference
    const difference = activityDistanceMiles - plannedDistanceMiles;
  
    // Determine feedback based on the difference and thresholds
    let feedback;
    if (Math.abs(difference) <= thresholds.onTarget) {
      feedback = `Well done! You ran ${activityDistanceMiles} miles vs the planned ${plannedDistanceMiles} miles! Keep up the good work!`;
    } else if (difference === activityDistanceMiles) {
      feedback = "Have a good rest! enjoy your day!";
    } else if (difference < -thresholds.hugeLess) {
      feedback = `Well done! You ran ${activityDistanceMiles} miles vs the planned ${plannedDistanceMiles} miles! It seems you're quite far off from today's goal. Let's try to stick closer to the plan tomorrow.`;
    } else if (difference < -thresholds.moderateLess) {
      feedback = `Well done! You ran ${activityDistanceMiles} miles vs the planned ${plannedDistanceMiles} miles! You're getting there! Try to match the plan next time.`;
    } else if (difference < -thresholds.aBitLess) {
      feedback = `Well done! You ran ${activityDistanceMiles} miles vs the planned ${plannedDistanceMiles} miles! You ran just a bit short today, try to push a little more next time!`;
    } else if (difference > thresholds.tooMuch) {
      feedback = `Well done! You ran ${activityDistanceMiles} miles vs the planned ${plannedDistanceMiles} miles! You've exceeded today's goal by a lot. It's great to see your enthusiasm, but be careful not to overdo it!`;
    } else if (difference > thresholds.aLotMore) {
      feedback = `Well done! You ran ${activityDistanceMiles} miles vs the planned ${plannedDistanceMiles} miles! You've exceeded today's goal by a lot. It's great to see your enthusiasm, but be careful not to overdo it.`;
    } else {
      feedback = `Well done! You ran ${activityDistanceMiles} miles vs the planned ${plannedDistanceMiles} miles! Great effort! But remember, sticking to the plan is key to avoid overtraining.`;
    }
  
    return feedback;
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
          // 7. Give feedback based on the activity distance compared to planned distance
          const db = getDatabase();
          const feedback = await giveFeedbackOnActivityDistance(userId, currentDayIndex, db);
          setFeedbackMessage(feedback); 

      console.log('Update Last Run operations and latest activity paces fetched successfully.');
    } catch (error) {
      console.error('Failed to update last run and fetch latest activity paces:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestOrCross = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      // 1. Update the current day 
      await updateCurrentDay();

      // 7. Give feedback based on the activity distance compared to planned distance
      const db = getDatabase();
      const feedback = await giveFeedbackOnActivityDistance(userId, currentDayIndex, db);
      setFeedbackMessage(feedback); 

      console.log('rest or cross completed successfully.');
    } catch (error) {
      console.error('Failed to update day', error);
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
  const decrementTrainingDay = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      const userRef = ref(getDatabase(), `users/${userId}`);
      
      // Fetch the current day index from Firebase
      const snapshot = await get(userRef);
      let currentDayIndex = snapshot.val().currentDayIndex;
      
      // Decrement the day index by 1, but not below 0
      currentDayIndex = Math.max(currentDayIndex - 1, 0);
  
      // Update the currentDayIndex in Firebase
      await update(userRef, { currentDayIndex });
  
      console.log(`Training day has been decremented to day ${currentDayIndex + 1}.`);
    } catch (error) {
      console.error("Error decrementing the training day:", error);
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

  const getImageUrlForActivity = (activity) => {
    if (activity.includes('easy run')) {
      return roadImage; // this will be the image for an easy run
    } else if (activity.includes('long run')) {
      return longroad; // this will be the image for a long run
    } else if (activity === 'Rest') {
      return restroad; // this will be the image for a rest day
  } else if (activity.includes('Cross')) {
    return crossroad; 
  } else if (activity.includes('Half Marathon')) {
    return runrun; 
  } else if (activity.includes('Marathon')) {
    return temporoad; 

  }
    return roadImage; // default image if activity doesn't match any conditions
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
  const addQuotesToDatabase = async () => {
    const db = getDatabase();
    const userId = localStorage.getItem("userId");
    const quotesRef = ref(db, `users/${userId}/motivationalQuotes`);
    await set(quotesRef, quotes);
  };

  
  const setup = async () => {

    await addQuotesToDatabase();
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
        case 'decrementTrainingDay':
          decrementTrainingDay();
        break;
        case 'setup':
          setup();
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
        setup={setup} handleUpdateLastRun={handleUpdateLastRun} handleTriggerButtonClick={handleTriggerButtonClick} handleRestOrCross={handleRestOrCross }
        loading={loading} trainingPlan={trainingPlan} openTrainingDialog={openTrainingDialog} onCloseTrainingDialog={handleTrainingDialogClose} 
        randomQuote={randomQuote} feedbackMessage={feedbackMessage} />
      <Footer />
    </>
  );

};
export default Plan;

//////from here