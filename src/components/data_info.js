import React from 'react';
import { Box, Paper, Typography, Dialog, DialogTitle, DialogContent } from '@mui/material';
import SwipeableViews from 'react-swipeable-views';
import UserHealthForm from '../pages/UserHealthForm';
import TrainingCalendar from './training_plan';
import HoverableButtons from './hoverable_buttons';

const DataInfo = ({
  averagePaces, 
  recommendedPaceNextRun, 
  startingPace, 
  currentDayIndex, 
  setCurrentDayIndex, 
  getImageUrlForActivity, 
  corePace, 
  finishingPace, 
  nextRunPaces, 
  openDialog, 
  handleCloseDialog, 
  start, 
  setup, 
  handleUpdateLastRun, 
  handleTriggerButtonClick, 
  loading, 
  openTrainingDialog, 
  onCloseTrainingDialog, 
  trainingPlan 
}) => {
const paperStyle = {
  padding: '20px',
  width: '80%',
  marginBottom: '20px',
  backgroundColor: 'orange',
  color: 'white',
  borderRadius: '20px',
  // Updated boxShadow for a more 3D look
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2), 0 6px 20px rgba(0, 0, 0, 0.19)',
  textAlign: 'center',
  transition: 'transform 0.3s ease-in-out, boxShadow 0.3s ease-in-out',
  // Hover styles
  ':hover': {
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3), 0 12px 24px rgba(0, 0, 0, 0.25)', // More pronounced shadow on hover
    transform: 'translateY(-4px) scale(1.02)', // Slightly lift and scale the box
  },
};

  const digitalTextStyle = {
    fontFamily: '"Lucida Console", "Monaco", monospace', // Digital-looking font
    textShadow: '0 0 5px #FFA500', // Orange glow effect
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" marginBottom={2} width="100%">
      <Paper className="average-paces-box" sx={{ ...paperStyle }}>
        <Typography variant="h5" sx={{ ...digitalTextStyle }}>Your Standard Pace:</Typography>
        <Typography sx={{ ...digitalTextStyle }}>Starting Pace: {averagePaces.startingPace}</Typography>
        <Typography sx={{ ...digitalTextStyle }}>Core Pace: {averagePaces.corePace}</Typography>
        <Typography sx={{ ...digitalTextStyle }}>Finishing Pace: {averagePaces.finishingPace}</Typography>
      </Paper>



      {Object.keys(trainingPlan).length > 0 && (
        <Box display="flex" justifyContent="center" width="100%">
          <Paper elevation={3} sx={{ ...paperStyle, overflow: 'hidden', padding: '20px 0' }}>
            <SwipeableViews
              index={currentDayIndex}
              onChangeIndex={(index) => setCurrentDayIndex(index)}
              enableMouseEvents
            >
              {Object.keys(trainingPlan).map((week, weekIndex) =>
                trainingPlan[week].days ? trainingPlan[week].days.map((day, dayIndex) => (
                  <Box key={`${weekIndex}-${dayIndex}`} p={2} textAlign="center">
                    <Typography variant="h6" sx={{ ...digitalTextStyle }}>Week: {weekIndex + 1} Day: {dayIndex + 1}</Typography>
                    <Typography sx={{ ...digitalTextStyle }}>Activity: {day.activity}</Typography>
                    <Typography sx={{ ...digitalTextStyle }}>Pace: {day.pace} per mile</Typography>
                    <img src={getImageUrlForActivity(day.activity)} alt="Activity" style={{ maxWidth: '100%', height: 'auto', borderRadius: '10px' }} />
                  </Box>
                )) : null
              )}
            </SwipeableViews>
          </Paper>
        </Box>
      )}
      <Paper className="pace-recommendations-box" sx={{ ...paperStyle }}>
        <Typography variant="h5" sx={{ ...digitalTextStyle }}>You Ran at:</Typography>
        <Typography sx={{ ...digitalTextStyle }}>Starting Pace: {startingPace}</Typography>
        <Typography sx={{ ...digitalTextStyle }}>Core Pace: {corePace}</Typography>
        <Typography sx={{ ...digitalTextStyle }}>Finishing Pace: {finishingPace}</Typography>
      </Paper>

      <Paper className="next-run-paces-box" sx={{ ...paperStyle }}>
        <Typography variant="h5" sx={{ ...digitalTextStyle }}>Next Run Paces:</Typography>
        <Typography sx={{ ...digitalTextStyle }}>Starting Pace: {nextRunPaces.startingPace}</Typography>
        <Typography sx={{ ...digitalTextStyle }}>Core Pace: {nextRunPaces.corePace}</Typography>
        <Typography sx={{ ...digitalTextStyle }}>Finishing Pace: {nextRunPaces.finishingPace}</Typography>
      </Paper>
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Add Runner Details</DialogTitle>
        <DialogContent>
          <UserHealthForm />
        </DialogContent>
      </Dialog>

      <Dialog open={openTrainingDialog} onClose={onCloseTrainingDialog} >
        <DialogTitle>Training Calendar</DialogTitle>
        <DialogContent sx={{ backgroundColor: 'orange', color: 'white' }}>
          <TrainingCalendar trainingPlan={trainingPlan} />
        </DialogContent>
      </Dialog>

      <HoverableButtons
        start={start}
        setup={setup}
        handleUpdateLastRun={handleUpdateLastRun}
        handleTriggerButtonClick={handleTriggerButtonClick}
        loading={loading}
      />
    </Box>
  );
};

export default DataInfo;
