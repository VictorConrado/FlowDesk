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

        // api/tickets
        [HttpPost]
        public async Task<IActionResult> Create(CreateTicketDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var result = await _service.CreateAsync(userId, dto);
            return Ok(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(int page = 1, int pageSize = 10)
        {
            var result = await _service.GetAllAsync(page, pageSize);
            return Ok(result);
        }

        [Authorize]
        [HttpGet("my-tickets")]
        public async Task<IActionResult> GetMyTickets()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            var tickets = await _service.GetTicketsByUserIdAsync(userId);

            return Ok(tickets);
        }

        [Authorize(Roles = "Admin,Technician")]
        [HttpPut("{id}/assign")]
        public async Task<IActionResult> Assign(int id, AssingTicketDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            await _service.AssignAsync(id, dto.TechnicianId);

            return NoContent();
        }

        [Authorize(Roles = "Admin, Technician")]
        [HttpPut("{id}/close")]
        public async Task<IActionResult> Close(int id, CloseTicketDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            await _service.CloseAsync(id, userId, role == "Admin" || role == "Technician", dto.Comment);

            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}/reopen")]
        public async Task<IActionResult> Reopen(int id)
        {
            await _service.ReopenAsync(id);

            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}/priority")]
        public async Task<IActionResult> ChangePriority(int id, ChangePriorityDto dto)
        {
             await _service.ChangePriorityAsync(id, dto.Priority);

             return NoContent();
        }

        [Authorize]
        [HttpPost("{id}/comments")]
        public async Task<IActionResult> AddComment(int id, AddCommentDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            await _service.AddCommentAsync(id, userId, dto.Content);

            return NoContent();
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var ticket = await _service.GetByIdAsync(id);

            return Ok(ticket);
        }
    }
}
