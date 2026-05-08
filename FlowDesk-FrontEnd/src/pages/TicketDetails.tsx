export default function TicketDetails() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Detalhes do Ticket
        </h1>

        <p className="text-slate-400 mt-1">
          Visualize informações completas do ticket.
        </p>
      </div>

      <div
        className="
          bg-slate-900/70
          border
          border-slate-800
          rounded-2xl
          p-6
        "
      >
        <h2 className="text-xl font-semibold text-white mb-4">
          Ticket #001
        </h2>

        <div className="space-y-3 text-slate-300">
          <p>
            <span className="font-semibold text-white">
              Título:
            </span>{" "}
            Problema ao acessar sistema
          </p>

          <p>
            <span className="font-semibold text-white">
              Status:
            </span>{" "}
            Em andamento
          </p>

          <p>
            <span className="font-semibold text-white">
              Prioridade:
            </span>{" "}
            Alta
          </p>

          <p>
            <span className="font-semibold text-white">
              Descrição:
            </span>{" "}
            Usuário relatou falha ao realizar login.
          </p>
        </div>
      </div>
    </div>
  );
}