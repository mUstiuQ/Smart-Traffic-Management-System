using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using TrafficManagementApi.Models;

namespace TrafficManagementApi.Services
{
    public class MongoDbService
    {
        private readonly IMongoCollection<IoTMessage> _messagesCollection;
        private readonly IMongoCollection<User> _usersCollection;
        private readonly IMongoCollection<RouteEntry> _routeEntriesCollection;
        private readonly IMongoDatabase _database;

        public MongoDbService(string connectionString, string databaseName, string collectionName)
        {
            try
            {
                if (string.IsNullOrEmpty(connectionString))
                    throw new ArgumentException("MongoDB connection string is null or empty");
                if (string.IsNullOrEmpty(databaseName))
                    throw new ArgumentException("Database name is null or empty");
                if (string.IsNullOrEmpty(collectionName))
                    throw new ArgumentException("Collection name is null or empty");

                var client = new MongoClient(connectionString);
                var database = client.GetDatabase(databaseName);
                _messagesCollection = database.GetCollection<IoTMessage>(collectionName);
                _usersCollection = database.GetCollection<User>("Users");
                _routeEntriesCollection = database.GetCollection<RouteEntry>("RouteEntries");
                _database = database;

                // Verify connection
                database.RunCommand((Command<MongoDB.Bson.BsonDocument>)"{ ping: 1 }");
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to initialize MongoDB connection: {ex.Message}", ex);
            }
        }

        // User management methods
        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await _usersCollection.Find(u => u.Email == email).FirstOrDefaultAsync();
        }

        public async Task CreateUserAsync(User user)
        {
            await _usersCollection.InsertOneAsync(user);
        }

        // Existing IoT message methods
        public void InsertMessage(string messageContent)
        {
            var message = new IoTMessage { Content = messageContent };
            _messagesCollection.InsertOne(message);
        }

        public List<IoTMessage> GetMessages()
        {
            return _messagesCollection.Find(_ => true).ToList();
        }

        // Get messages with pagination
        public List<IoTMessage> GetMessages(int page, int pageSize)
        {
            return _messagesCollection.Find(_ => true)
                .Skip((page - 1) * pageSize)
                .Limit(pageSize)
                .SortByDescending(m => m.ReceivedAt)
                .ToList();
        }

        // Get messages by date range
        public List<IoTMessage> GetMessagesByDateRange(DateTime startDate, DateTime endDate)
        {
            var filter = Builders<IoTMessage>.Filter.And(
                Builders<IoTMessage>.Filter.Gte(m => m.ReceivedAt, startDate),
                Builders<IoTMessage>.Filter.Lte(m => m.ReceivedAt, endDate)
            );
            
            return _messagesCollection.Find(filter).ToList();
        }

        // Get message statistics
        public object GetMessageStatistics()
        {
            var totalMessages = _messagesCollection.CountDocuments(_ => true);
            var lastMessage = _messagesCollection.Find(_ => true)
                .SortByDescending(m => m.ReceivedAt)
                .FirstOrDefault();
            
            var last24Hours = _messagesCollection.CountDocuments(
                m => m.ReceivedAt >= DateTime.UtcNow.AddHours(-24)
            );

            return new
            {
                TotalMessages = totalMessages,
                Last24HoursMessages = last24Hours,
                LastMessageTime = lastMessage?.ReceivedAt
            };
        }

        // Get message by ID
        public IoTMessage GetMessageById(string id)
        {
            return _messagesCollection.Find(m => m.Id == id).FirstOrDefault();
        }

        // Delete message by ID
        public bool DeleteMessage(string id)
        {
            var result = _messagesCollection.DeleteOne(m => m.Id == id);
            return result.DeletedCount > 0;
        }

        // Route Entry methods
        public async Task<List<RouteEntry>> GetRouteEntriesAsync(string userId = null, double? maxPollutionLevel = null)
        {
            var filters = new List<FilterDefinition<RouteEntry>>();
            
            // Timisoara city boundaries
            const double TIMISOARA_CENTER_LAT = 45.7489;
            const double TIMISOARA_CENTER_LON = 21.2087;
            const double TIMISOARA_RADIUS = 0.045; // Approximately 5km in degrees

            // Add Timisoara location filter
            filters.Add(
                Builders<RouteEntry>.Filter.And(
                    Builders<RouteEntry>.Filter.Gte(r => r.StartLocation.Latitude, TIMISOARA_CENTER_LAT - TIMISOARA_RADIUS),
                    Builders<RouteEntry>.Filter.Lte(r => r.StartLocation.Latitude, TIMISOARA_CENTER_LAT + TIMISOARA_RADIUS),
                    Builders<RouteEntry>.Filter.Gte(r => r.StartLocation.Longitude, TIMISOARA_CENTER_LON - TIMISOARA_RADIUS),
                    Builders<RouteEntry>.Filter.Lte(r => r.StartLocation.Longitude, TIMISOARA_CENTER_LON + TIMISOARA_RADIUS)
                )
            );
            
            if (userId != null)
                filters.Add(Builders<RouteEntry>.Filter.Eq(r => r.CreatedBy, userId));

            // if (maxPollutionLevel.HasValue)
            // {
            //     filters.Add(Builders<RouteEntry>.Filter.ElemMatch(r => r.Waypoints,
            //         w => w.CO <= maxPollutionLevel.Value
            //         && w.No2 <= maxPollutionLevel.Value
            //         && w.PM25 <= maxPollutionLevel.Value));
            // }

            var filter = Builders<RouteEntry>.Filter.And(filters);
                
            return await _routeEntriesCollection.Find(filter)
                .SortByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<RouteEntry> GetRouteEntryByIdAsync(string id)
        {
            return await _routeEntriesCollection.Find(r => r.Id == id).FirstOrDefaultAsync();
        }

        public async Task<RouteEntry> CreateRouteEntryAsync(RouteEntry routeEntry)
        {
            await _routeEntriesCollection.InsertOneAsync(routeEntry);
            return routeEntry;
        }

        public async Task<bool> UpdateRouteEntryAsync(string id, RouteEntry routeEntryIn)
        {
            routeEntryIn.UpdatedAt = DateTime.UtcNow;
            var result = await _routeEntriesCollection.ReplaceOneAsync(r => r.Id == id, routeEntryIn);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> DeleteRouteEntryAsync(string id)
        {
            var result = await _routeEntriesCollection.DeleteOneAsync(r => r.Id == id);
            return result.DeletedCount > 0;
        }

        // Optimal Route Results methods
        public async Task<List<OptimalRouteResult>> GetOptimalRouteResultsAsync()
        {
            var collection = _database.GetCollection<OptimalRouteResult>("OptimalRouteResults");
            return await collection.Find(_ => true).ToListAsync();
        }
    }
}