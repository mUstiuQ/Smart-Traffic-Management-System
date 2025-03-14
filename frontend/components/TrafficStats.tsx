'use client';

import React from 'react';

interface TrafficStatsProps {
  dailyAverage: number;
  weeklyChange: string;
  peakHours: string[];
  congestionLevel: 'Low' | 'Medium' | 'High';
}

const TrafficStats: React.FC<TrafficStatsProps> = ({
  dailyAverage,
  weeklyChange,
  peakHours,
  congestionLevel,
}) => {
  const getCongestionColor = (level: string) => {
    switch (level) {
      case 'Low':
        return 'text-green-600';
      case 'Medium':
        return 'text-yellow-600';
      case 'High':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Traffic Statistics</h3>
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-500">Daily Average Traffic</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{dailyAverage}</p>
            <p className="mt-2 text-sm text-gray-500">
              <span className={weeklyChange.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                {weeklyChange}
              </span>
              {' '}vs last week
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-500">Current Congestion Level</p>
            <p className={`mt-2 text-3xl font-semibold ${getCongestionColor(congestionLevel)}`}>
              {congestionLevel}
            </p>
            <p className="mt-2 text-sm text-gray-500">Based on real-time data</p>
          </div>
        </div>
        <div className="mt-5">
          <h4 className="text-sm font-medium text-gray-500">Peak Hours</h4>
          <div className="mt-2 flex flex-wrap gap-2">
            {peakHours.map((hour, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {hour}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrafficStats;