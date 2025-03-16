using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Http;
using System.Text.Json;
using TrafficManagementApi.Models;
using TrafficManagementApi.Services;

namespace TrafficManagementApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly MongoDbService _mongoDbService;
        private readonly IOptions<Auth0Settings> _auth0Settings;
        private readonly IHttpClientFactory _httpClientFactory;

        public AuthController(MongoDbService mongoDbService, IOptions<Auth0Settings> auth0Settings, IHttpClientFactory httpClientFactory)
        {
            _mongoDbService = mongoDbService;
            _auth0Settings = auth0Settings;
            _httpClientFactory = httpClientFactory;
        }

        [HttpPost("google-login")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleTokenRequest request)
        {
            try
            {
                var payload = await ValidateGoogleToken(request.IdToken);
                if (payload == null)
                {
                    return Unauthorized("Invalid Google token");
                }

                // Check if user exists in database
                var user = await _mongoDbService.GetUserByEmailAsync(payload.Email);
                if (user == null)
                {
                    // Create new user
                    user = new User
                    {
                        Email = payload.Email,
                        Username = payload.Name,
                        Role = "user"
                    };
                    await _mongoDbService.CreateUserAsync(user);
                }

                return Ok(new
                {
                    Email = user.Email,
                    Username = user.Username,
                    Role = user.Role
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        private async Task<GoogleTokenPayload> ValidateGoogleToken(string idToken)
        {
            using var httpClient = _httpClientFactory.CreateClient();
            var validationUrl = $"https://oauth2.googleapis.com/tokeninfo?id_token={idToken}";

            var response = await httpClient.GetAsync(validationUrl);
            if (!response.IsSuccessStatusCode)
            {
                return null;
            }

            var content = await response.Content.ReadAsStringAsync();
            var tokenInfo = JsonSerializer.Deserialize<GoogleTokenInfo>(content);

            return new GoogleTokenPayload
            {
                Email = tokenInfo.Email,
                Name = tokenInfo.Name
            };
        }

        private class GoogleTokenInfo
        {
            public string Email { get; set; }
            public string Name { get; set; }
        }

        public class GoogleTokenRequest
        {
            public string IdToken { get; set; }
        }

        public class GoogleTokenPayload
        {
            public string Email { get; set; }
            public string Name { get; set; }
        }
    }
}