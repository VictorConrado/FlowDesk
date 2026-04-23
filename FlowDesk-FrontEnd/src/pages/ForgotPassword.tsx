import { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { api } from "../services/api";
import axios from "axios";
import { Link } from "react-router-dom";

type ForgotPasswordErrorResponse = {
  message?: string;
};

export default function ForgotPassword() {
  const [email, setEmail] = useState<string>("");

  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setSuccess("");

    try {
      setLoading(true);

      await api.post("/auth/forgot-password", { email });

      setSuccess("Se o email existir, enviamos instruções.");
    } catch (err: unknown) {
      if (axios.isAxiosError<ForgotPasswordErrorResponse>(err)) {
        const message =
          err.response?.data?.message ||
          "Erro ao enviar solicitação";
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
          Recuperar senha
        </h1>

        <p className="text-sm text-slate-400 mb-4 text-center">
          Informe seu email para receber instruções de recuperação.
        </p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
          className="w-full mb-3 p-3 rounded-lg bg-[#0f172a] border border-slate-600 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

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
          {loading ? "Enviando..." : "Enviar instruções"}
        </button>

        <div className="mt-4 text-sm text-center text-slate-400">
          Lembrou a senha?{" "}
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