export const identifyTopPerformanceMiles = (mileSegments) => {
    // Example performance metric: lower pace (faster speed) is better
    const sortedMiles = mileSegments.sort((a, b) => a.pace - b.pace);
    const topMilesCount = Math.ceil(sortedMiles.length * 0.3);
    return sortedMiles.slice(0, topMilesCount);
};