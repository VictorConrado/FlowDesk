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

        public Guid Number { get; private set; }

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

        public string? ClosingComment { get; private set; }

        public DateTime SLAExpiresAt { get; private set; }

        public DateTime CreatedAt { get; private set; }
        public DateTime? ClosedAt { get; private set; }

        public ICollection<TicketComment> Comments { get; private set; } = new List<TicketComment>();

        protected Ticket() { }

        public Ticket(string title, string description, int createdById, int categoryId, TicketPriority priority)
        {
            Number = Guid.NewGuid();

            Title = title;
            Description = description;
            CreatedById = createdById;
            CategoryId = categoryId;
            Priority = priority;
            Status = TicketStatus.Open;
            CreatedAt = DateTime.UtcNow;

            SLAExpiresAt = CalculateSLA(priority);
        }

        private DateTime CalculateSLA(TicketPriority priority)
        {
            return priority switch
            {
                TicketPriority.Low => DateTime.UtcNow.AddHours(72),
                TicketPriority.Medium => DateTime.UtcNow.AddHours(24),
                TicketPriority.High => DateTime.UtcNow.AddHours(4),
                _ => DateTime.UtcNow.AddHours(24)
            };
        }

        public void AssignTo(int userId)
        {
            if (Status == TicketStatus.Closed)
                throw new Exception("Ticket encerrado");
            
            AssignedToId = userId;
            Status = TicketStatus.InProgress;
        }

        public void ChangePriority(TicketPriority priority)
        {
            Priority = priority;

            SLAExpiresAt = CalculateSLA(priority);
        }

        public void AddComment(int userId, string content)
        {
            Comments.Add(new TicketComment(Id, userId, content));
        }

        public void Close(int performedById, string closingComment)
        {
            if (Status == TicketStatus.Closed)
                throw new Exception("O Ticket já está encerrado");

            if (AssignedToId != performedById)
                throw new Exception("Somente responsável pode fechar");

            Status = TicketStatus.Closed;

            ClosingComment = closingComment;

            ClosedAt = DateTime.UtcNow;
        }

        public void ForceClose(string closingComment)
        {
            Status = TicketStatus.Closed;

            ClosingComment = closingComment;

            ClosedAt = DateTime.UtcNow;
        }

        public void Reopen()
        {
            if (Status != TicketStatus.Closed)
                throw new Exception("Ticket não está fechado");

            Status = TicketStatus.InProgress;

            ClosedAt = null;
        }
    }
}
