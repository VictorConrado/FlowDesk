import {
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Download,
  FolderKanban,
} from "lucide-react";

import * as XLSX from "xlsx";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AuthContext } from "../context/AuthContext";
import { api } from "../services/api";

interface Ticket {
  id: number;
  title: string;
  description: string;
  status: "Open" | "InProgress" | "Closed";
  priority: "Low" | "Medium" | "High";
  createdAt: string;
  openedByName?: string;
  assignedToId?: number | null;
}

interface DashboardCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  glow: string;
}

function DashboardCard({
  title,
  value,
  icon,
  glow,
}: DashboardCardProps) {
  return (
    <div
      className={`
        rounded-2xl
        border
        border-white/10
        bg-white/5
        backdrop-blur-xl
        p-6
        shadow-lg
        transition-all
        duration-300
        hover:scale-[1.02]
        ${glow}
      `}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">
            {title}
          </p>

          <h2 className="mt-2 text-4xl font-bold text-white">
            {value}
          </h2>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-white">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  const [tickets, setTickets] = useState<Ticket[]>(
    []
  );

  const [loading, setLoading] =
    useState<boolean>(true);

  async function loadTickets() {
    try {
      const response = await api.get(
        "/tickets?page=1&pageSize=100"
      );

      const data = response.data;

      if (Array.isArray(data)) {
        setTickets(data);
      } else if (Array.isArray(data.items)) {
        setTickets(data.items);
      } else {
        setTickets([]);
      }
    } catch (error) {
      console.error(error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTickets();
  }, []);

  const priorityData = useMemo(() => {
    const safeTickets = tickets ?? [];

    return [
      {
        name: "High",
        value: safeTickets.filter(
          (ticket) =>
            ticket.priority === "High"
        ).length,
        color: "#ef4444",
      },
      {
        name: "Medium",
        value: safeTickets.filter(
          (ticket) =>
            ticket.priority === "Medium"
        ).length,
        color: "#facc15",
      },
      {
        name: "Low",
        value: safeTickets.filter(
          (ticket) =>
            ticket.priority === "Low"
        ).length,
        color: "#22c55e",
      },
    ];
  }, [tickets]);

  const statusData = useMemo(() => {
    const safeTickets = tickets ?? [];

    return [
      {
        name: "Open",
        total: safeTickets.filter(
          (ticket) =>
            ticket.status === "Open"
        ).length,
      },
      {
        name: "InProgress",
        total: safeTickets.filter(
          (ticket) =>
            ticket.status === "InProgress"
        ).length,
      },
      {
        name: "Closed",
        total: safeTickets.filter(
          (ticket) =>
            ticket.status === "Closed"
        ).length,
      },
    ];
  }, [tickets]);

  const usersData = useMemo(() => {
    const safeTickets = tickets ?? [];

    const grouped = safeTickets.reduce<
      Record<string, number>
    >((acc, ticket) => {
      const userName =
        ticket.openedByName ||
        "Usuário";

      acc[userName] =
        (acc[userName] || 0) + 1;

      return acc;
    }, {});

    return Object.entries(grouped).map(
      ([name, total]) => ({
        name,
        total,
      })
    );
  }, [tickets]);

  const assignedToMeCount = useMemo(() => {
    const safeTickets = tickets ?? [];

    return safeTickets.filter(
      (ticket) =>
        ticket.assignedToId &&
        user &&
        ticket.status !== "Closed"
    ).length;
  }, [tickets, user]);

  function exportExcel() {
    const worksheet =
      XLSX.utils.json_to_sheet(
        tickets.map((ticket) => ({
          ID: ticket.id,
          Título: ticket.title,
          Status: ticket.status,
          Prioridade:
            ticket.priority,
          CriadoEm:
            ticket.createdAt,
        }))
      );

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Tickets"
    );

    XLSX.writeFile(
      workbook,
      "flowdesk-tickets.xlsx"
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">
            Galactic Dashboard
          </h1>

          <p className="mt-2 text-gray-400">
            Monitoramento completo
            da central FlowDesk
          </p>
        </div>

        <button
          onClick={exportExcel}
          className="
            flex
            items-center
            gap-2
            rounded-xl
            border
            border-orange-500/30
            bg-orange-500/20
            px-5
            py-3
            font-semibold
            text-orange-200
            transition-all
            duration-300
            hover:scale-105
            hover:border-orange-400
            hover:bg-orange-500/30
            hover:shadow-[0_0_25px_rgba(249,115,22,0.45)]
          "
        >
          <Download size={18} />
          Exportar Excel
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          title="Total de Tickets"
          value={tickets.length}
          icon={<FolderKanban />}
          glow="hover:shadow-[0_0_30px_rgba(249,115,22,0.35)]"
        />

        <DashboardCard
          title="Tickets Abertos"
          value={
            statusData.find(
              (s) => s.name === "Open"
            )?.total || 0
          }
          icon={<AlertTriangle />}
          glow="hover:shadow-[0_0_30px_rgba(239,68,68,0.35)]"
        />

        <DashboardCard
          title="Em Progresso"
          value={
            statusData.find(
              (s) =>
                s.name ===
                "InProgress"
            )?.total || 0
          }
          icon={<Activity />}
          glow="hover:shadow-[0_0_30px_rgba(250,204,21,0.35)]"
        />

        <DashboardCard
          title="Atribuídos a Mim"
          value={assignedToMeCount}
          icon={<CheckCircle2 />}
          glow="hover:shadow-[0_0_30px_rgba(34,197,94,0.35)]"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div
          className="
            rounded-2xl
            border
            border-white/10
            bg-white/5
            p-6
            backdrop-blur-xl
          "
        >
          <h2 className="mb-6 text-xl font-bold text-white">
            Tickets por
            Prioridade
          </h2>

          <div className="w-full h-[320px] min-h-[320px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <Pie
                  data={
                    priorityData
                  }
                  dataKey="value"
                  nameKey="name"
                  outerRadius={110}
                  label
                >
                  {priorityData.map(
                    (
                      entry
                    ) => (
                      <Cell
                        key={
                          entry.name
                        }
                        fill={
                          entry.color
                        }
                      />
                    )
                  )}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div
          className="
            rounded-2xl
            border
            border-white/10
            bg-white/5
            p-6
            backdrop-blur-xl
          "
        >
          <h2 className="mb-6 text-xl font-bold text-white">
            Tickets por
            Status
          </h2>

          <div className="w-full h-[320px] min-h-[320px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={statusData}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.08)"
                />

                <XAxis
                  dataKey="name"
                  stroke="#d1d5db"
                />

                <YAxis
                  stroke="#d1d5db"
                />

                <Tooltip />

                <Bar
                  dataKey="total"
                  radius={[
                    8,
                    8,
                    0,
                    0,
                  ]}
                  fill="#f97316"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div
        className="
          rounded-2xl
          border
          border-white/10
          bg-white/5
          p-6
          backdrop-blur-xl
        "
      >
        <h2 className="mb-6 text-xl font-bold text-white">
          Tickets por
          Usuário
        </h2>

        <div className="w-full h-[380px] min-h-[380px]">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={usersData}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.08)"
              />

              <XAxis
                dataKey="name"
                stroke="#d1d5db"
              />

              <YAxis
                stroke="#d1d5db"
              />

              <Tooltip />

              <Bar
                dataKey="total"
                radius={[
                  8,
                  8,
                  0,
                  0,
                ]}
                fill="#ef4444"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}