using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FlowDesk.Application.Events
{
    public class TicketCreatedEvent
    {
        public int TicketId { get; set; }
        public string Title { get; set; }
    }
}
