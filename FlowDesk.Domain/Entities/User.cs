using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FlowDesk.Domain.Entities
{
    public class User
    {
        public int Id { get; private set; }
        public string Name { get; private set; } = string.Empty;
        public string Email { get; private set; } = string.Empty;
        public string PasswordHash { get; private set; } = string.Empty;
    
        public int RoleId { get; private set; }
        public Role Role { get; private set; }

        protected User() { }

        public User(string name, string email, string passwordHash, int roleId)
        {
            Name = name;
            Email = email;
            PasswordHash = passwordHash;
            RoleId = roleId;
        }
    }
}
