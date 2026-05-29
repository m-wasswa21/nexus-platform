"use client";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (mounted && !isLoading && !user) router.replace("/login");
  }, [user, isLoading, router, mounted]);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 rounded-full animate-spin mx-auto mb-3"
            style={{ borderColor: "#173962", borderTopColor: "transparent" }} />
          <p className="text-sm font-heading font-semibold" style={{ color: "#173962" }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-slate-50 pattern-dots-light">
      {/* Sidebar: fixed 256px, sticky, right border only — no extra shadow creating fake gap */}
      <aside className="w-64 shrink-0 sticky top-0 h-screen overflow-y-auto"
        style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}>
        <Sidebar />
      </aside>

      {/* Content: fills ALL remaining width. Pages control their own px-6 padding. */}
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
