"use client";
import { useState } from "react";
import { apiGet } from "@/lib/api";

export default function ExplainHoverCard({
  decisionId,
  children,
}: {
  decisionId: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [reasoning, setReasoning] = useState<string | null>(null);

  async function handleEnter() {
    setOpen(true);
    if (reasoning) return;
    const result = await apiGet(`/api/v1/audit/${decisionId}/reasoning`, {
      reasoning:
        "Matched via semantic similarity (0.87) + LLM confirmation (0.94). Both complaints reference 'ABC Institute' with matching address tokens despite differing spellings.",
    });
    setReasoning(result.reasoning);
  }

  return (
    <span
      className="relative inline-block cursor-help border-b border-dashed border-teal-500/50"
      onMouseEnter={handleEnter}
      onMouseLeave={() => setOpen(false)}
    >
      {children}
      {open && (
        <span className="absolute z-50 left-1/2 -translate-x-1/2 top-full mt-2 w-72 rounded-xl border border-slate-700 bg-slate-900 p-3 text-xs text-slate-300 shadow-xl pointer-events-none">
          <strong className="text-teal-400 block mb-1">AI Reasoning</strong>
          {reasoning ?? "Loading…"}
        </span>
      )}
    </span>
  );
}
