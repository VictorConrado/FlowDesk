import { useEffect, useState } from "react";
import type { User } from "../types/user";
import { getUsers, updateUserRole } from "../services/userService";
import { api } from "../services/api";

export default function Admin() {
  const [users, setUsers] = useState<User[]>([]);

  async function loadUsers(): Promise<void> {
    const data = await getUsers();
    setUsers(data);
  }

  async function handleChangeRole(
    userId: number,
    newRole: string
  ): Promise<void> {
    await updateUserRole(userId, newRole);
    await loadUsers();
  }

  useEffect(() => {
   (async () => {
     const res = await api.get<User[]>("/user");
     setUsers(res.data);
   })();
 }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin - Usuários</h1>

      <div className="grid gap-4">
        {users.map((u) => (
          <div
            key={u.id}
            className="bg-white p-4 rounded shadow flex justify-between items-center"
          >
            <div>
              <p className="font-bold">{u.name}</p>
              <p className="text-sm text-gray-500">{u.email}</p>
            </div>

            <select
              value={u.role}
              onChange={(e) =>
                handleChangeRole(u.id, e.target.value)
              }
              className="border p-2 rounded"
            >
              <option value="Admin">Admin</option>
              <option value="Technician">Technician</option>
              <option value="Employee">Employee</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}