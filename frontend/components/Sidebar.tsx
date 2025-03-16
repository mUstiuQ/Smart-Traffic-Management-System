'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  VideoCameraIcon, 
  CurrencyDollarIcon, 
  CloudIcon, 
  ChartBarIcon,
  Cog6ToothIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  
  // Load collapsed state from localStorage on component mount
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setCollapsed(savedState === 'true');
    }
  }, []);

  // Save collapsed state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', collapsed.toString());
  }, [collapsed]);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Traffic Analysis', href: '/traffic-analysis', icon: VideoCameraIcon },
    { name: 'Payment System', href: '/payment-system', icon: CurrencyDollarIcon },
    { name: 'Pollution Monitoring', href: '/pollution-monitoring', icon: CloudIcon },
    { name: 'Weather Conditions', href: '/weather-conditions', icon: ChartBarIcon },
    { name: 'API Messages', href: '/messages', icon: EnvelopeIcon },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
  ];

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className={`flex flex-col ${collapsed ? 'w-16' : 'w-64'} transition-width duration-300 ease-in-out`}>
        <div className="flex flex-col h-0 flex-1 bg-gray-800">
          <div className="flex flex-col h-0 flex-1 bg-gray-800">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center justify-between flex-shrink-0 px-4">
                {!collapsed && <span className="text-white text-xl font-bold">SmartTraffic</span>}
                <button
                  onClick={toggleSidebar}
                  className="p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {collapsed ? 
                    <ChevronRightIcon className="h-6 w-6" aria-hidden="true" /> : 
                    <ChevronLeftIcon className="h-6 w-6" aria-hidden="true" />
                  }
                </button>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`${
                        isActive
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      } group flex items-center px-2 py-2 text-sm font-medium rounded-md ${collapsed ? 'justify-center' : ''}`}
                      title={collapsed ? item.name : ''}
                    >
                      <item.icon
                        className={`${
                          isActive ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'
                        } ${collapsed ? '' : 'mr-3'} flex-shrink-0 h-6 w-6`}
                        aria-hidden="true"
                      />
                      {!collapsed && item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;