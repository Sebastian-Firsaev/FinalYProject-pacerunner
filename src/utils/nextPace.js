import { getDatabase, ref, get, update } from 'firebase/database';

const paceStringToSeconds = (paceString) => {
  if (typeof paceString !== 'string') {
    console.error(`Invalid paceString: ${paceString}`);
    return null; // Return null for invalid input
  }
  const [minutes, seconds] = paceString.replace(/ per mile$/, '').split(':').map(Number);
  return minutes * 60 + seconds;
};

const secondsToPaceString = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')} per mile`;
};

const calculateAveragesFromActivities = (activities) => {
    const totals = {
      cadence: 0,
      heartRate: 0,
      speed: 0,
      elevationGain: 0,
      count: 0
    };
  
    // Using Object.values to convert the activities object into an array of activities
    Object.values(activities).forEach((activity) => {
      totals.cadence += activity.average_cadence || 0;
      totals.heartRate += activity.average_heart_rate || 0;
      totals.speed += activity.average_speed || 0;
      totals.elevationGain += activity.total_elevation_gain || 0;
      totals.count += 1;
    });
  
    return {
      averageCadence: totals.count > 0 ? totals.cadence / totals.count : 0,
      averageHeartRate: totals.count > 0 ? totals.heartRate / totals.count : 0,
      averageSpeed: totals.count > 0 ? totals.speed / totals.count : 0,
      averageElevationGain: totals.count > 0 ? totals.elevationGain / totals.count : 0,
    };
  };
const updateNextRunPaces = async (userId) => {
  try {
    const db = getDatabase();
    const userRef = ref(db, `users/${userId}`);
    const snapshot = await get(userRef);
    const userData = snapshot.val();

    if (!userData) {
      console.error("User data not found");
      return;
    }

    const { AveragePaces, activities } = userData;
    const paceRecommendations = userData?.activity?.paceRecommendations;

    if (!AveragePaces || !paceRecommendations) {
      console.error("Pace data not found");
      return;
    }

    const averagesFromActivities = calculateAveragesFromActivities(activities);
    
    const isFaster = Object.entries(paceRecommendations).every(([paceType, recPace]) => {
      const recPaceSeconds = paceStringToSeconds(recPace);
      const avgPace = AveragePaces[`average${paceType.charAt(0).toUpperCase() + paceType.slice(1)}Pace`];
      if (recPaceSeconds === null || !avgPace) {
        return false; // Skip comparison if data is missing or invalid
      }
      const avgPaceSeconds = paceStringToSeconds(avgPace);
      return recPaceSeconds < avgPaceSeconds;
    });

    if (isFaster !== null) {
      // Factor in additional metrics from activities to decide on adjustments
      const adjustmentFactor = (averagesFromActivities.averageHeartRate > 160) ? 0 : isFaster ? 5 : -5;

      const updatedNextRun = {};
      ['core', 'finishing', 'starting'].forEach((paceType) => {
        const paceKey = `average${paceType.charAt(0).toUpperCase() + paceType.slice(1)}Pace`;
        const avgPace = AveragePaces[paceKey];
        if (avgPace) {
          const paceInSeconds = paceStringToSeconds(avgPace);
          // Adjust pace based on heart rate and speed averages
          const adjustedPaceInSeconds = paceInSeconds + adjustmentFactor;
          updatedNextRun[`${paceType}Pace`] = secondsToPaceString(adjustedPaceInSeconds); // Correct key naming
        }
      });

      await update(ref(db, `users/${userId}/NextRun`), updatedNextRun);
      console.log("NextRun paces updated successfully", updatedNextRun);
    } else {
      console.log("Pace comparison was not performed due to invalid data.");
    }
  } catch (error) {
    console.error("Failed to update NextRun paces", error);
  }
};

export default updateNextRunPaces;
