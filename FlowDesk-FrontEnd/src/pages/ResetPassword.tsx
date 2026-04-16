import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../services/api";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token");

  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    await api.post("/auth/reset-password", {
      token,
      newPassword: password,
    });

    alert("Senha alterada!");
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Nova senha</h2>

      <input
        type="password"
        placeholder="Nova senha"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button type="submit">Alterar senha</button>
    </form>
  );
}