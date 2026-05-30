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
import { register as doRegister } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight } from "lucide-react";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["mentee", "mentor", "sponsor"]),
  title: z.string().optional(),
  company: z.string().optional(),
});
type Form = z.infer<typeof schema>;

const ROLES = [
  { value: "mentee",  label: "Mentee",  desc: "I'm seeking mentorship & guidance" },
  { value: "mentor",  label: "Mentor",  desc: "I want to guide and develop others" },
  { value: "sponsor", label: "Sponsor", desc: "I support the community & programmes" },
];

export default function RegisterPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("mentee");
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { role: "mentee" },
  });

  async function onSubmit(data: Form) {
    setLoading(true);
    try {
      const res = await doRegister(data);
      qc.setQueryData(["me"], res.user);
      router.push("/dashboard");
    } catch {
      toast.error("Registration failed. Email may already be in use.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex font-body">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-14 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0a1628 0%, #173962 100%)" }}>
        <div className="absolute inset-0 pattern-dots" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/cio-logo.png" alt="CIO/CxO Forum" width={150} height={44} className="h-10 w-auto object-contain brightness-0 invert" />
            <div className="w-px h-7 bg-white/20" />
            <Image src="/uds-logo.png" alt="Uganda Digital Society" width={110} height={44} className="h-9 w-auto object-contain brightness-0 invert" />
          </Link>
          <p className="text-xs font-heading font-bold tracking-widest uppercase mt-3" style={{ color: "#c9a34b" }}>Digital Leadership Platform</p>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="tag inline-block">Join 113+ Leaders</div>
          <h1 className="font-heading text-4xl font-bold text-white leading-tight">
            Africa&#39;s Premier<br />
            <span className="text-gradient-gold">CIO/CxO Community</span>
          </h1>
          <p className="text-lg" style={{ color: "rgba(255,255,255,0.6)" }}>
            Mentor others. Get mentored. Celebrate achievements together.
          </p>
          {/* Role cards */}
          <div className="space-y-2 pt-4">
            {ROLES.map(({ value, label, desc }) => (
              <div key={value} onClick={() => { setRole(value); setValue("role", value as Form["role"]); }}
                className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200"
                style={role === value
                  ? { backgroundColor: "rgba(201,163,75,0.15)", border: "1px solid rgba(201,163,75,0.4)" }
                  : { backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: role === value ? "#c9a34b" : "rgba(255,255,255,0.2)" }} />
                <div>
                  <p className="text-sm font-heading font-bold" style={{ color: role === value ? "#c9a34b" : "white" }}>{label}</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
          © 2026 CIO/CxO Africa &amp; Uganda Digital Society &amp; Uganda Digital Society
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="mb-8">
            <h2 className="font-heading text-2xl font-bold mb-1" style={{ color: "#173962" }}>Create Account</h2>
            <p className="text-sm text-slate-500">Join Africa&#39;s CIO/CxO leadership community</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="font-heading font-semibold text-sm" style={{ color: "#173962" }}>Full Name</Label>
              <Input className="h-11 border-slate-200 rounded-xl" placeholder="Dr. Jane Nakato" {...register("name")} />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="font-heading font-semibold text-sm" style={{ color: "#173962" }}>Email Address</Label>
              <Input className="h-11 border-slate-200 rounded-xl" type="email" placeholder="jane@company.com" {...register("email")} />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="font-heading font-semibold text-sm" style={{ color: "#173962" }}>Password</Label>
              <Input className="h-11 border-slate-200 rounded-xl" type="password" placeholder="Min. 6 characters" {...register("password")} />
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="font-heading font-semibold text-sm" style={{ color: "#173962" }}>I want to join as</Label>
              <Select value={role} onValueChange={(v) => { setRole(v ?? "mentee"); setValue("role", (v ?? "mentee") as Form["role"]); }}>
                <SelectTrigger className="h-11 border-slate-200 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mentee">Mentee — I&#39;m seeking guidance</SelectItem>
                  <SelectItem value="mentor">Mentor — I want to guide others</SelectItem>
                  <SelectItem value="sponsor">Sponsor — I support the community</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="font-heading font-semibold text-sm" style={{ color: "#173962" }}>Job Title</Label>
                <Input className="h-11 border-slate-200 rounded-xl" placeholder="CIO" {...register("title")} />
              </div>
              <div className="space-y-1.5">
                <Label className="font-heading font-semibold text-sm" style={{ color: "#173962" }}>Company</Label>
                <Input className="h-11 border-slate-200 rounded-xl" placeholder="Company Ltd" {...register("company")} />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-cta w-full justify-center h-11 text-sm rounded-xl mt-2">
              {loading ? "Creating account..." : <><span>Create Account</span> <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="font-heading font-bold hover:opacity-80 transition-opacity" style={{ color: "#c9a34b" }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
