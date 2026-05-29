import axios from "axios";

export const api = axios.create({ baseURL: "/api" });

api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("nexus_token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
