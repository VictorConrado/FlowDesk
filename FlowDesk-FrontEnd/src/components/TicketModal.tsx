import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  CalendarClock,
  Loader2,
  MessageSquare,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

import { AuthContext } from "../context/AuthContext";
import { api } from "../services/api";

type TicketStatus =
  | "Open"
  | "InProgress"
  | "Closed";

type TicketPriority =
  | "Low"
  | "Medium"
  | "High";

interface TicketComment {
  content: string;
  createdAt: string;
  user: string;
}

interface Ticket {
  id: number;
  number?: string;
  title: string;
  description: string;
  status: TicketStatus | string | number;
  priority: TicketPriority | string | number; 
  category?: string;
  openedBy?: string; 
  assignedTo?: string | null; 
  createdAt?: string; 
  closedAt?: string | null;
  slaExpiresAt?: string | null;
  comments?: TicketComment[];
  closingComment?: string | null;

  user?: { name: string };
  assignedUser?: { name: string };
}

interface SystemUser {
  id: number;
  name: string;
  role: string;
}

interface Props {
  ticket: Ticket;
  onClose: () => void;
  onUpdated: () => Promise<void>;
}

const priorityClasses = {
  High:
    "bg-red-500/15 text-red-300 border border-red-500/30",

  Medium:
    "bg-yellow-500/15 text-yellow-300 border border-yellow-500/30",

  Low:
    "bg-green-500/15 text-green-300 border border-green-500/30",
};

const statusClasses = {
  Open:
    "bg-red-500/15 text-red-300 border border-red-500/30",

  InProgress:
    "bg-yellow-500/15 text-yellow-300 border border-yellow-500/30",

  Closed:
    "bg-green-500/15 text-green-300 border border-green-500/30",
};

function normalizeStatus(
  status?: string | number
): TicketStatus {
  if (!status) return "Open";

  const value = String(status).toLowerCase();

  if (
    value.includes("progress") ||
    value === "2"
  ) {
    return "InProgress";
  }

  if (
    value.includes("closed") ||
    value === "3"
  ) {
    return "Closed";
  }

  return "Open";
}

function normalizePriority(
  priority?: string | number
): TicketPriority {
  if (!priority) return "Low";

  const value = String(priority).toLowerCase();

  if (
    value.includes("high") ||
    value === "3"
  ) {
    return "High";
  }

  if (
    value.includes("medium") ||
    value === "2"
  ) {
    return "Medium";
  }

  return "Low";
}

function formatDate(
  date?: string | null
) {
  if (!date) {
    return "Data inválida";
  }

  const parsed = new Date(date);

  if (isNaN(parsed.getTime())) {
    return "Data inválida";
  }

  return parsed.toLocaleString("pt-BR");
}

function getSla(ticket: Ticket) {
  if (!ticket.slaExpiresAt) {
    return {
      label: "--",
      className:
        "bg-slate-500/15 text-slate-300 border border-slate-500/30",
    };
  }

  const now = new Date();

  const expires = new Date(
    ticket.slaExpiresAt
  );

  if (isNaN(expires.getTime())) {
    return {
      label: "--",
      className:
        "bg-slate-500/15 text-slate-300 border border-slate-500/30",
    };
  }

  const diff =
    expires.getTime() - now.getTime();

  const hours = Math.floor(
    diff / (1000 * 60 * 60)
  );

  if (hours > 24) {
    return {
      label: `${hours}h restantes`,
      className:
        "bg-green-500/15 text-green-300 border border-green-500/30",
    };
  }

  if (hours > 0) {
    return {
      label: `${hours}h restantes`,
      className:
        "bg-yellow-500/15 text-yellow-300 border border-yellow-500/30",
    };
  }

  return {
    label: "SLA vencido",
    className:
      "bg-red-500/15 text-red-300 border border-red-500/30",
  };
}

