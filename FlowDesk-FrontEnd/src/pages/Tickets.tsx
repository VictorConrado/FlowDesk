import { useEffect, useState, useContext } from "react";
import { api } from "../services/api";
import type { Ticket } from "../types/ticket";
import { AuthContext } from "../context/AuthContext";

export default function Tickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const { user } = useContext(AuthContext);

  async function loadTickets(): Promise<void> {
    const res = await api.get<Ticket[]>("/tickets?page=1&pageSize=10");
    setTickets(res.data);
  }

  async function createTicket(): Promise<void> {
    await api.post("/tickets", {
      title,
      description,
      categoryId: 1,
      priority: 2,
    });

    setTitle("");
    setDescription("");

    await loadTickets();
  }

  async function assignTicket(id: number): Promise<void> {
    await api.put(`/tickets/${id}/assign`);
    await loadTickets();
  }

  async function closeTicket(id: number): Promise<void> {
    await api.put(`/tickets/${id}/close`);
    await loadTickets();
  }

   useEffect(() => {
  (async () => {
    const res = await api.get<Ticket[]>("/tickets?page=1&pageSize=10");
    setTickets(res.data);
  })();
}, []);

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Tickets</h1>


      <div className="mb-4 flex gap-2">
        <input
          className="border p-2"
          value={title}
          placeholder="Título"
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          className="border p-2"
          value={description}
          placeholder="Descrição"
          onChange={(e) => setDescription(e.target.value)}
        />

        <button
          onClick={createTicket}
          className="bg-green-500 text-white px-4 rounded"
        >
          Criar
        </button>
      </div>

      <div className="grid gap-4">
        {tickets.map((t) => (
          <div
            key={t.id}
            className="bg-white p-4 rounded shadow flex justify-between items-center"
          >
            <div>
              <h2 className="font-bold">{t.title}</h2>
              <p className="text-sm text-gray-500">{t.status}</p>
            </div>

            <div className="flex gap-2 items-center">
              <span className="text-sm">{t.priority}</span>

              {user?.role === "Technician" && t.status === "Open" && (
                <button
                  onClick={() => assignTicket(t.id)}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Assumir
                </button>
              )}

              {user?.role === "Admin" && t.status !== "Closed" && (
                <button
                  onClick={() => closeTicket(t.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Fechar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}