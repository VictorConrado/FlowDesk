import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  CircleDot,
  Filter,
  Loader2,
  ShieldCheck,
  Sparkles,
  Ticket as TicketIcon,
  UserRound,
} from "lucide-react";

import { AuthContext } from "../context/AuthContext";
import { api } from "../services/api";

import TicketModal from "../components/TicketModal";

type TicketStatus = "Open" | "InProgress" | "Closed";
type TicketPriority = "Low" | "Medium" | "High";

interface TicketUser {
  id: number;
  name: string;
  email?: string;
}

interface TicketComment {
  id: number;
  content: string;
  createdAt: string;
  author?: TicketUser;
}

interface Ticket {
  id: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  user?: TicketUser;
  assignedTo?: TicketUser | null;
  comments?: TicketComment[];
  closingComment?: string | null;
}

const priorityConfig: Record<
  TicketPriority,
  {
    label: string;
    border: string;
    glow: string;
    badge: string;
  }
> = {
  High: {
    label: "Alta",
    border: "border-red-500/50",
    glow:
      "hover:shadow-[0_0_35px_rgba(239,68,68,0.45)] hover:border-red-400/70",
    badge:
      "bg-red-500/15 text-red-300 border border-red-500/30",
  },

  Medium: {
    label: "Média",
    border: "border-yellow-500/50",
    glow:
      "hover:shadow-[0_0_35px_rgba(250,204,21,0.40)] hover:border-yellow-400/70",
    badge:
      "bg-yellow-500/15 text-yellow-300 border border-yellow-500/30",
  },

  Low: {
    label: "Baixa",
    border: "border-green-500/50",
    glow:
      "hover:shadow-[0_0_35px_rgba(34,197,94,0.40)] hover:border-green-400/70",
    badge:
      "bg-green-500/15 text-green-300 border border-green-500/30",
  },
};

const statusConfig: Record<
  TicketStatus,
  {
    label: string;
    className: string;
    icon: ReactNode;
  }
> = {
  Open: {
    label: "Aberto",
    className:
      "bg-red-500/15 text-red-300 border border-red-500/30",
    icon: <AlertCircle size={14} />,
  },

  InProgress: {
    label: "Em andamento",
    className:
      "bg-yellow-500/15 text-yellow-300 border border-yellow-500/30",
    icon: <Loader2 size={14} />,
  },

  Closed: {
    label: "Fechado",
    className:
      "bg-green-500/15 text-green-300 border border-green-500/30",
    icon: <CheckCircle2 size={14} />,
  },
};

function calculateSla(createdAt: string) {
  const createdDate = new Date(createdAt);
  const now = new Date();

  const diffMs = now.getTime() - createdDate.getTime();

  const hours = Math.floor(diffMs / (1000 * 60 * 60));

  if (hours < 24) {
    return {
      label: `${hours}h`,
      className:
        "bg-green-500/15 text-green-300 border border-green-500/30",
    };
  }

  if (hours < 48) {
    return {
      label: `${hours}h`,
      className:
        "bg-yellow-500/15 text-yellow-300 border border-yellow-500/30",
    };
  }

  return {
    label: `${hours}h`,
    className:
      "bg-red-500/15 text-red-300 border border-red-500/30",
  };
}

