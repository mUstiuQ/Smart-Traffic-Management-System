using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TrafficManagementApi.Models;
using TrafficManagementApi.Services;
using Microsoft.AspNetCore.Authorization;

namespace TrafficManagementApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RouteController : ControllerBase
    {
        private readonly MongoDbService _mongoDbService;

        public RouteController(MongoDbService mongoDbService)
        {
            _mongoDbService = mongoDbService;
        }

        [HttpGet]
        public async Task<IActionResult> GetRoutes()
        {
            try
            {
                // Get user ID from claims if authenticatedt                
                string userId = User?.Identity?.IsAuthenticated == true ?
                    User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value : string.Empty;
                
                // Get pollution level from query parameter, default to null if not provided
                double? maxPollutionLevel = null;
                if (Request.Query.ContainsKey("maxPollutionLevel") && 
                    double.TryParse(Request.Query["maxPollutionLevel"], out double pollutionLevel))
                {
                    maxPollutionLevel = pollutionLevel;
                }
                
                var routes = await _mongoDbService.GetRouteEntriesAsync(userId, maxPollutionLevel);
                return Ok(routes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error retrieving routes: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        [HttpGet("optimal")]
    public async Task<IActionResult> GetOptimalRoutes()
    {
        try
        {
            // Get user ID from claims if authenticated
            string userId = User?.Identity?.IsAuthenticated == true ?
                User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value : string.Empty;

            // Get all routes for the user
            var routes = await _mongoDbService.GetRouteEntriesAsync(userId, maxPollutionLevel: null);

            // Calculate optimal routes based on distance, pollution, and traffic conditions
            var optimalRoutes = routes
                .OrderBy(r => r.Distance)
                .ThenBy(r => r.PollutionLevel)
                .ThenBy(r => r.TrafficConditions)
                .Take(3)
                .ToList();

            return Ok(optimalRoutes);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error retrieving optimal routes: {ex.Message}");
        }
    }

    public async Task<IActionResult> GetRoute(string id)
    {
            try
            {
                var route = await _mongoDbService.GetRouteEntryByIdAsync(id);
                if (route == null)
                {
                    return NotFound();
                }
                return Ok(route);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error retrieving route: {ex.Message}");
            }
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateRoute([FromBody] RouteEntryRequest routeRequest)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Get user ID from claims
                string userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized("User ID not found in token");
                }

                // Create new route entry
                var routeEntry = new RouteEntry
                {
                    Name = routeRequest.Name,
                    Description = routeRequest.Description,
                    StartLocation = routeRequest.StartLocation,
                    EndLocation = routeRequest.EndLocation,
                    Waypoints = routeRequest.Waypoints,
                    CreatedBy = userId,
                    // Calculate distance and estimated time based on waypoints
                    // This is a simplified calculation - in a real app, you'd use a mapping service
                    Distance = CalculateDistance(routeRequest.StartLocation, routeRequest.EndLocation, routeRequest.Waypoints),
                    EstimatedTime = CalculateEstimatedTime(routeRequest.StartLocation, routeRequest.EndLocation, routeRequest.Waypoints)
                };

                var result = await _mongoDbService.CreateRouteEntryAsync(routeEntry);
                return CreatedAtAction(nameof(GetRoute), new { id = result.Id }, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error creating route: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateRoute(string id, [FromBody] RouteEntryRequest routeRequest)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Get user ID from claims
                string userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized("User ID not found in token");
                }

                // Get existing route
                var existingRoute = await _mongoDbService.GetRouteEntryByIdAsync(id);
                if (existingRoute == null)
                {
                    return NotFound();
                }

                // Check if user is the creator of the route
                if (existingRoute.CreatedBy != userId)
                {
                    return Forbid("You don't have permission to update this route");
                }

                // Update route properties
                existingRoute.Name = routeRequest.Name;
                existingRoute.Description = routeRequest.Description;
                existingRoute.StartLocation = routeRequest.StartLocation;
                existingRoute.EndLocation = routeRequest.EndLocation;
                existingRoute.Waypoints = routeRequest.Waypoints;
                existingRoute.Distance = CalculateDistance(routeRequest.StartLocation, routeRequest.EndLocation, routeRequest.Waypoints);
                existingRoute.EstimatedTime = CalculateEstimatedTime(routeRequest.StartLocation, routeRequest.EndLocation, routeRequest.Waypoints);

                var result = await _mongoDbService.UpdateRouteEntryAsync(id, existingRoute);
                if (!result)
                {
                    return StatusCode(500, "Failed to update route");
                }

                return Ok(existingRoute);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error updating route: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteRoute(string id)
        {
            try
            {
                // Get user ID from claims
                string userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized("User ID not found in token");
                }

                // Get existing route
                var existingRoute = await _mongoDbService.GetRouteEntryByIdAsync(id);
                if (existingRoute == null)
                {
                    return NotFound();
                }

                // Check if user is the creator of the route
                if (existingRoute.CreatedBy != userId)
                {
                    return Forbid("You don't have permission to delete this route");
                }

                var result = await _mongoDbService.DeleteRouteEntryAsync(id);
                if (!result)
                {
                    return StatusCode(500, "Failed to delete route");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error deleting route: {ex.Message}");
            }
        }

        // Helper methods for distance and time calculation
        private double CalculateDistance(Location start, Location end, List<Waypoint> waypoints)
        {
            // Timisoara city boundaries (approximate)
            const double TIMISOARA_CENTER_LAT = 45.7489;
            const double TIMISOARA_CENTER_LON = 21.2087;
            const double TIMISOARA_RADIUS_KM = 5.0; // City radius in kilometers

            // Check if locations are within Timisoara boundaries
            bool isStartInTimisoara = IsLocationInTimisoara(start.Latitude, start.Longitude);
            bool isEndInTimisoara = IsLocationInTimisoara(end.Latitude, end.Longitude);

            if (!isStartInTimisoara || !isEndInTimisoara)
            {
                throw new ArgumentException("Routes must be within Timisoara city limits");
            }

            // Calculate distance using Haversine formula
            return CalculateHaversineDistance(start.Latitude, start.Longitude, end.Latitude, end.Longitude);
        }

        private double CalculateEstimatedTime(Location start, Location end, List<Waypoint> waypoints)
        {
            double distance = CalculateDistance(start, end, waypoints);
            const double AVG_SPEED_KMH = 30.0; // Average speed in Timisoara city
            return (distance / AVG_SPEED_KMH) * 60; // Convert to minutes
        }

        private bool IsLocationInTimisoara(double lat, double lon)
        {
            const double TIMISOARA_CENTER_LAT = 45.7489;
            const double TIMISOARA_CENTER_LON = 21.2087;
            const double TIMISOARA_RADIUS_KM = 5.0;

            double distance = CalculateHaversineDistance(lat, lon, TIMISOARA_CENTER_LAT, TIMISOARA_CENTER_LON);
            return distance <= TIMISOARA_RADIUS_KM;
        }

        private double CalculateHaversineDistance(double lat1, double lon1, double lat2, double lon2)
        {
            const double R = 6371; // Earth's radius in kilometers
            var dLat = ToRad(lat2 - lat1);
            var dLon = ToRad(lon2 - lon1);

            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(ToRad(lat1)) * Math.Cos(ToRad(lat2)) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return R * c;
        }

        private double ToRad(double degrees)
        {
            return degrees * (Math.PI / 180);
        }
    }
}