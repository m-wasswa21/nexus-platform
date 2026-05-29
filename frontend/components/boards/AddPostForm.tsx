"use client";
import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Smile, ImageIcon, Film, X, Upload } from "lucide-react";
import GifPicker from "./GifPicker";

const BG_COLORS = [
  "#ffffff", "#fef9c3", "#dcfce7", "#dbeafe",
  "#fce7f3", "#ede9fe", "#ffedd5", "#f0fdf4",
];

interface Props {
  boardId: number;
  boardQueryKey: string[];
  defaultName?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  showNameField?: boolean;
}

export default function AddPostForm({ boardId, boardQueryKey, defaultName = "", onSuccess, onCancel, showNameField = true }: Props) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [data, setData] = useState({
    author_name: defaultName || user?.name || "",
    author_email: user?.email || "",
    message: "",
    image_url: "" as string | null,
    gif_url: "" as string | null,
    bg_color: "#ffffff",
    is_anonymous: false,
  });
  const [showGif, setShowGif] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Sync author_name when the logged-in user loads after component mount
  useEffect(() => {
    if (defaultName && !data.author_name) {
      setData((d) => ({ ...d, author_name: defaultName }));
    }
  }, [defaultName]); // eslint-disable-line react-hooks/exhaustive-deps

  const addPost = useMutation({
    mutationFn: () => api.post(`/boards/${boardId}/posts`, {
      ...data,
      image_url: data.image_url || null,
      gif_url: data.gif_url || null,
    }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: boardQueryKey });
      qc.invalidateQueries({ queryKey: ["boards"] });
      toast.success("Message added! 🎉");
      setData((d) => ({ ...d, message: "", image_url: null, gif_url: null, bg_color: "#ffffff", is_anonymous: false }));
      onSuccess?.();
    },
    onError: () => toast.error("Failed to add message"),
  });

  async function handleImageUpload(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await api.post(`/boards/${boardId}/posts/upload-image`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setData((d) => ({ ...d, image_url: res.data.url, gif_url: null }));
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  const hasName    = data.is_anonymous || data.author_name.trim().length > 0;
  const hasMessage = data.message.trim().length > 0;
  const canSubmit  = hasName && hasMessage && !addPost.isPending;

  return (
    <div className="space-y-4">
      {/* Name row */}
      {showNameField && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="font-heading font-semibold text-xs" style={{ color: "#173962" }}>Your Name *</Label>
            <Input
              className={`h-10 rounded-xl text-sm ${
                !hasName && hasMessage && !data.is_anonymous
                  ? "border-red-300 focus:border-red-400"
                  : "border-slate-200"
              }`}
              placeholder="Dr. Jane Nakato"
              value={data.is_anonymous ? "" : data.author_name}
              disabled={data.is_anonymous}
              onChange={(e) => setData((d) => ({ ...d, author_name: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="font-heading font-semibold text-xs" style={{ color: "#173962" }}>
              Email <span className="text-slate-400 font-normal">(optional)</span>
            </Label>
            <Input
              className="h-10 border-slate-200 rounded-xl text-sm"
              type="email"
              placeholder="you@company.com"
              value={data.is_anonymous ? "" : data.author_email}
              disabled={data.is_anonymous}
              onChange={(e) => setData((d) => ({ ...d, author_email: e.target.value }))}
            />
          </div>
        </div>
      )}

      {/* Anonymous toggle */}
      <label className="flex items-center gap-2 cursor-pointer w-fit">
        <div
          onClick={() => setData((d) => ({ ...d, is_anonymous: !d.is_anonymous }))}
          className="w-9 h-5 rounded-full transition-colors duration-200 flex items-center px-0.5"
          style={{ backgroundColor: data.is_anonymous ? "#173962" : "#e2e8f0" }}
        >
          <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${data.is_anonymous ? "translate-x-4" : "translate-x-0"}`} />
        </div>
        <span className="text-xs font-heading font-semibold text-slate-500">Post anonymously</span>
      </label>

      {/* Message */}
      <div className="space-y-1.5">
        <Label className="font-heading font-semibold text-xs" style={{ color: "#173962" }}>Your Message *</Label>
        <Textarea
          className="border-slate-200 rounded-xl resize-none text-sm"
          rows={4}
          placeholder="Write a heartfelt message..."
          value={data.message}
          onChange={(e) => setData((d) => ({ ...d, message: e.target.value }))}
        />
      </div>

      {/* Media preview */}
      {(data.gif_url || data.image_url) && (
        <div className="relative rounded-xl overflow-hidden border border-slate-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={data.gif_url || data.image_url || ""} alt="preview" className="w-full max-h-40 object-cover" />
          <button
            onClick={() => setData((d) => ({ ...d, gif_url: null, image_url: null }))}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* GIF picker panel */}
      {showGif && (
        <GifPicker onSelect={(url) => { setData((d) => ({ ...d, gif_url: url, image_url: null })); setShowGif(false); }} onClose={() => setShowGif(false)} />
      )}

      {/* Card color */}
      <div className="space-y-2">
        <Label className="font-heading font-semibold text-xs" style={{ color: "#173962" }}>Card Color</Label>
        <div className="flex gap-2 flex-wrap">
          {BG_COLORS.map((c) => (
            <button key={c} type="button" onClick={() => setData((d) => ({ ...d, bg_color: c }))}
              className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
              style={{
                backgroundColor: c,
                borderColor: data.bg_color === c ? "#173962" : "#e2e8f0",
                boxShadow: data.bg_color === c ? "0 0 0 2px rgba(23,57,98,0.3)" : "none",
              }}
            />
          ))}
        </div>
      </div>

      {/* Toolbar + submit */}
      <div className="flex items-center justify-between pt-2">
        {/* Media buttons */}
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setShowGif((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-semibold transition-all hover:bg-slate-100"
            style={{ color: showGif ? "#c9a34b" : "#64748b" }}>
            <Smile className="w-4 h-4" /> GIF
          </button>
          <button type="button" onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-semibold transition-all hover:bg-slate-100 text-slate-500">
            {uploading ? <Upload className="w-4 h-4 animate-bounce" /> : <ImageIcon className="w-4 h-4" />}
            {uploading ? "Uploading..." : "Photo"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); e.target.value = ""; }} />
          {data.gif_url && (
            <span className="flex items-center gap-1 text-xs font-heading font-semibold px-2 py-1 rounded-lg" style={{ color: "#c9a34b", backgroundColor: "rgba(201,163,75,0.1)" }}>
              <Film className="w-3.5 h-3.5" /> GIF added
            </span>
          )}
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-2">
            {onCancel && (
              <button type="button" onClick={onCancel}
                className="px-4 py-2 rounded-xl border-2 border-slate-200 text-sm font-heading font-bold text-slate-500 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={() => addPost.mutate()}
              disabled={!canSubmit}
              className="btn-cta text-sm px-5 py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addPost.isPending ? "Sending..." : "Send 💌"}
            </button>
          </div>
          {/* Inline hint when button is disabled */}
          {!canSubmit && !addPost.isPending && (
            <p className="text-[10px] font-heading font-semibold text-slate-400">
              {!hasName && !hasMessage ? "Enter your name and message" :
               !hasName ? "Enter your name to continue" :
               "Write a message to continue"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
