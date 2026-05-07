using FlowDesk.Application.DTOs.Ticket;
using FlowDesk.Application.Events;
using FlowDesk.Application.Interfaces;
using FlowDesk.Domain.Entities;
using FlowDesk.Domain.Enums;
using FlowDesk.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FlowDesk.Infrastructure.Services
{
    public class TicketService : ITicketService
    {
        private readonly AppDbContext _context;

        private readonly IMessageBus _bus;

        public TicketService(AppDbContext context, IMessageBus bus)
        {
            _context = context;
            _bus = bus;
        }

        public async Task<TicketResponseDto> CreateAsync(int userId, CreateTicketDto dto)
        {
            var ticket = new Ticket(
                dto.Title,
                dto.Description,
                userId,
                dto.CategoryId,
                (TicketPriority)dto.Priority
                );

            _context.Tickets.Add(ticket);

            _context.TicketHistories.Add(
                new TicketHistory(
                    ticket.Id,
                    "Ticket criado",
                    userId
                ));

            await _context.SaveChangesAsync();
           
            await _bus.PublishAsync(new TicketCreatedEvent
            {
                TicketId = ticket.Id,
                Title = ticket.Title
            });

            var category = await _context.Categories
                   .FirstOrDefaultAsync(c => c.Id == dto.CategoryId);

            return new TicketResponseDto()
            {
               Id = ticket.Id,
               Title = ticket.Title,
               Status = ticket.Status.ToString(),
               Priority = ticket.Priority.ToString(),
               Category = category?.Name ?? ""
            };
        }

        public async Task<IEnumerable<TicketResponseDto>> GetAllAsync(int page, int pageSize)
        {
            var tickets = await _context.Tickets
                .Include(t => t.Category)
                .Include(t => t.AssignedTo)
                .Include(t => t.CreatedBy)
                .OrderByDescending(t => t.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return tickets.Select(t => new TicketResponseDto
            {
                Id = t.Id,
                Title = t.Title,
                Status = t.Status.ToString(),
                Priority = t.Priority.ToString(),
                Category = t.Category.Name
            });

        }

        public async Task<TicketDetailsDto> GetByIdAsync(int id)
        {
            var ticket = await _context.Tickets
                .Include(t => t.Category)
                .Include(t => t.CreatedBy)
                .Include(t => t.AssignedTo)
                .Include(t => t.Comments)
                    .ThenInclude(c => c.User)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (ticket == null)
                throw new Exception("Ticket não encontrado");

            return new TicketDetailsDto
            {
                Id = ticket.Id,
                Number = ticket.Number,
                Title = ticket.Title,
                Description = ticket.Description,
                Status = ticket.Status.ToString(),
                Priority = ticket.Priority.ToString(),
                Category = ticket.Category.Name,
                OpenedBy = ticket.CreatedBy.Name,
                AssignedTo = ticket.AssignedTo?.Name,
                CreatedAt = ticket.CreatedAt,
                ClosedAt = ticket.ClosedAt,
                SLAExpiresAt = ticket.SLAExpiresAt,
                ClosingComment = ticket.ClosingComment,

                Comments = ticket.Comments
                    .OrderBy(c => c.CreatedAt)
                    .Select(c => new TicketCommentDto
                    {
                        User = c.User.Name,
                        Content = c.Content,
                        CreatedAt = c.CreatedAt
                    })
                    .ToList()
            };

        }

        public async Task AssignAsync(int ticketId, int technicianId)
        {
            var ticket = await _context.Tickets.FirstOrDefaultAsync(t => t.Id == ticketId);

            if (ticket == null)
                throw new Exception("Ticket não encontrado");

            var technician = await _context.Users
               .FirstOrDefaultAsync(u =>
                   u.Id == technicianId &&
                   (u.Role.Name == "Admin" || u.Role.Name == "Technician"));

            if (technician == null)
                throw new Exception("Usuário inválido para atribuição");

            ticket.AssignTo(technicianId);

            _context.TicketHistories.Add(
                new TicketHistory(
                    ticket.Id,
                    $"Ticket atribuído para {technician.Name}",
                    technicianId
                ));

            await _context.SaveChangesAsync();
        }

        public async Task<List<Ticket>>GetTicketsByUserIdAsync(int userId)
        {

            return await _context.Tickets
                .Include(t => t.Category)
                .Where(t =>
                    t.AssignedToId == userId ||
                    t.CreatedById == userId)
                .ToListAsync();
        }


        public async Task CloseAsync(int ticketId, int performedById, bool isAdmin, string closingComment)
        {
           var ticket = await _context.Tickets.FirstOrDefaultAsync(t => t.Id == ticketId);
           
            if (ticket == null)
                throw new Exception("Ticket não encontrado");

            if (!isAdmin && ticket.AssignedToId != performedById)
                throw new Exception("Somente responsável pode fechar");

            if (isAdmin)
            {
                ticket.ForceClose(closingComment);
            }
            else
            {
                ticket.Close(performedById, closingComment);
            }

            _context.TicketHistories.Add(
                new TicketHistory(
                    ticket.Id,
                    "Ticket fechado",
                    performedById
                ));

            await _context.SaveChangesAsync();
        }

        public async Task ReopenAsync(int ticketId)
        {
            var ticket = await _context.Tickets
                .FirstOrDefaultAsync(t => t.Id == ticketId);

            if (ticket == null)
                throw new Exception("Ticket não encontrado");

            ticket.Reopen();

            _context.TicketHistories.Add(
                new TicketHistory(
                    ticket.Id,
                    "Ticket reaberto",
                    0
                ));

            await _context.SaveChangesAsync();
        }

        public async Task ChangePriorityAsync(int ticketId, string priority)
        {
            var ticket = await _context.Tickets
                .FirstOrDefaultAsync(t => t.Id == ticketId);

            if (ticket == null)
                throw new Exception("Ticket não encontrado");

            if (!Enum.TryParse<TicketPriority>(priority, true, out var parsedPriority))
            {
                throw new Exception("Prioridade inválida");
            }

            ticket.ChangePriority(parsedPriority);

            _context.TicketHistories.Add(
                new TicketHistory(
                    ticket.Id,
                    $"Prioridade alterada para {ticket.Priority}",
                    0
                ));

            await _context.SaveChangesAsync();
        }

        public async Task AddCommentAsync(int ticketId, int userId, string content)
        {
            var ticket = await _context.Tickets
                .Include(t => t.Comments)
                .FirstOrDefaultAsync(t => t.Id == ticketId);

            if (ticket == null)
                throw new Exception("Ticket não encontrado");

            ticket.AddComment(userId, content);

            _context.TicketHistories.Add(
                new TicketHistory(
                    ticket.Id,
                    "Comentário adicionado",
                    userId
                ));

            await _context.SaveChangesAsync();
        }
    }
}
