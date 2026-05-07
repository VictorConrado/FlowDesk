using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FlowDesk.Application.DTOs.Ticket
{
    public class TicketCommentDto
    {
        public string User { get; set; }

        public string Content { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
