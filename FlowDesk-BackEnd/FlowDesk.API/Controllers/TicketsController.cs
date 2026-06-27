using FlowDesk.Application.DTOs.Ticket;
using FlowDesk.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FlowDesk.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TicketsController : ControllerBase
    {
        private readonly ITicketService _service;

        public TicketsController(ITicketService service)
        {
            _service = service;
        }

        /// <summary>
        ///   Endpoint para criar um novo ticket.
        /// </summary>
         [HttpPost]
        public async Task<IActionResult> Create(CreateTicketDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var result = await _service.CreateAsync(userId, dto);
            return Ok(result);
        }

        /// <summary>
        ///  Endpoint para obter todos os tickets com paginação.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll(int page = 1, int pageSize = 10)
        {
            var result = await _service.GetAllAsync(page, pageSize);
            return Ok(result);
        }

        /// <summary>
        ///  Endpoint para obter todos os tickets do usuario logado.
        /// </summary>
        [Authorize]
        [HttpGet("my-tickets")]
        public async Task<IActionResult> GetMyTickets()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            var tickets = await _service.GetTicketsByUserIdAsync(userId);

            return Ok(tickets);
        }

        /// <summary>
        ///  Endpoint para atribuir um ticket a um técnico específico.
        /// </summary>
        [Authorize(policy: "TechnicianOnly")]
        [HttpPut("{id}/assign")]
        public async Task<IActionResult> Assign(int id, [FromBody] AssingTicketDto dto)
        {
            if (dto.TechnicianId <= 0)
                return BadRequest("TechnicianId inválido");

            await _service.AssignAsync(id, dto.TechnicianId);

            return NoContent();
        }

        /// <summary>
        ///  Endpoint para fechar um ticket. Apenas técnicos e administradores podem fechar tickets.
        /// </summary>
        [Authorize(policy: "TechnicianOnly")]
        [HttpPut("{id}/close")]
        public async Task<IActionResult> Close(int id, CloseTicketDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            await _service.CloseAsync(id, userId, role == "Admin" || role == "Technician", dto.Comment);

            return NoContent();
        }

        /// <summary>
        ///  Endpoint para reabrir um ticket. Apenas administradores podem reabrir tickets.
        /// </summary>
        [Authorize(policy: "AdminOnly")]
        [HttpPut("{id}/reopen")]
        public async Task<IActionResult> Reopen(int id)
        {
            await _service.ReopenAsync(id);

            return NoContent();
        }

        /// <summary>
        ///  Endpoint para alterar a prioridade de um ticket. Apenas administradores podem alterar a prioridade.
        /// </summary>
        [Authorize(policy: "AdminOnly")]
        [HttpPut("{id}/priority")]
        public async Task<IActionResult> ChangePriority(int id, ChangePriorityDto dto)
        {
            await _service.ChangePriorityAsync(id, dto.Priority);

            return NoContent();
        }

        /// <summary>
        ///  Endpoint para adicionar um comentário a um ticket. Apenas usuários autenticados podem adicionar comentários.
        /// </summary>
        [Authorize]
        [HttpPost("{id}/comments")]
        public async Task<IActionResult> AddComment(int id, AddCommentDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            await _service.AddCommentAsync(id, userId, dto.Content);

            return NoContent();
        }

        /// <summary>
        ///  Endpoint para obter um ticket específico pelo ID. Apenas usuários autenticados podem acessar este endpoint.
        /// </summary>
        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var ticket = await _service.GetByIdAsync(id);

            return Ok(ticket);
        }

        /// <summary>
        ///  Endpoint para deletar um ticket específico pelo ID. Apenas super administradores podem deletar tickets.
        /// </summary>
        [Authorize(policy: "SuperAdminOnly")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.DeleteAsync(id);

            return NoContent();
        }
    }
}
