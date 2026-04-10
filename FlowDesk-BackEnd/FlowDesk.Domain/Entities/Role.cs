using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FlowDesk.Domain.Entities
{
    public class Role
    {
        public int Id { get; private set; }
        public string Name { get; private set; } = string.Empty;

        public ICollection<User> Users { get; set; } = new List<User>();

        protected Role() { }

        public Role(int id, string name)
        {
            Id = id;
            Name = name;
        }

        public Role(string name)
        {
            Name = name;
        }
    }
}
