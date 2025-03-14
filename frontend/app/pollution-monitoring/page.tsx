'use client';

import React, { Suspense } from 'react';
import { CloudIcon, ChartBarIcon, BeakerIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

// TypeScript interfaces
interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  iconBg: string;
}

interface PollutionData {
  pollutant: string;
  level: number;
  location: string;
  time: string;
  status: 'Good' | 'Moderate' | 'Poor' | 'Hazardous';
}

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
  </div>
);

export default function PollutionMonitoring() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Pollution Monitoring</h1>
      
      <Suspense fallback={<LoadingSpinner />}>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard 
            title="Air Quality Index" 
            value="75" 
            change="-5%" 
            icon={<CloudIcon className="h-6 w-6 text-white" />} 
            iconBg="bg-blue-500"
          />
          <MetricCard 
            title="CO2 Levels" 
            value="412 ppm" 
            change="+2%" 
            icon={<BeakerIcon className="h-6 w-6 text-white" />} 
            iconBg="bg-green-500"
          />
          <MetricCard 
            title="PM2.5" 
            value="18 µg/m³" 
            change="-8%" 
            icon={<ChartBarIcon className="h-6 w-6 text-white" />} 
            iconBg="bg-purple-500"
          />
          <MetricCard 
            title="Alerts" 
            value="2" 
            change="+1" 
            icon={<ExclamationTriangleIcon className="h-6 w-6 text-white" />} 
            iconBg="bg-yellow-500"
          />
        </div>
      </Suspense>
      
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Suspense fallback={<LoadingSpinner />}>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Pollution Heatmap</h3>
              <div className="mt-5 h-64 bg-gray-200 rounded-md flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-500">Heatmap Placeholder</p>
                  <p className="text-sm text-gray-400">Shows pollution concentration across monitored areas</p>
                </div>
              </div>
            </div>
          </div>
        </Suspense>
        
        <Suspense fallback={<LoadingSpinner />}>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Historical Data</h3>
              <div className="mt-5 h-64 bg-gray-200 rounded-md flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-500">Graph Placeholder</p>
                  <p className="text-sm text-gray-400">24-hour pollution level trends</p>
                </div>
              </div>
            </div>
          </div>
        </Suspense>
      </div>
      
      <Suspense fallback={<LoadingSpinner />}>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Pollutant Levels</h3>
            <div className="mt-5">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pollutant
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Level
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
                    { pollutant: 'PM2.5', level: 18, location: 'Main St & 5th Ave', time: '2 min ago', status: 'Moderate' as const },
                    { pollutant: 'CO2', level: 412, location: 'Downtown Crossing', time: '5 min ago', status: 'Good' as const },
                    { pollutant: 'NO2', level: 45, location: 'Highway Entry', time: '12 min ago', status: 'Poor' as const },
                    { pollutant: 'O3', level: 85, location: 'West Bridge', time: '18 min ago', status: 'Moderate' as const },
                    { pollutant: 'SO2', level: 15, location: 'North District', time: '25 min ago', status: 'Good' as const },
                  ].map((data: PollutionData, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{data.pollutant}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data.level}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data.location}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data.time}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${{
                          'Good': 'bg-green-100 text-green-800',
                          'Moderate': 'bg-yellow-100 text-yellow-800',
                          'Poor': 'bg-red-100 text-red-800',
                          'Hazardous': 'bg-purple-100 text-purple-800'
                        }[data.status]}`}>
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
}

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