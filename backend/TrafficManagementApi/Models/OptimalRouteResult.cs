using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TrafficManagementApi.Models
{
    public class OptimalRouteResult
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        public double[] OptimalRoute { get; set; }

        public double TotalWeight { get; set; }
    }
}