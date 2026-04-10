using FlowDesk.Application.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using RabbitMQ.Client;

namespace FlowDesk.Infrastructure.Messaging
{
    public class RabbitMqService : IMessageBus
    {
        public void Publish <T>(T message)
        {
            var factory = new ConnectionFactory()
            {
                HostName = "localhost"
            };

            using var connection = factory.CreateConnection();
            using var channel = connection.CreateModel();
        
            var queue = typeof(T).Name;

            channel.QueueDeclare
                (queue: queue, durable: false, exclusive: false, autoDelete: false, arguments: null);

            var json = JsonSerializer.Serialize(message);
            var body = Encoding.UTF8.GetBytes(json);

            channel.BasicPublish(exchange: "", routingKey: queue, basicProperties: null, body: body);
        }
    }
}
