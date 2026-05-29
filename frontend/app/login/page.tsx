"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { login } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Zap } from "lucide-react";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
type Form = z.infer<typeof schema>;

const DEMO_ACCOUNTS = [
  { label: "Mentor",  email: "sarah.nabuuma@nexus.africa",  password: "password123", color: "#173962", description: "CIO · MTN Uganda" },
  { label: "Mentee",  email: "brian.otieno@nexus.africa",   password: "password123", color: "#16a34a", description: "IT Manager · KRA" },
  { label: "Admin",   email: "admin@nexus.africa",          password: "admin1234",   color: "#de2729", description: "Platform Admin" },
];

export default function LoginPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: Form) {
    setLoading(true);
    try {
      const res = await login(data.email, data.password);
      qc.setQueryData(["me"], res.user);
      router.push("/dashboard");
    } catch {
      toast.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  async function loginAsDemo(email: string, password: string, label: string) {
    setDemoLoading(label);
    try {
      const res = await login(email, password);
      qc.setQueryData(["me"], res.user);
      toast.success(`Signed in as ${label}`);
      router.push("/dashboard");
    } catch {
      toast.error("Demo login failed");
    } finally {
      setDemoLoading(null);
    }
  }

  function fillDemo(email: string, password: string) {
    setValue("email", email);
    setValue("password", password);
  }

  return (
    <div className="min-h-screen flex font-body">
      {/* Left panel — Navy */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-14 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0a1628 0%, #173962 100%)" }}>
        <div className="absolute inset-0 pattern-dots" />
        <div className="absolute top-1/3 right-0 w-72 h-72 rounded-full blur-3xl opacity-10" style={{ background: "#c9a34b" }} />

        <div className="relative z-10">
          <Link href="/">
            <Image src="/cio-logo.png" alt="CIO/CxO Forum" width={150} height={44} className="h-10 w-auto object-contain brightness-0 invert" />
          </Link>
          <p className="text-xs font-heading font-bold tracking-widest uppercase mt-3" style={{ color: "#c9a34b" }}>Nexus Platform</p>
        </div>

        <div className="relative z-10">
          <div className="tag mb-6 inline-block">Welcome Back</div>
          <h1 className="font-heading text-4xl font-bold text-white leading-tight mb-4">
            Africa&apos;s Premier<br />
            <span className="text-gradient-gold">Leadership Community</span>
          </h1>
          <p className="text-lg mb-8" style={{ color: "rgba(255,255,255,0.6)" }}>
            Connect, mentor, and celebrate together with Africa&#39;s top CIO/CxO leaders.
          </p>

          {/* Demo accounts on left panel */}
          <div className="space-y-2">
            <p className="text-[10px] font-heading font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>
              Quick Demo Access
            </p>
            {DEMO_ACCOUNTS.map((a) => (
              <button key={a.label}
                onClick={() => loginAsDemo(a.email, a.password, a.label)}
                disabled={!!demoLoading}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ borderColor: "rgba(255,255,255,0.12)", backgroundColor: "rgba(255,255,255,0.06)" }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-heading font-black text-white shrink-0"
                  style={{ backgroundColor: a.color }}>
                  {a.label[0]}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-heading font-bold text-white leading-tight">{a.label}</p>
                  <p className="text-[11px] truncate" style={{ color: "rgba(255,255,255,0.45)" }}>{a.description}</p>
                </div>
                {demoLoading === a.label ? (
                  <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin shrink-0" style={{ borderColor: "#c9a34b", borderTopColor: "transparent" }} />
                ) : (
                  <Zap className="w-3.5 h-3.5 shrink-0" style={{ color: "#c9a34b" }} />
                )}
              </button>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
          © 2026 Nexus — CIO/CxO Africa
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-md py-4">
          <div className="mb-7">
            <h2 className="font-heading text-2xl font-bold mb-1" style={{ color: "#173962" }}>Sign In</h2>
            <p className="text-sm text-slate-500">Enter your credentials to access the platform</p>
          </div>

          {/* Mobile demo buttons (visible only on small screens) */}
          <div className="lg:hidden mb-6">
            <p className="text-[10px] font-heading font-bold uppercase tracking-widest text-slate-400 mb-3">Quick Demo Access</p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map((a) => (
                <button key={a.label}
                  onClick={() => loginAsDemo(a.email, a.password, a.label)}
                  disabled={!!demoLoading}
                  className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all hover:shadow-sm active:scale-95"
                  style={{ borderColor: a.color + "30", backgroundColor: a.color + "08" }}
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-heading font-black text-white"
                    style={{ backgroundColor: a.color }}>
                    {a.label[0]}
                  </div>
                  <p className="text-[10px] font-heading font-bold" style={{ color: a.color }}>{a.label}</p>
                  {demoLoading === a.label && (
                    <div className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: a.color, borderTopColor: "transparent" }} />
                  )}
                </button>
              ))}
            </div>
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
              <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-slate-400 font-heading font-semibold">or sign in manually</span></div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label className="font-heading font-semibold text-sm" style={{ color: "#173962" }}>Email Address</Label>
              <Input
                className="h-11 border-slate-200 rounded-xl"
                type="email"
                placeholder="you@nexus.africa"
                {...register("email")}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="font-heading font-semibold text-sm" style={{ color: "#173962" }}>Password</Label>
              <Input
                className="h-11 border-slate-200 rounded-xl"
                type="password"
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={loading || !!demoLoading} className="btn-cta w-full justify-center h-11 text-sm rounded-xl">
              {loading ? "Signing in..." : <><span>Sign In</span> <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          {/* Fill-in helpers below form */}
          <div className="mt-6 p-4 rounded-xl border border-slate-200 bg-slate-50">
            <p className="text-[10px] font-heading font-bold uppercase tracking-widest text-slate-400 mb-3">Tap to fill credentials</p>
            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((a) => (
                <button key={a.label}
                  onClick={() => fillDemo(a.email, a.password)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-heading font-black text-white shrink-0"
                      style={{ backgroundColor: a.color }}>
                      {a.label[0]}
                    </div>
                    <div>
                      <p className="text-xs font-heading font-semibold" style={{ color: "#173962" }}>{a.label}</p>
                      <p className="text-[10px] text-slate-400">{a.email}</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">{a.password}</p>
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-sm text-slate-500 mt-5">
            Don&#39;t have an account?{" "}
            <Link href="/register" className="font-heading font-bold hover:opacity-80 transition-opacity" style={{ color: "#c9a34b" }}>Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
