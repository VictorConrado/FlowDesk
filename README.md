# 📌 FlowDesk — Documentação Completa

## 🧠 Visão Geral

O **FlowDesk** é um sistema de gerenciamento de tickets com arquitetura orientada a domínio (DDD) e comunicação assíncrona via mensageria.

O objetivo é simular um cenário corporativo real com autenticação, autorização por papel (RBAC), fluxo completo de atendimento de chamados e regras de domínio robustas.

O projeto também conta com testes automatizados utilizando xUnit.

Verifique o backend do projeto rodando: [flowdesk-app](https://flowdesk-6ec9.onrender.com/swagger/index.html)

---

# 🏗️ Arquitetura (DDD)

## Camadas

- **Domain** → Entidades, regras de negócio e enums
- **Application** → Serviços, DTOs e interfaces
- **Infrastructure** → EF Core, RabbitMQ e integrações externas
- **API** → Controllers, autenticação e endpoints HTTP

---

## Princípios aplicados

- Separação de responsabilidades
- Inversão de dependência
- Baixo acoplamento
- Alta coesão
- Regras centralizadas no domínio

---

# 🔐 Autenticação & Autorização

- JWT Bearer Token
- Rotas protegidas
- Isolamento de sessão por aba utilizando sessionStorage
- RBAC por roles
- Autorização baseada em claims
- Middleware de autenticação

---

## Roles

### 👑 Admin

- Visualiza todos os tickets
- Fecha tickets
- Reabre tickets
- Altera prioridades
- Gerencia usuários

### 🛠️ Technician

- Assume tickets
- Gerencia atendimento
- Fecha tickets atribuídos

### 👤 User

- Cria tickets
- Visualiza próprios tickets
- Adiciona comentários

---

# 🎫 Fluxo de Tickets

1. Usuário cria ticket
2. API persiste no banco
3. Evento `TicketCreatedEvent` é publicado
4. RabbitMQ processa mensagem
5. Consumer consome evento
6. Técnico assume ticket
7. Responsável adiciona comentários
8. Admin altera prioridade
9. Ticket pode ser fechado
10. Ticket pode ser reaberto
11. Histórico de ações é registrado

---

# 📡 Mensageria (Event-Driven)

## RabbitMQ

O sistema utiliza comunicação assíncrona baseada em eventos.

### Recursos implementados

- Publicação de eventos
- Consumers assíncronos
- Filas persistentes (`durable`)
- Mensagens persistentes
- Baixo acoplamento entre serviços

---

## Eventos

- `TicketCreatedEvent`
- `ForgotPasswordRequestedEvent`

---

## Consumers

### TicketCreatedConsumer

Responsável por consumir eventos de criação de ticket.

Exemplo atual:

- Logging
- Base para notificações futuras

---

# 🌐 Frontend

## Stack

- React
- TypeScript
- TailwindCSS
- Axios
- React Router
- Context API

---

## Funcionalidades

- Login com JWT
- Rotas protegidas
- Contexto global de autenticação
- Sidebar e Topbar
- Dashboard
- CRUD de tickets

---

# 🔗 Endpoints da API

# 🔐 Auth

## POST `/api/auth/register`

### Body

```json
{
  "name": "user",
  "email": "user@email.com",
  "password": "123456",
  "role": "User"
}
```

---

## POST `/api/auth/login`

### Body

```json
{
  "email": "user@email.com",
  "password": "123456"
}
```

### Response

```json
{
  "token": "jwt-token",
  "name": "user",
  "role": "Admin"
}
```

---

# 👤 Users

## GET `/api/users`

Admin only

---

## GET `/api/users/{id}`

Retorna usuário por ID

---

# 🎫 Tickets

## GET `/api/tickets?page=1&pageSize=10`

Lista paginada de tickets

---

## GET `/api/tickets/{id}`

Retorna detalhes completos do ticket

---

## GET `/api/tickets/my-tickets`

Retorna tickets do usuário autenticado

---

## POST `/api/tickets`

### Body

```json
{
  "title": "Erro no login",
  "description": "Não consigo autenticar",
  "categoryId": 1,
  "priority": 2
}
```

---

## PUT `/api/tickets/{id}/assign`

Atribui ticket para técnico

---

## PUT `/api/tickets/{id}/close`

Fecha ticket

---

## PUT `/api/tickets/{id}/reopen`

Reabre ticket

---

## PUT `/api/tickets/{id}/priority`

Altera prioridade do ticket

### Body

```json
{
  "priority": "High"
}
```

---

## POST `/api/tickets/{id}/comments`

Adiciona comentário ao ticket

### Body

```json
{
  "content": "Estamos analisando o problema"
}
```

---

# 🏷️ Categories

## GET `/api/categories`

Lista categorias disponíveis

---

# 🧭 Diagrama de Arquitetura

```text
                ┌────────────────────┐
                │     Frontend       │
                │ React + TS + TW    │
                └─────────┬──────────┘
                          │ HTTP (JWT)
                          ▼
                ┌────────────────────┐
                │       API          │
                │   Controllers      │
                └─────────┬──────────┘
                          ▼
                ┌────────────────────┐
                │   Application      │
                │ Services / DTOs    │
                └─────────┬──────────┘
                          ▼
                ┌────────────────────┐
                │      Domain        │
                │ Entities / Rules   │
                └─────────┬──────────┘
                          ▼
        ┌─────────────────┴─────────────────┐
        ▼                                   ▼
┌───────────────┐                 ┌─────────────────┐
│   MySQL DB    │                 │   RabbitMQ      │
│  Persistence  │                 │   Messaging     │
└───────────────┘                 └────────┬────────┘
                                          ▼
                                   ┌───────────────┐
                                   │   Consumer    │
                                   │ Notifications │
                                   └───────────────┘
```

---

# 🔄 Diagrama de Sequência

```text
User → Frontend → API → Service → Repository → DB
                          ↓
                   Publish Event
                          ↓
                     RabbitMQ
                          ↓
                      Consumer
```

---

# 🧩 Diagrama de Classes (Simplificado)

```text
User
- Id
- Name
- Email
- Role

Ticket
- Id
- Number
- Title
- Description
- Status
- Priority
- CreatedById
- AssignedToId

Category
- Id
- Name

TicketComment
- Id
- Content
- UserId

TicketHistory
- Id
- Action
- PerformedById
```

---

# 🚀 Tecnologias

## Backend

- .NET 9
- ASP.NET Core
- Entity Framework Core
- MySQL
- RabbitMQ
- JWT Authentication

---

## Frontend

- React
- TypeScript
- TailwindCSS

---

## Testes

- xUnit
- Moq
- FluentAssertions
- EF Core InMemory

---

# ⚙️ Como rodar o projeto

## Backend

```bash
cd FlowDesk.API
dotnet run
```

---

## Frontend

```bash
cd flowdesk-web
npm install
npm run dev
```

---

## RabbitMQ (Docker)

```bash
docker-compose up -d
```

---

# 🔐 Credenciais de teste

## 👑 Admin

```text
email: admin@flowdesk.com
senha: 123456
```

---

## 🛠️ Technician

```text
email: tech@flowdesk.com
senha: 123456
```

---

# 📸 Funcionalidades

- ✅ Login com JWT
- ✅ RBAC por roles
- ✅ CRUD de tickets
- ✅ Comentários em tickets
- ✅ Alteração de prioridade
- ✅ Reabertura de tickets
- ✅ Histórico de ações
- ✅ RabbitMQ
- ✅ Eventos assíncronos
- ✅ Arquitetura DDD
- ✅ Testes unitários
- ✅ Fluxo corporativo de atendimento

---

# 🧪 Testes Unitários

O projeto possui cobertura de testes unitários focada na camada de serviços.

---

## Estratégia

Os testes validam:

- Regras de negócio
- Fluxos críticos
- Publicação de eventos
- Tratamento de exceções
- Persistência de dados

---

## Tecnologias utilizadas

- xUnit
- Moq
- FluentAssertions
- EF Core InMemory

---

## TicketService Tests

### Cobertura

- Criação de tickets
- Publicação de eventos
- Atribuição de tickets
- Reabertura
- Fechamento com permissão
- Alteração de prioridade
- Adição de comentários
- Histórico de ações
- Tratamento de exceções

---

## AuthService Tests

### Cobertura

- Registro de usuário
- Email duplicado
- Login inválido
- Reset de senha
- Token de recuperação
- Eventos de recuperação

---

# 🎇 Considerações

O FlowDesk foi desenvolvido com foco em arquitetura limpa, regras de negócio reais e boas práticas utilizadas em sistemas corporativos modernos.

O projeto simula cenários reais de suporte técnico utilizando:

- DDD
- Event-Driven Architecture
- RabbitMQ
- JWT
- RBAC
- Testes automatizados
- Boas práticas de backend

---

# 👨‍💻 Autor

Victor Conrado