export default function TicketModal({
  ticket,
  onClose,
  onUpdated,
}: Props) {
  const { user } =
    useContext(AuthContext);

  const [ticketData, setTicketData] =
    useState<Ticket>(ticket);

  const [comment, setComment] =
    useState<string>("");

  const [closingComment, setClosingComment] =
    useState<string>("");

  const [reopenComment, setReopenComment] =
    useState<string>("");

  const [loading, setLoading] =
    useState<boolean>(false);

  const [users, setUsers] =
    useState<SystemUser[]>([]);

  const [selectedUserId, setSelectedUserId] =
    useState<number | "">("");

  const fetchTicket = useCallback(
    async () => {
      try {
        const response = await api.get(
          `/tickets/${ticket.id}`
        );

        setTicketData(response.data);
      } catch (error) {
        console.error(error);
      }
    },
    [ticket.id]
  );

  const fetchUsers = useCallback(
    async () => {
      try {
        const response =
          await api.get("/user");

        const filteredUsers =
          response.data.filter(
            (u: SystemUser) =>
              u.role === "Admin" ||
              u.role === "SuperAdmin" ||
              u.role ===
                "Technician"
          );

        setUsers(filteredUsers);
      } catch (error) {
        console.error(error);
      }
    },
    []
  );

  useEffect(() => {
    fetchTicket();

    if (user?.role === "Admin" || user?.role === "SuperAdmin") {
      fetchUsers();
    }
  }, [
    fetchTicket,
    fetchUsers,
    user?.role,
  ]);

  const sla = useMemo(
    () => getSla(ticketData),
    [ticketData]
  );

  const canClose =
    (user?.role === "Admin" ||
      user?.role === "SuperAdmin" ||
      user?.name ===
        ticketData.assignedTo) &&
    ticketData.status !== "Closed";

  const canReopen =
    (user?.role === "Admin" || user?.role === "SuperAdmin") &&
    ticketData.status === "Closed";

  const canAssign =
    ticketData.status !== "Closed" &&
    !ticketData.assignedTo &&
    (user?.role === "Admin" ||
      user?.role === "SuperAdmin" ||
      user?.role ===
        "Technician");

  async function handleComment() {
    if (!comment.trim()) return;

    try {
      setLoading(true);

      await api.post(
        `/tickets/${ticketData.id}/comments`,
        {
          content: comment,
        }
      );

      setComment("");

      await fetchTicket();

      await onUpdated();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCloseTicket() {
    if (!closingComment.trim()) {
      return;
    }

    try {
      setLoading(true);

      await api.put(
        `/tickets/${ticketData.id}/close`,
        {
          comment: closingComment,
        }
      );

      await onUpdated();

      await fetchTicket();

      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleReopen() {
    if (!reopenComment.trim()) {
      return;
    }

    try {
      setLoading(true);

      await api.put(
        `/tickets/${ticketData.id}/reopen`
      );

      await api.post(
        `/tickets/${ticketData.id}/comments`,
        {
          content: `${user?.name} reabriu o chamado: ${reopenComment}`,
        }
      );

      setReopenComment("");

      await onUpdated();

      await fetchTicket();

      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAssign() {
    try {
      setLoading(true);

      let technicianId = user?.id;

      if (
        user?.role === "Admin" &&
        selectedUserId
      ) {
        technicianId = Number(
          selectedUserId
        );
      }

      if (!technicianId) return;

      const assignedUser =
        users.find(
          (u) =>
            u.id === technicianId
        );

      await api.put(
        `/tickets/${ticketData.id}/assign`,
        {
          technicianId,
        }
      );

      if (assignedUser) {
        await api.post(
          `/tickets/${ticketData.id}/comments`,
          {
            content: `${assignedUser.name} adicionado como responsável pelo chamado`,
          }
        );
      }

      await onUpdated();

      await fetchTicket();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteTicket() {
      const confirmed = window.confirm(
        `Deseja realmente excluir o ticket #${ticketData.id}?`
      );

      if (!confirmed) {
        return;
      }

      try {
        setLoading(true);

        await api.delete(
          `/tickets/${ticketData.id}`
        );

        await onUpdated();

        onClose();
      } catch (error) {
        console.error(error);

        alert(
          "Erro ao excluir ticket."
        );
      } finally {
        setLoading(false);
      }
    }

  return (
    <div
      onClick={onClose}
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/70 p-4
        backdrop-blur-sm
      "
    >
      <div
        onClick={(e) =>
          e.stopPropagation()
        }
        className="
          relative max-h-[95vh]
          w-full max-w-5xl
          overflow-y-auto rounded-3xl
          border border-white/10
          bg-[#0B1120]/90 p-8
          shadow-[0_0_60px_rgba(249,115,22,0.18)]
          backdrop-blur-2xl
        "
      >
        <button
          onClick={onClose}
          className="
            absolute right-5 top-5
            rounded-full border
            border-white/10 p-2
            text-slate-400
            transition-all hover:border-red-500/40
            hover:bg-red-500/10
            hover:text-red-300
          "
        >
          <X size={18} />
        </button>

        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-3">
              <div
                className="
                  rounded-2xl border
                  border-orange-500/30
                  bg-orange-500/10 p-3
                "
              >
                <AlertTriangle className="text-orange-300" />
              </div>

              <div>
                <p
                  className="
                    text-xs uppercase
                    tracking-[0.25em]
                    text-slate-500
                  "
                >
                  Ticket #{ticketData.id}
                </p>

                <h2
                  className="
                    mt-1 font-orbitron
                    text-3xl font-bold
                    text-white
                  "
                >
                  {ticketData.title}
                </h2>
              </div>
            </div>

            <p
              className="
                mt-6 leading-relaxed
                text-slate-300
              "
            >
              {ticketData.description}
            </p>
          </div>

          <div
            className="
              grid grid-cols-1 gap-4
              md:grid-cols-2 xl:grid-cols-4
            "
          >
            <div
              className={`
                rounded-2xl p-4
                ${
                  statusClasses[
                    normalizeStatus(ticketData.status)
                  ]
                }
              `}
            >
              <p className="text-xs uppercase tracking-wider">
                Status
              </p>

              <p className="mt-2 font-semibold">
                {ticketData.status}
              </p>
            </div>

            <div
              className={`
                rounded-2xl p-4
                ${
                  priorityClasses[
                     normalizePriority(ticketData.priority)
                  ]
                }
              `}
            >
              <p className="text-xs uppercase tracking-wider">
                Prioridade
              </p>

              <p className="mt-2 font-semibold">
                {ticketData.priority}
              </p>
            </div>

            <div
              className={`
                rounded-2xl p-4
                ${sla.className}
              `}
            >
              <p className="text-xs uppercase tracking-wider">
                SLA
              </p>

              <p className="mt-2 font-semibold">
                {sla.label}
              </p>
            </div>

            <div
              className="
                rounded-2xl border
                border-white/10
                bg-white/5 p-4
              "
            >
              <p
                className="
                  text-xs uppercase
                  tracking-wider
                  text-slate-400
                "
              >
                Criado em
              </p>

              <p className="mt-2 text-sm text-white">
                {formatDate(
                  ticketData.createdAt
                )}
              </p>
            </div>
          </div>

          <div
            className="
              grid grid-cols-1 gap-4
              lg:grid-cols-2
            "
          >
            <div
              className="
                rounded-2xl border
                border-white/10
                bg-white/5 p-5
              "
            >
              <div className="flex items-center gap-2 text-orange-300">
                <UserRound size={18} />

                <h3 className="font-semibold">
                  Aberto por
                </h3>
              </div>

              <p className="mt-3 text-white">
                {ticketData.openedBy}
              </p>
            </div>

            <div
              className="
                rounded-2xl border
                border-white/10
                bg-white/5 p-5
              "
            >
              <div className="flex items-center gap-2 text-orange-300">
                <ShieldCheck size={18} />

                <h3 className="font-semibold">
                  Responsável
                </h3>
              </div>

              {user?.role === "Admin" &&
              ticketData.status !==
                "Closed" ? (
                <div className="mt-4 space-y-3">
                  <select
                    value={
                      selectedUserId
                    }
                    onChange={(e) =>
                      setSelectedUserId(
                        Number(
                          e.target.value
                        )
                      )
                    }
                    className="
                      w-full rounded-2xl
                      border border-white/10
                      bg-[#050816]/80 p-3
                      text-white outline-none
                    "
                  >
                    <option value="">
                      Selecione um
                      responsável
                    </option>

                    {users.map((u) => (
                      <option
                        key={u.id}
                        value={u.id}
                      >
                        {u.name} (
                        {u.role})
                      </option>
                    ))}
                  </select>

                  <button
                    disabled={
                      loading ||
                      !selectedUserId
                    }
                    onClick={
                      handleAssign
                    }
                    className="
                      rounded-2xl
                      bg-orange-500/20
                      px-4 py-2
                      text-sm font-semibold
                      text-orange-200
                      transition-all
                      hover:bg-orange-500/30
                      disabled:opacity-50
                    "
                  >
                    Delegar responsável
                  </button>

                  <p className="text-sm text-slate-400">
                    Atual:{" "}
                    {ticketData.assignedTo ??
                      "Não atribuído"}
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-white">
                  {ticketData.assignedTo ??
                    "Não atribuído"}
                </p>
              )}
            </div>
          </div>

          <div
            className="
              rounded-3xl border
              border-white/10
              bg-white/5 p-6
            "
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="text-orange-300" />

              <h3
                className="
                  text-xl font-semibold
                  text-white
                "
              >
                Comentários
              </h3>
            </div>

            <div className="mt-6 space-y-4">
              {ticketData.comments
                ?.length ? (
                ticketData.comments.map(
                  (comment, index) => (
                    <div
                      key={index}
                      className="
                        rounded-2xl border
                        border-white/10
                        bg-black/20 p-4
                      "
                    >
                      <div
                        className="
                          flex items-center
                          justify-between gap-3
                        "
                      >
                        <span
                          className="
                            text-sm font-semibold
                            text-orange-300
                          "
                        >
                          {comment.user ??
                            "Usuário"}
                        </span>

                        <span
                          className="
                            text-xs text-slate-500
                          "
                        >
                          {formatDate(
                            comment.createdAt
                          )}
                        </span>
                      </div>

                      <p
                        className="
                          mt-3 text-sm
                          leading-relaxed
                          text-slate-300
                        "
                      >
                        {
                          comment.content
                        }
                      </p>
                    </div>
                  )
                )
              ) : (
                <p className="text-slate-400">
                  Nenhum comentário
                  ainda.
                </p>
              )}
            </div>

            <div className="mt-6">
              <textarea
                value={comment}
                onChange={(e) =>
                  setComment(
                    e.target.value
                  )
                }
                placeholder="Adicionar comentário..."
                rows={4}
                className="
                  w-full rounded-2xl
                  border border-white/10
                  bg-[#050816]/70 p-4
                  text-white outline-none
                  transition-all
                  placeholder:text-slate-500
                  focus:border-orange-500/50
                  focus:ring-2
                  focus:ring-orange-500/20
                "
              />

              <button
                disabled={loading}
                onClick={handleComment}
                className="
                  mt-4 rounded-2xl
                  bg-gradient-to-r
                  from-red-500 to-orange-500
                  px-6 py-3 font-semibold
                  text-white transition-all
                  hover:scale-[1.02]
                  hover:shadow-[0_0_30px_rgba(249,115,22,0.35)]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Enviando...
                  </span>
                ) : (
                  "Enviar comentário"
                )}
              </button>
            </div>
          </div>

          {ticketData.closingComment && (
            <div
              className="
                rounded-3xl border
                border-red-500/20
                bg-red-500/10 p-6
              "
            >
              <h3
                className="
                  text-lg font-semibold
                  text-red-300
                "
              >
                Comentário de encerramento
              </h3>

              <p
                className="
                  mt-4 leading-relaxed
                  text-red-100/80
                "
              >
                {
                  ticketData.closingComment
                }
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-4">
            {canAssign &&
              user?.role ===
                "Technician" && (
                <button
                  disabled={loading}
                  onClick={
                    handleAssign
                  }
                  className="
                    rounded-2xl border
                    border-orange-500/30
                    bg-orange-500/15
                    px-6 py-3 font-semibold
                    text-orange-200 transition-all
                    hover:border-orange-400/60
                    hover:bg-orange-500/25
                  "
                >
                  Assumir Ticket
                </button>
              )}

              {user?.role === "SuperAdmin" && (
                <button
                  disabled={loading}
                  onClick={handleDeleteTicket}
                  className="
                    rounded-2xl
                    border
                    border-red-600/40
                    bg-red-600/15
                    px-6
                    py-3
                    font-semibold
                    text-red-300
                    transition-all
                    hover:bg-red-600/25
                    hover:border-red-500/70
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >
                  Excluir Ticket
                </button>
              )}

            {canReopen && (
              <div className="w-full space-y-4">
                <textarea
                  value={
                    reopenComment
                  }
                  onChange={(e) =>
                    setReopenComment(
                      e.target.value
                    )
                  }
                  rows={3}
                  placeholder="Comentário obrigatório para reabertura..."
                  className="
                    w-full rounded-2xl
                    border border-green-500/20
                    bg-[#050816]/80 p-4
                    text-white outline-none
                    placeholder:text-slate-500
                  "
                />

                <button
                  disabled={
                    loading ||
                    !reopenComment.trim()
                  }
                  onClick={
                    handleReopen
                  }
                  className="
                    rounded-2xl border
                    border-green-500/30
                    bg-green-500/15
                    px-6 py-3 font-semibold
                    text-green-200 transition-all
                    hover:border-green-400/60
                    hover:bg-green-500/25
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  Reabrir Ticket
                </button>
              </div>
            )}
          </div>

          {canClose && (
            <div
              className="
                rounded-3xl border
                border-red-500/20
                bg-red-500/10 p-6
              "
            >
              <div className="flex items-center gap-2">
                <CalendarClock className="text-red-300" />

                <h3
                  className="
                    text-xl font-semibold
                    text-red-200
                  "
                >
                  Encerrar Ticket
                </h3>
              </div>

              <textarea
                value={
                  closingComment
                }
                onChange={(e) =>
                  setClosingComment(
                    e.target.value
                  )
                }
                rows={4}
                placeholder="Comentário obrigatório para encerramento..."
                className="
                  mt-5 w-full rounded-2xl
                  border border-red-500/20
                  bg-[#050816]/80 p-4
                  text-white outline-none
                  transition-all
                  placeholder:text-slate-500
                  focus:border-red-400/50
                  focus:ring-2
                  focus:ring-red-500/20
                "
              />

              <button
                disabled={
                  loading ||
                  !closingComment.trim()
                }
                onClick={
                  handleCloseTicket
                }
                className="
                  mt-5 rounded-2xl
                  bg-gradient-to-r
                  from-red-500 to-orange-500
                  px-6 py-3 font-semibold
                  text-white transition-all
                  hover:scale-[1.02]
                  hover:shadow-[0_0_30px_rgba(239,68,68,0.35)]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                Encerrar Ticket
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}