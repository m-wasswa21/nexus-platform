import { User, TokenOut } from "@/types";
import { api } from "./api";

export async function login(email: string, password: string): Promise<TokenOut> {
  const { data } = await api.post<TokenOut>("/auth/login", { email, password });
  localStorage.setItem("nexus_token", data.access_token);
  return data;
}

export async function register(payload: {
  name: string; email: string; password: string;
  role: string; title?: string; company?: string; bio?: string;
}): Promise<TokenOut> {
  const { data } = await api.post<TokenOut>("/auth/register", payload);
  localStorage.setItem("nexus_token", data.access_token);
  return data;
}

export async function fetchMe(): Promise<User> {
  const { data } = await api.get<User>("/auth/me");
  return data;
}

export function logout() {
  localStorage.removeItem("nexus_token");
}

export function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("nexus_token") : null;
}

export function setToken(token: string) {
  localStorage.setItem("nexus_token", token);
}
