import { api } from "./api";
import type { User } from "../types/user";

export async function getUsers(): Promise<User[]> {
  const res = await api.get<User[]>("/users");
  return res.data;
}

export async function updateUserRole(
  userId: number,
  role: string
): Promise<void> {
  await api.put(`/users/${userId}/role`, { role });
}