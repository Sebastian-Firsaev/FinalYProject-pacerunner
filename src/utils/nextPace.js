import { getDatabase, ref, get, set } from 'firebase/database';

const compareAndStoreNextRunPaces = async (userId) => {
    try {
        const db = getDatabase();
        const userRef = ref(db, `users/${userId}`);
        const userSnapshot = await get(userRef);
        const userData = userSnapshot.val() || {};

        // Extracting relevant data from user's record
        const { AveragePaces, activity, lastUpdate, consecutiveSlowerPaces = 0 } = userData;
        const paceRecommendations = activity?.paceRecommendations;

        if (!AveragePaces || !paceRecommendations) {
            console.error("Failed to fetch pace data from Firebase.");
            return;
        }

        // Update is allowed only if last update was more than a week ago or if there was no update before
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const canUpdatePace = !lastUpdate || new Date(lastUpdate) <= oneWeekAgo;

        const nextRunPaces = {};
        let shouldUpdate = false;
        let newConsecutiveSlowerPaces = consecutiveSlowerPaces;

        ['Starting', 'Core', 'Finishing'].forEach((paceType) => {
            const averagePace = AveragePaces[`average${paceType}Pace`];
            const recommendationPace = paceRecommendations[`${paceType.toLowerCase()}Pace`];

            if (!averagePace || !recommendationPace) return;

            const averagePaceSeconds = paceStringToSeconds(averagePace);
            const recommendationPaceSeconds = paceStringToSeconds(recommendationPace);
            const difference = recommendationPaceSeconds - averagePaceSeconds;

            // Conditions for increasing pace
            if (difference >= 5 && canUpdatePace) {
                nextRunPaces[`${paceType.toLowerCase()}Pace`] = recommendationPace;
                shouldUpdate = true;
                newConsecutiveSlowerPaces = 0; // Reset slower paces counter
            } 
            // Conditions for decreasing pace
            else if (difference <= -5) {
                newConsecutiveSlowerPaces += 1;
                if (newConsecutiveSlowerPaces >= 2 && canUpdatePace) { // Decrease pace if slower twice consecutively
                    nextRunPaces[`${paceType.toLowerCase()}Pace`] = recommendationPace;
                    shouldUpdate = true;
                    newConsecutiveSlowerPaces = 0; // Reset slower paces counter
                }
            }
        });

        // Update Firebase if there's a change in pace
        if (shouldUpdate) {
            await set(ref(db, `users/${userId}/NextRun`), nextRunPaces);
            await set(ref(db, `users/${userId}`), {
                ...userData,
                lastUpdate: new Date().toISOString(),
                consecutiveSlowerPaces: newConsecutiveSlowerPaces,
            });
            console.log("Next run paces updated:", nextRunPaces);
        } else if (consecutiveSlowerPaces !== newConsecutiveSlowerPaces) {
            // Update only the consecutiveSlowerPaces count if no pace was updated
            await set(ref(db, `users/${userId}/consecutiveSlowerPaces`), newConsecutiveSlowerPaces);
        }
    } catch (error) {
        console.error("Error in compareAndStoreNextRunPaces:", error);
    }
};

const paceStringToSeconds = (paceString) => {
    const [minutes, seconds] = paceString.replace(/ per mile$/, "").split(":").map(Number);
    return minutes * 60 + seconds;
};

const secondsToPaceString = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds} per mile`;
};

export default compareAndStoreNextRunPaces;
