"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { MentorshipGoal, GoalStatus } from "@/types";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Check, Circle, Clock, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";

const STATUS_CONFIG: Record<GoalStatus, { icon: React.ReactNode; label: string; color: string }> = {
  not_started: { icon: <Circle className="w-4 h-4" />,     label: "Not Started", color: "#94a3b8" },
  in_progress:  { icon: <Clock className="w-4 h-4" />,      label: "In Progress",  color: "#c9a34b" },
  completed:    { icon: <Check className="w-4 h-4" />,      label: "Completed",    color: "#16a34a" },
};

const NEXT_STATUS: Record<GoalStatus, GoalStatus> = {
  not_started: "in_progress",
  in_progress: "completed",
  completed:   "not_started",
};

interface Props { mentorshipId: number; }

export default function GoalTracker({ mentorshipId }: Props) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding] = useState(false);

  const { data: goals = [] } = useQuery<MentorshipGoal[]>({
    queryKey: ["goals", mentorshipId],
    queryFn: () => api.get(`/mentorship/${mentorshipId}/goals`).then((r) => r.data),
    enabled: open,
  });

  const addGoal = useMutation({
    mutationFn: (title: string) => api.post(`/mentorship/${mentorshipId}/goals`, { title }).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["goals", mentorshipId] }); setNewTitle(""); setAdding(false); toast.success("Goal added!"); },
  });

  const updateGoal = useMutation({
    mutationFn: ({ goalId, status }: { goalId: number; status: GoalStatus }) =>
      api.patch(`/mentorship/${mentorshipId}/goals/${goalId}`, { status }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["goals", mentorshipId] }),
  });

  const deleteGoal = useMutation({
    mutationFn: (goalId: number) => api.delete(`/mentorship/${mentorshipId}/goals/${goalId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["goals", mentorshipId] }),
  });

  const completed = goals.filter((g) => g.status === "completed").length;
  const progress = goals.length > 0 ? Math.round((completed / goals.length) * 100) : 0;

  return (
    <div className="mt-4">
      <button onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all"
        style={open ? { borderColor: "rgba(23,57,98,0.2)", backgroundColor: "rgba(23,57,98,0.03)" } : { borderColor: "#e2e8f0", backgroundColor: "#f8fafc" }}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-heading font-bold uppercase tracking-widest" style={{ color: "#173962" }}>Goals & Milestones</span>
          {goals.length > 0 && (
            <span className="text-[10px] font-heading font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "rgba(201,163,75,0.15)", color: "#c9a34b" }}>
              {completed}/{goals.length}
            </span>
          )}
        </div>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
      </button>

      {open && (
        <div className="mt-2 space-y-2">
          {/* Progress bar */}
          {goals.length > 0 && (
            <div className="px-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-400 font-heading font-semibold">{progress}% complete</span>
                <span className="text-[10px] text-slate-400">{completed} of {goals.length} done</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress}%`, backgroundColor: progress === 100 ? "#16a34a" : "#c9a34b" }} />
              </div>
            </div>
          )}

          {/* Goal list */}
          {goals.map((goal) => {
            const cfg = STATUS_CONFIG[goal.status];
            return (
              <div key={goal.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-slate-100 bg-white group">
                <button onClick={() => updateGoal.mutate({ goalId: goal.id, status: NEXT_STATUS[goal.status] })}
                  className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{ color: cfg.color, backgroundColor: cfg.color + "15" }}
                  title={`Mark as ${NEXT_STATUS[goal.status].replace("_", " ")}`}>
                  {cfg.icon}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-heading font-semibold ${goal.status === "completed" ? "line-through text-slate-400" : ""}`}
                    style={goal.status !== "completed" ? { color: "#173962" } : {}}>
                    {goal.title}
                  </p>
                  <p className="text-[10px] font-heading" style={{ color: cfg.color }}>{cfg.label}</p>
                </div>
                <button onClick={() => deleteGoal.mutate(goal.id)}
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-red-400">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}

          {/* Add goal */}
          {adding ? (
            <div className="flex items-center gap-2">
              <Input className="h-9 text-sm border-slate-200 rounded-xl flex-1"
                placeholder="Goal title..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && newTitle.trim()) addGoal.mutate(newTitle.trim()); }}
                autoFocus />
              <button onClick={() => { if (newTitle.trim()) addGoal.mutate(newTitle.trim()); }}
                disabled={!newTitle.trim() || addGoal.isPending}
                className="btn-cta text-xs px-3 py-2 rounded-xl shrink-0">Add</button>
              <button onClick={() => { setAdding(false); setNewTitle(""); }}
                className="text-xs font-heading font-semibold text-slate-400 hover:text-slate-600 shrink-0">Cancel</button>
            </div>
          ) : (
            <button onClick={() => setAdding(true)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-dashed border-slate-200 text-xs font-heading font-semibold text-slate-400 hover:border-navy hover:text-navy transition-all"
              style={{ "--hover-border-color": "#173962" } as React.CSSProperties}>
              <Plus className="w-3.5 h-3.5" /> Add goal
            </button>
          )}
        </div>
      )}
    </div>
  );
}
