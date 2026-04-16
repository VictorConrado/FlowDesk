using FlowDesk.Application.DTOs.Auth;
using FlowDesk.Application.Interfaces;
using FlowDesk.Domain.Entities;
using FlowDesk.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Org.BouncyCastle.Crypto.Generators;
using System;
using System.Collections.Generic;
using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace FlowDesk.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public AuthService(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
        {
            var email = dto.Email.Trim().ToLower();

            if (await _context.Users.AnyAsync(x => x.Email == email))
                throw new InvalidOperationException("Email já cadastrado");

            if (dto.Password.Length < 6)
                throw new InvalidOperationException("Senha deve ter no mínimo 6 caracteres");

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            var user = new User(
                dto.Name,
                email,
                passwordHash,
                2 // Employee (RoleId)
            );

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return GenerateToken(user);
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
        {
            var user = await _context.Users
                .Include(x => x.Role)
                .FirstOrDefaultAsync(x => x.Email == dto.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                throw new Exception("Credenciais inválidas");

            return GenerateToken(user);
        }

        private AuthResponseDto GenerateToken(User user)
        {
            var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"]);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Role, user.Role?.Name ?? "Employee")
            };

            var token = new JwtSecurityToken(
                claims : claims,
                expires : DateTime.UtcNow.AddHours(2),
                signingCredentials : new SigningCredentials(
                   new SymmetricSecurityKey(key),
                   SecurityAlgorithms.HmacSha256)
            );



            return new AuthResponseDto
            {
                Token = new JwtSecurityTokenHandler().WriteToken(token),
                Name = user.Name,
                Role = user.Role?.Name ?? "Employee"
            };


        }

        public async Task ForgotPasswordAsync(ForgotPasswordDto dto)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(x => x.Email == dto.Email);

            if (user == null)
                throw new Exception("Email não encontrado");

            var token = Guid.NewGuid().ToString();

            user.SetResetToken(token, DateTime.UtcNow.AddHours(1));

            await _context.SaveChangesAsync();
        }

        public async Task ResetPasswordAsync(ResetPasswordDto dto)
        {
            var user = await _context.Users
        .FirstOrDefaultAsync(u => u.ResetToken == dto.Token);

            if (user == null || user.ResetTokenExpiry < DateTime.UtcNow)
                throw new Exception("Token inválido ou expirado");

            var hash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);

            user.UpdatePassword(hash);
            user.ClearResetToken();

            await _context.SaveChangesAsync();
        }
    }
}
