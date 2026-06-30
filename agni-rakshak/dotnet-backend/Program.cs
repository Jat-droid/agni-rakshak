using AgniRakshak.Api.Services;

var builder = WebApplication.CreateBuilder(args);

const string ReactDevCors = "ReactDevCors";

builder.Services.AddControllers();
builder.Services.AddSingleton<FireState>();

builder.Services.AddCors(options =>
{
    options.AddPolicy(ReactDevCors, policy =>
        policy.WithOrigins(
                "http://localhost:5173",
                "http://127.0.0.1:5173")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

app.UseCors(ReactDevCors);
app.MapControllers();

app.Run();
