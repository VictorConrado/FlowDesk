import {
  useState,
  useMemo,
  type ReactNode,
} from "react";

import { jwtDecode } from "jwt-decode";

import { AuthContext } from "./AuthContext";

import { api } from "../services/api";

import type {
  AuthResponse,
  User,
} from "../types/auth";

interface Props {
  children: ReactNode;
}

interface JwtPayload {
  unique_name: string;
  role: string;
}

export function AuthProvider({
  children,
}: Props) {
  const [user, setUser] =
    useState<User | null>(() => {
      const token =
        localStorage.getItem("token");

      if (!token) {
        return null;
      }

      try {
        const decoded =
          jwtDecode<JwtPayload>(token);

        return {
          name: decoded.unique_name,
          role: decoded.role,
        };
      } catch {
        localStorage.removeItem(
          "token"
        );

        return null;
      }
    });

  async function login(
    email: string,
    password: string
  ): Promise<void> {
    const response =
      await api.post<AuthResponse>(
        "/auth/login",
        {
          email,
          password,
        }
      );

    localStorage.setItem(
      "token",
      response.data.token
    );

    setUser({
      name: response.data.name,
      role: response.data.role,
    });
  }

  async function register(
    name: string,
    email: string,
    password: string
  ): Promise<void> {
    await api.post("/auth/register", {
      name,
      email,
      password,
    });

    await login(email, password);
  }

  function logout(): void {
    localStorage.removeItem("token");

    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      login,
      register,
      logout,
    }),
    [user]
  );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}