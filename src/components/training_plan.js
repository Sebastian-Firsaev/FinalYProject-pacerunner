import React from 'react';
import { Container, Typography, Accordion, AccordionSummary, AccordionDetails, Grid, Paper, useTheme } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import roadImage from '../constants/road.png';
import longroad from '../constants/longroad.png';
import restroad from '../constants/restroad.png';
import temporoad from '../constants/temporaod.png';
import runrun from '../constants/runrun.png';
import crossroad from '../constants/crossroad.png';
const TrainingCalendar = ({ trainingPlan }) => {
  const theme = useTheme();
  
  const paperStyle = {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(2.5),
    backgroundColor: 'orange',
    color: 'white',
    borderRadius: '20px',
    boxShadow: theme.shadows[3],
    textAlign: 'center',
    transition: 'transform 0.3s ease-in-out, boxShadow 0.3s ease-in-out',
    ':hover': {
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3), 0 12px 24px rgba(0, 0, 0, 0.25)',
      transform: 'translateY(-4px) scale(1.02)',
    },
  };

  const digitalTextStyle = {
    fontFamily: '"Lucida Console", "Monaco", monospace',
    textShadow: '0 0 5px #FFA500',
  };

  if (!Array.isArray(trainingPlan)) {
    return null;
  }

  const getImageUrlForActivity = (activity) => {
    if (activity.includes('easy run')) {
      return roadImage; // this will be the image for an easy run
    } else if (activity.includes('long run')) {
      return longroad; // this will be the image for a long run
    } else if (activity === 'Rest') {
      return restroad; // this will be the image for a rest day
  } else if (activity.includes('Cross')) {
    return crossroad; 
  } else if (activity.includes('Half Marathon')) {
    return runrun; 
  } else if (activity.includes('Marathon')) {
    return temporoad; 

  }
    return roadImage; // default image if activity doesn't match any conditions
  };

  return (
    <Container maxWidth="lg" sx={{ marginTop: theme.spacing(3) }}>
<Typography variant="h3" align="center" gutterBottom sx={{ ...digitalTextStyle, fontSize: '2.5rem' }}>
  My Training Plan
</Typography>
      {trainingPlan.map((week, weekIndex) => (
        <Accordion key={weekIndex} sx={{ marginBottom: theme.spacing(3), backgroundColor: 'rgba(255, 165, 0, 0.7)', color: 'white' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
            <Typography variant="h5" sx={digitalTextStyle}>Week {week.week}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              {week.days.map((day, dayIndex) => (
                <Grid item xs={12} md={6} key={`${weekIndex}-${dayIndex}`}>
                  <Paper elevation={3} sx={paperStyle}>
                    <Typography variant="h4" gutterBottom align='center' sx={digitalTextStyle}>
                      {day.activity === 'Rest' ? 'Rest Day' : `Day ${day.day}`}
                    </Typography>
                    <Typography align='center' variant='h5' sx={digitalTextStyle}>{day.activity}</Typography>
                    <Typography variant="h5" sx={{ ...digitalTextStyle }}>Distance: {day.distance} Miles </Typography>
                    <img src={getImageUrlForActivity(day.activity)} alt="Activity" style={{ maxWidth: '100%', height: 'auto', borderRadius: '20px' }} />
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
    </Container>
  );
};

export default TrainingCalendar;