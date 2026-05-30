"use client";
import { parseUTC } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { Board, Mentorship } from "@/types";
import Link from "next/link";
import Image from "next/image";
import {
  PartyPopper, Handshake, Plus, ArrowUpRight,
  Clock, CheckCircle, ChevronRight, Sparkles,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import DiceBearAvatar from "@/components/ui/DiceBearAvatar";

const BOARD_COLOR: Record<string, string> = {
  appreciation: "#173962", birthday: "#e91e8c", farewell: "#f97316",
  milestone: "#8b5cf6", graduation: "#0ea5e9",
};
const BOARD_EMOJI: Record<string, string> = {
  appreciation: "🙏", birthday: "🎂", farewell: "👋",
  milestone: "🏆", graduation: "🎓",
};

/* ── Shared page container — same padding on every section ────── */
const C = "px-6 py-7 max-w-screen-2xl"; // content sections
const H = "px-6 py-7"; // page header

export default function DashboardClient() {
  const { user } = useAuth();

  const { data: boards = [] } = useQuery<Board[]>({
    queryKey: ["boards"],
    queryFn: () => api.get("/boards").then(r => r.data),
  });
  const { data: mentorships = [] } = useQuery<Mentorship[]>({
    queryKey: ["mentorships"],
    queryFn: () => api.get("/mentorship").then(r => r.data),
  });

  const activeMentorship = mentorships.find(m => m.status === "active");
  const pendingCount     = mentorships.filter(m => m.status === "pending").length;
  const myBoards         = boards.filter(b => b.creator_id === user?.id);
  const receivedBoards   = boards.filter(b => b.recipient_id === user?.id);

  const stats = [
    { label: "Boards Created",   value: myBoards.length,        icon: PartyPopper, color: "#173962", bg: "rgba(23,57,98,0.07)",    href: "/boards" },
    { label: "Boards Received",  value: receivedBoards.length,  icon: Sparkles,    color: "#c9a34b", bg: "rgba(201,163,75,0.10)",  href: "/boards" },
    { label: "Mentorships",      value: mentorships.length,     icon: Handshake,   color: "#16a34a", bg: "rgba(22,163,74,0.08)",   href: "/mentorship" },
    { label: "Pending Requests", value: pendingCount,           icon: Clock,       color: "#de2729", bg: "rgba(222,39,41,0.07)",   href: "/mentorship" },
  ];

  return (
    <div className="min-h-full font-body">

      {/* ── Page header ── */}
      <div className={`${H} bg-white`} style={{ borderBottom: "1px solid #eef2f7" }}>
        <div className="flex items-center justify-between gap-6">
          <div>
            <p className="text-[11px] font-heading font-bold tracking-[0.18em] uppercase mb-2"
              style={{ color: "#c9a34b" }}>CIO/CxO Africa · Uganda Digital Society</p>
            <h1 className="font-heading text-[28px] font-black leading-tight" style={{ color: "#173962" }}>
              Good day, {user?.name?.split(" ")[0]} 👋
            </h1>
            <p className="text-[13px] text-slate-400 mt-1">
              Here&#39;s what&#39;s happening in your community today
            </p>
          </div>
          <Link href="/boards/new" className="btn-cta text-sm shrink-0 hidden md:flex">
            <Plus className="w-4 h-4" /> New Board
          </Link>
        </div>
      </div>

      {/* ── Body ── */}
      <div className={`${C} space-y-6`}>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, color, bg, href }) => (
            <Link key={label} href={href}
              className="group bg-white rounded-2xl p-5 border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: bg }}>
                  <Icon className="w-4.5 h-4.5" style={{ color }} />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-400 transition-colors" />
              </div>
              <div>
                <p className="font-heading text-[28px] font-black leading-none mb-1" style={{ color: "#173962" }}>{value}</p>
                <p className="text-[12px] text-slate-400 font-medium">{label}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Active mentorship hero */}
        {activeMentorship && (
          <div className="rounded-2xl overflow-hidden"
            style={{ background: "linear-gradient(120deg, #0f2443 0%, #173962 55%, #1e4a7c 100%)" }}>
            <div className="px-8 py-6 flex items-center justify-between gap-6 flex-wrap">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <DiceBearAvatar
                    name={user?.role === "mentee" ? activeMentorship.mentor.name : activeMentorship.mentee.name}
                    email={user?.role === "mentee" ? activeMentorship.mentor.email : activeMentorship.mentee.email}
                    size={52} rounded="full"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-400"
                    style={{ border: "2px solid #0f2443" }} />
                </div>
                <div>
                  <p className="text-[10px] font-heading font-bold uppercase tracking-widest mb-1"
                    style={{ color: "rgba(201,163,75,0.75)" }}>Active Mentorship</p>
                  <p className="font-heading font-bold text-white text-[17px] leading-tight">
                    {user?.role === "mentee" ? activeMentorship.mentor.name : activeMentorship.mentee.name}
                  </p>
                  <p className="text-[12px] mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                    {(user?.role === "mentee" ? activeMentorship.mentor.title : activeMentorship.mentee.title) || ""}
                  </p>
                </div>
              </div>
              <Link href="/mentorship" className="btn-primary text-sm shrink-0">
                View Journey <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* 5-col grid: boards (3) + sidebar cards (2) */}
        <div className="grid lg:grid-cols-5 gap-5">

          {/* Recent Boards — 3 cols */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #f1f5f9" }}>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "rgba(23,57,98,0.07)" }}>
                  <PartyPopper className="w-3.5 h-3.5" style={{ color: "#173962" }} />
                </div>
                <h2 className="font-heading font-bold text-[13px]" style={{ color: "#173962" }}>
                  Recent Boards
                </h2>
              </div>
              <Link href="/boards"
                className="flex items-center gap-1 text-[12px] font-heading font-semibold hover:opacity-70 transition-opacity"
                style={{ color: "#c9a34b" }}>
                All boards <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            {boards.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center gap-3">
                <span className="text-3xl">🎉</span>
                <p className="text-[13px] text-slate-400">No boards yet</p>
                <Link href="/boards/new" className="btn-cta text-xs">
                  <Plus className="w-3.5 h-3.5" /> Create a Board
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 divide-y divide-slate-50">
                  {boards.slice(0, 5).map(board => {
                    const color = BOARD_COLOR[board.board_type] || "#173962";
                    const emoji = BOARD_EMOJI[board.board_type] || "🎉";
                    return (
                      <Link key={board.id} href={`/boards/${board.id}`}
                        className="flex items-center gap-3.5 px-6 py-3.5 hover:bg-slate-50 transition-colors duration-100 group">
                        {board.cover_image_url ? (
                          <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 relative">
                            <Image src={board.cover_image_url} alt={board.title} fill className="object-cover" unoptimized />
                          </div>
                        ) : (
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
                            style={{ backgroundColor: color + "10" }}>
                            {emoji}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-heading font-semibold text-[13px] truncate" style={{ color: "#173962" }}>
                            {board.title}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {board.recipient?.name || board.recipient_name || "—"}
                            {" · "}{board.posts.length} msg
                          </p>
                        </div>
                        <span className="text-[10px] font-heading font-bold px-2 py-0.5 rounded-full shrink-0"
                          style={{ backgroundColor: color + "10", color }}>
                          {board.board_type}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    );
                  })}
                </div>
                <div className="px-6 py-3" style={{ borderTop: "1px solid #f1f5f9" }}>
                  <Link href="/boards/new"
                    className="flex items-center gap-1.5 text-[12px] font-heading font-semibold hover:opacity-70 transition-opacity"
                    style={{ color: "#173962" }}>
                    <Plus className="w-3.5 h-3.5" /> New Board
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Right column — 2 cols */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* Mentorships */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex-1">
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid #f1f5f9" }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: "rgba(22,163,74,0.08)" }}>
                    <Handshake className="w-3.5 h-3.5 text-green-600" />
                  </div>
                  <h2 className="font-heading font-bold text-[13px]" style={{ color: "#173962" }}>Mentorship</h2>
                </div>
                <Link href="/mentorship"
                  className="text-[12px] font-heading font-semibold hover:opacity-70 transition-opacity"
                  style={{ color: "#c9a34b" }}>View all</Link>
              </div>
              <div className="p-4 space-y-2">
                {mentorships.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-[13px] text-slate-400 mb-3">No mentorships yet</p>
                    <Link href="/mentors" className="btn-primary text-xs inline-flex">Find a Mentor</Link>
                  </div>
                ) : (
                  mentorships.slice(0, 3).map(m => {
                    const other = m.mentor_id === user?.id ? m.mentee : m.mentor;
                    const s = { pending: "#f59e0b", active: "#16a34a", completed: "#173962", declined: "#de2729" }[m.status];
                    return (
                      <Link key={m.id} href="/mentorship"
                        className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all duration-100">
                        <DiceBearAvatar name={other.name} email={other.email} size={34} rounded="full" />
                        <div className="flex-1 min-w-0">
                          <p className="font-heading font-semibold text-[12px] truncate" style={{ color: "#173962" }}>
                            {other.name}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">{other.title || other.role}</p>
                        </div>
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s }} />
                      </Link>
                    );
                  })
                )}
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4" style={{ borderBottom: "1px solid #f1f5f9" }}>
                <h2 className="font-heading font-bold text-[13px]" style={{ color: "#173962" }}>Quick Actions</h2>
              </div>
              <div className="p-2">
                {[
                  { label: "Create a Board", href: "/boards/new", emoji: "🎉", color: "#173962" },
                  { label: "Find a Mentor",  href: "/mentors",    emoji: "🤝", color: "#16a34a" },
                  { label: "Edit Profile",   href: "/profile",    emoji: "👤", color: "#c9a34b" },
                ].map(({ label, href, emoji, color }) => (
                  <Link key={href} href={href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0"
                      style={{ backgroundColor: color + "10" }}>{emoji}</div>
                    <span className="font-heading font-semibold text-[13px] flex-1" style={{ color: "#173962" }}>{label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-400 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Activity feed */}
        {boards.some(b => b.posts.length > 0) && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center gap-2.5 px-6 py-4" style={{ borderBottom: "1px solid #f1f5f9" }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "rgba(201,163,75,0.10)" }}>
                <CheckCircle className="w-3.5 h-3.5" style={{ color: "#c9a34b" }} />
              </div>
              <h2 className="font-heading font-bold text-[13px]" style={{ color: "#173962" }}>Recent Activity</h2>
            </div>
            <div className="divide-y divide-slate-50">
              {boards.flatMap(b => b.posts.slice(-2).map(p => ({ board: b, post: p })))
                .slice(0, 5)
                .map(({ board, post }, i) => (
                  <div key={i} className="flex items-start gap-4 px-6 py-3.5">
                    <DiceBearAvatar name={post.author_name} size={30} rounded="full" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-slate-600 leading-snug">
                        <span className="font-heading font-semibold" style={{ color: "#173962" }}>
                          {post.author_name}
                        </span>
                        {" left a message on "}
                        <Link href={`/boards/${board.id}`}
                          className="font-heading font-semibold hover:underline" style={{ color: "#c9a34b" }}>
                          {board.title}
                        </Link>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{post.message}</p>
                    </div>
                    <p className="text-[11px] text-slate-400 shrink-0">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
