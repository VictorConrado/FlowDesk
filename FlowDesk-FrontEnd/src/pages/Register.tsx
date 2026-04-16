import { useState } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    await api.post("/auth/register", {
      name,
      email,
      password,
    });

    alert("Conta criada!");
    navigate("/");
  }

  return (
    <form onSubmit={handleRegister}>
      <h2>Cadastro</h2>

      <input placeholder="Nome" onChange={e => setName(e.target.value)} />
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Senha" onChange={e => setPassword(e.target.value)} />

      <button type="submit">Cadastrar</button>
    </form>
  );
}