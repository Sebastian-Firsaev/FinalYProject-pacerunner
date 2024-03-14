import axios from 'axios';
import TrainingPlan from './training_plan';
import ErrorToast from '../components/error_toast';
import { trainingPlan } from '../constants/constant';

const STRAVA_API_BASE_URL = 'https://www.strava.com/api/v3';

const StravaApi = {
  exchangeAuthorizationCode: async (clientId, clientSecret, code) => {
    try {
      const response = await axios.post(`${STRAVA_API_BASE_URL}/oauth/token`, {
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code',
      });

      localStorage.setItem("userId", response.data.athlete.id);
      localStorage.setItem("accessToken", response.data.access_token);
      TrainingPlan.addStravaInfoToDb(response.data.athlete.id, 
        {
          "refresh_token": response.data.refresh_token,
          "access_token": response.data.access_token,
          "id": response.data.athlete.id,
          "username": response.data.athlete.username,
          "firstname": response.data.athlete.firstname,
          "lastname": response.data.athlete.lastname,
      }
      )

      return response.data.access_token;
    } catch (error) {
      console.error('Error exchanging authorization code for access token:', error);
      ErrorToast(error);
      localStorage.removeItem("code");
    }
  },
  
   getLatestActivity : async (id, accessToken) => {
    try {
      const response = await axios.get(`${STRAVA_API_BASE_URL}/athlete/activities`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
  
      const stravaInfo = [
        { label: 'Distance', value: response.data[0]?.distance || 'N/A' },
        { label: 'Heart Rate', value: response.data[0]?.average_heartrate || 'N/A' },
        { label: 'Time', value: response.data[0]?.moving_time || 'N/A' },
        { label: 'Pace', value: response.data[0]?.average_speed || 'N/A' },
      ];

      await TrainingPlan.addActivityInfoToDb(response.data[0]?.athlete?.id || id, stravaInfo);
  
      return response.data[0];
    } catch (error) {
      console.error('Error fetching Strava activity:', error);
      throw error;
    }
  },
  getActivityLaps: async (activityId, accessToken) => {
    try {
      const response = await axios.get(`${STRAVA_API_BASE_URL}/activities/${activityId}/laps`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
  
      return response.data;
    } catch (error) {
      console.error('Error fetching activity laps:', error);
      throw error;
    }
  },

  getTrainingPlan : async (id) => {
    try {
      await TrainingPlan.modifyTrainingPlan(id, trainingPlan);
    } catch (error) {
      console.error('Error fetching Training Plan:', error);
      throw error;
    }
  }

  
};

export default StravaApi;