export default function Tickets() {
  const { user } = useContext(AuthContext);

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedTicket, setSelectedTicket] =
    useState<Ticket | null>(null);

  const [statusFilter, setStatusFilter] =
    useState<string>("All");

  const [priorityFilter, setPriorityFilter] =
    useState<string>("All");

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);

      const response = await api.get("/tickets", {
        params: {
          page: 1,
          pageSize: 100,
        },
      });

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.items ?? [];

      setTickets(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesStatus =
        statusFilter === "All" ||
        ticket.status === statusFilter;

      const matchesPriority =
        priorityFilter === "All" ||
        ticket.priority === priorityFilter;

      return matchesStatus && matchesPriority;
    });
  }, [tickets, statusFilter, priorityFilter]);

  async function handleAssign(ticketId: number) {
    try {
      await api.put(`/tickets/${ticketId}/assign`, {
        technicianId: user?.id,
      });

      await fetchTickets();
    } catch (error) {
      console.error(error);
    }
  }

  async function handlePriorityChange(
    ticketId: number,
    priority: TicketPriority
  ) {
    try {
      await api.put(`/tickets/${ticketId}/priority`, {
        priority,
      });

      await fetchTickets();
    } catch (error) {
      console.error(error);
    }
  }

  async function handleReopen(ticketId: number) {
    try {
      await api.put(`/tickets/${ticketId}/reopen`);

      await fetchTickets();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <div
                className="
                  flex h-12 w-12 items-center justify-center
                  rounded-2xl border border-orange-500/30
                  bg-orange-500/10
                  shadow-[0_0_25px_rgba(249,115,22,0.25)]
                "
              >
                <TicketIcon className="text-orange-300" />
              </div>

              <div>
                <h1
                  className="
                    font-orbitron text-3xl font-bold
                    tracking-[0.2em]
                    text-white
                  "
                >
                  Tickets
                </h1>

                <p className="mt-1 text-sm text-slate-400">
                  Controle galáctico de chamados do FlowDesk.
                </p>
              </div>
            </div>
          </div>

          <div
            className="
              flex flex-col gap-4 rounded-3xl
              border border-white/10
              bg-white/5 p-5
              backdrop-blur-xl
              md:flex-row
            "
          >
            <div className="flex items-center gap-2 text-slate-300">
              <Filter size={18} />
              <span className="text-sm font-medium">
                Filtros
              </span>
            </div>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="
                rounded-xl border border-white/10
                bg-[#0B1120]/80 px-4 py-3
                text-sm text-white
                outline-none transition-all
                focus:border-orange-500/50
                focus:ring-2 focus:ring-orange-500/20
              "
            >
              <option value="All">Todos Status</option>
              <option value="Open">Aberto</option>
              <option value="InProgress">
                Em andamento
              </option>
              <option value="Closed">Fechado</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) =>
                setPriorityFilter(e.target.value)
              }
              className="
                rounded-xl border border-white/10
                bg-[#0B1120]/80 px-4 py-3
                text-sm text-white
                outline-none transition-all
                focus:border-orange-500/50
                focus:ring-2 focus:ring-orange-500/20
              "
            >
              <option value="All">
                Todas Prioridades
              </option>

              <option value="High">Alta</option>
              <option value="Medium">Média</option>
              <option value="Low">Baixa</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div
            className="
              flex min-h-[400px] items-center
              justify-center
            "
          >
            <div className="flex items-center gap-3 text-orange-300">
              <Loader2 className="animate-spin" />
              <span>Carregando tickets...</span>
            </div>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div
            className="
              flex min-h-[350px] flex-col
              items-center justify-center gap-4
              rounded-3xl border border-white/10
              bg-white/5 p-10
              text-center backdrop-blur-xl
            "
          >
            <Sparkles className="text-orange-300" size={42} />

            <div>
              <h2 className="text-xl font-semibold text-white">
                Nenhum ticket encontrado
              </h2>

              <p className="mt-2 text-slate-400">
                Ajuste os filtros ou crie um novo ticket.
              </p>
            </div>
          </div>
        ) : (
          <div
            className="
              grid grid-cols-1 gap-6
              xl:grid-cols-2
            "
          >
            {filteredTickets.map((ticket) => {
              const priorityStyle =
                priorityConfig[
                  ticket.priority as TicketPriority
                ] ?? priorityConfig.Low;

              const statusStyle =
                statusConfig[
                  ticket.status as TicketStatus
                ] ?? statusConfig.Open;

              const sla = calculateSla(ticket.createdAt);

              return (
                <div
                  key={ticket.id}
                  onClick={() =>
                    setSelectedTicket(ticket)
                  }
                  className={`
                    group relative cursor-pointer
                    overflow-hidden rounded-3xl
                    border bg-white/5 p-6
                    backdrop-blur-xl transition-all
                    duration-300
                    ${priorityStyle.border}
                    ${priorityStyle.glow}
                  `}
                >
                  <div
                    className="
                      absolute inset-0 opacity-0
                      transition-opacity duration-300
                      group-hover:opacity-100
                      bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_70%)]
                    "
                  />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <CircleDot
                            size={16}
                            className="text-orange-300"
                          />

                          <span
                            className="
                              text-xs uppercase
                              tracking-[0.25em]
                              text-slate-400
                            "
                          >
                            Ticket #{ticket.id}
                          </span>
                        </div>

                        <h2
                          className="
                            mt-3 text-xl font-semibold
                            text-white
                          "
                        >
                          {ticket.title}
                        </h2>
                      </div>

                      <div
                        className={`
                          flex items-center gap-2 rounded-full
                          px-3 py-1 text-xs font-semibold
                          ${statusStyle.className}
                        `}
                      >
                        {statusStyle.icon}
                        {statusStyle.label}
                      </div>
                    </div>

                    <p
                      className="
                        mt-4 line-clamp-3
                        text-sm leading-relaxed
                        text-slate-300
                      "
                    >
                      {ticket.description}
                    </p>

                    <div
                      className="
                        mt-6 flex flex-wrap
                        items-center gap-3
                      "
                    >
                      <div
                        className={`
                          rounded-full px-3 py-1
                          text-xs font-semibold
                          ${priorityStyle.badge}
                        `}
                      >
                        {priorityStyle.label}
                      </div>

                      <div
                        className={`
                          rounded-full px-3 py-1
                          text-xs font-semibold
                          ${sla.className}
                        `}
                      >
                        SLA: {sla.label}
                      </div>
                    </div>

                    <div
                      className="
                        mt-6 grid grid-cols-1
                        gap-4 md:grid-cols-2
                      "
                    >
                      <div
                        className="
                          rounded-2xl border border-white/10
                          bg-black/20 p-4
                        "
                      >
                        <div className="flex items-center gap-2 text-slate-400">
                          <UserRound size={16} />

                          <span className="text-xs uppercase tracking-wider">
                            Aberto por
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-white">
                          {ticket.user?.name ??
                            "Usuário"}
                        </p>
                      </div>

                      <div
                        className="
                          rounded-2xl border border-white/10
                          bg-black/20 p-4
                        "
                      >
                        <div className="flex items-center gap-2 text-slate-400">
                          <ShieldCheck size={16} />

                          <span className="text-xs uppercase tracking-wider">
                            Responsável
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-white">
                          {ticket.assignedTo?.name ??
                            "Não atribuído"}
                        </p>
                      </div>
                    </div>

                    <div
                      className="
                        mt-6 flex flex-col gap-4
                        xl:flex-row xl:items-center
                        xl:justify-between
                      "
                    >
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <CalendarClock size={16} />

                        <span>
                          {new Date(
                            ticket.createdAt
                          ).toLocaleString("pt-BR")}
                        </span>
                      </div>

                      <div
                        className="
                          flex flex-wrap gap-3
                        "
                        onClick={(e) =>
                          e.stopPropagation()
                        }
                      >
                        {!ticket.assignedTo &&
                          (user?.role ===
                            "Admin" ||
                            user?.role ===
                              "Technician") && (
                            <button
                              onClick={() =>
                                handleAssign(
                                  ticket.id
                                )
                              }
                              className="
                                rounded-xl border
                                border-orange-500/30
                                bg-orange-500/15
                                px-4 py-2 text-sm
                                font-medium text-orange-200
                                transition-all
                                hover:border-orange-400/60
                                hover:bg-orange-500/25
                              "
                            >
                              Assumir
                            </button>
                          )}

                        {user?.role ===
                          "Admin" && (
                          <select
                            value={ticket.priority}
                            onChange={(e) =>
                              handlePriorityChange(
                                ticket.id,
                                e.target
                                  .value as TicketPriority
                              )
                            }
                            className="
                              rounded-xl border
                              border-white/10
                              bg-[#0B1120]/90
                              px-4 py-2 text-sm
                              text-white outline-none
                              transition-all
                              focus:border-orange-500/50
                            "
                          >
                            <option value="Low">
                              Baixa
                            </option>

                            <option value="Medium">
                              Média
                            </option>

                            <option value="High">
                              Alta
                            </option>
                          </select>
                        )}

                        {user?.role ===
                          "Admin" &&
                          ticket.status ===
                            "Closed" && (
                            <button
                              onClick={() =>
                                handleReopen(
                                  ticket.id
                                )
                              }
                              className="
                                rounded-xl border
                                border-green-500/30
                                bg-green-500/15
                                px-4 py-2 text-sm
                                font-medium text-green-200
                                transition-all
                                hover:border-green-400/60
                                hover:bg-green-500/25
                              "
                            >
                              Reabrir
                            </button>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedTicket && (
        <TicketModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdated={fetchTickets}
        />
      )}
    </>
  );
}