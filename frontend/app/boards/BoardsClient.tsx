"use client";
import { parseUTC } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Board } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { Plus, MessageSquare, Share2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const BOARD_META: Record<string, { emoji: string; color: string; label: string }> = {
  appreciation: { emoji: "🙏", color: "#173962", label: "Appreciation" },
  birthday:     { emoji: "🎂", color: "#e91e8c", label: "Birthday" },
  farewell:     { emoji: "👋", color: "#f97316", label: "Farewell" },
  milestone:    { emoji: "🏆", color: "#8b5cf6", label: "Milestone" },
  graduation:   { emoji: "🎓", color: "#2563eb", label: "Graduation" },
  signoff:      { emoji: "✅", color: "#c9a34b", label: "Sign-off" },
};

export default function BoardsClient() {
  const { data: boards = [], isLoading } = useQuery<Board[]>({
    queryKey: ["boards"],
    queryFn: () => api.get("/boards").then((r) => r.data),
  });

  return (
    <div className="min-h-full font-body">
      {/* Page header */}
      <div className="px-6 py-7 bg-white" style={{ borderBottom: "1px solid #f1f5f9" }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-heading font-bold tracking-[0.16em] uppercase mb-2" style={{ color: "#c9a34b" }}>Community</p>
            <h1 className="font-heading text-3xl font-black" style={{ color: "#173962" }}>Appreciation Boards</h1>
            <p className="text-[14px] text-slate-500 mt-1.5">Create and manage celebration boards for your community</p>
          </div>
          <Link href="/boards/new" className="btn-cta text-sm shrink-0 hidden md:flex">
            <Plus className="w-4 h-4" /> New Board
          </Link>
        </div>
      </div>
      <div className="px-6 py-8 max-w-screen-2xl">

      {isLoading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map((i) => <div key={i} className="h-52 bg-slate-100 animate-pulse rounded-2xl" />)}
        </div>
      )}

      {!isLoading && boards.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-slate-200">
          <p className="text-5xl mb-4">🎉</p>
          <h2 className="font-heading text-xl font-bold mb-2" style={{ color: "#173962" }}>No boards yet</h2>
          <p className="text-sm text-slate-500 mb-6">Create your first appreciation board for someone special</p>
          <Link href="/boards/new" className="btn-cta text-sm inline-flex">
            <Plus className="w-4 h-4" /> Create Board
          </Link>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {boards.map((board) => {
          const meta = BOARD_META[board.board_type] || BOARD_META.appreciation;
          return (
            <div key={board.id} className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              {/* Cover image or color bar */}
              {board.cover_image_url ? (
                <div className="relative h-36 overflow-hidden">
                  <Image src={board.cover_image_url} alt={board.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.55))" }} />
                  <span className="absolute bottom-2.5 left-3 text-[10px] font-heading font-bold uppercase tracking-widest px-2.5 py-1 rounded-full backdrop-blur-sm"
                    style={{ backgroundColor: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.3)", color: "white" }}>
                    {meta.emoji} {meta.label}
                  </span>
                </div>
              ) : (
                <div className="h-2" style={{ background: `linear-gradient(90deg, ${board.cover_color}, ${board.cover_color}99)` }} />
              )}

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  {!board.cover_image_url && (
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
                        style={{ backgroundColor: board.cover_color + "12" }}>
                        {meta.emoji}
                      </div>
                      <div>
                        <span className="text-[10px] font-heading font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: board.cover_color + "12", color: board.cover_color }}>
                          {meta.label}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <h3 className="font-heading font-bold text-base mb-2 line-clamp-2" style={{ color: "#173962" }}>{board.title}</h3>
                <p className="text-xs text-slate-400 mb-4">
                  For: <span className="font-semibold text-slate-600">{board.recipient?.name || board.recipient_name || "—"}</span>
                  {" · "}
                  {formatDistanceToNow(new Date(board.created_at), { addSuffix: true })}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <MessageSquare className="w-3.5 h-3.5" />
                    {board.posts.length} message{board.posts.length !== 1 ? "s" : ""}
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/boards/${board.id}/contribute`}
                      className="flex items-center gap-1 text-xs font-heading font-bold px-3 py-1.5 rounded-full border-2 transition-all duration-200 hover:shadow-sm"
                      style={{ borderColor: "#173962", color: "#173962" }}>
                      <Share2 className="w-3 h-3" /> Share
                    </Link>
                    <Link href={`/boards/${board.id}`} className="btn-cta text-xs px-3 py-1.5 rounded-full">
                      View
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
}
