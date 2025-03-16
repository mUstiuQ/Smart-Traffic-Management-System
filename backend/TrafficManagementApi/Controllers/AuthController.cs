using Microsoft.AspNetCore.Mvc;
using TrafficManagementApi.Models;
using TrafficManagementApi.Services;
using BCrypt.Net;

using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;

namespace TrafficManagementApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly MongoDbService _mongoDbService;
        private readonly IConfiguration _configuration;

        public AuthController(MongoDbService mongoDbService, IConfiguration configuration)
        {
            _mongoDbService = mongoDbService;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(UserRegister userRegister)
        {
            // Check if email already exists
            var existingUser = await _mongoDbService.GetUserByEmailAsync(userRegister.Email);
            if (existingUser != null)
            {
                return BadRequest("Email already registered");
            }

            // Create new user
            var user = new User
            {
                Username = userRegister.Username,
                Email = userRegister.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(userRegister.Password)
            };

            await _mongoDbService.CreateUserAsync(user);
            return Ok("User registered successfully");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(UserLogin userLogin)
        {
            try
            {
                // Validate input
                if (string.IsNullOrEmpty(userLogin.Email) || string.IsNullOrEmpty(userLogin.Password))
                {
                    Console.WriteLine("Login failed: Email and password are required");
                    return BadRequest("Email and password are required");
                }

                // Find user by email
                var user = await _mongoDbService.GetUserByEmailAsync(userLogin.Email);
                if (user == null)
                {
                    Console.WriteLine($"Login failed: User with email {userLogin.Email} not found");
                    return BadRequest("Invalid email or password");
                }

                // Verify password
                bool passwordValid = BCrypt.Net.BCrypt.Verify(userLogin.Password, user.PasswordHash);
                if (!passwordValid)
                {
                    Console.WriteLine($"Login failed: Invalid password for user {userLogin.Email}");
                    return BadRequest("Invalid email or password");
                }

                return Ok(new { message = "Login successful" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Login error: {ex.Message}");
                return StatusCode(500, "An error occurred during login");
            }
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            // In a more sophisticated implementation, you might want to:
            // 1. Add the token to a blacklist
            // 2. Implement token revocation
            // 3. Use refresh tokens that can be invalidated
            
            // For now, we'll just return a success response as the frontend handles the token removal
            return Ok(new { message = "Logged out successfully" });
        }

        
    }
}