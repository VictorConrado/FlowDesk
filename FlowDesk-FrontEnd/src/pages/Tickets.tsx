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
  Plus,
  ShieldCheck,
  Sparkles,
  Ticket as TicketIcon,
  UserRound,
  X,
} from "lucide-react";

import { AuthContext } from "../context/AuthContext";
import { api } from "../services/api";
import TicketModal from "../components/TicketModal";

type TicketStatus = "Open" | "InProgress" | "Closed";
type TicketPriority = "Low" | "Medium" | "High";

interface TicketComment {
  id: number;
  content: string;
  createdAt: string;
}

// Interface ajustada para suportar possíveis retornos do backend
interface Ticket {
  id: number;
  number?: string;
  title: string;
  description: string;
  status: TicketStatus | string;
  priority: TicketPriority | string;
  category?: string;
  openedBy?: string; // Nome em string direta
  assignedTo?: string | null; // Nome em string direta
  createdAt?: string; // Alterado para opcional para evitar crash
  closedAt?: string | null;
  slaExpiresAt?: string | null;
  comments?: TicketComment[];
  closingComment?: string | null;
  // Objetos aninhados caso o backend use Includes/Joins
  user?: { name: string };
  assignedUser?: { name: string };
}

const priorityConfig: Record<
  TicketPriority,
  { label: string; border: string; glow: string; badge: string }
> = {
  High: {
    label: "Alta",
    border: "border-red-500/50",
    glow: "hover:shadow-[0_0_35px_rgba(239,68,68,0.45)] hover:border-red-400/70",
    badge: "bg-red-500/15 text-red-300 border border-red-500/30",
  },
  Medium: {
    label: "Média",
    border: "border-yellow-500/50",
    glow: "hover:shadow-[0_0_35px_rgba(250,204,21,0.40)] hover:border-yellow-400/70",
    badge: "bg-yellow-500/15 text-yellow-300 border border-yellow-500/30",
  },
  Low: {
    label: "Baixa",
    border: "border-green-500/50",
    glow: "hover:shadow-[0_0_35px_rgba(34,197,94,0.40)] hover:border-green-400/70",
    badge: "bg-green-500/15 text-green-300 border border-green-500/30",
  },
};

const statusConfig: Record<
  TicketStatus,
  { label: string; className: string; icon: ReactNode }
> = {
  Open: {
    label: "Aberto",
    className: "bg-red-500/15 text-red-300 border border-red-500/30",
    icon: <AlertCircle size={14} />,
  },
  InProgress: {
    label: "Em andamento",
    className: "bg-yellow-500/15 text-yellow-300 border border-yellow-500/30",
    icon: <Loader2 size={14} />,
  },
  Closed: {
    label: "Fechado",
    className: "bg-green-500/15 text-green-300 border border-green-500/30",
    icon: <CheckCircle2 size={14} />,
  },
};

function normalizePriority(priority?: string | number): TicketPriority {
  if (!priority) return "Low";
  const value = String(priority).toLowerCase();
  if (value.includes("high") || value === "3") return "High";
  if (value.includes("medium") || value === "2") return "Medium";
  return "Low";
}

function normalizeStatus(status?: string): TicketStatus {
  if (!status) return "Open";
  const value = status.toLowerCase();
  if (value.includes("progress")) return "InProgress";
  if (value.includes("closed")) return "Closed";
  return "Open";
}

// Lógica de SLA Refatorada e Segura
function getSla(ticket: Ticket) {
  if (!ticket.slaExpiresAt) {
    return {
      label: "--",
      className: "bg-slate-500/15 text-slate-300 border border-slate-500/30",
    };
  }

  const now = new Date();
  const expires = new Date(ticket.slaExpiresAt);

  if (isNaN(expires.getTime())) {
    return {
      label: "--",
      className: "bg-slate-500/15 text-slate-300 border border-slate-500/30",
    };
  }

  const diffMs = expires.getTime() - now.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));

  if (hours < 0) {
    return {
      label: "SLA vencido",
      className: "bg-red-500/15 text-red-300 border border-red-500/30",
    };
  }

  if (hours > 24) {
    return {
      label: `${hours}h restantes`,
      className: "bg-green-500/15 text-green-300 border border-green-500/30",
    };
  }

  return {
    label: `${hours}h restantes`,
    className: "bg-yellow-500/15 text-yellow-300 border border-yellow-500/30",
  };
}

