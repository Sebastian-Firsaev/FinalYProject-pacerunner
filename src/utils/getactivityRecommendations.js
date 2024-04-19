import { getDatabase, ref, set, onValue } from 'firebase/database';

const average = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
const median = (arr) => {
  const sorted = arr.slice().sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

const formatPace = (pace) => {
  const minutes = Math.floor(pace);
  const seconds = Math.round((pace - minutes) * 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds} per mile`;
};

// Calculate pace from moving time and distance
const calculatePacePerLap = (movingTimeInSeconds, distanceInMeters) => {
  const movingTimeInMinutes = movingTimeInSeconds / 60;
  const distanceInMiles = distanceInMeters / 1609.34; // Convert meters to miles
  return movingTimeInMinutes / distanceInMiles; // Pace in minutes per mile
};

const getactivityRecommendations = async (userId) => {
  const db = getDatabase();
  // Adjust the path to point to a specific activity structure
  const lapsRef = ref(db, `users/${userId}/activity/laps`);

  return new Promise((resolve, reject) => {
    onValue(lapsRef, async (snapshot) => {
      const laps = snapshot.val();
      if (!laps) {
        reject(new Error('No lap data found.'));
        return;
      }

      // Calculate pace per lap using moving time and distance
      const pacePerLap = laps.map(lap => calculatePacePerLap(lap.moving_time, lap.distance));

      // Exclude the first 3 and last 3 laps for the corePace calculation
      const lapsForCorePace = pacePerLap.slice(3, -3);
      const corePace = lapsForCorePace.length > 0 ? median(lapsForCorePace) : median(pacePerLap); // Use median of all if exclusion results in empty

      const startingPace = average(pacePerLap.slice(0, 3)) * 0.99;
      const finishingPace = average(pacePerLap.slice(-3)) * 1.01;

      const paceRecommendations = {
        startingPace: formatPace(startingPace),
        corePace: formatPace(corePace),
        finishingPace: formatPace(finishingPace)
      };

      try {
        await savePaceRecommendations(userId, paceRecommendations);
        resolve(paceRecommendations);
      } catch (error) {
        reject(error);
      }
    }, { onlyOnce: true });
  });
};

const savePaceRecommendations = async (userId, paceRecommendations) => {
  const db = getDatabase();
  // Adjust the path to a general location for pace recommendations
  const paceRef = ref(db, `users/${userId}/activity/paceRecommendations`);

  await set(paceRef, paceRecommendations);
  console.log("Pace recommendations saved to DB:", paceRecommendations);
};

export default getactivityRecommendations;
