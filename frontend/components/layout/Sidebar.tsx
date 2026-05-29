"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { LayoutDashboard, PartyPopper, Users, Handshake, User, LogOut } from "lucide-react";
import NotificationBell from "./NotificationBell";
import DiceBearAvatar from "@/components/ui/DiceBearAvatar";

const navItems = [
  { href: "/dashboard",  label: "Dashboard",    icon: LayoutDashboard },
  { href: "/boards",     label: "Boards",        icon: PartyPopper },
  { href: "/mentors",    label: "Find a Mentor", icon: Users },
  { href: "/mentorship", label: "My Mentorship", icon: Handshake },
  { href: "/profile",    label: "Profile",       icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 min-h-screen flex flex-col shrink-0" style={{ backgroundColor: "#0f2443" }}>

      {/* ── Logo ── */}
      <div className="px-6 py-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <Link href="/dashboard" className="block">
          <Image
            src="/cio-logo.png"
            alt="CIO/CxO Digital Leadership Forum"
            width={150}
            height={44}
            className="h-9 w-auto object-contain brightness-0 invert opacity-90"
            priority
          />
        </Link>
        <p className="text-[10px] mt-3 font-heading font-bold tracking-[0.18em] uppercase"
          style={{ color: "#c9a34b" }}>
          Nexus Platform
        </p>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150",
                active
                  ? "font-semibold"
                  : "hover:text-white"
              )}
              style={active
                ? {
                    backgroundColor: "rgba(201,163,75,0.14)",
                    color: "#c9a34b",
                    borderLeft: "3px solid #c9a34b",
                  }
                : {
                    color: "rgba(255,255,255,0.52)",
                    borderLeft: "3px solid transparent",
                  }
              }
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              <span className="font-heading">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── Role badge ── */}
      {user && (
        <div className="mx-3 mb-3 px-4 py-2.5 rounded-xl"
          style={{ backgroundColor: "rgba(201,163,75,0.08)", border: "1px solid rgba(201,163,75,0.18)" }}>
          <p className="text-[10px] font-heading font-bold uppercase tracking-[0.15em]" style={{ color: "#c9a34b" }}>
            {user.role}
          </p>
          <p className="text-[11px] mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.38)" }}>
            {user.company || "CIO/CxO Forum"}
          </p>
        </div>
      )}

      {/* ── User footer ── */}
      {user && (
        <div className="px-4 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-3 mb-3">
            <DiceBearAvatar name={user.name} email={user.email} size={36} rounded="full" />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-heading font-semibold text-white truncate leading-tight">
                {user.name}
              </p>
              <p className="text-[11px] truncate mt-0.5" style={{ color: "rgba(255,255,255,0.38)" }}>
                {user.email}
              </p>
            </div>
            <NotificationBell />
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-heading font-semibold transition-colors duration-150 hover:text-white"
            style={{ color: "rgba(255,255,255,0.35)" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            Sign Out
          </button>
        </div>
      )}
    </aside>
  );
}
