"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Board } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, X, ImageIcon, Palette } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const THEMES = [
  { color: "#173962", label: "Navy",     emoji: "🎩" },
  { color: "#de2729", label: "Red",      emoji: "🔴" },
  { color: "#c9a34b", label: "Gold",     emoji: "✨" },
  { color: "#16a34a", label: "Green",    emoji: "🌿" },
  { color: "#8b5cf6", label: "Purple",   emoji: "💜" },
  { color: "#e91e8c", label: "Pink",     emoji: "🌸" },
  { color: "#f97316", label: "Orange",   emoji: "🔥" },
  { color: "#0ea5e9", label: "Sky",      emoji: "💙" },
  { color: "#0a1628", label: "Midnight", emoji: "🌙" },
  { color: "#064e3b", label: "Forest",   emoji: "🌲" },
  { color: "#7c2d12", label: "Rust",     emoji: "🍂" },
  { color: "#1e1b4b", label: "Indigo",   emoji: "🌌" },
];

const BOARD_EMOJIS: Record<string, string> = {
  appreciation: "🙏", birthday: "🎂", farewell: "👋",
  milestone: "🏆", graduation: "🎓", signoff: "🌟",
};

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  board_type: z.enum(["appreciation", "birthday", "farewell", "milestone", "graduation", "signoff"]),
  recipient_name: z.string().min(2, "Recipient name required"),
  recipient_email: z.string().email().optional().or(z.literal("")),
  is_public: z.boolean(),
});
type Form = z.infer<typeof schema>;

type CoverMode = "color" | "image";

