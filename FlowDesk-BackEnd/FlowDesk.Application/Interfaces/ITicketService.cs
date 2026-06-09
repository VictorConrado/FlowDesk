using FlowDesk.Application.DTOs.Ticket;
using FlowDesk.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FlowDesk.Application.Interfaces
{
    public interface ITicketService
    {
        Task<TicketResponseDto> CreateAsync(int userId, CreateTicketDto dto);
        Task<IEnumerable<TicketResponseDto>> GetAllAsync(int page, int pageSize);
        Task<TicketDetailsDto> GetByIdAsync(int id);

        Task<List<TicketResponseDto>> GetTicketsByUserIdAsync(int userId);

        Task AssignAsync(int ticketId, int technicianId);
        Task CloseAsync(int ticketId, int performedBy, bool isAdmin, string closeComment);

        Task ReopenAsync(int ticketId);

        Task ChangePriorityAsync(int ticketId, string priority);

        Task AddCommentAsync(int ticketId, int userId, string content);

        Task DeleteAsync(int id);
    }
}