export default function Tickets() {
  const { user } = useContext(AuthContext);

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const [createModal, setCreateModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(""); // Ajustado para ID
  const [priority, setPriority] = useState<TicketPriority>("Medium");

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint = user?.role === "Employee" ? "/tickets/my-tickets" : "/tickets";
      const response = await api.get(endpoint);

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.items ?? [];

      setTickets(data);
    } catch (error) {
      console.error(error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const normalizedStatus = normalizeStatus(ticket.status);
      const normalizedPriority = normalizePriority(ticket.priority);

      const matchesStatus =
        statusFilter === "All" || normalizedStatus === statusFilter;
      const matchesPriority =
        priorityFilter === "All" || normalizedPriority === priorityFilter;

      return matchesStatus && matchesPriority;
    });
  }, [tickets, statusFilter, priorityFilter]);

  async function handleCreateTicket() {
    try {
      // Mapeamento para o CreateTicketDto do Backend (inteiros)
      const priorityMap: Record<TicketPriority, number> = {
        Low: 1,
        Medium: 2,
        High: 3,
      };

      await api.post("/tickets", {
        title,
        description,
        categoryId: parseInt(categoryId) || 1, // Envia como int32
        priority: priorityMap[priority],       // Envia como int32
      });

      setCreateModal(false);
      setTitle("");
      setDescription("");
      setCategoryId("");
      setPriority("Medium");
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
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-500/30 bg-orange-500/10">
                <TicketIcon className="text-orange-300" />
              </div>
              <div>
                <h1 className="font-orbitron text-3xl font-bold tracking-[0.2em] text-white">
                  Tickets
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                  Central de chamados do FlowDesk.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setCreateModal(true)}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 px-5 py-3 font-semibold text-white"
            >
              <Plus size={18} /> Novo Ticket
            </button>

            <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 md:flex-row">
              <div className="flex items-center gap-2 text-slate-300">
                <Filter size={18} />
                <span className="text-sm font-medium">Filtros</span>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-white/10 bg-[#0B1120]/80 px-4 py-3 text-sm text-white"
              >
                <option value="All">Todos Status</option>
                <option value="Open">Aberto</option>
                <option value="InProgress">Em andamento</option>
                <option value="Closed">Fechado</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="rounded-xl border border-white/10 bg-[#0B1120]/80 px-4 py-3 text-sm text-white"
              >
                <option value="All">Todas Prioridades</option>
                <option value="High">Alta</option>
                <option value="Medium">Média</option>
                <option value="Low">Baixa</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="flex items-center gap-3 text-orange-300">
              <Loader2 className="animate-spin" />
              <span>Carregando tickets...</span>
            </div>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="flex min-h-[350px] flex-col items-center justify-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
            <Sparkles className="text-orange-300" size={42} />
            <div>
              <h2 className="text-xl font-semibold text-white">
                Nenhum ticket encontrado
              </h2>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {filteredTickets.map((ticket) => {
              const normalizedPriority = normalizePriority(ticket.priority);
              const normalizedStatus = normalizeStatus(ticket.status);
              const priorityStyle = priorityConfig[normalizedPriority] ?? priorityConfig.Low;
              const statusStyle = statusConfig[normalizedStatus] ?? statusConfig.Open;
              const sla = getSla(ticket);

              // Lógica robusta para obter os nomes
              const creatorName = ticket.user?.name || ticket.openedBy || "Usuário não identificado";
              const assignedName = ticket.assignedUser?.name || ticket.assignedTo || "Não atribuído";

              return (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`group cursor-pointer rounded-3xl border bg-white/5 p-6 transition-all ${priorityStyle.border} ${priorityStyle.glow}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <CircleDot size={16} className="text-orange-300" />
                        <span className="text-xs tracking-[0.25em] text-slate-400">
                          Ticket #{ticket.id}
                        </span>
                      </div>
                      <h2 className="mt-3 text-xl font-semibold text-white">
                        {ticket.title}
                      </h2>
                    </div>

                    <div
                      className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusStyle.className}`}
                    >
                      {statusStyle.icon}
                      {statusStyle.label}
                    </div>
                  </div>

                  <p className="mt-4 line-clamp-3 text-sm text-slate-300">
                    {ticket.description}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <div
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityStyle.badge}`}
                    >
                      {priorityStyle.label}
                    </div>

                    <div
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${sla.className}`}
                    >
                      SLA: {sla.label}
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="flex items-center gap-2 text-slate-400">
                        <UserRound size={16} />
                        <span className="text-xs uppercase">Aberto por</span>
                      </div>
                      <p className="mt-2 text-sm text-white">
                        {creatorName}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="flex items-center gap-2 text-slate-400">
                        <ShieldCheck size={16} />
                        <span className="text-xs uppercase">Responsável</span>
                      </div>
                      <p className="mt-2 text-sm text-white">
                        {assignedName}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-2 text-sm text-slate-400">
                    <CalendarClock size={16} />
                    <span>
                      {ticket.createdAt
                        ? new Date(ticket.createdAt).toLocaleString("pt-BR")
                        : "Data não informada"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedTicket && (
        <TicketModal
          ticket={selectedTicket as any}
          onClose={() => setSelectedTicket(null)}
          onUpdated={fetchTickets}
        />
      )}

      {createModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0B1120] p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Novo Ticket</h2>
              <button onClick={() => setCreateModal(false)}>
                <X className="text-slate-400" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título"
                className="w-full rounded-2xl border border-white/10 bg-[#050816]/80 p-4 text-white"
              />

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição"
                rows={5}
                className="w-full rounded-2xl border border-white/10 bg-[#050816]/80 p-4 text-white"
              />

              <input
                type="number"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                placeholder="ID da Categoria (Ex: 1)"
                className="w-full rounded-2xl border border-white/10 bg-[#050816]/80 p-4 text-white"
              />

              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                className="w-full rounded-2xl border border-white/10 bg-[#050816]/80 p-4 text-white"
              >
                <option value="Low">Baixa</option>
                <option value="Medium">Média</option>
                <option value="High">Alta</option>
              </select>

              <button
                onClick={handleCreateTicket}
                className="w-full rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 py-4 font-semibold text-white"
              >
                Criar Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}