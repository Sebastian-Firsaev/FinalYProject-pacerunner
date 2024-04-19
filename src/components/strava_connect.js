import React from 'react';
import { Button } from '@mui/material';
import stravalogo from '../constants/strava_logo.png';

const StravaConnect = () => {
  const handleStravaConnect = () => {
    const clientId = process.env.REACT_APP_CLIENT_ID;
    const redirectUri = process.env.REACT_APP_REDIRECT_URL;
    const stravaAuthUrl = `http://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&approval_prompt=force&scope=activity:read_all`;
    window.location.href = stravaAuthUrl;
  };

  return (
    <Button variant="contained" color="primary" onClick={handleStravaConnect} className="connect-to-strava-button">
      <img src={stravalogo} alt="Strava Logo" style={{ marginRight: 8 }} />
      Connect to Strava
    </Button>
  );
};

export default StravaConnect;
