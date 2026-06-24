using FlowDesk.Application.Interfaces;
using FlowDesk.Infrastructure.Data;
using FlowDesk.Infrastructure.Messaging;
using FlowDesk.Infrastructure.Messaging.Consumers;
using FlowDesk.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("Default"),
        ServerVersion.AutoDetect(
            builder.Configuration.GetConnectionString("Default")
        )
    ));


// RabbitMQ
builder.Services.Configure<RabbitMqOptions>(
    builder.Configuration.GetSection("RabbitMQ")
);

builder.Services.AddSingleton<
    IRabbitMqConnectionFactory,
    RabbitMqConnectionFactory>();

builder.Services.AddSingleton<IMessageBus, RabbitMqService>();


// Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITicketService, TicketService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IEmailService, EmailService>();


// Consumers
builder.Services.AddHostedService<ForgotPasswordConsumer>();

// Quando transformar o TicketCreatedConsumer em BackgroundService:
builder.Services.AddHostedService<TicketCreatedConsumer>();


// JWT
builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer("Bearer", options =>
    {
        options.TokenValidationParameters = new()
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(
                    builder.Configuration["Jwt:Key"]!
                )
            )
        };
    });


// Authorization
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy(
        "AdminOnly",
        policy => policy.RequireRole(
            "Admin",
            "SuperAdmin"
        ));

    options.AddPolicy(
        "SuperAdminOnly",
        policy => policy.RequireRole(
            "SuperAdmin"
        ));

    options.AddPolicy(
        "TechnicianOnly",
        policy => policy.RequireRole(
            "Technician",
            "Admin",
            "SuperAdmin"
        ));
});


// Swagger
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc(
        "v1",
        new OpenApiInfo
        {
            Title = "FlowDesk API",
            Version = "v1"
        });

    options.AddSecurityDefinition(
        "Bearer",
        new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "Digite: Bearer {token}"
        });

    options.AddSecurityRequirement(
        new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },
                Array.Empty<string>()
            }
        });
});


// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:3000",
                "http://localhost:5173",
                "https://flow-desk-3uh2xxq8l-victorange.vercel.app"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors("AllowFrontend");

app.UseSwagger();
app.UseSwaggerUI();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider
        .GetRequiredService<AppDbContext>();

    db.Database.Migrate();
}

app.Run();