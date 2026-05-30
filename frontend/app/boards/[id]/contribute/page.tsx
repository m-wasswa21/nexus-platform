"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Board } from "@/types";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import PostCard from "@/components/boards/PostCard";
import AddPostForm from "@/components/boards/AddPostForm";
import DiceBearAvatar from "@/components/ui/DiceBearAvatar";
import { Users2, MessageSquare, Eye, ArrowRight, CalendarDays, BookOpen, X, ExternalLink, Newspaper } from "lucide-react";

const Confetti = dynamic(() => import("react-confetti"), { ssr: false });

const BOARD_META: Record<string, { emoji: string; label: string; accent: string }> = {
  appreciation: { emoji: "🙏", label: "Appreciation",  accent: "#173962" },
  birthday:     { emoji: "🎂", label: "Birthday",      accent: "#e91e8c" },
  farewell:     { emoji: "👋", label: "Farewell",      accent: "#f97316" },
  milestone:    { emoji: "🏆", label: "Milestone",     accent: "#8b5cf6" },
  graduation:   { emoji: "🎓", label: "Graduation",    accent: "#0ea5e9" },
};

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.48, ease: "easeOut" as const } },
};
const stagger = { show: { transition: { staggerChildren: 0.09 } } };

export default function ContributePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const boardKey = ["board-public", id];
  const [submitted, setSubmitted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiSize, setConfettiSize] = useState({ w: 0, h: 0 });
  const [showProgramme, setShowProgramme] = useState(false);
  const [showTribute, setShowTribute] = useState(false);
  const [pressModal, setPressModal] = useState<{ outlet: string; headline: string; url: string } | null>(null);

  const PRESS = [
    { outlet: "CEO.co.ug",           headline: "Uganda Digital Society launches inaugural John Babirukamu Annual Memorial Lecture",  url: "https://www.ceo.co.ug/uganda-digital-society-launches-inaugural-john-babirukamu-annual-memorial-lecture/" },
    { outlet: "BusinessFocus.co.ug", headline: "Uganda Digital Society announces inaugural John Babirukamu Annual Memorial Lecture", url: "https://businessfocus.co.ug/uganda-digital-society-announces-inaugural-john-babirukamu-annual-memorial-lecture/" },
    { outlet: "SoftPower.ug",        headline: "Uganda Digital Society announces first John Babirukamu Annual Memorial Lecture",     url: "https://softpower.ug/uganda-digital-society-announces-first-john-babirukamu-annual-memorial-lecture/" },
    { outlet: "TowerPost.com",       headline: "First John Babirukamu Annual Memorial Lecture to take place tomorrow",              url: "https://thetowerpost.com/2026/05/29/first-john-babirukamu-annual-memorial-lecture-to-take-place-tomorrow/" },
    { outlet: "LinkedIn",            headline: "John Ssenkeezi — 'John Birungi Babirukamu MCIM was the kind…'",                    url: "https://www.linkedin.com/posts/johnssenkeezi_john-birungi-babirukamu-mcim-was-the-kind-share-7463597742196457472-NdHB" },
  ];

  const sessionKey = `board_viewed_${id}`;

  const { data: board, isLoading } = useQuery<Board>({
    queryKey: boardKey,
    // count_view=true only on the first fetch this session — subsequent polls don't count
    queryFn: () => {
      const isFirstView = !sessionStorage.getItem(sessionKey);
      if (isFirstView) sessionStorage.setItem(sessionKey, "1");
      return api.get(`/boards/${id}`, { params: { count_view: isFirstView } }).then((r) => r.data);
    },
    refetchInterval: 8000,
    refetchIntervalInBackground: false,
  });

  function handleSuccess() {
    setSubmitted(true);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced) {
      // Capture real dimensions at trigger time — avoids the 0×0 SSR default
      setConfettiSize({ w: window.innerWidth, h: window.innerHeight });
      setShowConfetti(true);
    }
  }

  /* ── Loading ── */
  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
      <div className="w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: "#173962", borderTopColor: "transparent" }} />
      <p className="text-sm font-heading font-semibold" style={{ color: "#173962" }}>Loading board…</p>
    </div>
  );

  if (!board) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-slate-50">
      <p className="text-4xl">😕</p>
      <p className="font-heading font-bold text-lg" style={{ color: "#173962" }}>Board not found</p>
      <Link href="/" className="text-sm font-heading font-semibold hover:underline" style={{ color: "#c9a34b" }}>Go home</Link>
    </div>
  );

  const meta        = BOARD_META[board.board_type] || BOARD_META.appreciation;
  const recipient   = board.recipient?.name || board.recipient_name || "—";
  const postCount   = board.posts.length;
  const contribs    = [...new Map(board.posts.map(p => [p.author_name, p])).values()].slice(0, 5);
  const contribCount = new Set(board.posts.map(p => p.author_name)).size;
  const coverColor  = board.cover_color || meta.accent;
  const hasCoverImg = !!board.cover_image_url;

  return (
    <div className="min-h-screen font-body pattern-dots-light" style={{ backgroundColor: "#f7f9fc" }}>

      {/* ── Confetti ── */}
      {showConfetti && (
        <Confetti
          width={confettiSize.w} height={confettiSize.h}
          numberOfPieces={350} recycle={false}
          gravity={0.18}
          colors={["#173962","#c9a34b","#de2729","#ffffff","#16a34a","#8b5cf6","#e91e8c"]}
          onConfettiComplete={() => setShowConfetti(false)}
          style={{ position: "fixed", top: 0, left: 0, zIndex: 200, pointerEvents: "none" }}
        />
      )}

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg shadow-sm" style={{ borderBottom: "1px solid rgba(23,57,98,0.09)" }}>
        <div className="max-w-6xl mx-auto px-5 h-[60px] flex items-center justify-between">
          <Link href="/" className="flex-shrink-0 flex items-center gap-2.5">
            <Image src="/cio-logo.png" alt="CIO/CxO Forum" width={130} height={38} className="h-9 w-auto object-contain" priority />
            <div className="w-px h-6 bg-slate-300" />
            <Image src="/uds-logo.png" alt="Uganda Digital Society" width={100} height={38} className="h-8 w-auto object-contain" />
          </Link>
          <Link href="/login"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full font-heading font-bold text-xs transition-all hover:scale-105"
            style={{ backgroundColor: "rgba(23,57,98,0.07)", color: "#173962" }}>
            Sign in <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </nav>

      {/* ── Hero banner ── */}
      <div className="relative overflow-hidden" style={hasCoverImg ? {} : { background: `linear-gradient(135deg, ${coverColor}ee 0%, ${coverColor}99 60%, ${coverColor}55 100%)` }}>
        {/* Cover photo background */}
        {hasCoverImg && (
          <>
            <Image src={board.cover_image_url!} alt={board.title} fill className="object-cover" unoptimized priority />
            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(10,22,40,0.75) 0%, rgba(23,57,98,0.65) 60%, rgba(30,74,124,0.5) 100%)" }} />
          </>
        )}
        {/* Decorative blobs (color mode only) */}
        {!hasCoverImg && (
          <>
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-30" style={{ backgroundColor: coverColor }} />
            <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full blur-3xl opacity-20" style={{ backgroundColor: "#173962" }} />
          </>
        )}

        <div className="relative z-10 max-w-6xl mx-auto px-5 py-14 md:py-20">
          <motion.div variants={stagger} initial="hidden" animate="show" className="text-center">

            {/* Title */}
            <motion.h1 variants={fadeUp}
              className="font-heading text-3xl md:text-5xl font-black leading-tight text-white mb-3"
              style={{ textShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
              {board.title}
            </motion.h1>

            {/* For label */}
            <motion.p variants={fadeUp} className="text-base md:text-lg mb-2" style={{ color: "rgba(255,255,255,0.8)" }}>
              For{" "}
              <span className="font-heading font-black text-white">{recipient}</span>
            </motion.p>

            {/* Description */}
            {board.description && (
              <motion.p variants={fadeUp} className="text-sm max-w-xl mx-auto mb-6" style={{ color: "rgba(255,255,255,0.7)" }}>
                {board.description}
              </motion.p>
            )}

            {/* Stats row */}
            <motion.div variants={fadeUp} className="flex items-center justify-center gap-5 flex-wrap">
              <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-full"
                style={{ backgroundColor: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}>
                <MessageSquare className="w-3.5 h-3.5 text-white" />
                <span className="text-xs font-heading font-bold text-white">{postCount} message{postCount !== 1 ? "s" : ""}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-full"
                style={{ backgroundColor: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}>
                <Users2 className="w-3.5 h-3.5 text-white" />
                <span className="text-xs font-heading font-bold text-white">{contribCount} contributor{contribCount !== 1 ? "s" : ""}</span>
              </div>
              {board.view_count > 0 && (
                <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-full"
                  style={{ backgroundColor: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}>
                  <Eye className="w-3.5 h-3.5 text-white" />
                  <span className="text-xs font-heading font-bold text-white">{board.view_count} view{board.view_count !== 1 ? "s" : ""}</span>
                </div>
              )}
            </motion.div>

            {/* Contributor avatars */}
            {contribs.length > 0 && (
              <motion.div variants={fadeUp} className="flex items-center justify-center gap-1 mt-5">
                <div className="flex -space-x-2">
                  {contribs.map((p) => (
                    <div key={p.id} className="ring-2 ring-white/40 rounded-full"
                      title={p.author_name}>
                      <DiceBearAvatar name={p.author_name} size={30} rounded="full" />
                    </div>
                  ))}
                </div>
                {contribCount > 5 && (
                  <span className="ml-2 text-xs font-heading font-bold text-white/80">+{contribCount - 5} more</span>
                )}
              </motion.div>
            )}
          </motion.div>

          {/* Co-branding strip */}
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-3 mt-8 opacity-50">
            <Image src="/cio-logo.png" alt="CIO/CxO Forum" width={90} height={28} className="h-6 w-auto object-contain brightness-0 invert" />
            <div className="w-px h-4 bg-white/40" />
            <Image src="/uds-logo.png" alt="Uganda Digital Society" width={70} height={28} className="h-6 w-auto object-contain brightness-0 invert" />
          </motion.div>

          {/* Quick-access buttons */}
          <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-3 mt-5">
            <button onClick={() => setShowProgramme(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full font-heading font-semibold text-xs transition-all hover:scale-105 active:scale-95 backdrop-blur-sm"
              style={{ backgroundColor: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", color: "white" }}>
              <CalendarDays className="w-3.5 h-3.5" style={{ color: "#c9a34b" }} />
              View Programme
            </button>
            <button onClick={() => setShowTribute(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full font-heading font-semibold text-xs transition-all hover:scale-105 active:scale-95 backdrop-blur-sm"
              style={{ backgroundColor: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", color: "white" }}>
              <BookOpen className="w-3.5 h-3.5" style={{ color: "#c9a34b" }} />
              About John
            </button>
            <a href="https://docs.google.com/forms/d/e/1FAIpQLSfaqABscLxslw1h2aJJ35bh-jatwPiVh5L7ekDYOoyB8noALw/viewform"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full font-heading font-bold text-xs transition-all hover:scale-105 active:scale-95"
              style={{ background: "linear-gradient(135deg, #c9a34b, #e8c76a)", color: "#0a1628" }}>
              <ArrowRight className="w-3.5 h-3.5" />
              Register Now
            </a>
          </motion.div>
        </div>

      </div>

      {/* ── Body ── */}
      <div className="max-w-6xl mx-auto px-5 py-10">
        <div className="grid lg:grid-cols-[420px_1fr] gap-8 items-start">

          {/* ── LEFT — Sticky form ── */}
          <div className="lg:sticky lg:top-24 space-y-4">

            <AnimatePresence mode="wait">
              {submitted ? (
                /* Success state */
                <motion.div key="success"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-white rounded-3xl overflow-hidden shadow-xl"
                  style={{ border: `2px solid ${coverColor}33` }}>
                  <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${coverColor}, ${coverColor}55)` }} />
                  <div className="px-8 py-12 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                      className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${coverColor}22, ${coverColor}44)`, border: `2px solid ${coverColor}44` }}>
                      💌
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                      <p className="font-heading text-xl font-black mb-2" style={{ color: "#173962" }}>Message Sent!</p>
                      <p className="text-sm text-slate-500 mb-2">
                        Your appreciation has been added to the board for{" "}
                        <span className="font-semibold" style={{ color: "#173962" }}>{recipient}</span>.
                      </p>
                      <button onClick={() => setSubmitted(false)}
                        className="btn-primary text-sm w-full justify-center">
                        Add Another Message
                      </button>
                    </motion.div>
                  </div>
                </motion.div>
              ) : (
                /* Form */
                <motion.div key="form"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-white rounded-3xl overflow-hidden shadow-xl"
                  style={{ border: `2px solid ${coverColor}33` }}>
                  <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${coverColor}, ${coverColor}55)` }} />
                  <div className="p-6 md:p-7">
                    {/* Form header */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0"
                        style={{ background: `linear-gradient(135deg, ${coverColor}22, ${coverColor}44)`, border: `1.5px solid ${coverColor}44` }}>
                        {meta.emoji}
                      </div>
                      <div>
                        <p className="font-heading font-black text-[15px]" style={{ color: "#173962" }}>Add Your Message</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">No account needed — write from the heart ✨</p>
                      </div>
                    </div>

                    <AddPostForm
                      boardId={Number(id)}
                      boardQueryKey={boardKey}
                      showNameField={true}
                      onSuccess={handleSuccess}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Platform credit */}
            <div className="flex items-center justify-center gap-3">
              <Image src="/cio-logo.png" alt="CIO/CxO Forum" width={90} height={28} className="h-7 w-auto object-contain opacity-50 hover:opacity-80 transition-opacity" />
              <div className="w-px h-5 bg-slate-300" />
              <Image src="/uds-logo.png" alt="Uganda Digital Society" width={70} height={28} className="h-6 w-auto object-contain opacity-50 hover:opacity-80 transition-opacity" />
            </div>

          </div>

          {/* ── RIGHT — Posts ── */}
          <div>
            {postCount === 0 ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="bg-white rounded-3xl border-2 border-slate-100 py-20 text-center">
                <p className="text-5xl mb-4">💬</p>
                <p className="font-heading font-bold text-lg mb-1" style={{ color: "#173962" }}>No messages yet</p>
                <p className="text-sm text-slate-400">Be the first to leave a message for {recipient}!</p>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
                {/* Section heading */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${coverColor}22, ${coverColor}44)` }}>
                    <MessageSquare className="w-4 h-4" style={{ color: coverColor }} />
                  </div>
                  <div>
                    <h2 className="font-heading font-black text-[15px]" style={{ color: "#173962" }}>
                      {postCount} Message{postCount !== 1 ? "s" : ""}
                    </h2>
                    <p className="text-[11px] text-slate-400">{contribCount} contributor{contribCount !== 1 ? "s" : ""}</p>
                  </div>
                </div>

                {/* Masonry grid */}
                <div className="columns-1 sm:columns-2 gap-4 space-y-4">
                  {board.posts.map((post, i) => (
                    <motion.div key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
                      <PostCard
                        post={post}
                        boardId={Number(id)}
                        creatorId={board.creator_id}
                        allowDelete={user?.id === board.creator_id}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

        </div>
      </div>

      {/* ── In the Press ── */}
      <section className="py-10 px-5 border-t border-slate-100" style={{ backgroundColor: "#f8faff" }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-5">
            <Newspaper className="w-4 h-4" style={{ color: "#c9a34b" }} />
            <p className="text-[11px] font-heading font-bold uppercase tracking-[0.2em]" style={{ color: "#173962" }}>In the Press</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {PRESS.map((item) => (
              <button key={item.outlet} onClick={() => setPressModal(item)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full font-heading font-semibold text-xs transition-all hover:scale-105 active:scale-95 hover:shadow-md"
                style={{ backgroundColor: "white", border: "1.5px solid rgba(23,57,98,0.15)", color: "#173962" }}>
                <Newspaper className="w-3.5 h-3.5 shrink-0" style={{ color: "#c9a34b" }} />
                {item.outlet}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Programme Modal ── */}
      <AnimatePresence>
        {showProgramme && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(10,22,40,0.7)", backdropFilter: "blur(4px)" }}
            onClick={() => setShowProgramme(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-start justify-between px-6 py-5 sticky top-0" style={{ background: "linear-gradient(135deg, #0a1628, #173962)" }}>
                <div>
                  <p className="text-[10px] font-heading font-bold uppercase tracking-[0.18em] mb-0.5" style={{ color: "#c9a34b" }}>Programme</p>
                  <p className="text-white font-heading font-black text-base">Running Order</p>
                  <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>30 May 2026 · 09:30 – 12:00 · ICT Innovation Hub</p>
                </div>
                <button onClick={() => setShowProgramme(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all shrink-0 mt-0.5">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {/* Rows */}
              <div className="bg-white divide-y divide-slate-100">
                {[
                  { time: "09:30 – 10:00", activity: "Arrival & SOPs",                                                              person: "All" },
                  { time: "10:00 – 10:10", activity: "Welcome remarks & the industry side of John",                                 person: "John Ssenkeezi, President – Uganda Digital Society" },
                  { time: "10:10 – 10:20", activity: "Remembering John as a son and brother",                                       person: "Family representative" },
                  { time: "10:20 – 11:00", activity: "Keynote: Creating digital leaders through mentorship and knowledge sharing",   person: "Collin Babirukamu, ED IT – Bank of Uganda · Chairperson Advisory Board, CIO Forum" },
                  { time: "11:00 – 11:15", activity: "Mental wellness: building healthy, grounded leadership in demanding careers",  person: "Dr. Grace Bikumbi – MindLyfe" },
                  { time: "11:15 – 11:30", activity: "About the John Babirukamu Mentorship Programme",                              person: "Patricia Kahill, Director Education & Training – Uganda Digital Society" },
                  { time: "11:30 – 11:35", activity: "Remarks by the CIO Forum",                                                    person: "Jonathan Kayemba, Chairperson Board of Governors" },
                  { time: "11:35 – 11:45", activity: "Audience reactions or comments",                                              person: "Facilitated by the Emcee" },
                  { time: "11:45 – 12:00", activity: "Closing remarks",                                                             person: "Joan Generous Asaba, Vice President – Uganda Digital Society" },
                ].map(({ time, activity, person }) => (
                  <div key={time} className="px-6 py-3.5 hover:bg-slate-50 transition-colors">
                    <p className="text-[10px] font-heading font-bold tabular-nums mb-0.5" style={{ color: "#c9a34b" }}>{time}</p>
                    <p className="text-sm font-heading font-semibold leading-snug mb-0.5" style={{ color: "#173962" }}>{activity}</p>
                    <p className="text-xs text-slate-400 leading-snug">{person}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tribute Modal ── */}
      <AnimatePresence>
        {showTribute && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(10,22,40,0.7)", backdropFilter: "blur(4px)" }}
            onClick={() => setShowTribute(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl bg-white"
              onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-start justify-between px-7 py-6 sticky top-0 bg-white border-b border-slate-100">
                <div>
                  <p className="text-[10px] font-heading font-bold uppercase tracking-[0.2em] mb-1" style={{ color: "#c9a34b" }}>In Memoriam</p>
                  <h2 className="font-heading font-black text-xl" style={{ color: "#173962" }}>Honoring John Babirukamu</h2>
                  <p className="text-sm text-slate-400 mt-0.5">A Legacy That Redefined Uganda&apos;s Digital Landscape</p>
                </div>
                <button onClick={() => setShowTribute(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all shrink-0 mt-0.5">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {/* Content */}
              <div className="px-7 py-6 space-y-4 text-[15px] text-slate-600 leading-relaxed">
                {/* Pull quote */}
                <div className="rounded-2xl p-5 mb-2" style={{ background: "linear-gradient(135deg, #0a1628, #173962)", border: "1px solid rgba(201,163,75,0.2)" }}>
                  <p className="text-sm font-heading font-semibold text-white leading-relaxed">
                    &ldquo;Some contributions are visible in campaigns, platforms, and institutions, others are deeper, embedded in the systems, standards, and thinking that continue to shape an entire industry long after their originators are gone. John Birungi Babirukamu belongs to the latter.&rdquo;
                  </p>
                </div>
                <p>As Uganda reflects on his life and legacy, it becomes increasingly clear that his influence extends far beyond the roles he held or the organizations he served. He was not merely a participant in the rise of digital communication in Uganda — he was one of its key architects. At a time when the digital space was still being defined, John brought structure to uncertainty, discipline to experimentation, and strategy to a field still finding its professional identity.</p>
                <p>He saw digital communication not as a supplementary tool, but as a core business function — one that required systems thinking, governance, and measurable impact. In doing so, he helped transform digital marketing in Uganda from an emerging practice into a credible, data-driven discipline.</p>
                <p>With over 14 years of experience as a certified Management Information Systems expert and strategist, John operated at the intersection of technology, communication, and institutional transformation.</p>
                <p>A defining chapter of his career was at <strong className="font-semibold" style={{ color: "#173962" }}>Next Media Services</strong>, where he served as Head of Digital Marketing for over five years — leading the company&apos;s first digital marketing strategy, establishing its social media governance framework, and rebuilding its digital ecosystem. His work became a national benchmark, introducing interactive platforms for NBS TV, live streaming infrastructure, and early video streaming applications.</p>
                <p>John later moved to <strong className="font-semibold" style={{ color: "#173962" }}>Metropolitan Republic</strong>, bridging storytelling and performance, then to <strong className="font-semibold" style={{ color: "#173962" }}>MTN Uganda</strong> as Digital Communications Manager during a critical phase of the company&apos;s digital expansion.</p>
                <p>He also contributed to QG Group, NTV Uganda, Uganda Breweries Limited, Equity Bank, BRAC, and Sheraton Kampala — consistently championing systems thinking, governance, information security, and data integrity.</p>
                <p>As <strong className="font-semibold" style={{ color: "#173962" }}>General Manager at Hedge Marketing</strong>, he delivered 600% revenue growth, managing multinational accounts including Prudential Africa PLC, Uganda Baati, Opportunity Bank, EFC Bank, Housing Finance Bank, and AAR Insurance.</p>
                <p>He held an Executive MBA from the University of Suffolk, ISO certifications, membership in the Chartered Institute of Marketing UK and the Uganda Marketers&apos; Society — and was a <strong className="font-semibold" style={{ color: "#173962" }}>founding Vice President of the Uganda Digital Society</strong>.</p>
                <p>Yet beyond strategy, those who knew John remember his humanity — a mentor who invested deeply in others, a steady presence in a fast-moving industry, and an unwavering commitment to growing the next generation of digital professionals.</p>
                <div className="pt-5 border-t border-slate-100 text-center text-sm text-slate-500 italic">
                  In remembering John Babirukamu, we are not only looking back — we are reaffirming the standards, values, and vision he left behind.
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Press Article Modal ── */}
      <AnimatePresence>
        {pressModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(10,22,40,0.7)", backdropFilter: "blur(4px)" }}
            onClick={() => setPressModal(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl bg-white"
              onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-start justify-between px-6 py-5" style={{ background: "linear-gradient(135deg, #0a1628, #173962)" }}>
                <div>
                  <p className="text-[10px] font-heading font-bold uppercase tracking-[0.18em] mb-1" style={{ color: "#c9a34b" }}>In the Press</p>
                  <p className="text-white font-heading font-black text-base">{pressModal.outlet}</p>
                </div>
                <button onClick={() => setPressModal(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {/* Content */}
              <div className="px-6 py-6">
                <p className="font-heading font-bold text-base leading-snug mb-6" style={{ color: "#173962" }}>
                  {pressModal.headline}
                </p>
                <a href={pressModal.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-heading font-bold text-sm transition-all hover:scale-[1.02]"
                  style={{ background: "linear-gradient(135deg, #173962, #1e4a7c)", color: "white" }}>
                  <ExternalLink className="w-4 h-4" />
                  Read Full Article
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
