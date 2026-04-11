using FlowDesk.Application.DTOs.Users;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FlowDesk.Application.Interfaces
{
    public interface IUserService
    {
         Task<IEnumerable<UserDto>> GetAllAsync();
    }
}
