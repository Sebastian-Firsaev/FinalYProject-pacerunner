export const processStreamsPerMile = (streams) => {
    const mileSegments = [];
    const mile = 1609.34; // One mile in meters
    let lastMileIndex = 0;
    let currentMile = 0;

    streams.distance.forEach((distance, index) => {
        if (distance >= currentMile + mile || index === streams.distance.length - 1) {
            const mileSegment = calculateMetricsForSegment(streams, lastMileIndex, index);
            mileSegments.push(mileSegment);
            lastMileIndex = index;
            currentMile += mile;
        }
    });

    return mileSegments;
};

const calculateMetricsForSegment = (streams, startIndex, endIndex) => {
    const pace = streams.pace.slice(startIndex, endIndex + 1).reduce((a, b) => a + b, 0) / (endIndex - startIndex + 1);
    const heartRate = streams.heartrate.slice(startIndex, endIndex + 1).reduce((a, b) => a + b, 0) / (endIndex - startIndex + 1);
    const elevation = streams.altitude[endIndex] - streams.altitude[startIndex];

    return {
        pace: pace, // Pace is already in minutes per mile
        heartRate: heartRate,
        elevation: elevation
    };
};