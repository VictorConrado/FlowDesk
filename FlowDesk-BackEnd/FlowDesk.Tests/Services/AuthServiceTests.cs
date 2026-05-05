using FlowDesk.Application.DTOs.Auth;
using FlowDesk.Application.Events;
using FlowDesk.Application.Interfaces;
using FlowDesk.Domain.Entities;
using FlowDesk.Infrastructure.Services;
using FlowDesk.Tests.Helpers;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Moq;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Xunit;

namespace FlowDesk.Tests.Services
{
    public class AuthServiceTests
    {
        private readonly Mock<IConfiguration> _configMock = new();
        private readonly Mock<IMessageBus> _busMock = new();

        [Fact]
        public async Task Should_Not_Register_With_Duplicated_Email()
        {
            // Arrange
            var context = DbContextFactory.Create();

            context.Users.Add(new User("Usuário", "email@test.com", "hash", 2));
            await context.SaveChangesAsync();

            var service = new AuthService(context, _configMock.Object, _busMock.Object);

            var dto = new RegisterDto
            {
                Name = "Teste",
                Email = "email@test.com",
                Password = "123456"
            };

            // Act
            Func<Task> act = async () => await service.RegisterAsync(dto);

            // Assert
            await act.Should()
                .ThrowAsync<InvalidOperationException>()
                .WithMessage("Email já cadastrado");
        }

        [Fact]
        public async Task Should_Throw_When_Login_Invalid()
        {
            var context = DbContextFactory.Create();

            var service = new AuthService(context, _configMock.Object, _busMock.Object);

            var dto = new LoginDto
            {
                Email = "fake@test.com",
                Password = "123"
            };

            Func<Task> act = async () => await service.LoginAsync(dto);

            await act.Should()
                .ThrowAsync<Exception>()
                .WithMessage("Credenciais inválidas");
        }

        [Fact]
        public async Task Should_Generate_Token_And_Publish_Event_When_User_Exists()
        {
            // Arrange
            var context = DbContextFactory.Create();

            var user = new User("Usuário", "email@test.com", "hash", 2);
            context.Users.Add(user);
            await context.SaveChangesAsync();

            var service = new AuthService(context, _configMock.Object, _busMock.Object);

            var dto = new ForgotPasswordDto
            {
                Email = "email@test.com"
            };

            // Act
            await service.ForgotPasswordAsync(dto);

            // Assert
            var updatedUser = context.Users.First();

            updatedUser.ResetToken.Should().NotBeNull();
            updatedUser.ResetTokenExpiry.Should().BeAfter(DateTime.UtcNow);

            _busMock.Verify(b =>
                b.PublishAsync(It.IsAny<ForgotPasswordRequestedEvent>()),
                Times.Once
            );
        }

        [Fact]
        public async Task Should_Do_Nothing_When_User_Does_Not_Exist()
        {
            var context = DbContextFactory.Create();

            var service = new AuthService(context, _configMock.Object, _busMock.Object);

            var dto = new ForgotPasswordDto
            {
                Email = "naoexiste@test.com"
            };

            // Act
            var act = async () => await service.ForgotPasswordAsync(dto);

            // Assert
            await act.Should().NotThrowAsync();

            _busMock.Verify(b =>
                b.PublishAsync(It.IsAny<ForgotPasswordRequestedEvent>()),
                Times.Never
            );
        }

        [Fact]
        public async Task Should_Reset_Password_When_Token_Is_Valid()
        {
            var context = DbContextFactory.Create();

            var user = new User("Usuário", "email@test.com", "oldhash", 2);
            user.SetResetToken("token123", DateTime.UtcNow.AddHours(1));

            context.Users.Add(user);
            await context.SaveChangesAsync();

            var service = new AuthService(context, _configMock.Object, _busMock.Object);

            var dto = new ResetPasswordDto
            {
                Token = "token123",
                NewPassword = "novaSenha123"
            };

            // Act
            await service.ResetPasswordAsync(dto);

            // Assert
            var updatedUser = context.Users.First();

            updatedUser.ResetToken.Should().BeNull();
            updatedUser.PasswordHash.Should().NotBe("oldhash");
        }

        [Fact]
        public async Task Should_Not_Register_With_Short_Password()
        {
            // Arrange
            var context = DbContextFactory.Create();

            var service = new AuthService(context, _configMock.Object, _busMock.Object);

            var dto = new RegisterDto
            {
                Name = "Usuário",
                Email = "test@test.com",
                Password = "123"
            };

            // Act
            Func<Task> act = async () => await service.RegisterAsync(dto);

            // Assert
            await act.Should()
                .ThrowAsync<InvalidOperationException>()
                .WithMessage("Senha deve ter no mínimo 6 caracteres");
        }

        [Fact]
        public async Task Should_Not_Login_With_Nonexistent_Email()
        {
            // Arrange
            var context = DbContextFactory.Create();

            var service = new AuthService(context, _configMock.Object, _busMock.Object);

            var dto = new LoginDto
            {
                Email = "naoexiste@test.com",
                Password = "123456"
            };

            // Act
            Func<Task> act = async () => await service.LoginAsync(dto);

            // Assert
            await act.Should()
                .ThrowAsync<Exception>()
                .WithMessage("Credenciais inválidas");
        }
    }
}