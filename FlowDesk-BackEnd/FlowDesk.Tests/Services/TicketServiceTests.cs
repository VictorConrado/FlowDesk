using FlowDesk.Application.DTOs.Ticket;
using FlowDesk.Application.Events;
using FlowDesk.Application.Interfaces;
using FlowDesk.Domain.Entities;
using FlowDesk.Domain.Enums;
using FlowDesk.Infrastructure.Services;
using FlowDesk.Tests.Helpers;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace FlowDesk.Tests.Services
{
    public class TicketServiceTests
    {
        private readonly Mock<IMessageBus> _busMock = new();

        [Fact]
        public async Task Should_Create_Ticket_And_Publish_Event()
        {
            // Arrange
            var context = DbContextFactory.Create();
            var service = new TicketService(context, _busMock.Object);

            var dto = new CreateTicketDto
            {
                Title = "Erro no sistema",
                Description = "Bug ao salvar",
                CategoryId = 1,
                Priority = 2
            };

            // Act
            var result = await service.CreateAsync(1, dto);

            // Assert
            var ticket = context.Tickets.FirstOrDefault();

            ticket.Should().NotBeNull();
            ticket.Title.Should().Be("Erro no sistema");

            _busMock.Verify(b =>
                b.PublishAsync(It.IsAny<TicketCreatedEvent>()),
                Times.Once
            );
        }

        [Fact]
        public async Task Should_Assign_Ticket()
        {
            // Arrange
            var context = DbContextFactory.Create();

            var service = new TicketService(
                context,
                _busMock.Object);

            var role = new Role("Technician");

            context.Roles.Add(role);

            await context.SaveChangesAsync();

            var technician = new User(
                "Tech",
                "tech@test.com",
                "123456",
                role.Id);

            context.Users.Add(technician);

            var ticket = new Ticket(
                "Titulo",
                "Desc",
                1,
                1,
                TicketPriority.Medium);

            context.Tickets.Add(ticket);

            await context.SaveChangesAsync();

            // Act
            await service.AssignAsync(
                ticket.Id,
                technician.Id);

            // Assert
            var updated = await context.Tickets
                .FirstAsync();

            updated.AssignedToId
                .Should()
                .Be(technician.Id);

            updated.Status
                .Should()
                .Be(TicketStatus.InProgress);

            context.TicketHistories
                .Count()
                .Should()
                .Be(1);
        }

        [Fact]
        public async Task Should_Throw_When_Ticket_Not_Found()
        {
            var context = DbContextFactory.Create();
            var service = new TicketService(context, _busMock.Object);

            Func<Task> act = async () => await service.AssignAsync(999, 1);

            await act.Should()
                .ThrowAsync<Exception>()
                .WithMessage("Ticket não encontrado");
        }

        [Fact]
        public async Task Should_Change_Ticket_Priority()
        {
            // Arrange
            var context = DbContextFactory.Create();

            var service = new TicketService(
                context,
                _busMock.Object);

            var ticket = new Ticket(
                "Erro",
                "Descrição",
                1,
                1,
                TicketPriority.Low);

            context.Tickets.Add(ticket);

            await context.SaveChangesAsync();

            // Act
            await service.ChangePriorityAsync(
                ticket.Id,
                "High");

            // Assert
            var updated = await context.Tickets
                .FirstAsync();

            updated.Priority
                .Should()
                .Be(TicketPriority.High);
        }

        [Fact]
        public async Task Should_Throw_When_Priority_Is_Invalid()
        {
            var context = DbContextFactory.Create();

            var service = new TicketService(
                context,
                _busMock.Object);

            var ticket = new Ticket(
                "Erro",
                "Descrição",
                1,
                1,
                TicketPriority.Low);

            context.Tickets.Add(ticket);

            await context.SaveChangesAsync();

            Func<Task> act = async () =>
                await service.ChangePriorityAsync(
                    ticket.Id,
                    "XPTO");

            await act.Should()
                .ThrowAsync<Exception>()
                .WithMessage("Prioridade inválida");
        }

        [Fact]
        public async Task Should_Add_Comment_To_Ticket()
        {
            var context = DbContextFactory.Create();

            var service = new TicketService(
                context,
                _busMock.Object);

            var ticket = new Ticket(
                "Erro",
                "Descrição",
                1,
                1,
                TicketPriority.Medium);

            context.Tickets.Add(ticket);

            await context.SaveChangesAsync();

            // Act
            await service.AddCommentAsync(
                ticket.Id,
                1,
                "Estamos analisando");

            // Assert
            var updated = await context.Tickets
                .Include(t => t.Comments)
                .FirstAsync();

            updated.Comments
                .Should()
                .HaveCount(1);

            updated.Comments.First().Content
                .Should()
                .Be("Estamos analisando");
        }

        [Fact]
        public async Task Should_Reopen_Ticket()
        {
            var context = DbContextFactory.Create();

            var service = new TicketService(
                context,
                _busMock.Object);

            var ticket = new Ticket(
                "Erro",
                "Descrição",
                1,
                1,
                TicketPriority.High);

            ticket.ForceClose("Resolvido");

            context.Tickets.Add(ticket);

            await context.SaveChangesAsync();

            // Act
            await service.ReopenAsync(ticket.Id);

            // Assert
            var updated = await context.Tickets
                .FirstAsync();

            updated.Status
                .Should()
                .Be(TicketStatus.InProgress);
        }

        [Fact]
        public async Task Should_Close_Ticket()
        {
            var context = DbContextFactory.Create();

            var service = new TicketService(
                context,
                _busMock.Object);

            var ticket = new Ticket(
                "Erro",
                "Descrição",
                1,
                1,
                TicketPriority.High);

            ticket.AssignTo(1);

            context.Tickets.Add(ticket);

            await context.SaveChangesAsync();

            // Act
            await service.CloseAsync(
                ticket.Id,
                1,
                false,
                "Resolvido");

            // Assert
            var updated = await context.Tickets
                .FirstAsync();

            updated.Status
                .Should()
                .Be(TicketStatus.Closed);

            updated.ClosingComment
                .Should()
                .Be("Resolvido");
        }
    }
}