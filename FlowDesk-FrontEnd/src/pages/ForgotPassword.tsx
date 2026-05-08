import {
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import axios from "axios";

import {
  ArrowLeft,
  Mail,
  SendHorizonal,
  ShieldCheck,
} from "lucide-react";

import { api } from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] =
    useState<string>("");

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
      setLoading(true);

      setError("");
      setSuccess("");

      await api.post(
        "/auth/forgot-password",
        {
          email,
        }
      );

      setSuccess(
        "Se o e-mail existir em nossa base, um link de recuperação foi enviado."
      );
    } catch (err) {
      console.error(err);

      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ??
            "Não foi possível enviar o e-mail de recuperação."
        );
      } else {
        setError(
          "Ocorreu um erro inesperado."
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
            top-10
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
            RECUPERAR ACESSO
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
            Informe seu e-mail para
            receber o link de redefinição
            de senha.
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

          {/* SUCCESS */}
          {success && (
            <div
              className="
                rounded-2xl
                border
                border-green-500/20
                bg-green-500/10
                px-4
                py-3
                text-sm
                leading-relaxed
                text-green-300
              "
            >
              {success}
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
            <SendHorizonal size={18} />

            {loading
              ? "Enviando..."
              : "Enviar link"}
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