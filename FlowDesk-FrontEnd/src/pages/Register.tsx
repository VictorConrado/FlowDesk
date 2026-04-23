import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";

type RegisterErrorResponse = {
  message?: string;
};

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

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

      await api.post("/auth/register", {
        name,
        email,
        password,
      });

      navigate("/");
    } catch (err: unknown) {
      if (axios.isAxiosError<RegisterErrorResponse>(err)) {
        const message =
          err.response?.data?.message || "Erro ao criar conta";

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
        onSubmit={handleRegister}
        className="bg-[#1e293b] p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-700"
      >
        <h1 className="text-2xl font-semibold mb-6 text-center text-slate-100">
          Criar conta
        </h1>

        <input
          type="text"
          placeholder="Nome"
          className="w-full mb-3 p-3 rounded-lg bg-[#0f172a] border border-slate-600 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setName(e.target.value)
          }
          required
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-3 rounded-lg bg-[#0f172a] border border-slate-600 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
          required
        />

        <div className="relative mb-3">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Senha"
            className="w-full p-3 pr-10 rounded-lg bg-[#0f172a] border border-slate-600 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
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
            placeholder="Confirmar senha"
            className="w-full p-3 pr-10 rounded-lg bg-[#0f172a] border border-slate-600 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setConfirmPassword(e.target.value)
            }
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

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition disabled:opacity-60"
        >
          {loading ? "Cadastrando..." : "Cadastrar"}
        </button>

        <div className="mt-4 text-sm text-center text-slate-400">
          Já tem conta?{" "}
          <Link to="/" className="text-blue-400 hover:underline">
            Entrar
          </Link>
        </div>
      </form>
    </div>
  );
}