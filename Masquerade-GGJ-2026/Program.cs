using Masquerade_GGJ_2026.Orchestrators;

var builder = WebApplication.CreateBuilder(args);
// Add services to the cont
builder.Services.AddControllers();
builder.Services.AddSignalR();

builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
}); 

builder.Services.AddScoped<GameOrchestrator>();
builder.Services.AddScoped<GameNotifier>();

var app = builder.Build();

app.UseHttpsRedirection();
app.UseStaticFiles();
app.MapFallbackToFile("index.html");

app.UseAuthorization();

app.UseCors("CorsPolicy");

app.MapControllers();

// Mapuj hub Game
app.MapHub<Masquerade_GGJ_2026.Hubs.GameHub>("/hubs/game");

app.Run();
