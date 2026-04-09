using FlowDesk.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FlowDesk.Domain.Entities
{
    public class Ticket
    {
        public int Id { get; private set; }

        public string Title { get; private set; } = string.Empty;
        public string Description { get; private set; } = string.Empty;

        public int CreatedById { get; private set; }
        public User CreatedBy { get; private set; }

        public int? AssignedToId { get; private set; }
        public User? AssignedTo { get; private set; }

        public int CategoryId { get; private set; }
        public Category Category { get; private set; }

        public TicketStatus Status { get; private set; }
        public TicketPriority Priority { get; private set; }

        public DateTime CreatedAt { get; private set; }

        protected Ticket() { }

        public Ticket(string title, string description, int createdById, int categoryId, TicketPriority priority)
        {
            Title = title;
            Description = description;
            CreatedById = createdById;
            CategoryId = categoryId;
            Priority = priority;
            Status = TicketStatus.Open;
            CreatedAt = DateTime.UtcNow;
        }

        public void AssignTo(int userId)
        {
            if (Status == TicketStatus.Closed)
                throw new Exception("Não foi possivel atribuir um ticket fechado");
            
            AssignedToId = userId;
            Status = TicketStatus.InProgress;
        }

        public void Close()
        {
            if (Status == TicketStatus.Closed)
                throw new Exception("O Ticket já está encerrado");

            Status = TicketStatus.Closed;
        }
    }
}
