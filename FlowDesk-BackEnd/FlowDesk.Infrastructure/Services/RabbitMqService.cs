using FlowDesk.Application.Interfaces;
using FlowDesk.Infrastructure.Messaging;
using RabbitMQ.Client;
using System.Text;
using System.Text.Json;

public class RabbitMqService : IMessageBus
{
    private readonly IConnection? _connection;
    private readonly IModel? _channel;

    public RabbitMqService(
        IRabbitMqConnectionFactory factory)
    {
        _connection = factory.CreateConnection();

        if (_connection != null)
        {
            _channel = _connection.CreateModel();
        }
    }

    public Task PublishAsync<T>(T message)
    {
        if (_channel == null)
        {
            Console.WriteLine(
                "RabbitMQ indisponível. Evento ignorado."
            );

            return Task.CompletedTask;
        }

        var queue = typeof(T).Name;

        _channel.QueueDeclare(
            queue,
            true,
            false,
            false,
            null
        );

        var json = JsonSerializer.Serialize(message);

        var body = Encoding.UTF8.GetBytes(json);

        var properties =
            _channel.CreateBasicProperties();

        properties.Persistent = true;

        _channel.BasicPublish(
            "",
            queue,
            properties,
            body
        );

        return Task.CompletedTask;
    }
}