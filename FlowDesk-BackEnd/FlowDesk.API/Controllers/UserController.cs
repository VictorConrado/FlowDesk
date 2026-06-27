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

        /// <summary>
        ///  Endpoint para obter todos os usuários do sistema.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll([FromServices] Application.Interfaces.IUserService userService)
        {
            var users = await userService.GetAllAsync();
            return Ok(users);
        }

        /// <summary>
        ///  Endpoint para obter um usuário específico pelo ID.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetByIdAsync(int id)
        {
            var user = await _userService.GetAllAsync().ContinueWith(t => t.Result.FirstOrDefault(u => u.Id == id));  
            if (user == null)
                return NotFound("Usuario não encontrado");
            return Ok(user);
        }

        /// <summary>
        ///  Endpoint para atualizar a role de um usuário específico.   
        /// </summary>
        [Authorize(policy:"AdminOnly")]
        [HttpPut("{id}/role")]
        public async Task<IActionResult> UpdateRoleAsync(int id, [FromBody] UpdateUserRoleDto dto)
        {
            try
            {
                var loggedUserId = int.Parse(
                    User.FindFirst(ClaimTypes.NameIdentifier)!.Value
                );

                if (loggedUserId == id)
                {
                    return BadRequest(
                        "Você não pode alterar sua própria role."
                    );
                }

                await _userService.UpdateRoleAsync(
                    id,
                    dto.RoleId,
                    loggedUserId
                );

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        ///  Endpoint para deletar um usuário específico pelo ID.
        /// </summary>
        [Authorize(policy: "SuperAdminOnly")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _userService.DeleteAsync(id);

            return NoContent();
        }
    }
}
