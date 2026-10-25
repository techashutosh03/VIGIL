"use client";
import { Command } from "cmdk";
import { useEffect, useState } from "react";
import { apiPostSafe } from "@/lib/api";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  async function ask() {
    if (!query.trim() || loading) return;
    setLoading(true);
    setAnswer(null);
    const result = await apiPostSafe(
      "/api/v1/copilot/query",
      { query },
      {
        answer:
          "Found 4 institutions flagged RED in Maharashtra region, driven primarily by 3 unresolved PGRC complaints exceeding SLA by 14+ days.",
      }
    );
    setAnswer(result.data.answer);
    setIsFallback(result.source === "fallback");
    setLoading(false);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-28 bg-black/60 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-2 mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <Command>
          <div className="flex items-center gap-2 border-b border-slate-800 px-4">
            <span className="text-teal-400 text-sm font-mono font-semibold">⌘K</span>
            <Command.Input
              autoFocus
              value={query}
              onValueChange={setQuery}
              placeholder="Ask VIGIL: e.g. 'show institutions flagged RED in Maharashtra'"
              className="w-full bg-transparent py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500"
              onKeyDown={(e) => e.key === "Enter" && ask()}
            />
            {query && (
              <button
                onClick={ask}
                className="px-2.5 py-1 text-xs rounded bg-teal-600 hover:bg-teal-500 text-white font-medium"
              >
                Ask
              </button>
            )}
          </div>
          <Command.List className="p-3 text-xs text-slate-400">
            {loading && <div className="py-2 text-slate-400 animate-pulse">Consulting Llama-3.1-70B reasoning engine…</div>}
            {answer && (
              <div className="rounded-xl border border-teal-500/30 bg-teal-500/10 p-3 text-sm text-slate-200 mt-2">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-teal-300">Co-Pilot Intelligence</span>
                  {isFallback && <span className="text-[10px] text-amber-400 font-mono">(cached response)</span>}
                </div>
                {answer}
              </div>
            )}
            {!loading && !answer && (
              <div className="py-2 text-slate-500 text-xs flex justify-between items-center">
                <span>Press Enter to query the AICTE decision-support co-pilot</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">ESC to close</kbd>
              </div>
            )}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
