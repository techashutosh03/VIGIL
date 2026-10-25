"use client";
import { useEventStream } from "@/lib/useEventStream";
import { LiveBadge } from "@/components/ui/LiveBadge";

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
  const { events: entries, source } = useEventStream<AuditEntry>("/api/v1/audit/stream", demoAudit, 2200);

  return (
    <div className="w-full border-t border-slate-800 bg-black/90 py-2">
      <div className="flex items-center justify-between px-4 mb-1">
        <span className="text-[10px] text-slate-600 uppercase tracking-wide">Hash-Chained Audit Ledger</span>
        <LiveBadge source={source} />
      </div>
      <div className="overflow-hidden">
        <div className="flex gap-8 animate-marquee whitespace-nowrap text-xs font-mono text-slate-500">
          {entries.map((e, i) => (
            <span key={i}>
              <span className="text-teal-400">{e.action}</span>{" "}
              <span className="text-slate-600">hash:{e.hash}</span>{" "}
              <span className="text-slate-700">← prev:{e.prevHash}</span>
            </span>
          ))}
          {entries.length === 0 && <span className="text-slate-700">Awaiting ledger entries…</span>}
        </div>
      </div>
    </div>
  );
}
