using FlowDesk.Application.Events;
using FlowDesk.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
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
        private readonly IServiceScopeFactory _scopeFactory;

        public ForgotPasswordConsumer(IServiceScopeFactory scopeFactory, IRabbitMqConnectionFactory factory)
        {
            _scopeFactory = scopeFactory;

            Console.WriteLine("ForgotPasswordConsumer iniciado");

            _connection = factory.CreateConnection();

            if (_connection == null)
            {
                Console.WriteLine(
                    "RabbitMQ indisponível. ForgotPasswordConsumer desativado."
                );

                return;
            }

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
            if (_channel == null)
            {
                return Task.CompletedTask;
            }

            Console.WriteLine("Consumer escutando fila...");

            var consumer = new EventingBasicConsumer(_channel);

            consumer.Received += async (sender, eventArgs) =>
            {
                try
                {
                    Console.WriteLine("Mensagem recebida!");

                    var body = eventArgs.Body.ToArray();
                    var json = Encoding.UTF8.GetString(body);

                    var message = JsonSerializer.Deserialize<ForgotPasswordRequestedEvent>(json);

                    if (message == null)
                    {
                        Console.WriteLine("Mensagem inválida");
                        _channel.BasicAck(eventArgs.DeliveryTag, false);
                        return;
                    }

                    var resetLink = $"http://localhost:5173/reset-password?token={message.Token}";

                    var html = $@"
                        <h2>Recuperação de senha</h2>
                        <p>Clique no botão abaixo para redefinir sua senha:</p>
                        <a href='{resetLink}'
                           style='display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none;'>
                           Resetar senha
                        </a>
                        <p>Se você não solicitou, ignore este email.</p>
                    ";

                    using (var scope = _scopeFactory.CreateScope())
                    {
                        var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

                        await emailService.SendAsync(
                            message.Email,
                            "Recuperação de senha - FlowDesk",
                            html
                        );
                    }

                    Console.WriteLine("Email enviado");

                    _channel.BasicAck(eventArgs.DeliveryTag, false);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Erro ao processar mensagem: {ex.Message}");

                    _channel.BasicNack(eventArgs.DeliveryTag, false, false);
                }
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
            Console.WriteLine("Encerrando consumer...");

            _channel?.Close();
            _connection?.Close();

            base.Dispose();
        }
    }
}