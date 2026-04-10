using FlowDesk.Application.DTOs.Ticket;
using FlowDesk.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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

        [Authorize(Roles = "Admin,Technician")]
        [HttpPut("{id}/assign")]
        public async Task<IActionResult> Assign(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            await _service.AssignAsync(id, userId);
            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}/close")]
        public async Task<IActionResult> Close(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            await _service.CloseAsync(id, userId);
            return NoContent();
        }
    }
}
