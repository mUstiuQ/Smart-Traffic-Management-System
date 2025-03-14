'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import TrafficStats from '../components/TrafficStats';

const TrafficMap = dynamic(() => import('../components/TrafficMap'), {
  ssr: false
});

export default function Home() {
  // Sample data for TrafficStats
  const trafficData = {
    dailyAverage: 15000,
    weeklyChange: '+5.2%',
    peakHours: ['8:00 AM - 10:00 AM', '5:00 PM - 7:00 PM'],
    congestionLevel: 'Medium' as const
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
      <div className="lg:col-span-2 h-[600px] bg-white rounded-lg shadow">
        <TrafficMap />
      </div>
      <div className="lg:col-span-1">
        <TrafficStats
          dailyAverage={trafficData.dailyAverage}
          weeklyChange={trafficData.weeklyChange}
          peakHours={trafficData.peakHours}
          congestionLevel={trafficData.congestionLevel}
        />
      </div>
    </div>
  );
}