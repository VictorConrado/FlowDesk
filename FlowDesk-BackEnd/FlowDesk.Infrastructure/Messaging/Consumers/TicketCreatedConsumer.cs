using FlowDesk.Application.Events;
using FlowDesk.Application.Interfaces;
using Microsoft.Extensions.Hosting;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text;
using System.Text.Json;

namespace FlowDesk.Infrastructure.Messaging.Consumers;

public class TicketCreatedConsumer : BackgroundService
{
    private readonly IConnection? _connection;
    private readonly IModel? _channel;

    public TicketCreatedConsumer(
        IRabbitMqConnectionFactory factory)
    {
        Console.WriteLine("Inicializando TicketCreatedConsumer...");

        _connection = factory.CreateConnection();

        if (_connection == null)
        {
            Console.WriteLine(
                "RabbitMQ indisponível. TicketCreatedConsumer desativado."
            );

            return;
        }

        _channel = _connection.CreateModel();

        _channel.QueueDeclare(
            queue: "TicketCreatedEvent",
            durable: true,
            exclusive: false,
            autoDelete: false,
            arguments: null
        );
    }

    protected override Task ExecuteAsync(
        CancellationToken stoppingToken)
    {
        if (_channel == null)
        {
            Console.WriteLine(
                "TicketCreatedConsumer não iniciado porque RabbitMQ está indisponível."
            );

            return Task.CompletedTask;
        }

        Console.WriteLine("TicketCreatedConsumer iniciado");

        var consumer = new EventingBasicConsumer(_channel);

        consumer.Received += (model, ea) =>
        {
            var body = ea.Body.ToArray();
            var json = Encoding.UTF8.GetString(body);

            var message =
                JsonSerializer.Deserialize<TicketCreatedEvent>(json);

            Console.WriteLine(
                $"Novo ticket criado: {message?.Title}"
            );
        };

        _channel.BasicConsume(
            queue: "TicketCreatedEvent",
            autoAck: true,
            consumer: consumer
        );

        return Task.CompletedTask;
    }

    public override void Dispose()
    {
        Console.WriteLine("Encerrando TicketCreatedConsumer...");

        _channel?.Close();
        _connection?.Close();

        base.Dispose();
    }
}