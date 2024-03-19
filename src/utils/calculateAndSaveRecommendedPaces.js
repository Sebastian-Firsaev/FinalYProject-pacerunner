import { getDatabase, ref, set, onValue } from 'firebase/database';

// Helper function to convert pace string to minutes as a decimal
const paceStringToMinutes = (paceString) => {
  if (!paceString || typeof paceString !== 'string' || paceString.trim() === '') {
    console.error('Invalid pace string:', paceString);
    return 0;
  }

  const timeMatch = paceString.match(/(\d+):(\d+)/);
  if (!timeMatch) {
    console.error('Pace string in incorrect format:', paceString);
    return 0;
  }

  const [_, minutes, seconds] = timeMatch.map(Number);
  if (seconds >= 60) {
    console.error('Invalid seconds in pace string:', seconds);
    return 0;
  }

  return minutes + seconds / 60;
};

// Function to convert minutes back to pace string format
const minutesToPaceString = (minutesDecimal) => {
  const minutes = Math.floor(minutesDecimal);
  const seconds = Math.round((minutesDecimal - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')} per mile`;
};

const calculateOverallPace = async (userId) => {
  try {
    const db = getDatabase();
    const activitiesRef = ref(db, `users/${userId}/activities`); // Adjust path as needed

    onValue(activitiesRef, async (snapshot) => {
      const activities = snapshot.val();
      if (!activities) {
        console.log('No activities found.');
        return;
      }

      let totalStartingPace = 0;
      let totalCorePace = 0;
      let totalFinishingPace = 0;
      let count = 0;

      Object.values(activities).forEach((activity) => {
        const paceRec = activity.paceRecommendations;
        if (paceRec && paceRec.corePace && paceRec.finishingPace && paceRec.startingPace) {
          console.log(`Processing pace recommendation: Starting=${paceRec.startingPace}, Core=${paceRec.corePace}, Finishing=${paceRec.finishingPace}`);

          const startingPace = paceStringToMinutes(paceRec.startingPace.split(' ')[0]);
          const corePace = paceStringToMinutes(paceRec.corePace.split(' ')[0]);
          const finishingPace = paceStringToMinutes(paceRec.finishingPace.split(' ')[0]);

          totalStartingPace += startingPace;
          totalCorePace += corePace;
          totalFinishingPace += finishingPace;
          count++;
        } else {
          console.error('One or more pace recommendations are missing or incomplete:', paceRec);
        }
      });

      if (count > 0) {
        const averageStartingPace = minutesToPaceString(totalStartingPace / count);
        const averageCorePace = minutesToPaceString(totalCorePace / count);
        const averageFinishingPace = minutesToPaceString(totalFinishingPace / count);

        console.log(`Averages: Starting=${averageStartingPace}, Core=${averageCorePace}, Finishing=${averageFinishingPace}`);

        const averages = {
          averageStartingPace,
          averageCorePace,
          averageFinishingPace,
        };

        const averagesRef = ref(db, `users/${userId}/AveragePaces`);
        await set(averagesRef, averages);

        console.log("Average paces calculated and saved to the database:", averages);
      } else {
        console.log('No valid pace recommendations found to calculate averages.');
      }
    }, { onlyOnce: true });
  } catch (error) {
    console.error("Error in calculateOverallPace:", error);
  }
};

export default calculateOverallPace;
