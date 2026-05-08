export interface AuthResponse {
  token: string;
  name: string;
  role: string;
}

export interface User {
  id: number;
  name: string;
  role: string;
}