import { api } from "./api";
import type { User } from "../types/user";

export async function getUsers(): Promise<User[]> {
  const res = await api.get<User[]>("/user");
  return res.data;
}

export async function updateUserRole(
  userId: number,
  role: string
): Promise<void> {
  const roleMap: Record<string, number> = {
    Admin: 1,
    Employee: 2,
    Technician: 3,
  };

  await api.put(`/user/${userId}/role`, {
    roleId: roleMap[role],
  });
}