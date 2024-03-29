export function generatePace(age, restingHeartRate) {
    
    const HRrest = restingHeartRate > 0 ? restingHeartRate : 60;

    // Max Heart Rate
    const MHR = 220 - age;

    // VO2 Max
    const vo2Max = 15 * (MHR / HRrest);

    // Convert VO2 Max to a running pace (minutes per kilometer)
    // common rough estimate is that each VO2 Max point equals about 1 minute per mile.
    
    const runningPacePerMile = 1 * (60 - vo2Max); 

    
    return runningPacePerMile.toFixed(2);
    
}

