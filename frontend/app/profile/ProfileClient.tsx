"use client";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DiceBearAvatar from "@/components/ui/DiceBearAvatar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

const schema = z.object({
  name: z.string().min(2),
  title: z.string().optional(),
  company: z.string().optional(),
  bio: z.string().optional(),
  skills: z.string().optional(),
  linkedin_url: z.string().url().optional().or(z.literal("")),
  is_available: z.boolean(),
});
type Form = z.infer<typeof schema>;

export default function ProfileClient() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [isAvailable, setIsAvailable] = useState(user?.is_available ?? true);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name || "",
      title: user?.title || "",
      company: user?.company || "",
      bio: user?.bio || "",
      skills: user?.skills || "",
      linkedin_url: user?.linkedin_url || "",
      is_available: user?.is_available ?? true,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: Form) => api.patch("/auth/me", data).then((r) => r.data),
    onSuccess: (updated) => {
      qc.setQueryData(["me"], updated);
      toast.success("Profile updated!");
    },
    onError: () => toast.error("Failed to update profile"),
  });

  if (!user) return null;

  return (
    <div className="min-h-full font-body">
      <div className="px-6 py-7 bg-white" style={{ borderBottom: "1px solid #f1f5f9" }}>
        <div>
          <p className="text-[11px] font-heading font-bold tracking-[0.16em] uppercase mb-2" style={{ color: "#c9a34b" }}>Account</p>
          <h1 className="font-heading text-3xl font-black" style={{ color: "#173962" }}>My Profile</h1>
          <p className="text-[14px] text-slate-500 mt-1.5">Update your personal and professional details</p>
        </div>
      </div>
      <div className="px-6 py-8 max-w-2xl">

      {/* Avatar section */}
      <div className="flex items-center gap-4 mb-8 p-5 bg-card border border-border rounded-2xl">
        <DiceBearAvatar name={user.name} email={user.email} size={64} rounded="full" />
        <div>
          <p className="font-semibold text-foreground">{user.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="capitalize">{user.role}</Badge>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
        <div className="space-y-1.5">
          <Label>Full Name</Label>
          <Input {...register("name")} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Job Title</Label>
            <Input placeholder="CIO" {...register("title")} />
          </div>
          <div className="space-y-1.5">
            <Label>Company</Label>
            <Input placeholder="Company Ltd" {...register("company")} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Bio</Label>
          <Textarea placeholder="Tell the community about yourself..." rows={4} {...register("bio")} />
        </div>

        <div className="space-y-1.5">
          <Label>Skills <span className="text-muted-foreground font-normal">(comma-separated)</span></Label>
          <Input placeholder="Digital Transformation, IT Strategy, Cloud, Leadership" {...register("skills")} />
        </div>

        <div className="space-y-1.5">
          <Label>LinkedIn URL</Label>
          <Input placeholder="https://linkedin.com/in/yourprofile" {...register("linkedin_url")} />
        </div>

        {user.role === "mentor" && (
          <div className="flex items-center justify-between p-4 bg-muted/40 rounded-xl">
            <div>
              <p className="font-medium text-foreground text-sm">Available for mentees</p>
              <p className="text-xs text-muted-foreground">Turn off to pause new mentorship requests</p>
            </div>
            <Switch
              checked={isAvailable}
              onCheckedChange={(v) => { setIsAvailable(v); setValue("is_available", v); }}
            />
          </div>
        )}

        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </form>
      </div>
    </div>
  );
}
