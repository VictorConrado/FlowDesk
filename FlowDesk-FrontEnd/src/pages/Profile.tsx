import { useEffect, useState } from "react";
import { api } from "../services/api";
import type { Ticket } from "../types/ticket";

export default function Profile() {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    api
      .get("/tickets/my-tickets")
      .then((res) => setTickets(res.data));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Meus Tickets
        </h1>

        <p className="text-slate-400 mt-1">
          Visualize todos os tickets criados por você.
        </p>
      </div>

      <div className="grid gap-4">
        {tickets.map((t) => (
          <div
            key={t.id}
            className="
              bg-slate-900/70
              border
              border-slate-800
              rounded-2xl
              p-5
            "
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {t.title}
                </h2>

                <p className="text-slate-400 text-sm">
                  Status: {t.status}
                </p>
              </div>

              <span
                className="
                  px-3
                  py-1
                  rounded-full
                  text-xs
                  bg-blue-500/20
                  text-blue-400
                  border
                  border-blue-500/20
                "
              >
                {t.priority}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}