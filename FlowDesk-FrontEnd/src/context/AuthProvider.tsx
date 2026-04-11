import { useState, useMemo, type ReactNode} from "react";
import { AuthContext } from "./AuthContext";
import { api } from "../services/api";
import { jwtDecode } from "jwt-decode";
import type { AuthResponse, User } from "../types/auth";

interface Props {
  children: ReactNode;
}

interface JwtPayload {
  unique_name: string;
  role: string;
}

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(() => {
    const token = localStorage.getItem("token");

    if (!token) return null;

    const decoded = jwtDecode<JwtPayload>(token);

    return {
      name: decoded.unique_name,
      role: decoded.role,
    };
  });

  async function login(email: string, password: string) {
    const response = await api.post<AuthResponse>("/auth/login", {
      email,
      password,
    });

    localStorage.setItem("token", response.data.token);

    setUser({
      name: response.data.name,
      role: response.data.role,
    });
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  const value = useMemo(() => ({ user, login, logout }), [user]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}