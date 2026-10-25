"use client";
import { useEventStream } from "@/lib/useEventStream";
import { LiveBadge } from "@/components/ui/LiveBadge";

type LogLine = { agent: string; message: string; level: "info" | "decision" | "warn" };

function* demoLogs(): Generator<LogLine> {
  const lines: LogLine[] = [
    { agent: "IntakeAgent", message: "Normalized complaint #4821 metadata.", level: "info" },
    { agent: "DNAEngine", message: "Fuzzy match score 81.4 → candidate found.", level: "info" },
    { agent: "DNAEngine", message: "Semantic similarity 0.87 — entering ambiguous zone.", level: "warn" },
    { agent: "LLMJudge", message: "Same institution confirmed. Confidence 0.94.", level: "decision" },
    { agent: "Orchestrator", message: "Auto-linked. Routed to Overlap Graph.", level: "decision" },
  ];
  let i = 0;
  while (true) {
    yield lines[i % lines.length];
    i++;
  }
}

export default function ReasoningConsole() {
  const { events: logs, source } = useEventStream<LogLine>("/api/v1/agents/stream", demoLogs, 1100);

  const color = { info: "text-slate-400", decision: "text-teal-400", warn: "text-amber-400" };

  return (
    <div className="rounded-2xl border border-slate-800 bg-black/80 p-4 font-mono text-xs h-72 overflow-y-auto">
      <div className="flex items-center justify-between mb-2 sticky top-0 bg-black/80 pb-1">
        <span className="text-slate-500 uppercase tracking-wide">Agent Reasoning Stream</span>
        <LiveBadge source={source} />
      </div>
      {logs.map((l, i) => (
        <div key={i} className="mb-1">
          <span className="text-blue-500">[{l.agent}]</span>{" "}
          <span className={color[l.level]}>{l.message}</span>
        </div>
      ))}
      <div className="animate-pulse text-slate-600">▌</div>
    </div>
  );
}
