"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { apiPost } from "@/lib/api";

type Stage = {
  stage: string;
  method: string;
  confidence: number;
  status: "pending" | "running" | "done";
};

const STAGE_LABELS = [
  { stage: "exact", method: "AICTE Permanent ID Match" },
  { stage: "fuzzy", method: "RapidFuzz + Double Metaphone" },
  { stage: "semantic", method: "MiniLM-L6-v2 + pgvector (cosine)" },
  { stage: "llm_judge", method: "Groq Llama-3.1-70B Chain-of-Thought" },
];

export default function DNAHelixVisualizer({ complaintText }: { complaintText: string }) {
  const [stages, setStages] = useState<Stage[]>(
    STAGE_LABELS.map((s) => ({ ...s, confidence: 0, status: "pending" }))
  );
  const [running, setRunning] = useState(false);

  async function runResolution() {
    setRunning(true);
    setStages(STAGE_LABELS.map((s) => ({ ...s, confidence: 0, status: "pending" })));

    const result = await apiPost(
      "/api/v1/institutions/resolve",
      { text: complaintText },
      {
        stages: [
          { stage: "exact", confidence: 0 },
          { stage: "fuzzy", confidence: 81.4 },
          { stage: "semantic", confidence: 0.87 },
          { stage: "llm_judge", confidence: 0.94 },
        ],
      }
    );

    for (let i = 0; i < STAGE_LABELS.length; i++) {
      setStages((prev) =>
        prev.map((s, idx) => (idx === i ? { ...s, status: "running" } : s))
      );
      await new Promise((r) => setTimeout(r, 650));
      const matched = result.stages.find((r: any) => r.stage === STAGE_LABELS[i].stage);
      setStages((prev) =>
        prev.map((s, idx) =>
          idx === i
            ? { ...s, status: "done", confidence: matched?.confidence ?? 0 }
            : s
        )
      );
    }
    setRunning(false);
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-teal-400 tracking-wide uppercase">
          Institution DNA Engine — Live Resolution
        </h3>
        <button
          onClick={runResolution}
          disabled={running}
          className="px-4 py-1.5 text-xs font-medium rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white"
        >
          {running ? "Resolving…" : "Run DNA Match"}
        </button>
      </div>

      <div className="relative flex flex-col gap-4">
        {/* Helix spine */}
        <div className="absolute left-5 top-2 bottom-2 w-px bg-gradient-to-b from-blue-500/10 via-teal-400/40 to-blue-500/10" />

        {stages.map((s, i) => (
          <motion.div
            key={s.stage}
            className="relative pl-12 flex items-center gap-4"
            initial={{ opacity: 0.3, x: i % 2 === 0 ? -8 : 8 }}
            animate={{
              opacity: s.status === "pending" ? 0.35 : 1,
              x: 0,
            }}
            transition={{ duration: 0.4 }}
          >
            <motion.span
              className="absolute left-3 w-4 h-4 rounded-full border-2"
              animate={{
                borderColor: s.status === "done" ? "#14b8a6" : s.status === "running" ? "#2563eb" : "#334155",
                backgroundColor: s.status === "done" ? "#14b8a6" : "transparent",
                scale: s.status === "running" ? [1, 1.4, 1] : 1,
              }}
              transition={{ repeat: s.status === "running" ? Infinity : 0, duration: 0.8 }}
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-slate-200">{s.method}</div>
              <div className="text-xs text-slate-500">Stage: {s.stage}</div>
            </div>
            <div className="text-right">
              <span
                className={`text-sm font-mono ${
                  s.status === "done" ? "text-teal-400" : "text-slate-600"
                }`}
              >
                {s.status === "done"
                  ? s.stage === "fuzzy"
                    ? `${s.confidence.toFixed(1)}%`
                    : `${(s.confidence * (s.confidence > 1 ? 1 : 100)).toFixed(1)}${s.confidence > 1 ? "%" : "%"}`
                  : "—"}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
