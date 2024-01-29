import { getDatabase, ref, set } from 'firebase/database';
import SuccessToast from '../components/success_toast';
import ErrorToast from '../components/error_toast';

const TrainingPlan = {
  addStravaInfoToDb: async (userId, stravaData) => {
    try {
      const db = getDatabase();
      const userRef = ref(db, `users/${userId}/stravaData`);
      await set(userRef, stravaData);
      SuccessToast("Strava info has been updated successfully!");
    } catch (error) {
      console.log(error);
      ErrorToast(error);
    }
  },
  addActivityInfoToDb: async (userId, stravaData) => {
    try {
      const db = getDatabase();
      const userRef = ref(db, `users/${userId}/activity`);
      await set(userRef, stravaData);
      SuccessToast("Activity info has been updated successfully!");
    } catch (error) {
      console.log(error);
      ErrorToast(error);
    }
  },
  modifyTrainingPlan: async (userId, modifiedPlan) => {
    try {
      const db = getDatabase();
      const userRef = ref(db, `users/${userId}/trainingPlan`);
      await set(userRef, modifiedPlan);
      SuccessToast("Plan was updated!");
      console.log('Training plan modified and linked to the user successfully.');
    } catch (error) {
      console.error('Error modifying training plan:', error);
      throw error;
    }
  },
  
};

export default TrainingPlan;
