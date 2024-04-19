import React, { useEffect, useState } from 'react';
import { Paper, Box, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import StravaConnect from '../components/strava_connect';
import Header from '../components/header';

const Home = () => {
  const [user, setUser] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const storedCode = localStorage.getItem('code');
    const userId = localStorage.getItem("userId");

    if(storedCode) {
      navigate('/plan');
    }

    if (storedUser) {
      setUser(storedUser);
      setAuthenticated(true);
      setLoading(false);
    } else {
      const unsubscribe = onAuthStateChanged(auth, (authUser) => {
        console.log(authUser)
        setUser(authUser);
        setAuthenticated(!!authUser);
        setLoading(false);
        localStorage.setItem('user', JSON.stringify(authUser));
      });

      return () => unsubscribe();
    }

  }, [navigate]);

  useEffect(() => {
    if (!authenticated && !loading) {
      navigate('/login');
    }
  }, [authenticated, loading, navigate]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        backgroundImage: 'linear-gradient(120deg, #89f7fe 0%, #66a6ff 100%)'
      }}
    >
      {user && (
        <Box>
          <Paper elevation={3} sx={{ padding: '16px', marginBottom: '20px', backgroundColor: 'orange' }}>
            <Header user={user} />
          </Paper>

          {authenticated && (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
              <Box mt={4}>
                <StravaConnect />
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Home;