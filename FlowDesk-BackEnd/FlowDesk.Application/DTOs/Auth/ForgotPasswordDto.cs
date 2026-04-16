using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FlowDesk.Application.DTOs.Auth
{
    public class ForgotPasswordDto
    {
        [Required(ErrorMessage = "O Email é obrigatório")]
        [EmailAddress(ErrorMessage = "O Email deve ser um endereço de email válido")]
        public string Email { get; set; } = string.Empty;
    }
}
