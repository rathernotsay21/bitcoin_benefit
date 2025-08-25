'use client';

import React from 'react';
import VestingTimelineChartRecharts from './VestingTimelineChartRecharts';

// Wrapper component to improve HMR and prevent caching issues
const VestingTimelineChart: React.FC<React.ComponentProps<typeof VestingTimelineChartRecharts>> = (props) => {
  return <VestingTimelineChartRecharts {...props} />;
};

VestingTimelineChart.displayName = 'VestingTimelineChart';

export default VestingTimelineChart;
