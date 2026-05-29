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
import { ArrowRight } from "lucide-react";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
type Form = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
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

  return (
    <div className="min-h-screen flex font-body">
      {/* Left panel — Navy */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-14 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0a1628 0%, #173962 100%)" }}>
        <div className="absolute inset-0 pattern-dots" />
        <div className="absolute top-1/3 right-0 w-72 h-72 rounded-full blur-3xl opacity-10" style={{ background: "#c9a34b" }} />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/cio-logo.png" alt="CIO/CxO Forum" width={150} height={44} className="h-10 w-auto object-contain brightness-0 invert" />
            <div className="w-px h-7 bg-white/20" />
            <Image src="/uds-logo.png" alt="Uganda Digital Society" width={110} height={44} className="h-9 w-auto object-contain brightness-0 invert" />
          </Link>
          <p className="text-xs font-heading font-bold tracking-widest uppercase mt-3" style={{ color: "#c9a34b" }}>Nexus Platform</p>
        </div>

        <div className="relative z-10">
          <div className="tag mb-6 inline-block">Welcome Back</div>
          <h1 className="font-heading text-4xl font-bold text-white leading-tight mb-4">
            Africa&apos;s Premier<br />
            <span className="text-gradient-gold">Leadership Community</span>
          </h1>
          <p className="text-lg" style={{ color: "rgba(255,255,255,0.6)" }}>
            Connect, mentor, and celebrate together with Africa&#39;s top CIO/CxO leaders.
          </p>
        </div>

        <p className="relative z-10 text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
          © 2026 Nexus — CIO/CxO Africa &amp; Uganda Digital Society
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-md py-4">
          <div className="mb-7">
            <h2 className="font-heading text-2xl font-bold mb-1" style={{ color: "#173962" }}>Sign In</h2>
            <p className="text-sm text-slate-500">Enter your credentials to access the platform</p>
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
            <button type="submit" disabled={loading} className="btn-cta w-full justify-center h-11 text-sm rounded-xl">
              {loading ? "Signing in..." : <><span>Sign In</span> <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Don&#39;t have an account?{" "}
            <Link href="/register" className="font-heading font-bold hover:opacity-80 transition-opacity" style={{ color: "#c9a34b" }}>Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
