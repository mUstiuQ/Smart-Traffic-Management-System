using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using TrafficManagementApi.Services;
using TrafficManagementApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure Auth0
var auth0Settings = builder.Configuration.GetSection("Auth0").Get<Auth0Settings>();
builder.Services.Configure<Auth0Settings>(builder.Configuration.GetSection("Auth0"));

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.Authority = $"https://{auth0Settings.Domain}/";
    options.Audience = auth0Settings.Audience;
});

// Configure MongoDB service
var mongoConnectionString = builder.Configuration["MongoDB:ConnectionString"];
var mongoDatabaseName = builder.Configuration["MongoDB:DatabaseName"];
var mongoCollectionName = builder.Configuration["MongoDB:CollectionName"];

builder.Services.AddSingleton(new MongoDbService(
    mongoConnectionString,
    mongoDatabaseName,
    mongoCollectionName));

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowNextJsApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    // Disable HTTPS redirection in development to avoid CORS issues
    // with the frontend running on http://localhost:3000
}
else
{
    // Only use HTTPS redirection in production
    app.UseHttpsRedirection();
}

// Apply CORS before other middleware
app.UseCors("AllowNextJsApp");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
