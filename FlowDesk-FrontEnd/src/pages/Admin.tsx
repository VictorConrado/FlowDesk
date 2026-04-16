import { useEffect, useState } from "react";
import type { User } from "../types/user";
import { getUsers, updateUserRole } from "../services/userService";
import axios from "axios";

export default function Admin() {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUserId, setLoadingUserId] = useState<number | null>(null);

  const loggedUserIdRaw = localStorage.getItem("userId");
  const loggedUserId = loggedUserIdRaw ? parseInt(loggedUserIdRaw) : null;

  async function loadUsers(): Promise<void> {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Erro ao carregar usuários", error);
    }
  }

  async function handleChangeRole(
    userId: number,
    newRole: string
  ): Promise<void> {
    const isSelf = loggedUserId !== null && userId === loggedUserId;

    if (isSelf) {
      alert("Você não pode alterar sua própria role.");
      return;
    }

    try {
      setLoadingUserId(userId);

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, role: newRole } : u
        )
      );
      await updateUserRole(userId, newRole);

      await loadUsers();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (
          err.response?.data ===
          "Você não pode alterar sua própria role."
        ) {
          alert("Você não pode alterar sua própria role.");
        } else {
          alert("Erro ao atualizar role");
        }
      }
      await loadUsers();
    } finally {
      setLoadingUserId(null);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Admin - Usuários
      </h1>

      <div className="grid gap-4">
        {users.map((u) => {
          const isSelf =
            loggedUserId !== null && u.id === loggedUserId;

          return (
            <div
              key={u.id}
              className="bg-white p-4 rounded shadow flex justify-between items-center"
            >
              {/* INFO */}
              <div>
                <p className="font-bold">
                  {u.name}{" "}
                  {isSelf && (
                    <span className="text-blue-500">(Você)</span>
                  )}
                </p>

                <p className="text-sm text-gray-500">
                  {u.email}
                </p>

                {isSelf && (
                  <p className="text-xs text-red-500 mt-1">
                    Você não pode alterar sua própria role
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={u.role}
                  disabled={loadingUserId === u.id || isSelf}
                  onChange={(e) =>
                    handleChangeRole(u.id, e.target.value)
                  }
                  className="border p-2 rounded"
                >
                  <option value="Admin">Admin</option>
                  <option value="Technician">Technician</option>
                  <option value="Employee">Employee</option>
                </select>

                {loadingUserId === u.id && (
                  <span className="text-sm text-gray-400">
                    Salvando...
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}