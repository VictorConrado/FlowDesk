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
  User,
} from "lucide-react";

import { AuthContext } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();

  const { register } =
    useContext(AuthContext);

  const [name, setName] =
    useState<string>("");

  const [email, setEmail] =
    useState<string>("");

  const [password, setPassword] =
    useState<string>("");

  const [confirmPassword, setConfirmPassword] =
    useState<string>("");

  const [showPassword, setShowPassword] =
    useState<boolean>(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState<boolean>(false);

  const [loading, setLoading] =
    useState<boolean>(false);

  const [error, setError] =
    useState<string>("");

  async function handleRegister(
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();

    try {
      setError("");

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

      await register(
        name,
        email,
        password
      );

      navigate("/dashboard");
    } catch (err) {
      console.error(err);

      setError(
        "Não foi possível criar sua conta."
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
            -left-44
            -top-44
            h-[430px]
            w-[430px]
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
          max-w-lg
          overflow-hidden
          rounded-[32px]
          border
          border-white/10
          p-8
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
            CRIAR CONTA
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
            Registre-se para acessar o
            núcleo galáctico do FlowDesk.
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleRegister}
          className="
            relative
            z-10
            mt-8
            flex
            flex-col
            gap-5
          "
        >
          {/* NAME */}
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
              Nome
            </label>

            <div className="relative">
              <User
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
                type="text"
                placeholder="Digite seu nome"
                value={name}
                onChange={(e) =>
                  setName(
                    e.target.value
                  )
                }
                required
                className="
                  input-galaxy
                  pl-12
                "
              />
            </div>
          </div>

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
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-white/40
                "
              />

              <input
                type="email"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                required
                className="
                  input-galaxy
                  pl-12
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
              Confirmar Senha
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
                placeholder="Confirme sua senha"
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
              ? "Criando conta..."
              : "Registrar"}
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
            Já possui uma conta?
          </p>

          <Link
            to="/"
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
            Fazer login
          </Link>
        </div>
      </div>
    </div>
  );
}