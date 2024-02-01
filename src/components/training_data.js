import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import {iconMapping } from '../constants/constant';

const TrainingData = ({ trainingData, recommendedPace }) => {
  return (
    <Paper elevation={3} style={{ padding: '16px', marginBottom: '20px', backgroundColor: 'orange', color: '#fff', maxWidth: '100%' }}>
      <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column">
        <Box display="flex" justifyContent="space-around" width="100%" mb={3}>
          {trainingData && trainingData.map((dataItem, index) => (
            <DataItem key={index} icon={iconMapping[dataItem.label]} label={dataItem.label} value={dataItem.value} />
          ))}
        </Box>
        {recommendedPace && (
          <Typography variant="h4" style={{ textAlign: 'center' }}>
            Recommended pace for run is {recommendedPace} per mile
          </Typography>
        )}
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

export default TrainingData;
