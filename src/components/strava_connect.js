import React from 'react';
import { Button } from '@mui/material';

const StravaConnect = () => {
  const handleStravaConnect = () => {
    const clientId = process.env.REACT_APP_CLIENT_ID;
    const redirectUri = process.env.REACT_APP_REDIRECT_URL;
    const stravaAuthUrl = `http://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&approval_prompt=force&scope=activity:read_all`;
    window.location.href = stravaAuthUrl;
  };

  return (
    <Button variant="contained" color="primary" onClick={handleStravaConnect} className="connect-to-strava-button">
      <img src="strava_logo.png" alt="Strava Logo" />
      Connect to Strava
    </Button>
  );
  
  
};

export default StravaConnect;
