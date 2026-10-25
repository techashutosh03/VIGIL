"use client";
import { useEventStream } from "@/lib/useEventStream";
import { LiveBadge } from "@/components/ui/LiveBadge";

type MediatorEvent = { source: "RB" | "PGRC" | "AI_MEDIATOR"; text: string; ts: string };

function* demoWarRoom(): Generator<MediatorEvent> {
  const script: MediatorEvent[] = [
    { source: "RB", text: "Issued show-cause notice on 12 Mar for infra non-compliance.", ts: "12 Mar" },
    { source: "PGRC", text: "Received grievance on 14 Mar regarding same infra issue — duplicate scope detected.", ts: "14 Mar" },
    { source: "AI_MEDIATOR", text: "Recommending PGRC defer action; RB notice already covers scope. Confidence: 0.91", ts: "now" },
  ];
  let i = 0;
  while (true) {
    yield script[i % script.length];
    i++;
  }
}

export default function WarRoomPanel({ overlapId }: { overlapId: string }) {
  const { events, source } = useEventStream<MediatorEvent>(`/api/v1/overlaps/${overlapId}/stream`, demoWarRoom, 1600);

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-slate-950/70 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wide">
          ⚡ Overlap War Room — Active
        </h3>
        <LiveBadge source={source} />
      </div>
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {events.map((e, i) => (
          <div
            key={i}
            className={`rounded-lg px-4 py-2 text-sm ${
              e.source === "AI_MEDIATOR"
                ? "bg-teal-500/10 border border-teal-500/30 text-teal-200"
                : "bg-slate-800/60 text-slate-300"
            }`}
          >
            <span className="font-mono text-xs opacity-60 mr-2">[{e.source}]</span>
            {e.text}
          </div>
        ))}
        {events.length === 0 && <p className="text-slate-600 text-xs">Waiting for bureau activity…</p>}
      </div>
    </div>
  );
}
