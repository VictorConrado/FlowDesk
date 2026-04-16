import { useState } from "react";
import { api } from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    await api.post("/auth/forgot-password", { email });

    alert("Se o email existir, enviamos instruções.");
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Recuperar senha</h2>

      <input
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <button type="submit">Enviar</button>
    </form>
  );
}