using FlowDesk.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using SendGrid;
using SendGrid.Helpers.Mail;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FlowDesk.Infrastructure.Services
{
    public class EmailService : IEmailService
    {
        private readonly string _apiKey;

        public EmailService(IConfiguration config)
        {
            _apiKey = config["SendGrid:ApiKey"];
        }

        public async Task SendAsync(string to, string subject, string htmlContent)
        {
            var client = new SendGridClient(_apiKey);

            var from = new EmailAddress("estudantecomv@gmail.com", "FlowDesk");
            var toEmail = new EmailAddress(to);

            var msg = MailHelper.CreateSingleEmail(from, toEmail, subject, plainTextContent: "", htmlContent : htmlContent);

            await client.SendEmailAsync(msg);
        }
    }
}
