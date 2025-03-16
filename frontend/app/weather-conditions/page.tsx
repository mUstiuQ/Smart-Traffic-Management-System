'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { SunIcon, CloudIcon, BoltIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { 
  fetchCurrentWeather, 
  fetchWeatherForecast, 
  fetchWeatherAlerts,
  fetchRoadWeatherConditions,
  CurrentWeather,
  WeatherForecast,
  WeatherAlert,
  RoadWeatherCondition
} from '../../utils/weatherApi';

// TypeScript interfaces
interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
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
  const isPositive = change?.startsWith('+');
  
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
      {change && (
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <span className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {change}
            </span>{' '}
            <span className="text-gray-500">from previous period</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to determine weather status
const getWeatherStatus = (condition: string): 'Clear' | 'Cloudy' | 'Rainy' | 'Stormy' | 'Snowy' => {
  const lowerCondition = condition.toLowerCase();
  if (lowerCondition.includes('clear') || lowerCondition.includes('sunny')) return 'Clear';
  if (lowerCondition.includes('cloud') || lowerCondition.includes('overcast')) return 'Cloudy';
  if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle')) return 'Rainy';
  if (lowerCondition.includes('storm') || lowerCondition.includes('thunder')) return 'Stormy';
  if (lowerCondition.includes('snow')) return 'Snowy';
  return 'Clear'; // Default
};

// Format date for display
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

const WeatherConditions = () => {
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast | null>(null);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [roadConditions, setRoadConditions] = useState<RoadWeatherCondition | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        // Fetch all weather data in parallel
        const [currentData, forecastData, alertsData, roadData] = await Promise.all([
          fetchCurrentWeather(),
          fetchWeatherForecast(),
          fetchWeatherAlerts(),
          fetchRoadWeatherConditions()
        ]);
        
        setCurrentWeather(currentData);
        setForecast(forecastData);
        setAlerts(alertsData.alerts);
        setRoadConditions(roadData);
        setError(null);
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setError('Failed to load weather data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, []);

  // Convert weather data to table format
  const getWeatherTableData = (): WeatherData[] => {
    if (!currentWeather || !roadConditions) return [];
    
    // Create an entry for current weather
    const currentEntry: WeatherData = {
      condition: currentWeather.condition,
      temperature: `${currentWeather.temperature}°C`,
      location: `Lat: ${currentWeather.location.latitude.toFixed(2)}, Lon: ${currentWeather.location.longitude.toFixed(2)}`,
      time: formatDate(currentWeather.timestamp),
      status: getWeatherStatus(currentWeather.condition)
    };
    
    // Create an entry for road conditions
    const roadEntry: WeatherData = {
      condition: roadConditions.roadSurface,
      temperature: `${roadConditions.temperature}°C`,
      location: `Lat: ${roadConditions.location.latitude.toFixed(2)}, Lon: ${roadConditions.location.longitude.toFixed(2)}`,
      time: formatDate(roadConditions.timestamp),
      status: getWeatherStatus(roadConditions.precipitation)
    };
    
    // Add forecast entries if available
    const forecastEntries: WeatherData[] = forecast?.forecast.slice(0, 3).map(day => ({
      condition: day.condition,
      temperature: `${day.temperature.min}°C - ${day.temperature.max}°C`,
      location: 'Forecast',
      time: day.date,
      status: getWeatherStatus(day.condition)
    })) || [];
    
    return [currentEntry, roadEntry, ...forecastEntries];
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Weather Conditions</h1>
      
      <Suspense fallback={<LoadingSpinner />}>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {currentWeather && (
            <>
              <MetricCard 
                title="Temperature" 
                value={`${currentWeather.temperature}°C`} 
                icon={<SunIcon className="h-6 w-6 text-white" />} 
                iconBg="bg-orange-500"
              />
              <MetricCard 
                title="Humidity" 
                value={`${currentWeather.humidity}%`} 
                icon={<CloudIcon className="h-6 w-6 text-white" />}
                iconBg="bg-blue-500"
              />
              <MetricCard 
                title="Wind Speed" 
                value={`${currentWeather.windSpeed} km/h`} 
                icon={<CloudIcon className="h-6 w-6 text-white" />} 
                iconBg="bg-teal-500"
              />
              <MetricCard 
                title="Precipitation" 
                value={`${currentWeather.precipitation}%`} 
                icon={<BoltIcon className="h-6 w-6 text-white" />} 
                iconBg="bg-purple-500"
              />
            </>
          )}
        </div>
      </Suspense>
      
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Suspense fallback={<LoadingSpinner />}>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Weather Alerts</h3>
              <div className="mt-5">
                {alerts && alerts.length > 0 ? (
                  <div className="space-y-4">
                    {alerts.map((alert, index) => (
                      <div key={index} className={`p-4 rounded-md ${
                        alert.severity === 'severe' ? 'bg-red-50' :
                        alert.severity === 'moderate' ? 'bg-yellow-50' : 'bg-blue-50'
                      }`}>
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <ExclamationTriangleIcon className={`h-5 w-5 ${
                              alert.severity === 'severe' ? 'text-red-400' :
                              alert.severity === 'moderate' ? 'text-yellow-400' : 'text-blue-400'
                            }`} aria-hidden="true" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-gray-800">{alert.type}</h3>
                            <div className="mt-2 text-sm text-gray-700">
                              <p>{alert.description}</p>
                              <p className="mt-1 text-xs">
                                {new Date(alert.startTime).toLocaleString()} - {new Date(alert.endTime).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No active weather alerts
                  </div>
                )}
              </div>
            </div>
          </div>
        </Suspense>
        
        <Suspense fallback={<LoadingSpinner />}>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Weather Forecast</h3>
              <div className="mt-5">
                {forecast && forecast.forecast.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {forecast.forecast.slice(0, 3).map((day, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-md">
                        <div className="text-center">
                          <p className="font-medium">{new Date(day.date).toLocaleDateString()}</p>
                          <div className="mt-2">
                            <p className="text-2xl font-bold">{day.temperature.max}°C</p>
                            <p className="text-sm text-gray-500">{day.temperature.min}°C</p>
                          </div>
                          <p className="mt-2">{day.condition}</p>
                          <div className="mt-2 text-sm text-gray-500">
                            <p>Humidity: {day.humidity}%</p>
                            <p>Precipitation: {day.precipitation}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No forecast data available
                  </div>
                )}
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
                  {getWeatherTableData().map((data, idx) => (
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
      
      {roadConditions && (
        <Suspense fallback={<LoadingSpinner />}>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Road Weather Conditions</h3>
              <div className="mt-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="text-sm font-medium text-gray-500">Road Surface</h4>
                    <p className="mt-1 text-lg font-semibold">{roadConditions.roadSurface}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="text-sm font-medium text-gray-500">Visibility</h4>
                    <p className="mt-1 text-lg font-semibold">{roadConditions.visibility}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="text-sm font-medium text-gray-500">Wind Effect</h4>
                    <p className="mt-1 text-lg font-semibold">{roadConditions.windEffect}</p>
                  </div>
                </div>
                
                {roadConditions.hazards && roadConditions.hazards.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Road Hazards</h4>
                    <div className="space-y-3">
                      {roadConditions.hazards.map((hazard, idx) => (
                        <div key={idx} className="bg-red-50 p-3 rounded-md">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                            </div>
                            <div className="ml-3">
                              <h5 className="text-sm font-medium text-red-800">{hazard.type}</h5>
                              <p className="text-sm text-red-700">Severity: {hazard.severity}</p>
                              <p className="text-xs text-red-700 mt-1">
                                Location: Lat {hazard.location.latitude.toFixed(2)}, Lon {hazard.location.longitude.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Suspense>
      )}
    </div>
  );
};

// Change from const export to function export
export default function Page() {
  return <WeatherConditions />;
}