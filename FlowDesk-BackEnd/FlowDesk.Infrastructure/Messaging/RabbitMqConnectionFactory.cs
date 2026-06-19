using FlowDesk.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using RabbitMQ.Client;

namespace FlowDesk.Infrastructure.Messaging;

public class RabbitMqConnectionFactory : IRabbitMqConnectionFactory
{
    private readonly IConfiguration _configuration;

    public RabbitMqConnectionFactory(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public IConnection? CreateConnection()
    {
        try
        {
            var factory = new ConnectionFactory
            {
                HostName = _configuration["RabbitMQ:Host"],
                UserName = _configuration["RabbitMQ:Username"],
                Password = _configuration["RabbitMQ:Password"],
                VirtualHost = _configuration["RabbitMQ:VirtualHost"],
                Port = int.Parse(_configuration["RabbitMQ:Port"] ?? "5672")
            };

            var useSsl = bool.Parse(_configuration["RabbitMQ:UseSsl"] ?? "false");

            if (useSsl)
            {
                factory.Ssl.Enabled = true;
                factory.Ssl.ServerName = _configuration["RabbitMQ:Host"];
            }

            return factory.CreateConnection();
        }
        catch (Exception ex)
        {
            Console.WriteLine(
                $"RabbitMQ indisponível: {ex.Message}"
            );

            return null;
        }
    }
}