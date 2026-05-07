using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FlowDesk.Domain.Entities
{
    public class TicketComment
    {
        public int Id { get; private set; }

        public int TicketId { get; private set; }
        public Ticket Ticket { get; private set; }

        public int UserId { get; private set; }
        public User User { get; private set; }

        public string Content { get; private set; }

        public DateTime CreatedAt { get; private set; }

        protected TicketComment() { }

        public TicketComment(int ticketId, int userId, string content)
        {
            TicketId = ticketId;
            UserId = userId;
            Content = content;
            CreatedAt = DateTime.UtcNow;
        }
    }
}
