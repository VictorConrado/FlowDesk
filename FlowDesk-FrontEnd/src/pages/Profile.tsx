import { useEffect, useState } from "react";
import { api } from "../services/api";
import type { Ticket } from "../types/ticket";

export default function Profile() {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    api.get("/tickets/my-tickets")
      .then(res => setTickets(res.data));
  }, []);

  return (
    <div>
      <h2>Meus Tickets</h2>

      <ul>
        {tickets.map((t) => (
          <li key={t.id}>
            {t.title} - {t.status}
          </li>
        ))}
      </ul>
    </div>
  );
}