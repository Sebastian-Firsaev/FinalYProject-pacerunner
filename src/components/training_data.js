import React, { useState } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import SwipeableViews from 'react-swipeable-views';

const TrainingData = ({ trainingData, trainingPlan }) => {
  const [selectedDay, setSelectedDay] = useState(Object.keys(trainingPlan)[0]);

  const handleDayChange = (newDay) => {
    setSelectedDay(newDay);
  };

  return (
    <Paper elevation={3} style={{ padding: '16px', marginBottom: '20px', backgroundColor: 'orange', color: '#fff', maxWidth: '50%' }}>
      <Box display="flex" flexDirection="column" alignItems="center">
        <Box display="flex" justifyContent="space-between" width="100%">
          {Array.isArray(trainingData) && trainingData.map((dataItem, index) => (
            <DataItem key={index} {...dataItem} />
          ))}
        </Box>

        <Box mt={2} width="100%">
          <TrainingPlanContainer>
            <TrainingPlan trainingPlan={trainingPlan} selectedDay={selectedDay} onDayChange={handleDayChange} />
          </TrainingPlanContainer>
        </Box>
      </Box>
    </Paper>
  );
};

const DataItem = ({ icon, label, value }) => (
  <Box textAlign="center" flex="1">
    {icon}
    <Typography variant="subtitle2" color="textSecondary">
      {label}
    </Typography>
    <Typography variant="h6">{value}</Typography>
  </Box>
);

const TrainingPlanContainer = ({ children }) => (
  <Box display="flex" alignItems="center" justifyContent="center" height="100%">
    {children}
  </Box>
);

const TrainingPlan = ({ trainingPlan, selectedDay, onDayChange }) => {
  const defaultImageUrl = 'road.png';
  const days = Object.keys(trainingPlan);

  const handleNextDay = () => {
    const currentIndex = days.indexOf(selectedDay);
    const nextIndex = (currentIndex + 1) % days.length;
    onDayChange(days[nextIndex]);
  };

  const handlePreviousDay = () => {
    const currentIndex = days.indexOf(selectedDay);
    const previousIndex = (currentIndex - 1 + days.length) % days.length;
    onDayChange(days[previousIndex]);
  };

  const handleSwipeChangeIndex = (index) => {
    onDayChange(days[index]);
  };

  return (
    <SwipeableViews index={days.indexOf(selectedDay)} onChangeIndex={handleSwipeChangeIndex} style={{ width: '100%' }}>
      {days.map((day) => (
        <div key={day} style={{ minWidth: '400px', padding: '32px', display: 'inline-block', textAlign: 'center' }}>
          <Typography variant="h4" style={{ marginBottom: '16px' }}>{day}</Typography>
          <img src={defaultImageUrl} alt={`Default image for ${day}`} style={{ maxWidth: '100%', height: 'auto' }} />
          <Typography variant="h6" style={{ marginTop: '16px' }}>
            Activity: {trainingPlan[day].activity}
          </Typography>
          {trainingPlan[day].pace && (
            <Typography variant="h6" style={{ marginTop: '16px' }}>
              Pace: {trainingPlan[day].pace}
            </Typography>
          )}
        </div>
      ))}
    </SwipeableViews>
  );
};

export default TrainingData;