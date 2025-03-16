'use client';
import React, { useState, useEffect, useRef } from 'react';
import { fetchRoutes, createRoute, deleteRoute, RouteEntry, RouteEntryRequest, Location, Waypoint } from '../../utils/routeApi';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

export default function RoutesPage() {
  const [routes, setRoutes] = useState<RouteEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<RouteEntry | null>(null);
  const mapRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const waypointsRef = useRef<Waypoint[]>([]);
  
  // Form state
  const [routeName, setRouteName] = useState('');
  const [routeDescription, setRouteDescription] = useState('');
  const [startLocation, setStartLocation] = useState<Location>({
    name: '',
    latitude: 0,
    longitude: 0
  });
  const [endLocation, setEndLocation] = useState<Location>({
    name: '',
    latitude: 0,
    longitude: 0
  });

  // Load routes on component mount
  useEffect(() => {
    loadRoutes();
    initMap();
  }, []);

  const loadRoutes = async () => {
    setLoading(true);
    setError('');
    try {
      const routesData = await fetchRoutes();
      setRoutes(routesData);
    } catch (err) {
      console.error(err);
      setError('Failed to load routes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const initMap = async () => {
    if (typeof window !== 'undefined') {
      const L = await import('leaflet');

      if (!mapRef.current) {
        // Initialize the map
        const map = L.map('route-map').setView([44.4268, 26.1025], 13); // Bucharest coordinates

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Add click handler for adding waypoints
        map.on('click', (e: any) => {
          if (showForm) {
            addWaypoint(e.latlng.lat, e.latlng.lng);
          }
        });

        // Store map instance
        mapRef.current = map;
      }
    }
  };

  const addWaypoint = (lat: number, lng: number) => {
    const newWaypoint: Waypoint = { latitude: lat, longitude: lng };
    waypointsRef.current = [...waypointsRef.current, newWaypoint];
    
    // Add marker to map
    if (mapRef.current) {
      const L = require('leaflet');
      const marker = L.marker([lat, lng]).addTo(mapRef.current);
      markersRef.current.push(marker);
      
      // Update polyline if we have at least 2 points
      updateRouteLine();
    }
  };

  const updateRouteLine = () => {
    const waypoints = waypointsRef.current;
    if (waypoints.length < 2 || !mapRef.current) return;
    
    const L = require('leaflet');
    
    // Remove existing route layer if it exists
    if (routeLayerRef.current) {
      mapRef.current.removeLayer(routeLayerRef.current);
    }
    
    // Create array of latlng points
    const points = waypoints.map(wp => [wp.latitude, wp.longitude]);
    
    // Create polyline and add to map
    const polyline = L.polyline(points, { color: 'blue' }).addTo(mapRef.current);
    routeLayerRef.current = polyline;
    
    // Fit map to show all points
    mapRef.current.fitBounds(polyline.getBounds());
  };

  const clearMap = () => {
    if (mapRef.current) {
      // Remove all markers
      markersRef.current.forEach(marker => {
        mapRef.current.removeLayer(marker);
      });
      markersRef.current = [];
      
      // Remove route line
      if (routeLayerRef.current) {
        mapRef.current.removeLayer(routeLayerRef.current);
        routeLayerRef.current = null;
      }
      
      // Clear waypoints
      waypointsRef.current = [];
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startLocation.name || !endLocation.name || waypointsRef.current.length < 2) {
      setError('Please provide start and end locations and at least 2 waypoints');
      return;
    }
    
    try {
      const routeData: RouteEntryRequest = {
        name: routeName,
        description: routeDescription,
        startLocation: startLocation,
        endLocation: endLocation,
        waypoints: waypointsRef.current
      };
      
      await createRoute(routeData);
      setShowForm(false);
      clearForm();
      clearMap();
      await loadRoutes();
    } catch (err) {
      console.error(err);
      setError('Failed to create route. Please try again.');
    }
  };

  const clearForm = () => {
    setRouteName('');
    setRouteDescription('');
    setStartLocation({ name: '', latitude: 0, longitude: 0 });
    setEndLocation({ name: '', latitude: 0, longitude: 0 });
    waypointsRef.current = [];
  };

  const handleDeleteRoute = async (id: string) => {
    if (confirm('Are you sure you want to delete this route?')) {
      try {
        await deleteRoute(id);
        await loadRoutes();
      } catch (err) {
        console.error(err);
        setError('Failed to delete route. Please try again.');
      }
    }
  };

  const showRouteOnMap = (route: RouteEntry) => {
    setSelectedRoute(route);
    clearMap();
    
    if (mapRef.current) {
      const L = require('leaflet');
      
      // Add start and end markers
      const startMarker = L.marker([route.startLocation.latitude, route.startLocation.longitude])
        .bindPopup(`Start: ${route.startLocation.name}`)
        .addTo(mapRef.current);
      
      const endMarker = L.marker([route.endLocation.latitude, route.endLocation.longitude])
        .bindPopup(`End: ${route.endLocation.name}`)
        .addTo(mapRef.current);
      
      markersRef.current.push(startMarker, endMarker);
      
      // Add waypoint markers
      route.waypoints.forEach((waypoint, index) => {
        const waypointMarker = L.marker([waypoint.latitude, waypoint.longitude])
          .bindPopup(`Waypoint ${index + 1}`)
          .addTo(mapRef.current);
        markersRef.current.push(waypointMarker);
      });
      
      // Create route line
      const points = [
        [route.startLocation.latitude, route.startLocation.longitude],
        ...route.waypoints.map(wp => [wp.latitude, wp.longitude]),
        [route.endLocation.latitude, route.endLocation.longitude]
      ];
      
      const polyline = L.polyline(points, { color: 'blue' }).addTo(mapRef.current);
      routeLayerRef.current = polyline;
      
      // Fit map to show the route
      mapRef.current.fitBounds(polyline.getBounds());
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Route Management</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <button 
          onClick={() => {
            setShowForm(!showForm);
            if (!showForm) {
              clearMap();
              clearForm();
            }
          }}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
        >
          {showForm ? 'Cancel' : 'Create New Route'}
        </button>
      </div>
      
      {showForm && (
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-xl font-bold mb-4">Create New Route</h2>
          <p className="mb-4 text-gray-600">Click on the map to add waypoints for your route.</p>
          
          <form onSubmit={handleSubmit}></form>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="routeName">
                Route Name
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="routeName"
                type="text"
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="routeDescription">
                Description
              </label>
              <textarea
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="routeDescription"
                value={routeDescription}
                onChange={(e) => setRouteDescription(e.target.value)}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startLocationName">
                Start Location Name
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="startLocationName"
                type="text"
                value={startLocation.name}
                onChange={(e) => setStartLocation({...startLocation, name: e.target.value})}
                required
              />
            </div>
            
            <div className="flex mb-4">
              <div className="w-1/2 pr-2">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startLat">
                  Start Latitude
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="startLat"
                  type="number"
                  step="0.000001"
                  value={startLocation.latitude || ''}
                  onChange={(e) => setStartLocation({...startLocation, latitude: parseFloat(e.target.value)})}
                  required
                />
              </div>
              <div className="w-1/2 pl-2">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startLng">
                  Start Longitude
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="startLng"
                  type="number"
                  step="0.000001"
                  value={startLocation.longitude || ''}
                  onChange={(e) => setStartLocation({...startLocation, longitude: parseFloat(e.target.value)})}
                  required
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="endLocationName">
                End Location Name
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="endLocationName"
                type="text"
                value={endLocation.name}
                onChange={(e) => setEndLocation({...endLocation, name: e.target.value})}
                required
              />
            </div>
            
            <div className="flex mb-4">
              <div className="w-1/2 pr-2">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="endLat">
                  End Latitude
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="endLat"
                  type="number"
                  step="0.000001"
                  value={endLocation.latitude || ''}
                  onChange={(e) => setEndLocation({...endLocation, latitude: parseFloat(e.target.value)})}
                  required
                />
              </div>
              <div className="w-1/2 pl-2">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="endLng">
                  End Longitude
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="endLng"
                  type="number"
                  step="0
                  