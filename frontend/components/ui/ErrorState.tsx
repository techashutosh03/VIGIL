export function ErrorState({
  message = "Couldn't reach VIGIL backend. Showing cached demo data.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="text-amber-400 text-sm">⚠️</span>
        <p className="text-xs text-amber-300">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs px-3 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 shrink-0"
        >
          Retry
        </button>
      )}
    </div>
  );
}
