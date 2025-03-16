using MongoDB.Bson.Serialization.Attributes;

namespace TrafficManagementApi.Models
{
    public class EnvironmentalData
    {
        [BsonElement("co")]
        public double CO { get; set; }

        [BsonElement("no2")]
        public double NO2 { get; set; }

        [BsonElement("pm25")]
        public double PM25 { get; set; }

        [BsonElement("timestamp")]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        [BsonElement("location")]
        public Location Location { get; set; } = new Location();
    }
}