"use client";
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Notification } from "@/types";
import { Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

const TYPE_ICON: Record<string, string> = {
  board_post:            "💌",
  mentorship_request:    "🤝",
  mentorship_accepted:   "🎉",
  mentorship_declined:   "😔",
  mentorship_completed:  "🏆",
  reaction:              "👏",
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: () => api.get("/notifications").then((r) => r.data),
    refetchInterval: 30_000,
  });

  const unread = notifications.filter((n) => !n.is_read).length;

  const markAll = useMutation({
    mutationFn: () => api.patch("/notifications/read-all"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markOne = useMutation({
    mutationFn: (id: number) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen((v) => !v); if (!open && unread > 0) markAll.mutate(); }}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-white/10"
      >
        <Bell className="w-4 h-4 text-white/70" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold font-heading"
            style={{ backgroundColor: "#de2729", color: "white" }}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50"
          style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <p className="font-heading font-bold text-sm" style={{ color: "#173962" }}>Notifications</p>
            {unread > 0 && (
              <button onClick={() => markAll.mutate()}
                className="text-[10px] font-heading font-bold hover:opacity-70" style={{ color: "#c9a34b" }}>
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-slate-400">No notifications yet</div>
            )}
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => { markOne.mutate(n.id); setOpen(false); }}
                className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors"
                style={!n.is_read ? { backgroundColor: "rgba(23,57,98,0.03)" } : {}}
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0 mt-0.5"
                  style={{ backgroundColor: "rgba(201,163,75,0.12)" }}>
                  {TYPE_ICON[n.type] || "🔔"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-heading font-semibold truncate" style={{ color: "#173962" }}>{n.title}</p>
                  {n.message && <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>}
                  <p className="text-[10px] text-slate-300 mt-1">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</p>
                </div>
                {!n.is_read && <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: "#de2729" }} />}
              </div>
            ))}
          </div>

          {notifications.length > 0 && (
            <div className="border-t border-slate-100 px-4 py-2">
              <Link href="/dashboard" onClick={() => setOpen(false)}
                className="text-[11px] font-heading font-bold hover:opacity-70 transition-opacity" style={{ color: "#c9a34b" }}>
                View dashboard →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
