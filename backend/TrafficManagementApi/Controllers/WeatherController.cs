using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using TrafficManagementApi.Models;

namespace TrafficManagementApi.Controllers
{
    [ApiController]
    [Route("api/weather")]
    public class WeatherController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetCurrentWeather([FromQuery] double? latitude = null, [FromQuery] double? longitude = null)
        {
            try
            {
                // Default to a location if none provided
                double lat = latitude ?? 47.6062;
                double lng = longitude ?? -122.3321;
                
                // This would be replaced with actual weather API integration
                var weatherData = new
                {
                    location = new { latitude = lat, longitude = lng },
                    timestamp = DateTime.UtcNow,
                    temperature = 18.5, // Celsius
                    condition = "Partly Cloudy",
                    precipitation = 0.0,
                    humidity = 65,
                    windSpeed = 12.3,
                    windDirection = "NW",
                    visibility = 9.7,
                    pressure = 1013.2
                };

                return Ok(weatherData);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error retrieving weather data: {ex.Message}");
            }
        }

        [HttpGet("forecast")]
        public IActionResult GetWeatherForecast([FromQuery] double? latitude = null, [FromQuery] double? longitude = null, [FromQuery] int days = 3)
        {
            try
            {
                // Default to a location if none provided
                double lat = latitude ?? 47.6062;
                double lng = longitude ?? -122.3321;
                
                // Limit forecast days
                if (days < 1) days = 1;
                if (days > 7) days = 7;
                
                var forecast = new List<object>();
                var random = new Random();
                var baseTemp = 18.5;
                var conditions = new[] { "Sunny", "Partly Cloudy", "Cloudy", "Light Rain", "Heavy Rain" };
                
                for (int i = 0; i < days; i++)
                {
                    forecast.Add(new
                    {
                        date = DateTime.UtcNow.AddDays(i).Date,
                        temperature = new
                        {
                            min = Math.Round(baseTemp - random.NextDouble() * 5, 1),
                            max = Math.Round(baseTemp + random.NextDouble() * 5, 1)
                        },
                        condition = conditions[random.Next(conditions.Length)],
                        precipitation = Math.Round(random.NextDouble() * 10, 1),
                        humidity = random.Next(50, 90),
                        windSpeed = Math.Round(5 + random.NextDouble() * 15, 1)
                    });
                }

                return Ok(new { location = new { latitude = lat, longitude = lng }, forecast });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error retrieving weather forecast: {ex.Message}");
            }
        }

        [HttpGet("alerts")]
        public IActionResult GetWeatherAlerts([FromQuery] double? latitude = null, [FromQuery] double? longitude = null)
        {
            try
            {
                // Default to a location if none provided
                double lat = latitude ?? 47.6062;
                double lng = longitude ?? -122.3321;
                
                // This would be replaced with actual weather alert API integration
                var alerts = new List<object>
                {
                    new
                    {
                        id = "alert1",
                        type = "Heavy Rain",
                        severity = "Moderate",
                        description = "Heavy rainfall expected with potential for localized flooding",
                        startTime = DateTime.UtcNow.AddHours(2),
                        endTime = DateTime.UtcNow.AddHours(8),
                        affectedAreas = new[] { "Downtown", "North Hills" }
                    },
                    new
                    {
                        id = "alert2",
                        type = "High Winds",
                        severity = "Minor",
                        description = "Gusty winds up to 45 km/h expected",
                        startTime = DateTime.UtcNow.AddHours(4),
                        endTime = DateTime.UtcNow.AddHours(10),
                        affectedAreas = new[] { "Coastal Areas", "East Side" }
                    }
                };

                return Ok(new { location = new { latitude = lat, longitude = lng }, alerts });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error retrieving weather alerts: {ex.Message}");
            }
        }

        [HttpGet("road-conditions")]
        public IActionResult GetRoadWeatherConditions([FromQuery] double? latitude = null, [FromQuery] double? longitude = null)
        {
            try
            {
                // Default to a location if none provided
                double lat = latitude ?? 47.6062;
                double lng = longitude ?? -122.3321;
                
                // This would be replaced with actual road condition API integration
                var roadConditions = new
                {
                    location = new { latitude = lat, longitude = lng },
                    timestamp = DateTime.UtcNow,
                    roadSurface = "Wet",
                    visibility = "Good",
                    temperature = 16.2, // Celsius
                    precipitation = "Light Rain",
                    windEffect = "Low",
                    hazards = new List<object>
                    {
                        new
                        {
                            type = "Standing Water",
                            severity = "Minor",
                            location = new { latitude = lat + 0.01, longitude = lng - 0.01 }
                        }
                    }
                };

                return Ok(roadConditions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error retrieving road weather conditions: {ex.Message}");
            }
        }
    }
}