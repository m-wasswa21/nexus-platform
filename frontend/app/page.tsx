"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Handshake, PartyPopper, Users, Calendar, Clock, MapPin } from "lucide-react";

const stats = [
  { value: "113+", label: "Community Members" },
  { value: "34",   label: "Active Mentors" },
  { value: "78",   label: "Mentees Enrolled" },
  { value: "2:1",  label: "Mentor Ratio" },
];

const features = [
  { icon: Handshake,   title: "Mentorship Matching",    desc: "Connect with experienced CIO/CxO leaders who guide your career journey with structured programmes." },
  { icon: PartyPopper, title: "Appreciation Boards",    desc: "Celebrate milestones together — birthdays, farewells, graduations and programme completions." },
  { icon: Users,       title: "CIO/CxO Community",      desc: "A curated network of Africa's top digital leaders sharing insights, opportunities and support." },
];

const compare = [
  { name: "Kudoboard",    board: true,  mentor: false },
  { name: "MentorCruise", board: false, mentor: true },
  { name: "LinkedIn",     board: false, mentor: false },
  { name: "This Platform ✦", board: true, mentor: true, highlight: true },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-body">

      {/* ── NAVBAR ─────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-slate-200/80 shadow-sm shadow-navy/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-6 h-[72px] flex items-center justify-between">
          <Link href="/" className="flex-shrink-0 flex items-center gap-3">
            <Image src="/cio-logo.png" alt="CIO/CxO Forum" width={150} height={44} className="h-10 w-auto object-contain" priority />
            <div className="w-px h-7 bg-slate-300" />
            <Image src="/uds-logo.png" alt="Uganda Digital Society" width={110} height={44} className="h-9 w-auto object-contain" />
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {["Features", "Community"].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`}
                className="px-4 py-2 rounded-full text-sm font-semibold font-heading transition-all duration-200 text-navy/60 hover:text-navy hover:bg-navy/5">
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login"
              className="px-4 py-2 rounded-full text-sm font-semibold font-heading text-navy/70 hover:text-navy hover:bg-navy/5 transition-all duration-200">
              Sign In
            </Link>
            <Link href="/register" className="btn-cta text-sm">
              Join the Forum <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[88vh] flex items-center" style={{ background: "linear-gradient(135deg, #0a1628 0%, #173962 60%, #1e4a7c 100%)" }}>
        <div className="absolute inset-0">
          <Image
            src="/conclave.jpg"
            alt="CIO/CxO Forum community"
            fill
            className="object-cover object-center"
            priority
            quality={85}
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(10,22,40,0.92) 0%, rgba(23,57,98,0.85) 55%, rgba(30,74,124,0.75) 100%)" }} />
        </div>

        <div className="absolute inset-0 pattern-dots" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: "radial-gradient(circle, #c9a34b, transparent)" }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-16 py-32 w-full grid lg:grid-cols-2 gap-16 items-center">
          <div>
            {/* Logos */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="flex items-center gap-3 mb-6 opacity-80">
              <Image src="/uds-logo.png" alt="Uganda Digital Society" width={90} height={30} className="h-7 w-auto object-contain brightness-0 invert" />
              <div className="w-px h-5 bg-white/30" />
              <Image src="/cio-logo.png" alt="CIO/CxO Forum" width={90} height={30} className="h-6 w-auto object-contain brightness-0 invert" />
            </motion.div>

            {/* Badge */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 backdrop-blur-sm"
              style={{ backgroundColor: "rgba(201,163,75,0.1)", border: "1px solid rgba(201,163,75,0.25)" }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#c9a34b" }} />
              <span className="text-xs font-heading font-semibold tracking-[0.2em] uppercase" style={{ color: "#c9a34b" }}>
                Featured Event
              </span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}
              className="font-heading text-4xl md:text-5xl lg:text-6xl font-black leading-[1.05] mb-4" style={{ color: "#c9a34b" }}>
              1<sup className="text-2xl">st</sup> John Babirukamu<br />
              <span className="text-white">Annual Memorial Lecture</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.28 }}
              className="text-base md:text-lg mb-6 max-w-xl leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
              <span className="font-semibold text-white">Theme: </span>
              Creating Digital Leaders Through Mentorship and Knowledge Sharing
            </motion.p>

            {/* Event details chips */}
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.38 }}
              className="flex flex-wrap gap-3 mb-8">
              {[
                { icon: Calendar, text: "Saturday, 30th May 2026" },
                { icon: Clock,    text: "10:00 AM – 12:00 PM" },
                { icon: MapPin,   text: "National ICT Hub" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 px-3 py-2 rounded-xl backdrop-blur-sm"
                  style={{ backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
                  <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: "#c9a34b" }} />
                  <span className="text-xs font-heading font-semibold text-white">{text}</span>
                </div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.48 }}
              className="flex flex-wrap items-center gap-4">
              <Link
                href="https://jbannualmemoriallecture.org/boards/4/contribute"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-heading font-bold text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg"
                style={{ background: "linear-gradient(135deg, #c9a34b, #e8c76a)", color: "#0a1628" }}>
                Leave a Message <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-heading font-bold text-sm border-2 transition-all duration-300 hover:scale-105"
                style={{ borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.85)" }}>
                Join the Community
              </Link>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.3 }}
            className="hidden lg:block">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl" style={{ border: "2px solid rgba(201,163,75,0.3)" }}>
              <Image
                src="/meeting.jpg"
                alt="CIO/CxO leaders in session"
                width={580}
                height={400}
                className="object-cover w-full h-[420px]"
                quality={90}
              />
              <div className="absolute inset-x-0 bottom-0 h-32" style={{ background: "linear-gradient(to top, rgba(10,22,40,0.8), transparent)" }} />
              <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
                {[
                  { value: "113+", label: "Members" },
                  { value: "34",   label: "Mentors" },
                  { value: "78",   label: "Mentees" },
                ].map(({ value, label }) => (
                  <div key={label} className="text-center px-4 py-2 rounded-xl backdrop-blur-md"
                    style={{ backgroundColor: "rgba(201,163,75,0.15)", border: "1px solid rgba(201,163,75,0.3)" }}>
                    <p className="font-heading font-black text-lg leading-none" style={{ color: "#c9a34b" }}>{value}</p>
                    <p className="text-[10px] font-heading font-semibold uppercase tracking-widest text-white/60 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS ──────────────────────────────────────────────────── */}
      <section className="py-16 border-y border-slate-200" style={{ backgroundColor: "#f8faff" }}>
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map(({ value, label }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }} viewport={{ once: true }}>
              <p className="font-heading text-4xl font-black" style={{ color: "#173962" }}>{value}</p>
              <p className="text-sm text-slate-500 mt-1 font-body">{label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────────── */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="tag mb-4 inline-block">Platform Features</span>
            <h2 className="section-title mb-4">Everything in One Place</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              No more juggling separate tools for mentorship, celebrations, and community.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }} viewport={{ once: true }}
                className="feature-card group p-8 rounded-2xl border-2 border-slate-200 hover:border-corporate-gold/40 hover:shadow-2xl transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-lg"
                  style={{ background: "linear-gradient(135deg, #173962, #1e4a7c)" }}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-heading font-bold text-lg mb-3" style={{ color: "#173962" }}>{title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARE ────────────────────────────────────────────────── */}
      <section className="py-24" style={{ backgroundColor: "#f8faff" }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="tag mb-4 inline-block">Why This Platform?</span>
          <h2 className="section-title mb-12">One Platform. Everything.</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {compare.map(({ name, board, mentor, highlight }, i) => (
              <motion.div key={name} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="rounded-2xl p-6 border-2 transition-all duration-300"
                style={highlight
                  ? { borderColor: "#c9a34b", background: "linear-gradient(135deg, #173962, #0f2443)", boxShadow: "0 10px 30px rgba(23,57,98,0.25)" }
                  : { borderColor: "#e2e8f0", backgroundColor: "white" }}>
                <p className={`font-heading font-bold mb-5 ${highlight ? "text-corporate-gold" : "text-navy"}`}>{name}</p>
                <div className="space-y-3">
                  {[["Boards", board], ["Mentorship", mentor]].map(([label, has]) => (
                    <div key={String(label)} className="flex items-center gap-2 justify-center">
                      <CheckCircle className={`w-4 h-4 ${has ? (highlight ? "text-corporate-gold" : "text-navy") : "text-slate-300"}`} />
                      <span className={`text-sm ${has ? (highlight ? "text-white" : "text-navy") : "text-slate-300"}`}>{String(label)}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMUNITY CTA ──────────────────────────────────────────── */}
      <section id="community" className="py-24" style={{ background: "linear-gradient(135deg, #0a1628 0%, #173962 100%)" }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="tag mb-6 inline-block">Join Today</span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">
              Ready to join Africa&#39;s<br />
              <span className="text-gradient-gold">top digital leaders?</span>
            </h2>
            <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
              Free to use. No credit card required. Start your mentorship journey today.
            </p>
            <Link href="/register" className="btn-primary text-base inline-flex">
              Create Your Account <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────── */}
      <footer style={{ backgroundColor: "#0a1628" }} className="text-white py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image src="/cio-logo.png" alt="CIO/CxO Forum" width={120} height={36} className="h-8 w-auto object-contain brightness-0 invert opacity-70" />
            <div className="w-px h-6 bg-white/20" />
            <Image src="/uds-logo.png" alt="Uganda Digital Society" width={90} height={36} className="h-8 w-auto object-contain brightness-0 invert opacity-70" />
          </div>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            © 2026 CIO/CxO Africa &amp; Uganda Digital Society
          </p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-heading font-semibold hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.5)" }}>Sign In</Link>
            <Link href="/register" className="btn-cta text-xs">Join Now</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
