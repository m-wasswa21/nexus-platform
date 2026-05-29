"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { User } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Search, Users, ExternalLink, ArrowRight, Bookmark, BookmarkCheck, SlidersHorizontal, X } from "lucide-react";
import DiceBearAvatar from "@/components/ui/DiceBearAvatar";

const SKILL_OPTIONS = ["Digital Transformation", "IT Strategy", "Cloud", "AI/ML", "Fintech", "Cybersecurity", "Leadership", "Agile", "Data Analytics", "Mobile Money"];

export default function MentorsClient() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<User | null>(null);
  const [requestData, setRequestData] = useState({ message: "", goals: "" });

  const { data: mentors = [], isLoading } = useQuery<User[]>({
    queryKey: ["mentors"],
    queryFn: () => api.get("/users/mentors").then((r) => r.data),
  });

  const { data: bookmarks = [] } = useQuery<User[]>({
    queryKey: ["bookmarks"],
    queryFn: () => api.get("/bookmarks").then((r) => r.data),
  });

  const bookmarkMutation = useMutation({
    mutationFn: ({ id, saved }: { id: number; saved: boolean }) =>
      saved ? api.delete(`/bookmarks/${id}`) : api.post(`/bookmarks/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookmarks"] }),
  });

  const requestMutation = useMutation({
    mutationFn: (data: { mentor_id: number; message: string; goals: string }) =>
      api.post("/mentorship", data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mentorships"] });
      toast.success("Mentorship request sent! 🎉");
      setSelectedMentor(null);
      setRequestData({ message: "", goals: "" });
    },
    onError: () => toast.error("Request failed — you may already have a pending request with this mentor"),
  });

  const bookmarkedIds = new Set(bookmarks.map((b) => b.id));

  const displayList = showSaved ? bookmarks : mentors.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch = !q || m.name.toLowerCase().includes(q) || m.title?.toLowerCase().includes(q) ||
      m.company?.toLowerCase().includes(q) || m.skills?.toLowerCase().includes(q);
    const matchAvailable = !availableOnly || m.is_available;
    const matchSkills = selectedSkills.length === 0 ||
      selectedSkills.every((s) => m.skills?.toLowerCase().includes(s.toLowerCase()));
    return matchSearch && matchAvailable && matchSkills;
  });

  const toggleSkill = (s: string) => setSelectedSkills((prev) =>
    prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
  );

  const activeFilters = (availableOnly ? 1 : 0) + selectedSkills.length;

  return (
    <div className="min-h-full font-body">
      {/* Page header */}
      <div className="px-6 py-7 bg-white" style={{ borderBottom: "1px solid #f1f5f9" }}>
        <div>
          <p className="text-[11px] font-heading font-bold tracking-[0.16em] uppercase mb-2" style={{ color: "#c9a34b" }}>Community</p>
          <h1 className="font-heading text-3xl font-black" style={{ color: "#173962" }}>Find a Mentor</h1>
          <p className="text-[14px] text-slate-500 mt-1.5">Connect with experienced CIO/CxO leaders in the community</p>
        </div>
      </div>
      <div className="px-6 py-8 max-w-screen-2xl">

      {/* Search + filter bar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input className="pl-10 h-11 border-slate-200 rounded-xl bg-white"
            placeholder="Search by name, title, or skill..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <button onClick={() => setShowFilters((v) => !v)}
          className="flex items-center gap-2 px-4 h-11 rounded-xl border-2 font-heading font-bold text-sm transition-all"
          style={showFilters || activeFilters > 0
            ? { borderColor: "#173962", backgroundColor: "rgba(23,57,98,0.06)", color: "#173962" }
            : { borderColor: "#e2e8f0", color: "#64748b" }}>
          <SlidersHorizontal className="w-4 h-4" />
          Filters {activeFilters > 0 && <span className="w-5 h-5 rounded-full text-[10px] flex items-center justify-center text-white" style={{ backgroundColor: "#173962" }}>{activeFilters}</span>}
        </button>

        <button onClick={() => setShowSaved((v) => !v)}
          className="flex items-center gap-2 px-4 h-11 rounded-xl border-2 font-heading font-bold text-sm transition-all"
          style={showSaved
            ? { borderColor: "#c9a34b", backgroundColor: "rgba(201,163,75,0.1)", color: "#c9a34b" }
            : { borderColor: "#e2e8f0", color: "#64748b" }}>
          <Bookmark className="w-4 h-4" />
          Saved ({bookmarks.length})
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <p className="font-heading font-bold text-sm" style={{ color: "#173962" }}>Filters</p>
            {activeFilters > 0 && (
              <button onClick={() => { setAvailableOnly(false); setSelectedSkills([]); }}
                className="flex items-center gap-1 text-xs font-heading font-semibold text-slate-400 hover:text-red-500 transition-colors">
                <X className="w-3.5 h-3.5" /> Clear all
              </button>
            )}
          </div>

          <label className="flex items-center gap-2 cursor-pointer mb-4 w-fit">
            <div onClick={() => setAvailableOnly((v) => !v)}
              className="w-9 h-5 rounded-full transition-colors duration-200 flex items-center px-0.5"
              style={{ backgroundColor: availableOnly ? "#173962" : "#e2e8f0" }}>
              <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${availableOnly ? "translate-x-4" : "translate-x-0"}`} />
            </div>
            <span className="text-sm font-heading font-semibold text-slate-600">Available mentors only</span>
          </label>

          <p className="text-xs font-heading font-bold uppercase tracking-widest text-slate-400 mb-2">Skills</p>
          <div className="flex flex-wrap gap-2">
            {SKILL_OPTIONS.map((s) => (
              <button key={s} onClick={() => toggleSkill(s)}
                className="px-3 py-1.5 rounded-full text-xs font-heading font-semibold transition-all hover:scale-105"
                style={selectedSkills.includes(s)
                  ? { backgroundColor: "#173962", color: "white" }
                  : { backgroundColor: "#f1f5f9", color: "#475569" }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4].map((i) => <div key={i} className="h-56 bg-slate-100 animate-pulse rounded-2xl" />)}
        </div>
      )}

      {!isLoading && displayList.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-slate-200">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-heading text-lg font-bold mb-1" style={{ color: "#173962" }}>
            {showSaved ? "No saved mentors yet" : "No mentors found"}
          </p>
          <p className="text-sm text-slate-400">{showSaved ? "Bookmark mentors to see them here" : "Try adjusting your filters"}</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayList.map((mentor) => {
          const isBookmarked = bookmarkedIds.has(mentor.id);
          return (
            <div key={mentor.id}
              className="bg-white rounded-2xl border-2 border-slate-200 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              {/* Header */}
              <div className="flex items-start gap-3 mb-4">
                <DiceBearAvatar name={mentor.name} email={mentor.email} size={56} rounded="2xl" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-bold text-base truncate" style={{ color: "#173962" }}>{mentor.name}</h3>
                  <p className="text-sm text-slate-500 truncate">{mentor.title || "Senior Leader"}</p>
                  {mentor.company && <p className="text-xs text-slate-400 truncate">{mentor.company}</p>}
                </div>
                <button onClick={() => bookmarkMutation.mutate({ id: mentor.id, saved: isBookmarked })}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                  style={isBookmarked ? { backgroundColor: "rgba(201,163,75,0.15)", color: "#c9a34b" } : { backgroundColor: "#f1f5f9", color: "#94a3b8" }}>
                  {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                </button>
              </div>

              {mentor.bio && <p className="text-sm text-slate-500 line-clamp-3 mb-4 leading-relaxed">{mentor.bio}</p>}

              {mentor.skills && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {mentor.skills.split(",").slice(0, 3).map((s) => (
                    <span key={s.trim()} className="tag text-[10px] px-2 py-0.5">{s.trim()}</span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${mentor.is_available ? "bg-green-400" : "bg-slate-300"}`} />
                  <span className="text-xs font-heading font-semibold" style={{ color: mentor.is_available ? "#16a34a" : "#94a3b8" }}>
                    {mentor.is_available ? "Available" : "Unavailable"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {mentor.linkedin_url && (
                    <a href={mentor.linkedin_url} target="_blank" rel="noopener noreferrer"
                      className="w-7 h-7 rounded-lg flex items-center justify-center border border-slate-200 hover:border-navy hover:bg-navy hover:text-white transition-all text-slate-400">
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {user?.role !== "mentor" && mentor.is_available && (
                    <button onClick={() => setSelectedMentor(mentor)} className="btn-cta text-xs px-3 py-1.5 rounded-full flex items-center gap-1">
                      Connect <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Request dialog */}
      <Dialog open={!!selectedMentor} onOpenChange={() => setSelectedMentor(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading" style={{ color: "#173962" }}>Request Mentorship</DialogTitle>
          </DialogHeader>
          {selectedMentor && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 p-4 rounded-xl border-2" style={{ borderColor: "rgba(23,57,98,0.12)", backgroundColor: "rgba(23,57,98,0.03)" }}>
                <DiceBearAvatar name={selectedMentor.name} email={selectedMentor.email} size={44} rounded="xl" />
                <div>
                  <p className="font-heading font-bold text-sm" style={{ color: "#173962" }}>{selectedMentor.name}</p>
                  <p className="text-xs text-slate-400">{selectedMentor.title} · {selectedMentor.company}</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="font-heading font-semibold text-sm" style={{ color: "#173962" }}>Your Message *</Label>
                <Textarea className="border-slate-200 rounded-xl resize-none" rows={4}
                  value={requestData.message} onChange={(e) => setRequestData({ ...requestData, message: e.target.value })}
                  placeholder="Introduce yourself and explain why you'd like this mentor..." />
              </div>
              <div className="space-y-1.5">
                <Label className="font-heading font-semibold text-sm" style={{ color: "#173962" }}>
                  Goals <span className="text-slate-400 font-normal">(optional)</span>
                </Label>
                <Textarea className="border-slate-200 rounded-xl resize-none" rows={3}
                  value={requestData.goals} onChange={(e) => setRequestData({ ...requestData, goals: e.target.value })}
                  placeholder="What do you hope to achieve through this mentorship?" />
              </div>
              <div className="flex gap-3">
                <button className="btn-cta flex-1 justify-center rounded-xl"
                  disabled={!requestData.message.trim() || requestMutation.isPending}
                  onClick={() => requestMutation.mutate({ mentor_id: selectedMentor.id, ...requestData })}>
                  {requestMutation.isPending ? "Sending..." : "Send Request"}
                </button>
                <button onClick={() => setSelectedMentor(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl border-2 font-heading font-bold text-sm text-slate-500 border-slate-200 hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
