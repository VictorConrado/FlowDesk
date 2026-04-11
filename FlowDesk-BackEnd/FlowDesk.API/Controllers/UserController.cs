using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlowDesk.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserController : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAll([FromServices] Application.Interfaces.IUserService userService)
        {
            var users = await userService.GetAllAsync();
            return Ok(users);
        }
    }
}
