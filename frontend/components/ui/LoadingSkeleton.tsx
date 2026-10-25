export function LoadingSkeleton({ rows = 3, className = "" }: { rows?: number; className?: string }) {
  return (
    <div data-testid="loading-skeleton" className={`animate-pulse space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-4 bg-slate-800 rounded w-full" style={{ width: `${85 - i * 10}%` }} />
      ))}
    </div>
  );
}

export function LoadingCard() {
  return (
    <div data-testid="loading-skeleton" className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 animate-pulse">
      <div className="h-4 w-40 bg-slate-800 rounded mb-4" />
      <div className="space-y-2">
        <div className="h-3 bg-slate-800 rounded w-full" />
        <div className="h-3 bg-slate-800 rounded w-3/4" />
        <div className="h-3 bg-slate-800 rounded w-1/2" />
      </div>
    </div>
  );
}
