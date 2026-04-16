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

        Task<List<Ticket>> GetTicketsByUserIdAsync(int userId);


        Task AssignAsync(int ticketId, int userId);
        Task CloseAsync(int ticketId, int userId);
    }
}
