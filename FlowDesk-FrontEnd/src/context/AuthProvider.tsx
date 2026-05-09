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
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": string;

  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name": string;

  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string;
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
          id: Number(
            decoded[
              "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            ]
          ),

          name:
            decoded[
              "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
            ],

          role:
            decoded[
              "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
            ],
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
      id: response.data.id,
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