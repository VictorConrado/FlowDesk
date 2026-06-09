using FlowDesk.Application.DTOs.Users;
using FlowDesk.Application.Interfaces;
using FlowDesk.Domain.Entities;
using FlowDesk.Domain.Enums;
using FlowDesk.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FlowDesk.Infrastructure.Services
{
    public class UserService : IUserService
    {
        private readonly AppDbContext _context;

        public UserService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<UserDto>> GetAllAsync()
        {
            var users = await _context.Users
              .Include(u => u.Role)
              .ToListAsync();

            return users.Select(u => new UserDto
            {
                Id = u.Id,
                Name = u.Name,
                Email = u.Email,
                RoleId = u.RoleId,
                Role = u.Role.Name
            }).ToList();
        }

        public async Task<UserDto> GetByIdAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);

           {

                return new UserDto
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email,
                    RoleId = user.RoleId,
                    Role = user.Role.Name
                };
            }
        }

        public async Task UpdateRoleAsync(int userId, int roleId)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                throw new Exception("Usuário não encontrado");

            var targetRole = await _context.Roles
                .FirstOrDefaultAsync(r => r.Id == roleId);

            if (targetRole == null)
                throw new Exception("Role não encontrada");

            var currentRole = user.Role.Name;
            var newRole = targetRole.Name;

            var isDowngradeToEmployee =
                (currentRole == "Admin" ||
                 currentRole == "Technician")
                && newRole == "Employee";

            if (isDowngradeToEmployee)
            {
                var hasAssignedTicketInProgress =
                    await _context.Tickets.AnyAsync(t =>
                        t.AssignedToId == userId &&
                        t.Status == TicketStatus.InProgress
                    );

                if (hasAssignedTicketInProgress)
                {
                    throw new Exception(
                        "Não foi possível realizar a operação pois o usuário possui um chamado atribuído em andamento."
                    );
                }
            }

            user.UpdateRole(roleId);

            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user is null)
                throw new Exception("User não encontrado");

            _context.Users.Remove(user);

            await _context.SaveChangesAsync();
        }
    }
}
