using FlowDesk.Application.Events;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace FlowDesk.Infrastructure.Messaging
{
    public class TicketCreatedConsumer
    {
        public void Start()
        {
            var factory = new ConnectionFactory()
            {
                HostName = "localhost"
            };

            var connection = factory.CreateConnection();
            var channel = connection.CreateModel();

            channel.QueueDeclare(
                queue: "TicketCreatedEvent",
                durable: false,
                exclusive: false,
                autoDelete: false,
                arguments: null
            );

            var consumer = new EventingBasicConsumer(channel);

            consumer.Received += (model, ea) =>
            {
                var body = ea.Body.ToArray();
                var json = Encoding.UTF8.GetString(body);

                var message = JsonSerializer.Deserialize<TicketCreatedEvent>(json);

                Console.WriteLine($"Novo ticket criado: {message?.Title}");
            };

            channel.BasicConsume(
                queue: "TicketCreatedEvent",
                autoAck: true,
                consumer: consumer
            );

        }
    }
}
