"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchMe, logout as doLogout, getToken } from "@/lib/auth";
import { useRouter } from "next/navigation";

export function useAuth() {
  const qc = useQueryClient();
  const router = useRouter();

  const { data: user, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
    enabled: !!getToken(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  function logout() {
    doLogout();
    qc.clear();
    router.push("/login");
  }

  return { user: user ?? null, isLoading, logout };
}
