using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;

namespace TrafficManagementApi.Models
{
    public class RouteEntry
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = string.Empty;

        [BsonElement("name")]
        public string Name { get; set; } = string.Empty;

        [BsonElement("description")]
        public string Description { get; set; } = string.Empty;

        [BsonElement("startLocation")]
        public Location StartLocation { get; set; } = new Location();

        [BsonElement("endLocation")]
        public Location EndLocation { get; set; } = new Location();

        [BsonElement("waypoints")]
        public List<Waypoint> Waypoints { get; set; } = new List<Waypoint>();

        [BsonElement("distance")]
        public double Distance { get; set; } // in kilometers

        [BsonElement("estimatedTime")]
        public double EstimatedTime { get; set; } // in minutes

        [BsonElement("pollutionLevel")]
        public double PollutionLevel { get; set; } // air quality index

        [BsonElement("trafficConditions")]
        public string TrafficConditions { get; set; } = string.Empty; // traffic conditions

        [BsonElement("createdBy")]
        public string CreatedBy { get; set; } = string.Empty; // User ID

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("updatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public class Location
    {
        [BsonElement("name")]
        public string Name { get; set; } = string.Empty;

        [BsonElement("latitude")]
        public double Latitude { get; set; }

        [BsonElement("longitude")]
        public double Longitude { get; set; }
    }

    public class RouteWaypoint
    {
        [BsonElement("name")]
        public string Name { get; set; } = string.Empty;

        [BsonElement("latitude")]
        public double Latitude { get; set; }

        [BsonElement("longitude")]
        public double Longitude { get; set; }

        [BsonElement("environmentalData")]
        public EnvironmentalData EnvironmentalData { get; set; } = new EnvironmentalData();
    }

    public class RouteEntryRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public Location StartLocation { get; set; } = new Location();
        public Location EndLocation { get; set; } = new Location();
        public List<Waypoint> Waypoints { get; set; } = new List<Waypoint>();
    }
}