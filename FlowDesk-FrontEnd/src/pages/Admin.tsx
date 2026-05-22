import { useEffect, useState } from "react";
import type { User } from "../types/user";
import {
  getUsers,
  updateUserRole,
} from "../services/userService";
import axios from "axios";

export default function Admin() {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUserId, setLoadingUserId] =
    useState<number | null>(null);

  const loggedUserIdRaw =
    localStorage.getItem("userId");

  const loggedUserId = loggedUserIdRaw
    ? parseInt(loggedUserIdRaw)
    : null;

  async function loadUsers(): Promise<void> {
    try {
      const data = await getUsers();

      setUsers(data);
    } catch (error) {
      console.error(
        "Erro ao carregar usuários",
        error
      );

      alert("Erro ao carregar usuários");
    }
  }

  async function handleChangeRole(
    userId: number,
    newRole: string
  ): Promise<void> {
    const isSelf =
      loggedUserId !== null &&
      userId === loggedUserId;

    if (isSelf) {
      alert(
        "Você não pode alterar sua própria role."
      );

      return;
    }

    const previousUsers = [...users];

    try {
      setLoadingUserId(userId);

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, role: newRole }
            : u
        )
      );

      await updateUserRole(userId, newRole);

      await loadUsers();

      alert("Role atualizada com sucesso.");
    } catch (err: unknown) {

      setUsers(previousUsers);

      if (axios.isAxiosError(err)) {
        const errorMessage =
          typeof err.response?.data ===
          "string"
            ? err.response.data
            : "Erro ao atualizar role";

        alert(errorMessage);
      } else {
        alert(
          "Erro inesperado ao atualizar role"
        );
      }

      await loadUsers();
    } finally {
      setLoadingUserId(null);
    }
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Administração
        </h1>

        <p className="text-slate-400 mt-1">
          Gerencie permissões e cargos dos
          usuários.
        </p>
      </div>

      <div className="grid gap-4">
        {users.map((u) => {
          const isSelf =
            loggedUserId !== null &&
            u.id === loggedUserId;

          return (
            <div
              key={u.id}
              className="
                bg-slate-900/70
                border
                border-slate-800
                rounded-2xl
                p-5
                flex
                items-center
                justify-between
                backdrop-blur-sm
              "
            >
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {u.name}{" "}
                  {isSelf && (
                    <span className="text-blue-400">
                      (Você)
                    </span>
                  )}
                </h2>

                <p className="text-sm text-slate-400">
                  {u.email}
                </p>

                <p className="text-sm text-slate-500 mt-1">
                  Cargo atual: {u.role}
                </p>

                {isSelf && (
                  <p className="text-xs text-red-400 mt-2">
                    Você não pode alterar sua
                    própria role.
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={u.role}
                  disabled={
                    loadingUserId === u.id ||
                    isSelf
                  }
                  onChange={(e) =>
                    void handleChangeRole(
                      u.id,
                      e.target.value
                    )
                  }
                  className="
                    bg-slate-950
                    border
                    border-slate-700
                    text-slate-200
                    rounded-lg
                    px-3
                    py-2
                    outline-none
                    focus:border-blue-500
                    disabled:opacity-60
                    disabled:cursor-not-allowed
                  "
                >
                  <option value="Admin">
                    Admin
                  </option>

                  <option value="Technician">
                    Technician
                  </option>

                  <option value="Employee">
                    Employee
                  </option>
                </select>

                {loadingUserId === u.id && (
                  <span className="text-sm text-slate-400">
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