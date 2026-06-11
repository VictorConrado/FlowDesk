import axios from "axios";


export const api = axios.create({
  baseURL: "https://localhost:7195/api",
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});