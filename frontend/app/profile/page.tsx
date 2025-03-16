'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getAuthToken, logout } from '../../utils/auth';

interface UserProfile {
  name: string;
  email: string;
  picture: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndGetProfile = async () => {
      try {
        const authenticated = await isAuthenticated();
        if (!authenticated) {
          router.push('/login');
          return;
        }

        const token = await getAuthToken();
        const response = await fetch('https://YOUR_AUTH0_DOMAIN/userinfo', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndGetProfile();
  }, [router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-8">
        <div className="text-center mb-8">
          {user?.picture && (
            <img
              src={user.picture}
              alt="Profile"
              className="w-32 h-32 rounded-full mx-auto mb-4"
            />
          )}
          <h1 className="text-3xl font-bold text-gray-900">{user?.name}</h1>
          <p className="text-gray-600">{user?.email}</p>
        </div>

        <div className="border-t border-gray-200 pt-8">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Account Settings</h2>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}