import { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { api } from "../services/api";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";

type ResetPasswordErrorResponse = {
  message?: string;
};

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token");

  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!token) {
      setError("Token inválido ou expirado");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/reset-password", {
        token,
        newPassword: password,
      });

      setSuccess("Senha alterada com sucesso!");
    } catch (err: unknown) {
      if (axios.isAxiosError<ResetPasswordErrorResponse>(err)) {
        const message =
          err.response?.data?.message ||
          "Erro ao redefinir senha";
        setError(message);
      } else {
        setError("Erro inesperado");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
      <form
        onSubmit={handleSubmit}
        className="bg-[#1e293b] p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-700"
      >
        <h1 className="text-2xl font-semibold mb-6 text-center text-slate-100">
          Nova senha
        </h1>

        <p className="text-sm text-slate-400 mb-4 text-center">
          Digite sua nova senha abaixo.
        </p>

        <div className="relative mb-3">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Nova senha"
            value={password}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
            className="w-full p-3 pr-10 rounded-lg bg-[#0f172a] border border-slate-600 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="relative mb-3">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirmar nova senha"
            value={confirmPassword}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setConfirmPassword(e.target.value)
            }
            className="w-full p-3 pr-10 rounded-lg bg-[#0f172a] border border-slate-600 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <button
            type="button"
            onClick={() =>
              setShowConfirmPassword((prev) => !prev)
            }
            className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
          >
            {showConfirmPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-400 text-sm p-2 rounded mb-3 border border-red-500/20">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 text-green-400 text-sm p-2 rounded mb-3 border border-green-500/20">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition disabled:opacity-60"
        >
          {loading ? "Alterando..." : "Alterar senha"}
        </button>

        <div className="mt-4 text-sm text-center text-slate-400">
          <Link
            to="/"
            className="text-blue-400 hover:underline"
          >
            Voltar para login
          </Link>
        </div>
      </form>
    </div>
  );
}