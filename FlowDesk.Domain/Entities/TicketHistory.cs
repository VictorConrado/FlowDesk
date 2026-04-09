using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FlowDesk.Domain.Entities
{
    public class TicketHistory
    {
        public int Id { get; private set; }
   
        public int TicketId { get; private set; }
        public string Action { get; private set; }

        public int PerformedById { get; private set; }

        public DateTime CreatedAt { get; private set; }

        protected TicketHistory() { }

        public TicketHistory(int ticketId, string action, int performedById)
        {
            TicketId = ticketId;
            Action = action;
            PerformedById = performedById;
            CreatedAt = DateTime.UtcNow;
        }
    }
}
