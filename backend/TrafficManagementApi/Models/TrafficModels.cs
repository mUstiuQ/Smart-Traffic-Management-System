using System;
using System.Collections.Generic;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TrafficManagementApi.Models
{
    public class CongestionData
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        
        public List<CongestionLocation> Locations { get; set; } = new List<CongestionLocation>();
    }
    
    public class CongestionLocation
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string CongestionLevel { get; set; } // Low, Medium, High
        public double AverageSpeed { get; set; } // in km/h or mph
    }
    
    public class RouteData
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        
        public string RouteId { get; set; }
        public double EstimatedTime { get; set; } // in minutes
        public double Distance { get; set; } // in km or miles
        public string CongestionLevel { get; set; } // Low, Medium, High
        public List<Waypoint> Waypoints { get; set; } = new List<Waypoint>();
        public DateTime CalculatedAt { get; set; } = DateTime.UtcNow;
    }
    
    public class Waypoint
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }
    
    public class TrafficStatistics
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        
        public DateTime Date { get; set; }
        public double AverageSpeed { get; set; } // in km/h or mph
        public string PeakCongestionTime { get; set; } // e.g., "08:15 - 09:30"
        public int TotalVehicles { get; set; }
        public Dictionary<int, string> CongestionByHour { get; set; } = new Dictionary<int, string>();
    }
    
    public class TrafficIncident
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        
        public string IncidentType { get; set; } // Accident, Construction, etc.
        public string Severity { get; set; } // Low, Medium, High
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public DateTime ReportedAt { get; set; }
        public DateTime EstimatedClearTime { get; set; }
        public int AffectedLanes { get; set; }
    }
}