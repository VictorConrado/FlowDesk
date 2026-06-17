using FlowDesk.Application.Interfaces;
using RabbitMQ.Client;
using System.Text;
using System.Text.Json;

public class RabbitMqService : IMessageBus
{
    private readonly IConnection _connection;
    private readonly IModel _channel;

    public RabbitMqService()
    {
        var factory = new ConnectionFactory()
        {
            HostName = "rabbitmq" // depois trocar pra config
        };

        _connection = factory.CreateConnection();
        _channel = _connection.CreateModel();
    }

    public Task PublishAsync<T>(T message)
    {
        var queue = typeof(T).Name;

        _channel.QueueDeclare(
            queue: queue,
            durable: true,
            exclusive: false,
            autoDelete: false,
            arguments: null
        );

        var json = JsonSerializer.Serialize(message);
        var body = Encoding.UTF8.GetBytes(json);

        var properties = _channel.CreateBasicProperties();
        properties.Persistent = true;

        _channel.BasicPublish(
            exchange: "",
            routingKey: queue,
            basicProperties: properties,
            body: body
        );

        return Task.CompletedTask;
    }
}