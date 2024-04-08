import React from 'react';
import { Container, Typography, Accordion, AccordionSummary, AccordionDetails, Grid, Paper, Box } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import roadImage from '../constants/road.png';

const TrainingCalendar = ({ trainingPlan }) => {
  const paperStyle = {
    padding: '20px',
    marginBottom: '20px',
    backgroundColor: 'orange',
    color: 'white'
  };

  if (!Array.isArray(trainingPlan)) {
    return null;
  }

  const getImageUrlForActivity = (activity) => {
    // return image URLs based on activity
    return roadImage;
  };

  return (
    <Container maxWidth="lg" style={{ marginTop: '20px' }}>
      <Typography variant="h3" align="center" gutterBottom>
        My Training Plan
      </Typography>
      {trainingPlan && trainingPlan.map((week, weekIndex) => (
        <Accordion key={weekIndex} sx={{ marginBottom: '20px' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h5">Week {week.week}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              {week.days.map((day, dayIndex) => (
                <Grid item xs={12} md={6} key={`${weekIndex}-${dayIndex}`}>
                  <Paper elevation={3} sx={{ ...paperStyle }}>
                    <Typography variant="h4" gutterBottom align='center'>
                      {day.activity === 'Rest' ? 'Rest Day' : `Day ${day.day}`}
                    </Typography>
                    <Typography align='center' variant='h5'>{day.activity}</Typography>
                    {day.pace && <Typography>Pace: {day.pace} per mile</Typography>}
                    <img src={getImageUrlForActivity(day.activity)} alt="Activity" style={{ maxWidth: '100%', height: 'auto' }} />
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
