import React, { useState } from 'react';
import { Box, Paper, Typography, Dialog, DialogTitle, DialogContent,styled  } from '@mui/material';
import SwipeableViews from 'react-swipeable-views';
import UserHealthForm from '../pages/UserHealthForm';
import TrainingCalendar from './training_plan';
import HoverableButtons from './hoverable_buttons';
import TouchAppIcon from '@mui/icons-material/TouchApp';


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
  randomQuote,
  trainingPlan, 
  feedbackMessage,
  handleRestOrCross 
}) => {
  const [showPaceDetails, setShowPaceDetails] = useState(false); // New state to manage visibility

  const paperStyle = {
    padding: '20px',
    width: '80%',
    marginBottom: '20px',
    backgroundColor: 'orange',
    color: 'white',
    borderRadius: '20px',
   
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2), 0 6px 20px rgba(0, 0, 0, 0.19)',
    textAlign: 'center',
    transition: 'transform 0.3s ease-in-out, boxShadow 0.3s ease-in-out',
  
    ':hover': {
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3), 0 12px 24px rgba(0, 0, 0, 0.25)', 
      transform: 'translateY(-4px) scale(1.02)', 
    },
  };
  const StyledDialogTitle = styled(DialogTitle)({
    backgroundColor: '#3f51b5', 
    color: 'white',
    padding: '20px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2), 0 6px 20px rgba(0, 0, 0, 0.19)',
    textAlign: 'center'
  });
  const digitalTextStyle = {
    fontFamily: '"Lucida Console", "Monaco", monospace', 
    textShadow: '0 0 5px #FFA500', 
  };
  const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
    backgroundColor: 'orange', 
    padding: theme.spacing(2), 
  }));

  return (
    <Box display="flex" flexDirection="column" alignItems="center" marginBottom={2} width="100%" >
      <Paper className="average-paces-box" sx={{ ...paperStyle }} onClick={() => setShowPaceDetails(!showPaceDetails)}>
      <Typography variant="h4" sx={{ ...digitalTextStyle, cursor: 'pointer' }}>
      Your Standard Pace
    <TouchAppIcon sx={{ marginLeft: 1 }} /> {/* Icon with a right margin */}
  </Typography>
        {showPaceDetails && (
          // Conditionally render the pace details
          <>
            <Typography variant="h6" sx={{ ...digitalTextStyle }}>Starting Pace: {averagePaces.startingPace}</Typography>
            <Typography variant="h6"sx={{ ...digitalTextStyle }}>Core Pace: {averagePaces.corePace}</Typography>
            <Typography variant="h6"sx={{ ...digitalTextStyle }}>Finishing Pace: {averagePaces.finishingPace}</Typography>
          </>
        )}
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
                    <Typography variant="h4" sx={{ ...digitalTextStyle }}>Week: {weekIndex + 1} Day: {dayIndex + 1}</Typography>
                    <Typography variant="h4" sx={{ ...digitalTextStyle }}>Activity: {day.activity}</Typography>
                    <Typography variant="h4" sx={{ ...digitalTextStyle }}>Distance: {day.distance} miles</Typography>
                    <img src={getImageUrlForActivity(day.activity)} alt="Activity" style={{ maxWidth: '100%', height: 'auto', borderRadius: '10px' }} />
                  </Box>
                )) : null
              )}
            </SwipeableViews>
          </Paper>
        </Box>
      )}
      <Paper className="pace-recommendations-box" sx={{ ...paperStyle }}>
        <Typography variant="h4" sx={{ ...digitalTextStyle }}>You Ran at:</Typography>
        <Typography variant="h6"sx={{ ...digitalTextStyle }}>Starting Pace: {startingPace}</Typography>
        <Typography variant="h6"sx={{ ...digitalTextStyle }}>Core Pace: {corePace}</Typography>
        <Typography variant="h6"sx={{ ...digitalTextStyle }}>Finishing Pace: {finishingPace}</Typography>
      </Paper>
      {feedbackMessage && (
        <Paper sx={{ ...paperStyle, margin: '20px 0' }}>
          <Typography variant="h6" sx={{ ...digitalTextStyle }}>
             {feedbackMessage}
          </Typography>
        </Paper>
      )}
      <Paper className="next-run-paces-box" sx={{ ...paperStyle }}>
        <Typography variant="h4" sx={{ ...digitalTextStyle }}>Next Run Paces:</Typography>
        <Typography variant="h6"sx={{ ...digitalTextStyle }}>Starting Pace: {nextRunPaces.startingPace}</Typography>
        <Typography variant="h6"sx={{ ...digitalTextStyle }}>Core Pace: {nextRunPaces.corePace}</Typography>
        <Typography variant="h6" sx={{ ...digitalTextStyle }}>Finishing Pace: {nextRunPaces.finishingPace}</Typography>
      </Paper>
      <Paper elevation={3} sx={{ ...paperStyle, marginTop: 'auto' }}> 
          <Typography variant="h6" sx={{ ...digitalTextStyle }}>{randomQuote}</Typography>
        </Paper>
        <Dialog
      open={openDialog}
      onClose={handleCloseDialog}
      PaperProps={{
        style: {
          backgroundColor: 'transparent', 
          boxShadow: 'none',
        }
      }}
    >
      <StyledDialogTitle>
        <Typography variant="h6" component="div" style={{ color: 'white' }}>Add Runner Details</Typography>
      </StyledDialogTitle>
      <StyledDialogContent>
        <UserHealthForm />
      </StyledDialogContent>
    </Dialog>

      <Dialog open={openTrainingDialog} onClose={onCloseTrainingDialog} >
      <StyledDialogTitle>Training Calendar</StyledDialogTitle>
        <DialogContent sx={{ backgroundColor: 'orange', color: 'white' }}>
          <TrainingCalendar trainingPlan={trainingPlan} />
        </DialogContent>
      </Dialog>

      <HoverableButtons
        start={start}
        setup={setup}
        handleUpdateLastRun={handleUpdateLastRun}
        handleRestOrCross={handleRestOrCross}
        handleTriggerButtonClick={handleTriggerButtonClick}
        loading={loading}
      />
