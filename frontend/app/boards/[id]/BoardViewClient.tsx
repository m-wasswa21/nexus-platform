"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Board } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Share2, Plus, ArrowLeft, Play, Pause, ChevronLeft, ChevronRight, X, Maximize2, Eye, Users2 } from "lucide-react";
import DiceBearAvatar from "@/components/ui/DiceBearAvatar";
import Link from "next/link";
import Image from "next/image";
import PostCard from "@/components/boards/PostCard";
import AddPostForm from "@/components/boards/AddPostForm";
import { Badge } from "@/components/ui/badge";
import dynamic from "next/dynamic";
import { useWindowSize } from "react-use";

/* react-confetti — MIT license, open source, no API key */
const Confetti = dynamic(() => import("react-confetti"), { ssr: false });

const BOARD_EMOJIS: Record<string, string> = {
  appreciation: "🙏", birthday: "🎂", farewell: "👋",
  milestone: "🏆", graduation: "🎓",
};

export default function BoardViewClient() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const boardKey = ["board", id];

  const [showForm, setShowForm] = useState(false);
  const [slideshowActive, setSlideshowActive] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiSize, setConfettiSize] = useState({ w: 0, h: 0 });
  const touchStartX = useRef<number>(0);
  const shownForBoard = useRef<string | null>(null);
  const { width: winW, height: winH } = useWindowSize();

  function fireConfetti() {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    setConfettiSize({ w: window.innerWidth, h: window.innerHeight });
    setShowConfetti(true);
  }

  const sessionKey = `board_viewed_${id}`;

  const { data: board, isLoading } = useQuery<Board>({
    queryKey: boardKey,
    // Pass count_view=true only on the very first fetch this session
    queryFn: () => {
      const isFirstView = !sessionStorage.getItem(sessionKey);
      if (isFirstView) sessionStorage.setItem(sessionKey, "1");
      return api.get(`/boards/${id}`, { params: { count_view: isFirstView } }).then((r) => r.data);
    },
  });

  const posts = board?.posts || [];

  const nextSlide = useCallback(() => setSlideIndex((i) => (i + 1) % Math.max(posts.length, 1)), [posts.length]);
  const prevSlide = useCallback(() => setSlideIndex((i) => (i - 1 + posts.length) % Math.max(posts.length, 1)), [posts.length]);

  // Confetti burst — fires once on load per board per session
  useEffect(() => {
    if (!board || board.posts.length === 0) return;
    if (shownForBoard.current === String(board.id)) return;
    shownForBoard.current = String(board.id);
    fireConfetti();
  }, [board?.id, board?.posts.length]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!playing || posts.length === 0) return;
    const t = setInterval(nextSlide, 4000);
    return () => clearInterval(t);
  }, [playing, posts.length, nextSlide]);

  useEffect(() => {
    if (!slideshowActive) { setPlaying(false); return; }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "Escape") setSlideshowActive(false);
      if (e.key === " ") setPlaying((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slideshowActive, nextSlide, prevSlide]);

  function copyShareLink() {
    navigator.clipboard.writeText(`${window.location.origin}/boards/${id}/contribute`);
    toast.success("Share link copied!");
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#173962", borderTopColor: "transparent" }} />
    </div>
  );
  if (!board) return <div className="p-8 text-center text-slate-400">Board not found</div>;

  /* ── SLIDESHOW OVERLAY ───────────────────────────────────── */
  if (slideshowActive && posts.length > 0) {
    const post = posts[slideIndex];
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center" style={{ background: "linear-gradient(135deg, #0a1628, #173962)" }}
        onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          const diff = touchStartX.current - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 50) diff > 0 ? nextSlide() : prevSlide();
        }}
      >
        {/* Controls bar */}
        <div className="absolute top-4 left-0 right-0 flex items-center justify-between px-6">
          <p className="font-heading font-bold text-white text-sm">{board.title}</p>
          <div className="flex items-center gap-3">
            <span className="text-white/50 text-xs font-heading">{slideIndex + 1} / {posts.length}</span>
            <button onClick={() => setPlaying((v) => !v)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors">
              {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button onClick={() => setSlideshowActive(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Post card */}
        <div className="w-full max-w-lg mx-auto px-6">
          <div className="rounded-3xl p-8 shadow-2xl border" style={{ backgroundColor: post.bg_color || "#fff", borderColor: "rgba(201,163,75,0.3)" }}>
            {post.gif_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.gif_url} alt="gif" className="w-full rounded-2xl mb-4 max-h-48 object-cover" />
            )}
            {post.image_url && !post.gif_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.image_url} alt="img" className="w-full rounded-2xl mb-4 max-h-48 object-cover" />
            )}
            <p className="text-lg text-slate-700 leading-relaxed mb-6 text-center">&ldquo;{post.message}&rdquo;</p>
            <div className="flex items-center justify-center gap-2">
              <DiceBearAvatar name={post.author_name} size={32} rounded="full" />
              <p className="font-heading font-bold text-sm" style={{ color: "#173962" }}>— {post.author_name}</p>
            </div>
          </div>
        </div>

        {/* Nav arrows */}
        <button onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors">
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Dot indicators */}
        <div className="absolute bottom-6 flex gap-1.5">
          {posts.map((_, i) => (
            <button key={i} onClick={() => setSlideIndex(i)}
              className="rounded-full transition-all duration-300"
              style={{ width: i === slideIndex ? 20 : 6, height: 6, backgroundColor: i === slideIndex ? "#c9a34b" : "rgba(255,255,255,0.3)" }}
            />
          ))}
        </div>
      </div>
    );
  }

  /* ── NORMAL VIEW ─────────────────────────────────────────── */
  return (
    <div className="min-h-full font-body px-6 py-8 max-w-screen-2xl">
      {/* react-confetti — MIT license, no API key */}
      {showConfetti && (
        <Confetti
          width={confettiSize.w || winW}
          height={confettiSize.h || winH}
          numberOfPieces={350}
          recycle={false}
          gravity={0.18}
          colors={["#173962","#c9a34b","#de2729","#ffffff","#16a34a","#8b5cf6","#e91e8c"]}
          onConfettiComplete={() => setShowConfetti(false)}
          style={{ position: "fixed", top: 0, left: 0, zIndex: 100, pointerEvents: "none" }}
        />
      )}
      <Link href="/boards" className="flex items-center gap-2 text-sm font-heading font-semibold text-slate-400 hover:text-slate-700 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Boards
      </Link>

      {/* Board header card */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden mb-8">
        {board.cover_image_url ? (
          <div className="relative h-48 overflow-hidden">
            <Image src={board.cover_image_url} alt={board.title} fill className="object-cover" unoptimized />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%)" }} />
            <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between gap-4 flex-wrap">
              <div>
                <h1 className="font-heading text-2xl font-black text-white drop-shadow">{board.title}</h1>
                {board.description && <p className="text-sm mt-0.5 text-white/75">{board.description}</p>}
              </div>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                style={{ backgroundColor: "rgba(255,255,255,0.2)", border: "1.5px solid rgba(255,255,255,0.35)", backdropFilter: "blur(8px)" }}>
                {BOARD_EMOJIS[board.board_type] || "🎉"}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-3" style={{ background: `linear-gradient(90deg, ${board.cover_color}, ${board.cover_color}88)` }} />
        )}

        <div className="px-6 py-5 flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            {!board.cover_image_url && (
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm shrink-0"
                style={{ backgroundColor: board.cover_color + "15" }}>
                {BOARD_EMOJIS[board.board_type] || "🎉"}
              </div>
            )}
            <div>
              {!board.cover_image_url && (
                <h1 className="font-heading text-xl font-bold" style={{ color: "#173962" }}>{board.title}</h1>
              )}
              {!board.cover_image_url && board.description && (
                <p className="text-sm text-slate-400 mt-0.5">{board.description}</p>
              )}
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <Badge className="text-[10px] capitalize" variant="secondary">{board.board_type}</Badge>
                <span className="text-xs text-slate-400">
                  For <span className="font-semibold text-slate-600">{board.recipient?.name || board.recipient_name}</span>
                </span>
                <span className="text-xs text-slate-400">{posts.length} message{posts.length !== 1 ? "s" : ""}</span>
                <span className="text-xs text-slate-300">·</span>
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Eye className="w-3 h-3" /> {board.view_count} view{board.view_count !== 1 ? "s" : ""}
                </span>
                <span className="text-xs text-slate-300">·</span>
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Users2 className="w-3 h-3" />
                  {new Set(posts.map((p) => p.author_name)).size} contributor{new Set(posts.map((p) => p.author_name)).size !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {posts.length > 0 && (
              <button onClick={() => { setSlideshowActive(true); setSlideIndex(0); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full border-2 font-heading font-bold text-xs transition-all hover:shadow-sm"
                style={{ borderColor: "#173962", color: "#173962" }}>
                <Maximize2 className="w-3.5 h-3.5" /> Slideshow
              </button>
            )}
            <button onClick={copyShareLink}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border-2 font-heading font-bold text-xs transition-all hover:shadow-sm"
              style={{ borderColor: "#c9a34b", color: "#c9a34b" }}>
              <Share2 className="w-3.5 h-3.5" /> Share Link
            </button>
            <button onClick={() => setShowForm((v) => !v)} className="btn-cta text-xs px-4 py-2 rounded-full flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Add Message
            </button>
          </div>
        </div>
      </div>

      {/* Add message form */}
      {showForm && (
        <div className="bg-white rounded-2xl border-2 mb-8 p-6" style={{ borderColor: "rgba(201,163,75,0.4)" }}>
          <h3 className="font-heading font-bold text-sm mb-4" style={{ color: "#173962" }}>Add Your Message</h3>
          <AddPostForm
            boardId={Number(id)}
            boardQueryKey={boardKey}
            defaultName={user?.name}
            showNameField={true}
            onSuccess={() => { setShowForm(false); fireConfetti(); }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Posts grid */}
      {posts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-slate-200">
          <p className="text-5xl mb-3">💌</p>
          <p className="font-heading font-bold text-lg mb-1" style={{ color: "#173962" }}>No messages yet</p>
          <p className="text-sm text-slate-400">Be the first to add a message!</p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              boardId={Number(id)}
              creatorId={board.creator_id}
              viewerName={user?.name}
            />
          ))}
        </div>
      )}
    </div>
  );
}
