using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FlowDesk.Application.Interfaces
{
    public interface IMessageBus
    {
        Task PublishAsync<T>(T message);
    }
}
