using FlowDesk.Application.DTOs.Auth;
using FlowDesk.Application.Interfaces;
using FlowDesk.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FlowDesk.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _auth;

        public AuthController(IAuthService auth) 
        {
            _auth = auth;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            try
            {
                var result = await _auth.RegisterAsync(dto);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        //POST /api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var result = await _auth.LoginAsync(dto);
            return Ok(result);
        }

        [Authorize]
        [HttpGet("me")]
        public IActionResult Me()
        {
            var name = User.Identity.Name;
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            return Ok(new
            {
                name,
                role
            });
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordDto dto)
        {
            await _auth.ForgotPasswordAsync(dto);
            return Ok();
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword(ResetPasswordDto dto)
        {
            await _auth.ResetPasswordAsync(dto);
            return Ok();
        }
    }
}
