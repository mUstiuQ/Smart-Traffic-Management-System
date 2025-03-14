import React from 'react';

const activities = [
  {
    id: 1,
    event: 'Traffic congestion detected',
    location: 'Main Street & 5th Avenue',
    time: '2 minutes ago',
    status: 'warning',
  },
  {
    id: 2,
    event: 'Payment processed',
    location: 'Downtown Toll Gate',
    time: '15 minutes ago',
    status: 'success',
  },
  {
    id: 3,
    event: 'Weather alert',
    location: 'North District',
    time: '1 hour ago',
    status: 'info',
  },
  {
    id: 4,
    event: 'Air quality warning',
    location: 'Industrial Zone',
    time: '3 hours ago',
    status: 'danger',
  },
];

const RecentActivity = () => {
  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {activities.map((activity, activityIdx) => (
          <li key={activity.id}>
            <div className="relative pb-8">
              {activityIdx !== activities.length - 1 ? (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span
                    className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                      activity.status === 'warning'
                        ? 'bg-yellow-500'
                        : activity.status === 'success'
                        ? 'bg-green-500'
                        : activity.status === 'info'
                        ? 'bg-blue-500'
                        : 'bg-red-500'
                    }`}
                  >
                    <span className="text-white text-xs">
                      {activity.status === 'warning'
                        ? '⚠️'
                        : activity.status === 'success'
                        ? '✓'
                        : activity.status === 'info'
                        ? 'i'
                        : '!'}
                    </span>
                  </span>
                </div>
                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      {activity.event} <span className="font-medium text-gray-900">at {activity.location}</span>
                    </p>
                  </div>
                  <div className="text-right text-sm whitespace-nowrap text-gray-500">
                    <time dateTime="2020-09-20">{activity.time}</time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentActivity;