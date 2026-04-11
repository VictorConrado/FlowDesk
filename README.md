# 📌 FlowDesk — Documentação Completa

## 🧠 Visão Geral

O **FlowDesk** é um sistema de gerenciamento de tickets com arquitetura orientada a domínio (DDD) e comunicação assíncrona via mensageria. O objetivo é simular um cenário corporativo real com autenticação, autorização por papel (RBAC) e fluxo de atendimento de chamados.

---

## 🏗️ Arquitetura (DDD)

### Camadas

* **Domain** → Entidades, Value Objects, regras de negócio
* **Application** → Serviços, DTOs, interfaces
* **Infrastructure** → EF Core (MySQL), Mensageria (RabbitMQ)
* **API** → Controllers (HTTP), Middlewares

### Princípios aplicados

* Separação de responsabilidades
* Inversão de dependência
* Baixo acoplamento
* Alta coesão

---

## 🔐 Autenticação & Autorização

* JWT (Bearer Token)
* Token armazenado no localStorage (frontend)
* Rotas protegidas
* RBAC por `role`

### Roles

* **Admin**: fechar tickets, visualizar tudo
* **Technician**: assumir tickets
* **User**: criar e visualizar próprios tickets

---

## 🎫 Fluxo de Tickets

1. Usuário cria ticket
2. API persiste no banco
3. Evento `TicketCreatedEvent` é publicado
4. Consumer processa (log/notificação)
5. Technician assume ticket
6. Admin fecha ticket

---

## 📡 Mensageria (Event-Driven)

* Broker: RabbitMQ
* Exchange/Queue: baseada no nome do evento
* Evento: `TicketCreatedEvent`
* Consumer: processamento assíncrono (ex.: logging, notificações futuras)

---

## 🌐 Frontend

* React + TypeScript + Tailwind
* Context API (Auth)
* Axios (HTTP)
* React Router (rotas protegidas)
* Layout com Sidebar + Topbar

---

## 🔗 Endpoints da API

### 🔐 Auth

* `POST /api/auth/register`

  * Body: `{ name, email, password, role }`
  * Response: 201

* `POST /api/auth/login`

  * Body: `{ email, password }`
  * Response: `{ token, name, role }`

---

### 👤 Users

* `GET /api/users`

  * Admin only

* `GET /api/users/{id}`

---

### 🎫 Tickets

* `GET /api/tickets?page=1&pageSize=10`

  * Lista paginada

* `GET /api/tickets/{id}`

* `POST /api/tickets`

  * Body:

  ```json
  {
    "title": "string",
    "description": "string",
    "categoryId": 1,
    "priority": 2
  }
  ```

* `PUT /api/tickets/{id}/assign`

  * Technician assume ticket

* `PUT /api/tickets/{id}/close`

  * Admin fecha ticket

---

### 🏷️ Categories

* `GET /api/categories`

---

## 🧭 Diagrama de Arquitetura (Profissional)

```
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

## 🔄 Diagrama de Sequência (Criação de Ticket)

```
User → Frontend → API → Service → Repository → DB
                          ↓
                   Publish Event
                          ↓
                     RabbitMQ
                          ↓
                      Consumer
```

---

## 🧩 Diagrama de Classes (Simplificado)

```
User
- Id
- Name
- Email
- Role

Ticket
- Id
- Title
- Description
- Status
- Priority
- UserId

Category
- Id
- Name

Relationships:
User 1 --- * Ticket
Category 1 --- * Ticket
```

---
### 🚀 Tecnologias

* .NET 9
* MySQL
* RabbitMQ
* React + TypeScript
* TailwindCSS

### ⚙️ Como rodar

#### Backend

```bash
cd FlowDesk.API
dotnet run
```

#### Frontend

```bash
cd flowdesk-web
npm install
npm run dev
```

#### Docker (RabbitMQ)

```bash
docker-compose up -d
```

---

### 🔐 Credenciais de teste

```
Admin:
email: admin@flowdesk.com
senha: 123456

Technician:
email: tech@flowdesk.com
senha: 123456
```

---

### 📸 Funcionalidades

* Login com JWT
* RBAC por role
* CRUD de tickets
* Atribuição e fechamento
* Mensageria com eventos
---

Espero que tenham curtido 🎇
