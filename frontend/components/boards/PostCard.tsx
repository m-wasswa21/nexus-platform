import { parseUTC } from "@/lib/utils";
"use client";
import { BoardPost, PostReaction } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Trash2, Smile } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import DiceBearAvatar from "@/components/ui/DiceBearAvatar";
import dynamic from "next/dynamic";
import { useState, useRef, useEffect } from "react";

/* emoji-picker-react — MIT license, no API key, fully client-side */
const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

interface Props {
  post: BoardPost;
  boardId: number;
  creatorId: number;
  viewerName?: string;
  allowDelete?: boolean;
}

function groupReactions(reactions: PostReaction[]): { emoji: string; count: number }[] {
  const map: Record<string, number> = {};
  for (const r of reactions) map[r.emoji] = (map[r.emoji] || 0) + 1;
  return Object.entries(map).map(([emoji, count]) => ({ emoji, count }));
}

export default function PostCard({ post, boardId, creatorId, viewerName = "", allowDelete = true }: Props) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const boardKey = ["board", String(boardId)];
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close picker on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setShowPicker(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const addReaction = useMutation({
    mutationFn: ({ emoji }: { emoji: string }) =>
      api.post(`/boards/${boardId}/posts/${post.id}/reactions`, {
        emoji,
        author_name: viewerName || user?.name || "Guest",
      }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: boardKey }),
    onError: () => toast.error("Already reacted with this emoji"),
  });

  const removeReaction = useMutation({
    mutationFn: ({ emoji }: { emoji: string }) =>
      api.delete(`/boards/${boardId}/posts/${post.id}/reactions/${encodeURIComponent(emoji)}`, {
        params: { author_name: viewerName || user?.name || "Guest" },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: boardKey }),
  });

  const deletePost = useMutation({
    mutationFn: () => api.delete(`/boards/${boardId}/posts/${post.id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: boardKey });
      qc.invalidateQueries({ queryKey: ["boards"] });
      toast.success("Post removed");
    },
  });

  const grouped = groupReactions(post.reactions || []);
  const myName = viewerName || user?.name || "";

  function handleReaction(emoji: string) {
    const alreadyMine = post.reactions?.some(
      (r) => r.emoji === emoji && r.author_name === myName
    );
    setShowPicker(false);
    if (alreadyMine) removeReaction.mutate({ emoji });
    else addReaction.mutate({ emoji });
  }

  const canDelete = allowDelete && user && (post.author_id === user.id || creatorId === user.id);

  return (
    <div
      className="break-inside-avoid rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group"
      style={{ backgroundColor: post.bg_color || "#ffffff" }}
    >
      {/* GIF */}
      {post.gif_url && (
        <div className="relative w-full aspect-video">
          <Image src={post.gif_url} alt="GIF" fill className="object-cover" unoptimized />
        </div>
      )}

      {/* Image */}
      {post.image_url && !post.gif_url && (
        <div className="relative w-full aspect-video">
          <Image src={post.image_url} alt="Post image" fill className="object-cover" unoptimized />
        </div>
      )}

      {/* Body */}
      <div className="p-4">
        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed mb-4">{post.message}</p>

        {/* Reaction summary */}
        {grouped.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {grouped.map(({ emoji, count }) => {
              const mine = post.reactions?.some(
                (r) => r.emoji === emoji && r.author_name === myName
              );
              return (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold font-heading transition-all hover:scale-105"
                  style={mine
                    ? { backgroundColor: "rgba(201,163,75,0.2)", border: "1.5px solid rgba(201,163,75,0.6)", color: "#a1823c" }
                    : { backgroundColor: "rgba(0,0,0,0.05)", border: "1.5px solid rgba(0,0,0,0.08)", color: "#64748b" }
                  }
                >
                  {emoji} <span>{count}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Footer: avatar + name + react button + delete */}
        <div className="flex items-center justify-between pt-3 border-t border-black/5">
          <div className="flex items-center gap-2">
            <DiceBearAvatar name={post.author_name} email={post.author?.email} size={24} rounded="full" />
            <div>
              <p className="text-xs font-heading font-bold" style={{ color: "#173962" }}>
                {post.author_name}
                {post.is_anonymous && <span className="ml-1 text-[10px] text-slate-400 font-normal">(anon)</span>}
              </p>
              <p className="text-[10px] text-slate-400">{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Emoji picker trigger */}
            <div className="relative" ref={pickerRef}>
              <button
                onClick={() => setShowPicker((v) => !v)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
                title="React"
              >
                <Smile className="w-4 h-4" />
              </button>
              {showPicker && (
                <div className="absolute bottom-8 right-0 z-30 shadow-2xl rounded-2xl overflow-hidden">
                  <EmojiPicker
                    onEmojiClick={(emojiData) => handleReaction(emojiData.emoji)}
                    width={280}
                    height={350}
                    searchDisabled={false}
                    skinTonesDisabled
                    previewConfig={{ showPreview: false }}
                  />
                </div>
              )}
            </div>

            {canDelete && (
              <button
                onClick={() => deletePost.mutate()}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all text-slate-300 hover:text-red-400 hover:bg-red-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
