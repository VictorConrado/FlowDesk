import {
  useContext,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Rocket,
} from "lucide-react";

import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();

  const { login } =
    useContext(AuthContext);

  const [email, setEmail] =
    useState<string>("");

  const [password, setPassword] =
    useState<string>("");

  const [loading, setLoading] =
    useState<boolean>(false);

  const [error, setError] =
    useState<string>("");

  const [showPassword, setShowPassword] =
    useState<boolean>(false);

  async function handleLogin(
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      await login(email, password);

      navigate("/dashboard");
    } catch (err) {
      console.error(err);

      setError(
        "Falha ao autenticar. Verifique suas credenciais."
      );
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
      {/* BACKGROUND EFFECTS */}
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
            -top-40
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
            -right-32
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
            h-[300px]
            w-[300px]
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
          max-w-md
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
            <Rocket size={34} />
          </div>

          <h1
            className="
              mt-6
              text-center
              text-3xl
              font-extrabold
              tracking-[0.15em]
              text-white
            "
          >
            FLOWDESK
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
            Acesse a central de
            gerenciamento de tickets.
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleLogin}
          className="
            relative
            z-10
            mt-8
            flex
            flex-col
            gap-5
          "
        >
          {/* EMAIL */}
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
              E-mail
            </label>

            <div className="relative">
              <Mail
                size={18}
                className="
                  pointer-events-none
                  absolute
                  left-4
                  top-1/2
                  z-10
                  -translate-y-1/2
                  text-white/40
                "
              />

              <input
                type="email"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
                className="
                  input-galaxy
                  w-full
                  !pl-12
                "
              />
            </div>
          </div>

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
              Senha
            </label>

            <div className="relative">
              <Lock
                size={18}
                className="
                  pointer-events-none
                  absolute
                  left-4
                  top-1/2
                  z-10
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
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                required
                className="
                  input-galaxy
                  w-full
                  !pl-12
                  !pr-12
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
                  z-10
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

          {/* ACTIONS */}
          <div
            className="
              flex
              items-center
              justify-between
              gap-4
            "
          >
            <Link
              to="/forgot-password"
              className="
                text-sm
                text-orange-300
                transition-colors
                hover:text-orange-200
              "
            >
              Esqueceu a senha?
            </Link>
          </div>

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
              disabled:cursor-not-allowed
              disabled:opacity-70
            "
          >
            {loading
              ? "Autenticando..."
              : "Entrar"}
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
          <p
            className="
              text-sm
              text-white/55
            "
          >
            Ainda não possui conta?
          </p>

          <Link
            to="/register"
            className="
              mt-2
              inline-block
              text-sm
              font-medium
              text-orange-300
              transition-colors
              hover:text-orange-200
            "
          >
            Criar conta
          </Link>
        </div>
      </div>
    </div>
  );
}