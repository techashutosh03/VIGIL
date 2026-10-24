"use client";
import { Command } from "cmdk";
import { useEffect, useState } from "react";
import { apiPost } from "@/lib/api";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    if (!query.trim()) return;
    setLoading(true);
    setAnswer(null);
    const result = await apiPost(
      "/api/v1/copilot/query",
      { query },
      {
        answer:
          "Found 4 institutions flagged RED in Maharashtra region, driven primarily by 3 unresolved PGRC complaints exceeding SLA by 14+ days.",
      }
    );
    setAnswer(result.answer);
    setLoading(false);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-28 bg-black/60 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Command>
          <div className="flex items-center gap-2 border-b border-slate-800 px-4">
            <span className="text-teal-400 text-sm">⌘K</span>
            <Command.Input
              autoFocus
              value={query}
              onValueChange={setQuery}
              placeholder="Ask VIGIL: e.g. 'show institutions flagged RED in Maharashtra'"
              className="w-full bg-transparent py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500"
              onKeyDown={(e) => e.key === "Enter" && ask()}
            />
          </div>
          <div className="p-4 min-h-[80px] text-sm">
            {loading && <p className="text-slate-500 animate-pulse">VIGIL Co-Pilot is thinking…</p>}
            {answer && <p className="text-slate-200 leading-relaxed">{answer}</p>}
            {!loading && !answer && (
              <p className="text-slate-600 text-xs">Press Enter to query the AI Co-Pilot agent.</p>
            )}
          </div>
        </Command>
      </div>
    </div>
  );
}
