import { AccessTime, DirectionsRun, Favorite, Speed } from "@mui/icons-material";

export const trainingPlan = {
  Week1_Day1: { activity: '4.8 km run', pace: '1:00' },
  Week1_Day2: { activity: '8.1 km run', pace: '5:30' },
  Week1_Day3: { activity: '4.8 km run', pace: '5:30' },
  Week1_Day4: { activity: '3 x hill', pace: '5:30' },
  Week1_Day5: { activity: 'Rest', pace: '' },
  Week1_Day6: { activity: '8.1 km', pace: '5:30' },
  Week1_Day7: { activity: '16.1 long run', pace: '5:30' },
};

export const exampleTrainingPlan = {
  Day1: 'Walk 5 km',
  Day2: 'Run 1 km',
  Day3: 'Cardio',
  Day4: 'Relax',
  Day5: 'Walk 5km',
  Day6: 'Run 2km',
};

export const exampleTrainingData = [
  { label: 'Heart Rate', value: '120 bpm' },
  { label: 'Distance', value: '5 km' },
  { label: 'Time', value: '30 min' },
  { label: 'Pace', value: '6:00 min/km' },
];
export const iconMapping = {
  'Distance': <DirectionsRun />,
  'Heart Rate': <Favorite />,
  'Time': <AccessTime />,
  'Pace': <Speed />,
};