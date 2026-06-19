using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FlowDesk.Infrastructure.Messaging
{
    public class RabbitMqOptions
    {
        public string Host { get; set; } = string.Empty;

        public int Port { get; set; } = 5672;

        public string Username { get; set; } = "guest";

        public string Password { get; set; } = "guest";

        public string VirtualHost { get; set; } = "/";

        public bool UseSsl { get; set; }
    }
}
