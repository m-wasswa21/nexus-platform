import { parseUTC } from "@/lib/utils";
"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Mentorship, MentorshipStatus } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { CheckCircle, XCircle, Handshake, ArrowRight } from "lucide-react";
import GoalTracker from "@/components/mentorship/GoalTracker";
import VideoCallButton from "@/components/mentorship/VideoCallButton";
import DiceBearAvatar from "@/components/ui/DiceBearAvatar";

const STATUS_STYLE: Record<MentorshipStatus, { bg: string; text: string; label: string }> = {
  pending:   { bg: "rgba(245,158,11,0.1)",  text: "#d97706", label: "Pending" },
  active:    { bg: "rgba(22,163,74,0.1)",   text: "#16a34a", label: "Active" },
  completed: { bg: "rgba(23,57,98,0.1)",    text: "#173962", label: "Completed" },
  declined:  { bg: "rgba(222,39,41,0.1)",   text: "#de2729", label: "Declined" },
};

export default function MentorshipClient() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: mentorships = [], isLoading } = useQuery<Mentorship[]>({
    queryKey: ["mentorships"],
    queryFn: () => api.get("/mentorship").then((r) => r.data),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: MentorshipStatus }) =>
      api.patch(`/mentorship/${id}`, { status }).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["mentorships"] }); toast.success("Updated!"); },
    onError: () => toast.error("Failed to update"),
  });

  const asMentor = mentorships.filter((m) => m.mentor_id === user?.id);
  const asMentee = mentorships.filter((m) => m.mentee_id === user?.id);

  const MentorshipCard = ({ m }: { m: Mentorship }) => {
    const other = m.mentor_id === user?.id ? m.mentee : m.mentor;
    const isMentor = m.mentor_id === user?.id;
    const status = STATUS_STYLE[m.status];

    return (
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
        {/* Status bar */}
        <div className="h-1 -mx-6 -mt-6 mb-5 rounded-t-2xl" style={{ backgroundColor: status.text + "40" }} />

        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <DiceBearAvatar name={other.name} email={other.email} size={48} rounded="2xl" />
            <div>
              <p className="font-heading font-bold" style={{ color: "#173962" }}>{other.name}</p>
              <p className="text-sm text-slate-400">{other.title || other.role}</p>
            </div>
          </div>
          <span className="text-[10px] font-heading font-bold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: status.bg, color: status.text }}>
            {status.label}
          </span>
        </div>

        {m.message && (
          <div className="rounded-xl p-3 mb-3 border" style={{ backgroundColor: "rgba(23,57,98,0.03)", borderColor: "rgba(23,57,98,0.1)" }}>
            <p className="text-[10px] font-heading font-bold uppercase tracking-widest text-slate-400 mb-1">Message</p>
            <p className="text-sm text-slate-600 line-clamp-2">{m.message}</p>
          </div>
        )}

        {m.goals && (
          <div className="rounded-xl p-3 mb-3 border" style={{ backgroundColor: "rgba(201,163,75,0.05)", borderColor: "rgba(201,163,75,0.15)" }}>
            <p className="text-[10px] font-heading font-bold uppercase tracking-widest mb-1" style={{ color: "#c9a34b" }}>Goals</p>
            <p className="text-sm text-slate-600 line-clamp-2">{m.goals}</p>
          </div>
        )}

        <p className="text-xs text-slate-400 mb-4">
          {formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}
          {m.started_at && ` · Started ${formatDistanceToNow(new Date(m.started_at), { addSuffix: true })}`}
        </p>

        {isMentor && m.status === "pending" && (
          <div className="flex gap-2">
            <button className="btn-cta flex-1 justify-center rounded-xl text-xs py-2"
              onClick={() => updateStatus.mutate({ id: m.id, status: "active" })}>
              <CheckCircle className="w-3.5 h-3.5" /> Accept
            </button>
            <button
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl text-xs py-2 font-heading font-bold border-2 transition-colors hover:bg-red-50"
              style={{ borderColor: "#de272920", color: "#de2729" }}
              onClick={() => updateStatus.mutate({ id: m.id, status: "declined" })}>
              <XCircle className="w-3.5 h-3.5" /> Decline
            </button>
          </div>
        )}

        {m.status === "active" && (
          <>
            <VideoCallButton mentorshipId={m.id} mentorName={m.mentor.name} menteeName={m.mentee.name} />
            <GoalTracker mentorshipId={m.id} />
            <button
              className="w-full flex items-center justify-center gap-1.5 rounded-xl text-xs py-2.5 font-heading font-bold border-2 transition-all hover:shadow-sm mt-3"
              style={{ borderColor: "rgba(23,57,98,0.2)", color: "#173962" }}
              onClick={() => updateStatus.mutate({ id: m.id, status: "completed" })}>
              <CheckCircle className="w-3.5 h-3.5" style={{ color: "#c9a34b" }} /> Mark as Completed
            </button>
          </>
        )}
      </div>
    );
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#173962", borderTopColor: "transparent" }} />
    </div>
  );

  return (
    <div className="min-h-full font-body">
      <div className="px-6 py-7 bg-white" style={{ borderBottom: "1px solid #f1f5f9" }}>
        <div>
          <p className="text-[11px] font-heading font-bold tracking-[0.16em] uppercase mb-2" style={{ color: "#c9a34b" }}>Community</p>
          <h1 className="font-heading text-3xl font-black" style={{ color: "#173962" }}>My Mentorship</h1>
          <p className="text-[14px] text-slate-500 mt-1.5">Track and manage your mentorship connections</p>
        </div>
      </div>
      <div className="px-6 py-8 max-w-screen-2xl">

      {mentorships.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-slate-200">
          <Handshake className="w-12 h-12 mx-auto mb-3" style={{ color: "rgba(23,57,98,0.2)" }} />
          <h2 className="font-heading text-lg font-bold mb-2" style={{ color: "#173962" }}>No mentorships yet</h2>
          <p className="text-sm text-slate-400 mb-6">
            {user?.role === "mentor" ? "You haven't received any requests yet." : "Find a mentor to get started."}
          </p>
          {user?.role !== "mentor" && (
            <Link href="/mentors" className="btn-cta text-sm inline-flex">
              Find a Mentor <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      )}

      {mentorships.length > 0 && (
        <Tabs defaultValue={user?.role === "mentor" ? "as-mentor" : "as-mentee"}>
          <TabsList className="mb-6 bg-slate-100 p-1 rounded-xl">
            {asMentee.length > 0 && <TabsTrigger value="as-mentee" className="rounded-lg font-heading font-semibold">As Mentee ({asMentee.length})</TabsTrigger>}
            {asMentor.length > 0 && <TabsTrigger value="as-mentor" className="rounded-lg font-heading font-semibold">As Mentor ({asMentor.length})</TabsTrigger>}
          </TabsList>
          <TabsContent value="as-mentee">
            <div className="grid md:grid-cols-2 gap-5">
              {asMentee.map((m) => <MentorshipCard key={m.id} m={m} />)}
            </div>
          </TabsContent>
          <TabsContent value="as-mentor">
            <div className="grid md:grid-cols-2 gap-5">
              {asMentor.map((m) => <MentorshipCard key={m.id} m={m} />)}
            </div>
          </TabsContent>
        </Tabs>
      )}
      </div>
    </div>
  );
}
