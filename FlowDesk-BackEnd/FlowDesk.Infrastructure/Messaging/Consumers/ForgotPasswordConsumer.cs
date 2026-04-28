using FlowDesk.Application.Events;
using Microsoft.Extensions.Hosting;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text;
using System.Text.Json;

namespace FlowDesk.Infrastructure.Messaging.Consumers
{
    public class ForgotPasswordConsumer : BackgroundService
    {
        private readonly IConnection _connection;
        private readonly IModel _channel;

        public ForgotPasswordConsumer()
        {
            var factory = new ConnectionFactory()
            {
                HostName = "localhost"
            };

            _connection = factory.CreateConnection();
            _channel = _connection.CreateModel();

            _channel.QueueDeclare(
                queue: "ForgotPasswordRequestedEvent",
                durable: true,
                exclusive: false,
                autoDelete: false,
                arguments: null
            );
        }

        protected override Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var consumer = new EventingBasicConsumer(_channel);

            consumer.Received += (sender, eventArgs) =>
            {
                var body = eventArgs.Body.ToArray();
                var json = Encoding.UTF8.GetString(body);

                var message = JsonSerializer.Deserialize<ForgotPasswordRequestedEvent>(json);

                if (message == null)
                    return;

                var resetLink = $"http://localhost:5173/reset-password?token={message.Token}";

                Console.WriteLine("📩 EMAIL SIMULADO");
                Console.WriteLine($"Para: {message.Email}");
                Console.WriteLine($"Link: {resetLink}");

                _channel.BasicAck(eventArgs.DeliveryTag, false);
            };

            _channel.BasicConsume(
                queue: "ForgotPasswordRequestedEvent",
                autoAck: false,
                consumer: consumer
            );

            return Task.CompletedTask;
        }

        public override void Dispose()
        {
            _channel.Close();
            _connection.Close();
            base.Dispose();
        }
    }
}