export default function NewBoardClient() {
  const router = useRouter();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [coverMode, setCoverMode] = useState<CoverMode>("color");
  const [coverColor, setCoverColor] = useState(THEMES[0].color);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [boardType, setBoardType] = useState<Form["board_type"]>("appreciation");

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { board_type: "appreciation" as const, is_public: true },
  });

  const mutation = useMutation({
    mutationFn: (data: Form & { cover_color: string; cover_image_url: string | null }) =>
      api.post<Board>("/boards", data).then((r) => r.data),
    onSuccess: (board) => {
      qc.invalidateQueries({ queryKey: ["boards"] });
      toast.success("Board created!");
      router.push(`/boards/${board.id}`);
    },
    onError: () => toast.error("Failed to create board"),
  });

  async function handleCoverUpload(file: File) {
    if (!file.type.startsWith("image/")) { toast.error("Must be an image"); return; }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await api.post("/boards/upload-cover", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setCoverImageUrl(res.data.url);
      setCoverMode("image");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function removeCoverImage() {
    setCoverImageUrl(null);
    setCoverMode("color");
    if (fileRef.current) fileRef.current.value = "";
  }

  function onSubmit(data: Form) {
    mutation.mutate({
      ...data,
      cover_color: coverColor,
      cover_image_url: coverMode === "image" ? coverImageUrl : null,
    });
  }

  const previewEmoji = BOARD_EMOJIS[boardType] || "🎉";

  return (
    <div className="min-h-full font-body">
      {/* Page header */}
      <div className="px-6 py-7 bg-white" style={{ borderBottom: "1px solid #f1f5f9" }}>
        <Link href="/boards" className="flex items-center gap-2 text-sm font-heading font-semibold text-slate-400 hover:text-slate-700 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Boards
        </Link>
        <p className="text-[11px] font-heading font-bold tracking-[0.16em] uppercase mb-2" style={{ color: "#c9a34b" }}>Community</p>
        <h1 className="font-heading text-3xl font-black" style={{ color: "#173962" }}>Create a Board</h1>
        <p className="text-[14px] text-slate-500 mt-1.5">Start a group appreciation board for someone special</p>
      </div>

      <div className="px-6 py-8 max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">

          {/* ── Cover preview ── */}
          <div className="rounded-2xl overflow-hidden border-2 border-slate-200 relative" style={{ height: 200 }}>
            {coverMode === "image" && coverImageUrl ? (
              <>
                <Image src={coverImageUrl} alt="Cover" fill className="object-cover" unoptimized />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.45))" }} />
                <button type="button" onClick={removeCoverImage}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors z-10">
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-7xl"
                style={{ background: `linear-gradient(135deg, ${coverColor}22, ${coverColor}44)`, border: `3px solid ${coverColor}33` }}>
                {previewEmoji}
              </div>
            )}
            {/* Overlay label */}
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between z-10">
              <span className="text-xs font-heading font-bold text-white/80 drop-shadow-sm">Cover Preview</span>
              <div className="flex gap-2">
                <button type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-heading font-bold backdrop-blur-sm transition-all hover:scale-105"
                  style={{ backgroundColor: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.35)", color: "white" }}>
                  {uploading ? <Upload className="w-3.5 h-3.5 animate-bounce" /> : <ImageIcon className="w-3.5 h-3.5" />}
                  {uploading ? "Uploading…" : "Upload Photo"}
                </button>
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCoverUpload(f); e.target.value = ""; }} />
          </div>

          {/* ── Cover mode tabs ── */}
          <div className="flex gap-2">
            <button type="button" onClick={() => setCoverMode("color")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-heading font-bold transition-all"
              style={coverMode === "color"
                ? { backgroundColor: "#173962", color: "white" }
                : { backgroundColor: "#f1f5f9", color: "#64748b" }}>
              <Palette className="w-3.5 h-3.5" /> Colour
            </button>
            <button type="button" onClick={() => coverImageUrl ? setCoverMode("image") : fileRef.current?.click()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-heading font-bold transition-all"
              style={coverMode === "image"
                ? { backgroundColor: "#173962", color: "white" }
                : { backgroundColor: "#f1f5f9", color: "#64748b" }}>
              <ImageIcon className="w-3.5 h-3.5" /> Photo
            </button>
          </div>

          {/* ── Colour picker (only when color mode) ── */}
          {coverMode === "color" && (
            <div className="space-y-2">
              <Label className="font-heading font-semibold text-sm" style={{ color: "#173962" }}>Theme Colour</Label>
              <div className="grid grid-cols-6 gap-2">
                {THEMES.map((t) => (
                  <button key={t.color} type="button" onClick={() => setCoverColor(t.color)}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all hover:scale-105"
                    style={coverColor === t.color
                      ? { borderColor: t.color, backgroundColor: t.color + "15" }
                      : { borderColor: "#e2e8f0", backgroundColor: "white" }}
                    title={t.label}>
                    <span className="text-lg">{t.emoji}</span>
                    <span className="text-[9px] font-heading font-bold truncate w-full text-center"
                      style={{ color: coverColor === t.color ? t.color : "#94a3b8" }}>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Board Type ── */}
          <div className="space-y-1.5">
            <Label className="font-heading font-semibold text-sm" style={{ color: "#173962" }}>Board Type</Label>
            <Select defaultValue="appreciation" onValueChange={(v) => {
              const val = v as Form["board_type"];
              setValue("board_type", val);
              setBoardType(val);
            }}>
              <SelectTrigger className="h-11 border-slate-200 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[["appreciation","🙏 Appreciation"],["birthday","🎂 Birthday"],["farewell","👋 Farewell"],
                  ["milestone","🏆 Milestone"],["graduation","🎓 Graduation"],["signoff","✅ Mentorship Sign-off"]].map(([v,l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ── Title ── */}
          <div className="space-y-1.5">
            <Label className="font-heading font-semibold text-sm" style={{ color: "#173962" }}>Board Title</Label>
            <Input className="h-11 border-slate-200 rounded-xl" placeholder="Happy Birthday, Dr. Sarah!" {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          {/* ── Description ── */}
          <div className="space-y-1.5">
            <Label className="font-heading font-semibold text-sm" style={{ color: "#173962" }}>
              Description <span className="text-slate-400 font-normal">(optional)</span>
            </Label>
            <Textarea className="border-slate-200 rounded-xl resize-none" placeholder="Add a note about this board…" rows={3} {...register("description")} />
          </div>

          {/* ── Recipient ── */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="font-heading font-semibold text-sm" style={{ color: "#173962" }}>Recipient Name</Label>
              <Input className="h-11 border-slate-200 rounded-xl" placeholder="Dr. Sarah Nabuuma" {...register("recipient_name")} />
              {errors.recipient_name && <p className="text-xs text-destructive">{errors.recipient_name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="font-heading font-semibold text-sm" style={{ color: "#173962" }}>
                Recipient Email <span className="text-slate-400 font-normal">(optional)</span>
              </Label>
              <Input className="h-11 border-slate-200 rounded-xl" type="email" placeholder="sarah@company.com" {...register("recipient_email")} />
            </div>
          </div>

          {/* ── Submit ── */}
          <button type="submit" disabled={mutation.isPending || uploading}
            className="btn-cta w-full justify-center h-12 text-sm rounded-xl font-heading font-bold disabled:opacity-60">
            {mutation.isPending ? "Creating…" : "Create Board ✨"}
          </button>
        </form>
      </div>
    </div>
  );
}
