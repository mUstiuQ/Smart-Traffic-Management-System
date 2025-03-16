'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

const TrafficMap = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResult, setSearchResult] = useState<[number, number] | null>(null);

  const [routeLayer, setRouteLayer] = useState<any>(null);
  const [routeFlowLayer, setRouteFlowLayer] = useState<any>(null);

  const drawRoute = async (start: [number, number], end: [number, number]) => {
    if (!mapRef.current) return;
    const L = await import('leaflet');

    // Remove existing route layers
    if (routeLayer) mapRef.current.removeLayer(routeLayer);
    if (routeFlowLayer) mapRef.current.removeLayer(routeFlowLayer);

    // Create route polyline
    const newRouteLayer = L.polyline([start, end], {
      color: '#2196F3',
      weight: 4,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(mapRef.current);

    // Create animated flow effect
    const newFlowLayer = L.polyline([start, end], {
      color: '#64B5F6',
      weight: 3,
      opacity: 0.7,
      dashArray: '10, 20',
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(mapRef.current);

    setRouteLayer(newRouteLayer);
    setRouteFlowLayer(newFlowLayer);

    // Calculate and display distance
    const distance = mapRef.current.distance(L.latLng(start), L.latLng(end)) / 1000; // Convert to km
    newRouteLayer.bindTooltip(`Distance: ${distance.toFixed(2)} km`, {
      permanent: true,
      direction: 'center',
      className: 'route-tooltip'
    });

    // Animate the flow
    let offset = 0;
    const animateFlow = () => {
      offset = (offset + 1) % 30;
      newFlowLayer.setStyle({ dashOffset: `-${offset}` });
      requestAnimationFrame(animateFlow);
    };
    animateFlow();
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setLocationError('Please enter a location to search');
      return;
    }
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
      const data = await response.json();
      if (data.length > 0) {
        const result = [parseFloat(data[0].lat), parseFloat(data[0].lon)] as [number, number];
        setSearchResult(result);
        if (mapRef.current) {
          mapRef.current.flyTo(result, 16, {
            duration: 1.5,
            easeLinearity: 0.25
          });
          // Add marker for search result
          const L = await import('leaflet');
          L.marker(result, {
            icon: L.icon({
              iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41]
            })
          }).bindPopup(searchQuery).addTo(mapRef.current);

          // Draw route if we have user location
          if (userLocation) {
            drawRoute(userLocation, result);
          }
        }
        setLocationError('');
      } else {
        setLocationError('Location not found');
      }
    } catch (error) {
      console.error('Search error:', error);
      setLocationError('Search failed. Please try again.');
    }
  };
  const mapRef = useRef<any>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState<string>('');

  useEffect(() => {
    const initMap = async () => {
      if (typeof window !== 'undefined') {
        const L = await import('leaflet');

        if (!mapRef.current) {
          // Initialize the map
          const mapContainer = document.getElementById('map');
          if (!mapContainer) {
            console.error('Map container not found');
            return;
          }
          const map = L.map(mapContainer).setView([44.4268, 26.1025], 13); // Bucharest coordinates

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          // Add traffic cameras and waypoints
          const cameras = [
            { lat: 44.4268, lng: 26.1025, name: 'Camera 1' },
            { lat: 44.4366, lng: 26.1025, name: 'Camera 2' },
            { lat: 44.4268, lng: 26.1125, name: 'Camera 3' },
          ];

          // Add waypoints between cameras
          const waypoints = [
            // Between Camera 1 and Camera 2
            { lat: 44.4317, lng: 26.1025, name: 'Waypoint 1' },
            // Between Camera 2 and Camera 3
            { lat: 44.4317, lng: 26.1075, name: 'Waypoint 2' },
            { lat: 44.4268, lng: 26.1075, name: 'Waypoint 3' },
          ];

          // Add camera markers
          cameras.forEach(camera => {
            L.marker([camera.lat, camera.lng])
              .bindPopup(camera.name)
              .addTo(map);
          });

          // Add waypoint markers with different style
          waypoints.forEach(waypoint => {
            L.circleMarker([waypoint.lat, waypoint.lng], {
              radius: 4,
              fillColor: '#2196F3',
              color: '#fff',
              weight: 1,
              opacity: 0.8,
              fillOpacity: 0.6
            }).bindPopup(waypoint.name).addTo(map);
          });

          // Draw polylines between cameras through waypoints with animation
          const routePoints = [
            [cameras[0].lat, cameras[0].lng],
            [waypoints[0].lat, waypoints[0].lng],
            [cameras[1].lat, cameras[1].lng],
            [waypoints[1].lat, waypoints[1].lng],
            [waypoints[2].lat, waypoints[2].lng],
            [cameras[2].lat, cameras[2].lng]
          ];

          // Create animated polyline
          const polyline = L.polyline(routePoints as L.LatLngExpression[], {
            color: '#2196F3',
            weight: 4,
            opacity: 0.9,
            lineCap: 'round',
            lineJoin: 'round'
          }).addTo(map);

          // Add animated flow effect
          const flow = L.polyline(routePoints as L.LatLngExpression[], {
            color: '#64B5F6',
            weight: 3,
            opacity: 0.7,
            dashArray: '10, 20',
            lineCap: 'round',
            lineJoin: 'round'
          }).addTo(map);

          // Animate the flow
          let offset = 0;
          const animateFlow = () => {
            offset = (offset + 1) % 30;
            flow.setStyle({ dashOffset: `-${offset}` });
            requestAnimationFrame(animateFlow);
          };
          animateFlow();

          // Get user's location
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation([latitude, longitude]);
                
                // Create a custom icon for user location
                const userIcon = L.divIcon({
                  className: 'relative',
                  html: '<div class="w-6 h-6 bg-blue-600 rounded-full border-2 border-white shadow-lg pulse-animation flex items-center justify-center"><div class="w-2 h-2 bg-white rounded-full"></div></div>',
                  iconSize: [24, 24],
                });

                // Add user location marker
                L.marker([latitude, longitude], { icon: userIcon })
                  .bindPopup('You are here')
                  .addTo(map);

                // Center map on user location with smooth animation
                if (map) {
                map.flyTo([latitude, longitude], 16, {
                  duration: 1.5,
                  easeLinearity: 0.25
                });
              }
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
    <div className="flex flex-col gap-4 h-full w-full">
      <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-200">
        <h2 className="text-lg font-semibold mb-2">Search Location</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter location..."
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Search
          </button>
        </div>
      </div>
      <div className="relative h-full w-full rounded-md overflow-hidden">
        <div id="map" className="h-full w-full" />
        {locationError && (
          <div className="absolute top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
            {locationError}
          </div>
        )}
        <style jsx>{`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(2.5); opacity: 0.25; }
            100% { transform: scale(3); opacity: 0; }
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
    </div>
  );
};

export default TrafficMap;