"use client";
import { useEventStream } from "@/lib/useEventStream";

type AuditEntry = { action: string; hash: string; prevHash: string };

function* demoAudit(): Generator<AuditEntry> {
  let prev = "0000...a1f3";
  const actions = [
    "INSTITUTION_MATCHED",
    "OVERLAP_DETECTED",
    "RISK_SCORE_UPDATED",
    "COMPLAINT_ROUTED",
    "HUMAN_REVIEW_APPROVED",
  ];
  let i = 0;
  while (true) {
    const hash = Math.random().toString(16).slice(2, 10) + "...";
    const entry = { action: actions[i % actions.length], hash, prevHash: prev };
    prev = hash;
    yield entry;
    i++;
  }
}

export default function AuditTicker() {
  const entries = useEventStream<AuditEntry>("/api/v1/audit/stream", demoAudit, 2200);

  return (
    <div className="w-full overflow-hidden border-t border-slate-800 bg-black/90 py-2">
      <div className="flex gap-8 animate-marquee whitespace-nowrap text-xs font-mono text-slate-500">
        {entries.map((e, i) => (
          <span key={i}>
            <span className="text-teal-400">{e.action}</span>{" "}
            <span className="text-slate-600">hash:{e.hash}</span>{" "}
            <span className="text-slate-700">← prev:{e.prevHash}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
