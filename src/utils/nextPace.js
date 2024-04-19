import { getDatabase, ref, get, update } from 'firebase/database';

// Convert pace string to seconds
const paceStringToSeconds = (paceString) => {
  const [minutes, seconds] = paceString.split(':').map(Number);
  return minutes * 60 + seconds;
};

// Convert seconds back to pace string
const secondsToPaceString = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Calculate average values from activities
const calculateAveragesFromActivities = (activities) => {
  const totals = {
    cadence: 0,
    heartRate: 0,
    speed: 0,
    elevationGain: 0,
    count: 0
  };

  Object.values(activities).forEach((activity) => {
    totals.cadence += activity.average_cadence || 0;
    totals.heartRate += activity.average_heart_rate || 0;
    totals.speed += activity.average_speed || 0;
    totals.elevationGain += activity.total_elevation_gain || 0;
    totals.count += 1;
  });

  return {
    averageCadence: totals.cadence / totals.count,
    averageHeartRate: totals.heartRate / totals.count,
    averageSpeed: totals.speed / totals.count,
    averageElevationGain: totals.elevationGain / totals.count,
  };
};

// Update next run paces
const updateNextRunPaces = async (userId) => {
  const db = getDatabase();
  const userRef = ref(db, `users/${userId}`);
  const snapshot = await get(userRef);
  const userData = snapshot.val();

  // Check if user data exists
  if (!userData) {
    console.error('User data not found');
    return;
  }

  // Destructure necessary data from user data
  const { AveragePaces, activities, activity, healthInfo } = userData;

  // Calculate average heart rate threshold based on age
  const age = healthInfo && healthInfo.age ? parseInt(healthInfo.age, 10) : 50; // Default age to 50 if not provided
  const maxHeartRate = 220 - age; // Basic formula to calculate max heart rate
  const heartRateThreshold = maxHeartRate * 0.75; // Target 75% of max heart rate

  // Ensure we have necessary data to continue
  if (!AveragePaces || !activities || !activity) {
    console.error('Necessary data not found');
    return;
  }

  // Only proceed if it's been at least 7 days since last pace increase
  const currentDayIndex = parseInt(activity.currentDayIndex, 10);
  if (currentDayIndex % 7 !== 0) {
    console.log('Pace update not due');
    return;
  }

  // Calculate new paces
  const averages = calculateAveragesFromActivities(activities);
  const adjustmentFactor = averages.averageHeartRate > heartRateThreshold ? 0 : 5; // Only increase if below threshold

  const updatedPaces = {};
  ['core', 'finishing', 'starting'].forEach((paceType) => {
    const paceKey = `average${paceType.charAt(0).toUpperCase()}${paceType.slice(1)}Pace`;
    const currentPace = paceStringToSeconds(AveragePaces[paceKey]);
    const newPace = currentPace - adjustmentFactor; // Decrease seconds to increase pace
    updatedPaces[paceKey] = secondsToPaceString(newPace);
  });

  // Update database with new paces
  await update(ref(db, `users/${userId}/AveragePaces`), updatedPaces);
  console.log('Average paces updated successfully', updatedPaces);
};

export default updateNextRunPaces;
