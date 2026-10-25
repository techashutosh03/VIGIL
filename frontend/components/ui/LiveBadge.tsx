export function LiveBadge({ source }: { source: "live" | "fallback" | "connecting" }) {
  const config = {
    live: { label: "● LIVE", color: "text-teal-400 bg-teal-500/10 border-teal-500/30" },
    fallback: { label: "● DEMO MODE", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
    connecting: { label: "● CONNECTING", color: "text-slate-400 bg-slate-500/10 border-slate-500/30" },
  }[source];

  return (
    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${config.color}`}>
      {config.label}
    </span>
  );
}
