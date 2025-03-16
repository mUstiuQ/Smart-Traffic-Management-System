using System;
using System.Text;
using System.Collections.Generic;
using System.Threading.Tasks;
using Azure.Messaging.EventHubs;
using Azure.Messaging.EventHubs.Consumer;
using Microsoft.AspNetCore.Mvc;
using TrafficManagementApi.Services;
using TrafficManagementApi.Models;

namespace TrafficManagementApi.Controllers
{
    [ApiController]
    [Route("api/iot")]
    public class IoTController : ControllerBase
    {
        private readonly string _connectionString;
        private readonly string _eventHubName;
        private readonly string _consumerGroup;
        private readonly MongoDbService _mongoDbService;

        public IoTController(MongoDbService mongoDbService, IConfiguration configuration)
        {
            _mongoDbService = mongoDbService;
            _connectionString = configuration["IoTHub:ConnectionString"];
            _eventHubName = configuration["IoTHub:EventHubName"];
            _consumerGroup = EventHubConsumerClient.DefaultConsumerGroupName;
        }

        [HttpGet("fetch")]
        public async Task<IActionResult> FetchAndStoreMessages()
        {
            try
            {
                await using var consumer = new EventHubConsumerClient(_consumerGroup, _connectionString, _eventHubName);
                var messages = new List<string>();

                await foreach (PartitionEvent partitionEvent in consumer.ReadEventsAsync(startReadingAtEarliestEvent: true, cancellationToken: HttpContext.RequestAborted))
                {
                    string message = Encoding.UTF8.GetString(partitionEvent.Data.Body.ToArray());
                    messages.Add(message);

                    // Store in Remote MongoDB
                    _mongoDbService.InsertMessage(message);
                    // break;  // Fetch only one message at a time - removed for testing
                }

                return Ok(messages.Count > 0 ? messages : new List<string> { "No new messages" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error fetching messages: {ex.Message}");
            }
        }

        [HttpGet("messages")]
        public IActionResult GetStoredMessages()
        {
            try
            {
                var messages = _mongoDbService.GetMessages();
                return Ok(messages);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error retrieving messages: {ex.Message}");
            }
        }

        [HttpGet("messages/paged")]
        public IActionResult GetPagedMessages([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                if (page < 1) page = 1;
                if (pageSize < 1 || pageSize > 100) pageSize = 10;

                var messages = _mongoDbService.GetMessages(page, pageSize);
                return Ok(messages);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error retrieving paged messages: {ex.Message}");
            }
        }

        [HttpGet("messages/daterange")]
        public IActionResult GetMessagesByDateRange([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            try
            {
                if (startDate > endDate)
                {
                    return BadRequest("Start date must be before end date");
                }

                var messages = _mongoDbService.GetMessagesByDateRange(startDate, endDate);
                return Ok(messages);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error retrieving messages by date range: {ex.Message}");
            }
        }

        [HttpGet("messages/statistics")]
        public IActionResult GetMessageStatistics()
        {
            try
            {
                var statistics = _mongoDbService.GetMessageStatistics();
                return Ok(statistics);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error retrieving message statistics: {ex.Message}");
            }
        }

        [HttpGet("messages/{id}")]
        public IActionResult GetMessageById(string id)
        {
            try
            {
                var message = _mongoDbService.GetMessageById(id);
                if (message == null)
                {
                    return NotFound($"Message with ID {id} not found");
                }
                return Ok(message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error retrieving message: {ex.Message}");
            }
        }

        [HttpDelete("messages/{id}")]
        public IActionResult DeleteMessage(string id)
        {
            try
            {
                var result = _mongoDbService.DeleteMessage(id);
                if (!result)
                {
                    return NotFound($"Message with ID {id} not found");
                }
                return Ok($"Message with ID {id} deleted successfully");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error deleting message: {ex.Message}");
            }
        }
    }
}