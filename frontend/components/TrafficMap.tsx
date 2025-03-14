'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

const TrafficMap = () => {
  const mapRef = useRef<any>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState<string>('');

  useEffect(() => {
    const initMap = async () => {
      if (typeof window !== 'undefined') {
        const L = await import('leaflet');

        if (!mapRef.current) {
          // Initialize the map
          const map = L.map('map').setView([44.4268, 26.1025], 13); // Bucharest coordinates

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          // Add sample traffic cameras
          const cameras = [
            { lat: 44.4268, lng: 26.1025, name: 'Camera 1' },
            { lat: 44.4366, lng: 26.1025, name: 'Camera 2' },
            { lat: 44.4268, lng: 26.1125, name: 'Camera 3' },
          ];

          cameras.forEach(camera => {
            L.marker([camera.lat, camera.lng])
              .bindPopup(camera.name)
              .addTo(map);
          });

          // Add sample traffic heatmap data
          const heatmapData = [
            [44.4268, 26.1025, 0.8],
            [44.4366, 26.1025, 0.6],
            [44.4268, 26.1125, 0.3],
          ];

          // Get user's location
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation([latitude, longitude]);
                
                // Create a custom icon for user location
                const userIcon = L.divIcon({
                  className: 'relative',
                  html: '<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg pulse-animation"></div>',
                  iconSize: [16, 16],
                });

                // Add user location marker
                L.marker([latitude, longitude], { icon: userIcon })
                  .bindPopup('You are here')
                  .addTo(map);

                // Center map on user location
                map.setView([latitude, longitude], 15);
              },
              (error) => {
                setLocationError('Unable to retrieve your location');
                console.error('Geolocation error:', error);
              }
            );
          } else {
            setLocationError('Geolocation is not supported by your browser');
          }

          // Store map instance
          mapRef.current = map;
        }
      }
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative h-full w-full rounded-md overflow-hidden">
      <div id="map" className="h-full w-full" />
      {locationError && (
        <div className="absolute top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
          {locationError}
        </div>
      )}
      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          70% { transform: scale(2); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }
        .pulse-animation {
          position: relative;
        }
        .pulse-animation::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(59, 130, 246, 0.5);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default TrafficMap;