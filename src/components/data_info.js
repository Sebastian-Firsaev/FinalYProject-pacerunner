import React from 'react';
import { Box, Paper, Typography, Dialog, DialogTitle, DialogContent } from '@mui/material';
import SwipeableViews from 'react-swipeable-views';
import UserHealthForm from '../pages/UserHealthForm';
import TrainingCalendar from './training_plan';
import HoverableButtons from './hoverable_buttons';

const DataInfo = ({ averagePaces, recommendedPaceNextRun, startingPace, currentDayIndex, setCurrentDayIndex, getImageUrlForActivity, corePace, finishingPace, nextRunPaces, openDialog, handleCloseDialog, start, setup, handleUpdateLastRun, handleTriggerButtonClick, loading, openTrainingDialog, onCloseTrainingDialog, trainingPlan }) => {
  const paperStyle = {
    padding: '20px',
    marginBottom: '20px',
    backgroundColor: 'orange',
    color: 'white'
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="spaceBetween" marginBottom={2} width="100%">
      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems="spaceBetween" marginBottom={2} width="auto" sx={{ gap: '20px' }}>
        <Box width={{ xs: '100%', sm: 'auto' }} paddingRight={{ xs: 0, sm: 2 }} flexGrow={1}>
          {averagePaces.startingPace && averagePaces.corePace && averagePaces.finishingPace && (
            <Paper className="average-paces-box" sx={{ ...paperStyle, marginBottom: { xs: 2, sm: 0 } }}>
              <Typography variant="h5">Your Standard Pace:</Typography>
              <Typography>Starting Pace: {averagePaces.startingPace}</Typography>
              <Typography>Core Pace: {averagePaces.corePace}</Typography>
              <Typography>Finishing Pace: {averagePaces.finishingPace}</Typography>
            </Paper>
          )}

          {recommendedPaceNextRun && (
            <Paper className="recommended-pace-next-run-box" sx={{ ...paperStyle, marginBottom: { xs: 2, sm: 0 } }}>
              <Typography variant="h5">Recommended pace for next run: {recommendedPaceNextRun} per mile</Typography>
            </Paper>
          )}
        </Box>

        <Box width={{ xs: '100%', sm: 'auto' }} paddingLeft={{ xs: 0, sm: 2 }} flexGrow={1}>
          {startingPace && corePace && finishingPace && (
            <Paper className="pace-recommendations-box" sx={{ ...paperStyle, marginBottom: { xs: 2, sm: 0 } }}>
              <Typography variant="h5">You Ran at:</Typography>
              <Typography>Starting Pace: {startingPace}</Typography>
              <Typography>Core Pace: {corePace}</Typography>
              <Typography>Finishing Pace: {finishingPace}</Typography>
            </Paper>
          )}

          {nextRunPaces.startingPace && nextRunPaces.corePace && nextRunPaces.finishingPace && (
            <Paper className="next-run-paces-box" sx={{ ...paperStyle, marginBottom: { xs: 2, sm: 0 } }}>
              <Typography variant="h5">Next Run Paces:</Typography>
              <Typography>Starting Pace: {nextRunPaces.startingPace}</Typography>
              <Typography>Core Pace: {nextRunPaces.corePace}</Typography>
              <Typography>Finishing Pace: {nextRunPaces.finishingPace}</Typography>
            </Paper>
          )}
        </Box>
      </Box>


      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Add Runner Details</DialogTitle>
        <DialogContent>
          <UserHealthForm />
        </DialogContent>
      </Dialog>

      {Object.keys(trainingPlan).length > 0 && (
        <Box display="flex" justifyContent="center">
          <Paper elevation={3} sx={{ ...paperStyle, width: '80%', overflow: 'hidden', backgroundColor: 'orange' }}>
            <SwipeableViews
              index={currentDayIndex}
              onChangeIndex={(index) => setCurrentDayIndex(index)}
              enableMouseEvents
            >
              {Object.keys(trainingPlan).map((week, weekIndex) =>
                trainingPlan[week].days ? trainingPlan[week].days.map((day, dayIndex) => (
                  <Box key={`${weekIndex}-${dayIndex}`} p={2} textAlign="center">
                    <Typography variant="h6">Week: {weekIndex + 1} Day: {dayIndex + 1}</Typography>
                    <Typography>Activity: {day.activity}</Typography>
                    <Typography>Pace: {day.pace} per mile</Typography>
                    <img src={getImageUrlForActivity(day.activity)} alt="Activity" style={{ maxWidth: '100%', height: 'auto' }} />
                  </Box>
                )) : null
              )}
            </SwipeableViews>
          </Paper>
        </Box>
      )}


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