<Paper className="average-paces-box" sx={{ ...paperStyle }} onClick={() => setShowPaceDetails(!showPaceDetails)}>
  <Typography variant="h5" sx={{ ...digitalTextStyle, cursor: 'pointer' }}>
  Information
    <TouchAppIcon sx={{ marginLeft: 1 }} /> {/* Icon with a right margin */}
  </Typography>
  {showPaceDetails && (
    <>
    <Typography variant="h6" sx={{ ...digitalTextStyle, fontWeight: 'bold' }}>
        First time set up
      </Typography>
      <Typography paragraph sx={{ ...digitalTextStyle }}>
        Go to <b>"options"</b> and press <b>"Setup"</b><br></br>
        Then go to <b>"Start and upload Runs"</b><br></br>
        Press <b>"Start"</b><br></br>
        You're all set!
      </Typography>
      <Typography variant="h6" sx={{ ...digitalTextStyle, fontWeight: 'bold' }}>
        Every day use
      </Typography>
      <Typography paragraph sx={{ ...digitalTextStyle }}>
        Then go to <b>"Start and upload Runs"</b><br></br>
        Press <b>"Upload last run"</b> to update your details from your latest activity<br></br>
        If the training activity ir Cross or Rest, enjoy your day or do some exercise!<br></br>
        The press <b>"Cross or rest"</b> to proceed to the next day.
      </Typography>
      <Typography variant="h6" sx={{ ...digitalTextStyle, fontWeight: 'bold' }}>
        Marathon Training Plan
      </Typography>
      <Typography variant="subtitle1" sx={{ ...digitalTextStyle, fontWeight: 'bold' }}>
        Source: <a href="http://halhigdon.com" target="_blank" rel="noopener noreferrer">halhigdon.com</a>
      </Typography>
      <Typography paragraph sx={{ ...digitalTextStyle }}>
        <b>Long Runs:</b> The essence of this running program lies in the weekend long runs, starting at 10 miles and peaking at 20 miles, with "stepback" weeks every third week to reduce mileage for recovery. The focus is on maintaining consistent, quality runs throughout the week rather than extending runs beyond 20 miles, which can lead to fatigue without additional benefits.
      </Typography>
      <Typography paragraph sx={{ ...digitalTextStyle }}>
        <b>Race Pace:</b> refers to the pace you aim to maintain in the race you're preparing for; for instance, if training for a 4:00 marathon, your race pace would be 9:09 per mile. In this program, you'll train at this pace during "pace" runs.
      </Typography>
      <Typography paragraph sx={{ ...digitalTextStyle }}>
        <b>Cross-Training:</b> scheduled for Mondays following Sunday long runs in intermediate training programs, involves alternative aerobic activities like swimming, cycling, or walking to engage different muscle groups and aid recovery. While sports like tennis or basketball might increase injury risk due to their sudden movements, cross-training can vary weekly and include combinations of exercises, lasting between 30 to 60 minutes to facilitate recovery after long runs.
      </Typography>
      <Typography paragraph sx={{ ...digitalTextStyle }}>
        <b>Rest:</b> is crucial in any training program, not only as a recovery tool but as a foundation for stronger performance. Scientists highlight that muscle regeneration and strengthening occur during rest periods—24 to 72 hours after intense exercise. Coaches echo that effective hard training, like long runs which are essential for improvement, requires being well-rested. In this intermediate program, Friday is designated as a rest day to prepare for the weekend's hard runs.
      </Typography>
    </>
  )}
</Paper>


    </Box>
    
  );
  
};

export default DataInfo;
