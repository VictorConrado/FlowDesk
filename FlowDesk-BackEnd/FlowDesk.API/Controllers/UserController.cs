using FlowDesk.Application.DTOs.Users;
using FlowDesk.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FlowDesk.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly Application.Interfaces.IUserService _userService;

        public UserController(Application.Interfaces.IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromServices] Application.Interfaces.IUserService userService)
        {
            var users = await userService.GetAllAsync();
            return Ok(users);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetByIdAsync(int id)
        {
            var user = await _userService.GetAllAsync().ContinueWith(t => t.Result.FirstOrDefault(u => u.Id == id));  
            if (user == null)
                return NotFound("Usuario não encontrado");
            return Ok(user);
        }

        [HttpPut("{id}/role")]
        public async Task<IActionResult> UpdateRoleAsync(int id, [FromBody] UpdateUserRoleDto dto)
        {
            var loggedUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            if (loggedUserId == id)
                return BadRequest("Você não pode alterar sua própria role.");

            await _userService.UpdateRoleAsync(id, dto.RoleId);
            return NoContent();
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAsync(int id)
        {
            await _userService.DeleteAsync(id);
            return NoContent();
        }
    }
}
