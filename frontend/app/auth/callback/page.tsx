"use client";
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { setToken, fetchMe } from "@/lib/auth";
import Image from "next/image";

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const qc = useQueryClient();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error || !token) {
      router.replace("/login?error=oauth_failed");
      return;
    }

    setToken(token);
    fetchMe()
      .then((user) => {
        qc.setQueryData(["me"], user);
        router.replace("/dashboard");
      })
      .catch(() => router.replace("/login?error=oauth_failed"));
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 font-body"
      style={{ background: "linear-gradient(135deg, #0a1628, #173962)" }}>
      <div className="flex items-center gap-3 opacity-80">
        <Image src="/cio-logo.png" alt="CIO/CxO Forum" width={100} height={32} className="h-8 w-auto object-contain brightness-0 invert" />
        <div className="w-px h-6 bg-white/20" />
        <Image src="/uds-logo.png" alt="Uganda Digital Society" width={80} height={32} className="h-7 w-auto object-contain brightness-0 invert" />
      </div>
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#c9a34b", borderTopColor: "transparent" }} />
        <p className="text-white font-heading font-semibold text-sm">Signing you in…</p>
      </div>
    </div>
  );
}
