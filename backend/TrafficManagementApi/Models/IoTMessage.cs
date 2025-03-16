using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;

namespace TrafficManagementApi.Models
{
    public class IoTMessage
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        public string Content { get; set; }
        
        public DateTime ReceivedAt { get; set; } = DateTime.UtcNow;
    }
}