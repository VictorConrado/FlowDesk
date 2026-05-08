import {
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import axios from "axios";

import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
} from "lucide-react";

import { api } from "../services/api";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();

  const token = useMemo(
    () =>
      searchParams.get("token") ??
      "",
    [searchParams]
  );

  const [password, setPassword] =
    useState<string>("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState<string>("");

  const [showPassword, setShowPassword] =
    useState<boolean>(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState<boolean>(false);

  const [loading, setLoading] =
    useState<boolean>(false);

  const [success, setSuccess] =
    useState<string>("");

  const [error, setError] =
    useState<string>("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();

    try {
      setError("");
      setSuccess("");

      if (!token) {
        setError(
          "Token inválido ou inexistente."
        );

        return;
      }

      if (
        password !==
        confirmPassword
      ) {
        setError(
          "As senhas não coincidem."
        );

        return;
      }

      setLoading(true);

      await api.post(
        "/auth/reset-password",
        {
          token,
          newPassword: password,
        }
      );

      setSuccess(
        "Senha redefinida com sucesso."
      );

      setTimeout(() => {
        navigate("/");
      }, 2500);
    } catch (err) {
      console.error(err);

      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ??
            "Não foi possível redefinir sua senha."
        );
      } else {
        setError(
          "Erro inesperado ao redefinir senha."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="
        relative
        flex
        min-h-screen
        items-center
        justify-center
        overflow-hidden
        px-4
        py-10
      "
    >
      {/* BACKGROUND */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          overflow-hidden
        "
      >
        <div
          className="
            absolute
            -left-40
            top-0
            h-[420px]
            w-[420px]
            rounded-full
            bg-red-500/10
            blur-3xl
          "
        />

        <div
          className="
            absolute
            right-0
            top-0
            h-[420px]
            w-[420px]
            rounded-full
            bg-orange-500/10
            blur-3xl
          "
        />

        <div
          className="
            absolute
            bottom-0
            left-1/3
            h-[280px]
            w-[280px]
            rounded-full
            bg-green-500/10
            blur-3xl
          "
        />
      </div>

      {/* CARD */}
      <div
        className="
          glass-card
          relative
          z-10
          w-full
          max-w-lg
          overflow-hidden
          rounded-[32px]
          border
          border-white/10
          p-8
          shadow-glass
        "
      >
        {/* GLOW */}
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-gradient-to-br
            from-orange-500/5
            via-transparent
            to-red-500/5
          "
        />

        {/* HEADER */}
        <div className="relative z-10">
          <div
            className="
              mx-auto
              flex
              h-20
              w-20
              items-center
              justify-center
              rounded-[28px]
              border
              border-orange-500/20
              bg-gradient-to-br
              from-orange-500/20
              to-red-500/20
              text-orange-300
              shadow-neonOrange
            "
          >
            <ShieldCheck size={34} />
          </div>

          <h1
            className="
              mt-6
              text-center
              text-3xl
              font-extrabold
              tracking-[0.12em]
              text-white
            "
          >
            NOVA SENHA
          </h1>

          <p
            className="
              mt-3
              text-center
              text-sm
              leading-relaxed
              text-white/60
            "
          >
            Defina uma nova senha segura
            para acessar novamente o
            FlowDesk.
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="
            relative
            z-10
            mt-8
            flex
            flex-col
            gap-5
          "
        >
          {/* PASSWORD */}
          <div>
            <label
              className="
                mb-2
                block
                text-xs
                uppercase
                tracking-[0.2em]
                text-orange-300
              "
            >
              Nova senha
            </label>

            <div className="relative">
              <Lock
                size={18}
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-white/40
                "
              />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Digite sua nova senha"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                required
                className="
                  input-galaxy
                  pl-12
                  pr-12
                "
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (prev) => !prev
                  )
                }
                className="
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  text-white/40
                  transition-colors
                  hover:text-orange-300
                "
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label
              className="
                mb-2
                block
                text-xs
                uppercase
                tracking-[0.2em]
                text-orange-300
              "
            >
              Confirmar senha
            </label>

            <div className="relative">
              <Lock
                size={18}
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-white/40
                "
              />

              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                placeholder="Confirme sua nova senha"
                value={
                  confirmPassword
                }
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                required
                className="
                  input-galaxy
                  pl-12
                  pr-12
                "
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    (prev) => !prev
                  )
                }
                className="
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  text-white/40
                  transition-colors
                  hover:text-orange-300
                "
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {/* SUCCESS */}
          {success && (
            <div
              className="
                flex
                items-center
                gap-3
                rounded-2xl
                border
                border-green-500/20
                bg-green-500/10
                px-4
                py-3
                text-sm
                text-green-300
              "
            >
              <CheckCircle2 size={18} />

              <span>{success}</span>
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div
              className="
                rounded-2xl
                border
                border-red-500/20
                bg-red-500/10
                px-4
                py-3
                text-sm
                text-red-300
              "
            >
              {error}
            </div>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="
              primary-button
              mt-2
              flex
              items-center
              justify-center
              gap-3
              px-5
              py-4
              text-sm
              uppercase
              tracking-[0.15em]
            "
          >
            {loading
              ? "Redefinindo..."
              : "Salvar nova senha"}
          </button>
        </form>

        {/* FOOTER */}
        <div
          className="
            relative
            z-10
            mt-8
            text-center
          "
        >
          <Link
            to="/"
            className="
              inline-flex
              items-center
              gap-2
              text-sm
              font-medium
              text-orange-300
              transition-colors
              hover:text-orange-200
            "
          >
            <ArrowLeft size={16} />

            Voltar para login
          </Link>
        </div>
      </div>
    </div>
  );
}