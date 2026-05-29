"use client";
import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import Image from "next/image";

// Tenor v1 anonymous key — no signup required
// https://tenor.com/gifapi
const TENOR_KEY = "LIVDSRZULELA";
const TENOR_BASE = "https://api.tenor.com/v1";

interface GifResult {
  id: string;
  url: string;
  preview: string;
  title: string;
}

interface Props {
  onSelect: (url: string) => void;
  onClose: () => void;
}

const TRENDING = [
  "congratulations", "thank you", "birthday", "celebration",
  "happy", "amazing", "well done", "proud",
];

async function fetchTenor(endpoint: string, params: Record<string, string>): Promise<GifResult[]> {
  const qs = new URLSearchParams({ key: TENOR_KEY, media_filter: "minimal", limit: "18", ...params });
  const res = await fetch(`${TENOR_BASE}/${endpoint}?${qs}`);
  const json = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (json.results || []).map((g: any) => ({
    id: g.id,
    url: g.media[0].gif.url,
    preview: g.media[0].tinygif?.url || g.media[0].gif.url,
    title: g.title || g.id,
  }));
}

export default function GifPicker({ onSelect, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GifResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const search = useCallback(async (q: string) => {
    setError(false);
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const data = await fetchTenor("search", { q });
      setResults(data);
    } catch {
      setError(true);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  async function loadTrending(tag: string) {
    setQuery(tag);
    setError(false);
    setLoading(true);
    try {
      const data = await fetchTenor("search", { q: tag });
      setResults(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-2xl overflow-hidden" style={{ width: 380 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <p className="font-heading font-bold text-sm" style={{ color: "#173962" }}>Pick a GIF</p>
        <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-400">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-slate-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <Input
            className="pl-8 h-9 text-sm border-slate-200 rounded-xl"
            placeholder="Search GIFs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search(query)}
          />
        </div>
      </div>

      {/* Trending chips */}
      {!query && (
        <div className="px-3 py-2 flex flex-wrap gap-1.5 border-b border-slate-100">
          {TRENDING.map((t) => (
            <button key={t} onClick={() => loadTrending(t)}
              className="px-2.5 py-1 rounded-full text-[11px] font-heading font-semibold transition-all hover:scale-105"
              style={{ backgroundColor: "rgba(201,163,75,0.1)", color: "#c9a34b", border: "1px solid rgba(201,163,75,0.25)" }}>
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      <div className="h-64 overflow-y-auto p-2">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#173962", borderTopColor: "transparent" }} />
          </div>
        )}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center px-4">
            <p className="text-sm text-slate-400">Could not load GIFs</p>
            <button onClick={() => search(query)}
              className="text-xs font-heading font-bold hover:opacity-70 transition-opacity"
              style={{ color: "#c9a34b" }}>Try again</button>
          </div>
        )}
        {!loading && !error && results.length === 0 && query && (
          <div className="flex items-center justify-center h-full text-sm text-slate-400">No results for &quot;{query}&quot;</div>
        )}
        {!loading && !error && results.length === 0 && !query && (
          <div className="flex items-center justify-center h-full text-sm text-slate-400">Tap a tag or type to search</div>
        )}
        <div className="grid grid-cols-3 gap-1.5">
          {results.map((gif) => (
            <button key={gif.id} onClick={() => { onSelect(gif.url); onClose(); }}
              className="relative aspect-square rounded-xl overflow-hidden hover:ring-2 transition-all hover:scale-105"
              style={{ "--tw-ring-color": "#c9a34b" } as React.CSSProperties}>
              <Image src={gif.preview} alt={gif.title} fill className="object-cover" unoptimized />
            </button>
          ))}
        </div>
      </div>

      <div className="px-3 py-2 border-t border-slate-100 flex items-center justify-end">
        <p className="text-[10px] text-slate-400 font-heading">Powered by Tenor</p>
      </div>
    </div>
  );
}
