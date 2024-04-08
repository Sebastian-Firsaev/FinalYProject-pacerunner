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

    const { AveragePaces, activity } = userData;
    const paceRecommendations = activity?.paceRecommendations;

    if (!AveragePaces || !paceRecommendations) {
      console.error("Pace data not found");
      return;
    }

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
      const adjustment = isFaster ? 5 : -5;

      const updatedNextRun = {};
      ['core', 'finishing', 'starting'].forEach((paceType) => {
        const paceKey = `average${paceType.charAt(0).toUpperCase() + paceType.slice(1)}Pace`;
        const avgPace = AveragePaces[paceKey];
        if (avgPace) {
          const paceInSeconds = paceStringToSeconds(avgPace);
          const adjustedPaceInSeconds = paceInSeconds + adjustment;
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
