'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { CogIcon, BellIcon, UserCircleIcon, ShieldCheckIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../components/ThemeProvider';

// TypeScript interfaces
interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label: string;
  description?: string;
}

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
  </div>
);

// Toggle switch component
const Toggle: React.FC<ToggleProps> = ({ enabled, onChange, label, description }) => {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</h3>
        {description && <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>}
      </div>
      <button
        type="button"
        className={`${enabled ? 'bg-indigo-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
      >
        <span className="sr-only">Use setting</span>
        <span
          aria-hidden="true"
          className={`${enabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
      </button>
    </div>
  );
};

// Settings section component
const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children }) => {
  return (
    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">{title}</h2>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-6">
        {children}
      </div>
    </div>
  );
};

export default function Settings() {
  const { darkMode, toggleDarkMode } = useTheme();
  
  // State for toggle settings
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: false,
    dataSharing: true,
    darkMode: false,
    autoUpdate: true,
    twoFactorAuth: false,
    locationTracking: true,
    analyticsCollection: true
  });

  // Sync the darkMode state with the context when component mounts
  useEffect(() => {
    setSettings(prev => ({ ...prev, darkMode }));
  }, [darkMode]);

  const updateSetting = (key: keyof typeof settings, value: boolean) => {
    // If the setting is darkMode, use the context's toggle function
    if (key === 'darkMode') {
      toggleDarkMode();
    } else {
      setSettings(prev => ({ ...prev, [key]: value }));
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Settings</h1>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Suspense fallback={<LoadingSpinner />}>
          <SettingsSection title="User Preferences">
            <div className="space-y-4">
              <Toggle
                label="Dark Mode"
                description="Enable dark theme for the application"
                enabled={settings.darkMode}
                onChange={(value) => updateSetting('darkMode', value)}
              />
              <Toggle
                label="Auto-update Data"
                description="Automatically refresh data in real-time"
                enabled={settings.autoUpdate}
                onChange={(value) => updateSetting('autoUpdate', value)}
              />
              
              <div className="pt-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Language</h3>
                <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                  <option>English</option>
                  <option>Romanian</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                </select>
              </div>
            </div>
          </SettingsSection>
        </Suspense>
        
        <Suspense fallback={<LoadingSpinner />}>
          <SettingsSection title="Notifications">
            <div className="space-y-4">
              <Toggle
                label="Push Notifications"
                description="Receive alerts for important events"
                enabled={settings.notifications}
                onChange={(value) => updateSetting('notifications', value)}
              />
              <Toggle
                label="Email Alerts"
                description="Get email notifications for critical updates"
                enabled={settings.emailAlerts}
                onChange={(value) => updateSetting('emailAlerts', value)}
              />
              
              <div className="pt-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Notification Frequency</h3>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center">
                    <input
                      id="frequency-realtime"
                      name="notification-frequency"
                      type="radio"
                      defaultChecked
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="frequency-realtime" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Real-time
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="frequency-hourly"
                      name="notification-frequency"
                      type="radio"
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="frequency-hourly" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Hourly digest
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="frequency-daily"
                      name="notification-frequency"
                      type="radio"
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="frequency-daily" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Daily summary
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </SettingsSection>
        </Suspense>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Suspense fallback={<LoadingSpinner />}>
          <SettingsSection title="Security & Privacy">
            <div className="space-y-4">
              <Toggle
                label="Two-Factor Authentication"
                description="Add an extra layer of security to your account"
                enabled={settings.twoFactorAuth}
                onChange={(value) => updateSetting('twoFactorAuth', value)}
              />
              <Toggle
                label="Location Tracking"
                description="Allow the system to track your location for better service"
                enabled={settings.locationTracking}
                onChange={(value) => updateSetting('locationTracking', value)}
              />
              <Toggle
                label="Data Sharing"
                description="Share anonymous usage data to help improve the system"
                enabled={settings.dataSharing}
                onChange={(value) => updateSetting('dataSharing', value)}
              />
              
              <div className="pt-4">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Clear All Data
                </button>
              </div>
            </div>
          </SettingsSection>
        </Suspense>
        
        <Suspense fallback={<LoadingSpinner />}>
          <SettingsSection title="System">
            <div className="space-y-4">
              <Toggle
                label="Analytics Collection"
                description="Collect usage statistics to improve performance"
                enabled={settings.analyticsCollection}
                onChange={(value) => updateSetting('analyticsCollection', value)}
              />
              
              <div className="pt-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Data Retention Period</h3>
                <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                  <option>30 days</option>
                  <option>60 days</option>
                  <option>90 days</option>
                  <option>180 days</option>
                  <option>1 year</option>
                </select>
              </div>
              
              <div className="pt-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">System Information</h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Version: 1.0.0</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Last Updated: June 15, 2023</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Build: 2023.06.15.1</p>
                </div>
              </div>
              
              <div className="pt-4">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5 text-gray-400" aria-hidden="true" />
                  Check for Updates
                </button>
              </div>
            </div>
          </SettingsSection>
        </Suspense>
      </div>
      
      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}