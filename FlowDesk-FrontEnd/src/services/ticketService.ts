import { api } from "./api";

export async function assignTicket(id: number): Promise<void> {
  await api.put(`/tickets/${id}/assign`);
}

export async function closeTicket(id: number): Promise<void> {
  await api.put(`/tickets/${id}/close`);
}