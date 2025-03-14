'use client';
import React, { Suspense } from 'react';
import { VideoCameraIcon, TruckIcon, UserIcon, IdentificationIcon } from '@heroicons/react/24/outline';

// TypeScript interfaces
interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  iconBg: string;
}

interface VehicleData {
  plate: string;
  type: string;
  location: string;
  time: string;
  status: 'Registered' | 'Commercial' | 'Unregistered';
}

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 text-red-800 rounded-lg">
          <h3 className="text-lg font-medium">Something went wrong</h3>
          <p>Please try refreshing the page</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
  </div>
);

export default function TrafficAnalysis() {
  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Traffic Analysis</h1>
        
        <Suspense fallback={<LoadingSpinner />}>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard 
              title="Vehicles Detected" 
              value="1,248" 
              change="+12%" 
              icon={<TruckIcon className="h-6 w-6 text-white" />} 
              iconBg="bg-blue-500"
            />
            <MetricCard 
              title="Pedestrians" 
              value="356" 
              change="+8%" 
              icon={<UserIcon className="h-6 w-6 text-white" />} 
              iconBg="bg-green-500"
            />
            <MetricCard 
              title="License Plates Read" 
              value="987" 
              change="+15%" 
              icon={<IdentificationIcon className="h-6 w-6 text-white" />} 
              iconBg="bg-purple-500"
            />
            <MetricCard 
              title="Active Cameras" 
              value="24" 
              change="+2" 
              icon={<VideoCameraIcon className="h-6 w-6 text-white" />} 
              iconBg="bg-yellow-500"
            />
          </div>
        </Suspense>
        
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Suspense fallback={<LoadingSpinner />}>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Live Camera Feed</h3>
                <div className="mt-5 h-64 bg-gray-200 rounded-md flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-gray-500">Camera Feed Placeholder</p>
                    <p className="text-sm text-gray-400">OpenCV-processed video stream with object detection</p>
                  </div>
                </div>
              </div>
            </div>
          </Suspense>
          
          <Suspense fallback={<LoadingSpinner />}>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Traffic Density Heatmap</h3>
                <div className="mt-5 h-64 bg-gray-200 rounded-md flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-gray-500">Heatmap Placeholder</p>
                    <p className="text-sm text-gray-400">Shows traffic density across monitored areas</p>
                  </div>
                </div>
              </div>
            </div>
          </Suspense>
        </div>
        
        <Suspense fallback={<LoadingSpinner />}>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <h3 className="text-lg leading-6 font-medium text-gray-900">License Plate Recognition</h3>
              <div className="mt-5">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        License Plate
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vehicle Type
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
                      { plate: 'B-123-ABC', type: 'Sedan', location: 'Main St & 5th Ave', time: '2 min ago', status: 'Registered' as const },
                      { plate: 'TM-456-XYZ', type: 'SUV', location: 'Downtown Crossing', time: '5 min ago', status: 'Registered' as const },
                      { plate: 'CJ-789-DEF', type: 'Truck', location: 'Highway Entry', time: '12 min ago', status: 'Commercial' as const },
                      { plate: 'IS-012-GHI', type: 'Motorcycle', location: 'West Bridge', time: '18 min ago', status: 'Registered' as const },
                      { plate: 'B-345-JKL', type: 'Van', location: 'North District', time: '25 min ago', status: 'Unregistered' as const },
                    ].map((vehicle: VehicleData, idx) => (
                      <tr key={idx}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{vehicle.plate}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.location}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.time}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            vehicle.status === 'Registered' 
                              ? 'bg-green-100 text-green-800' 
                              : vehicle.status === 'Commercial'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {vehicle.status}
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
    </ErrorBoundary>
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