'use client';

import React, { Suspense } from 'react';
import { SunIcon, CloudIcon, BoltIcon } from '@heroicons/react/24/outline';

// TypeScript interfaces
interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  iconBg: string;
}

interface WeatherData {
  condition: string;
  temperature: string;
  location: string;
  time: string;
  status: 'Clear' | 'Cloudy' | 'Rainy' | 'Stormy' | 'Snowy';
}

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
  </div>
);

// Helper component for metric cards
const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, iconBg }) => {
  const isPositive = change.startsWith('+');
  
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-md p-3 ${iconBg}`}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-5 py-3">
        <div className="text-sm">
          <span className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {change}
          </span>{' '}
          <span className="text-gray-500">from previous period</span>
        </div>
      </div>
    </div>
  );
};

const WeatherConditions = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Weather Conditions</h1>
      
      <Suspense fallback={<LoadingSpinner />}>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard 
            title="Temperature" 
            value="24°C" 
            change="+2°C" 
            icon={<SunIcon className="h-6 w-6 text-white" />} 
            iconBg="bg-orange-500"
          />
          <MetricCard 
            title="Humidity" 
            value="65%" 
            change="-5%" 
            icon={<CloudIcon className="h-6 w-6 text-white" />}
            iconBg="bg-blue-500"
          />
          <MetricCard 
            title="Wind Speed" 
            value="12 km/h" 
            change="+3 km/h" 
            icon={<CloudIcon className="h-6 w-6 text-white" />} 
            iconBg="bg-teal-500"
          />
          <MetricCard 
            title="Precipitation" 
            value="30%" 
            change="+10%" 
            icon={<BoltIcon className="h-6 w-6 text-white" />} 
            iconBg="bg-purple-500"
          />
        </div>
      </Suspense>
      
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Suspense fallback={<LoadingSpinner />}>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Weather Map</h3>
              <div className="mt-5 h-64 bg-gray-200 rounded-md flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-500">Weather Map Placeholder</p>
                  <p className="text-sm text-gray-400">Interactive weather map with radar data</p>
                </div>
              </div>
            </div>
          </div>
        </Suspense>
        
        <Suspense fallback={<LoadingSpinner />}>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <h3 className="text-lg leading-6 font-medium text-gray-900">5-Day Forecast</h3>
              <div className="mt-5 h-64 bg-gray-200 rounded-md flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-500">Forecast Visualization</p>
                  <p className="text-sm text-gray-400">Temperature and precipitation forecast</p>
                </div>
              </div>
            </div>
          </div>
        </Suspense>
      </div>
      
      <Suspense fallback={<LoadingSpinner />}>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Weather Conditions</h3>
            <div className="mt-5">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Condition
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Temperature
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[
                    { condition: 'Sunny', temperature: '24°C', location: 'Downtown', time: '10 min ago', status: 'Clear' as const },
                    { condition: 'Partly Cloudy', temperature: '22°C', location: 'North District', time: '15 min ago', status: 'Cloudy' as const },
                    { condition: 'Light Rain', temperature: '19°C', location: 'West Bridge', time: '20 min ago', status: 'Rainy' as const },
                    { condition: 'Thunderstorm', temperature: '18°C', location: 'South Park', time: '25 min ago', status: 'Stormy' as const },
                    { condition: 'Overcast', temperature: '21°C', location: 'East Side', time: '30 min ago', status: 'Cloudy' as const },
                  ].map((data: WeatherData, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{data.condition}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data.temperature}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data.location}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data.time}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          data.status === 'Clear' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : data.status === 'Cloudy'
                            ? 'bg-gray-100 text-gray-800'
                            : data.status === 'Rainy'
                            ? 'bg-blue-100 text-blue-800'
                            : data.status === 'Stormy'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-50 text-blue-800'
                        }`}>
                          {data.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
};

// Change from const export to function export
export default function Page() {
  return <WeatherConditions />;
}