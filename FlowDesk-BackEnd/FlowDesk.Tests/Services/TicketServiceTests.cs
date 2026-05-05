using FlowDesk.Application.DTOs.Ticket;
using FlowDesk.Application.Events;
using FlowDesk.Application.Interfaces;
using FlowDesk.Domain.Entities;
using FlowDesk.Domain.Enums;
using FlowDesk.Infrastructure.Services;
using FlowDesk.Tests.Helpers;
using FluentAssertions;
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
            var context = DbContextFactory.Create();
            var service = new TicketService(context, _busMock.Object);

            var ticket = new Ticket("Titulo", "Desc", 1, 1, TicketPriority.Medium);
            context.Tickets.Add(ticket);
            await context.SaveChangesAsync();

            // Act
            await service.AssignAsync(ticket.Id, 99);

            // Assert
            var updated = context.Tickets.First();

            updated.AssignedToId.Should().Be(99);
            context.TicketHistories.Count().Should().Be(1);
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
    }
}