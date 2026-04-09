using FlowDesk.Application.DTOs.Ticket;
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

        public TicketService(AppDbContext context)
        {
            _context = context;
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
            await _context.SaveChangesAsync();

            return new TicketResponseDto()
            {
               Id = ticket.Id,
               Title = ticket.Title,
               Status = ticket.Status.ToString(),
               Priority = ticket.Priority.ToString(),
            };
        }

        public async Task<IEnumerable<TicketResponseDto>> GetAllAsync(int page, int pageSize)
        {
            var tickets = await _context.Tickets
                .Include(t => t.Category)
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

        public async Task AssignAsync(int ticketId, int userId)
        {
            var ticket = await _context.Tickets.FindAsync(ticketId);

            if (ticket == null)
                throw new Exception("Ticket não encontrado");

            ticket.AssignTo(userId);

            _context.TicketHistories.Add(
                new TicketHistory(ticket.Id, "Ticket atribuído", userId));

            await _context.SaveChangesAsync();
        }

        public async Task CloseAsync(int ticketId, int userId)
        {
           var ticket = await _context.Tickets.FindAsync(ticketId);
            if (ticket == null)
                throw new Exception("Ticket não encontrado");

            ticket.Close();

            _context.TicketHistories.Add(
                new TicketHistory(ticket.Id, "Ticket fechado", userId));
            await _context.SaveChangesAsync();
        }
    }
}
