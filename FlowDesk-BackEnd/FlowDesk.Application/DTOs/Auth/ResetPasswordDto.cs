using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FlowDesk.Application.DTOs.Auth
{
    public class ResetPasswordDto
    {
        [Required(ErrorMessage = "Token é obrigatorio")]
        public string Token { get; set; } = string.Empty;

        [Required(ErrorMessage = "Nova senha é obrigatoria")]
        [MinLength(6, ErrorMessage = "A nova senha deve conter no mínimo 6 caracteres")]
        public string NewPassword { get; set; } = string.Empty;

        [Required]
        [Compare("NewPassword", ErrorMessage = "As senhas não coincidem")]
        public string ConfirmPassword { get; set; } = string.Empty;
    }
}
