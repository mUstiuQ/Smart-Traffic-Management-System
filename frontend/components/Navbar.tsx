'use client';

import React, { useState } from 'react';
import { BellIcon, MagnifyingGlassIcon, UserCircleIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  
  return (
    <header className="bg-white shadow-sm z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-800">SmartTraffic</h1>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2"
                  placeholder="Search..."
                />
              </div>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <div className="relative">
                <button 
                  className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <span className="sr-only">View notifications</span>
                  <BellIcon className="h-6 w-6" aria-hidden="true" />
                </button>
                
                {/* Notification dropdown */}
                {showNotifications && (
                  <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {[
                        { id: 1, title: 'Traffic congestion detected', message: 'High traffic on Main Street', time: '2 min ago' },
                        { id: 2, title: 'Weather alert', message: 'Rain expected in 30 minutes', time: '15 min ago' },
                        { id: 3, title: 'System update', message: 'New features available', time: '1 hour ago' },
                        { id: 4, title: 'Pollution warning', message: 'Air quality decreasing in Industrial Zone', time: '3 hours ago' },
                      ].map((notification) => (
                        <a
                          key={notification.id}
                          href="#"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <p className="font-medium">{notification.title}</p>
                          <p className="text-xs text-gray-500">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                        </a>
                      ))}
                    </div>
                    <div className="border-t border-gray-100 px-4 py-2">
                      <a href="#" className="text-xs text-indigo-600 hover:text-indigo-900">View all notifications</a>
                    </div>
                  </div>
                )}
              </div>
              
              
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;