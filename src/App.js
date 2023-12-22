import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [activityData, setActivityData] = useState(null);
  const [marathonPlan, setMarathonPlan] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [stravaCode, setStravaCode] = useState('');

  // Function to handle Strava authentication
  const handleStravaLogin = () => {
    const clientId = '115444';
    const redirectUri = 'http://localhost:3000/';

    // Redirect users to Strava's authorization endpoint
    window.location.href = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=read_all`;
  };

  // Fetch activity data after authentication
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      setStravaCode(code);
    }

    const fetchActivityData = async () => {
      if (stravaCode) {
        const clientId = '115444';
        const clientSecret = '8c937f4c16dc90b3945449d4cc5ede48857ce57e';
        const redirectUri = 'http://localhost:3000/';

        try {
          const response = await axios.post('https://www.strava.com/oauth/token', {
            client_id: clientId,
            client_secret: clientSecret,
            code: stravaCode,
            grant_type: 'authorization_code',
          });

          if (response.status === 200) {
            const data = response.data;
            const accessToken = data.access_token;

            // Fetch activities after getting access token
            const activitiesResponse = await axios.get('https://www.strava.com/api/v3/athlete/activities', {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
              params: {
                per_page: 1, // Retrieve only 1 activity (most recent)
              },
            });

            if (activitiesResponse.status === 200) {
              const activities = activitiesResponse.data;
              if (activities.length > 0) {
                // Retrieve data from the last activity
                const lastActivity = activities[0];
                setActivityData(lastActivity);
              }
            }
          } else {
            // Handle errors if needed
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    };

    fetchActivityData();
  }, [stravaCode]);

  // Simulated login function
  const handleLogin = (e) => {
    e.preventDefault();

    setLoggedIn(true);
  };

  // Function to display activity data
  const handleDisplayActivity = async () => {
    // Logic to display activity data from Strava
    try {
      // Fetch the latest activity data from Strava
      // Use a similar method as in useEffect for fetching activityData
      // Once fetched, update the activityData state
    } catch (error) {
      console.error('Error fetching activity data:', error);
    }
  };

  // Training plan sample
  useEffect(() => {
    const pfitzingerPlan = [
      'Day 1: Rest',
      'Day 2: Pace run 2.5 miles',
      'Day 3: Training run 3 miles',
      'Day 4: Rest ',
      'Day 5: Training run 3 miles',
      'Day 6: Training run 3 miles',
      'Day 7: Long Run 7 miles',
      'Day 8: 8 miles  at marathon pace',
      'Day 9: 8 miles  at marathon pace',
      'Day 10: 8 miles  at marathon pace',
      'Day 11 8 miles  at marathon pace',
    ];

    setMarathonPlan(pfitzingerPlan);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>PaceRunner</h1>
        <p>Training evolved</p>
      </header>
      <main className="App-content">
        {!loggedIn ? (
          <form className="login-form" onSubmit={handleLogin}>
            <h2>Login with Strava</h2>
            {!stravaCode ? (
              <button
                type="button"
                onClick={handleStravaLogin}
                className="connect-to-strava-button"
              >
                <img src="strava_logo.png" alt="Strava Logo" />
                Connect to Strava
              </button>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Enter Strava Code"
                  value={stravaCode}
                  onChange={(e) => setStravaCode(e.target.value)}
                  required
                  disabled
                />
                <button type="submit" className="login-button">
                  Login
                </button>
              </>
            )}
          </form>
        ) : (
          <>
            <section className="marathon-plan-container">
              <div className="marathon-plan">
                {marathonPlan.map((day, index) => (
                  <div
                    key={index}
                    className="marathon-plan-day-container"
                    style={{ '--index': index }}
                  >
                    <div className="marathon-plan-day">
                      <img src="road.png" alt="Road" className="road-image" />
                      <p>{day}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="display-activity">
              <button onClick={handleDisplayActivity} className="display-activity-button">
                Display Activity
              </button>
              {activityData && (
                <div className="activity-details">
                  <h2>Recent Activity Details</h2>
                  <div className="activity-info">
                    <p><strong>Name:</strong> {activityData.name}</p>
                    <p><strong>Type:</strong> {activityData.type}</p>
                    <p><strong>Distance:</strong> {activityData.distance}</p>
                    {/* Display other relevant activity details */}
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </main>
      <footer className="App-footer">
        <p>&copy; 2023 PaceRunner</p>
      </footer>
    </div>
  );
}

export default App;
