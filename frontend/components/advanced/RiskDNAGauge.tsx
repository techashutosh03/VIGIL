"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { apiGetSafe } from "@/lib/api";
import { LoadingCard } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";

type RiskData = { score: number; frequency: number; severity: number; overlap: number; ageing: number };

export default function RiskDNAGauge({ institutionId = "inst-1" }: { institutionId?: string }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<RiskData | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  async function load() {
    setLoading(true);
    const result = await apiGetSafe<RiskData>(
      `/api/v1/dashboard/risk-score/${institutionId}`,
      { score: 82, frequency: 38, severity: 22, overlap: 20, ageing: 2 }
    );
    setData(result.data);
    setIsFallback(result.source === "fallback");
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [institutionId]);

  if (loading) return <LoadingCard />;
  if (!data) return <div className="text-slate-500 text-xs">Risk data unavailable</div>;

  const rawScore = typeof data.score === "number" && !isNaN(data.score) ? data.score : 0;
  const clampedScore = Math.max(0, Math.min(100, rawScore));
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedScore / 100) * circumference;
  const color = clampedScore >= 75 ? "#ef4444" : clampedScore >= 40 ? "#f59e0b" : "#14b8a6";

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 flex flex-col items-center gap-2" role="meter" aria-valuenow={clampedScore}>
      {isFallback && <ErrorState message="Live risk score unavailable — showing demo value." onRetry={load} />}
      <svg width={140} height={140} viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} stroke="#1e293b" strokeWidth="10" fill="none" />
        <motion.circle
          cx="70"
          cy="70"
          r={radius}
          stroke={color}
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          transform="rotate(-90 70 70)"
        />
        <text x="70" y="75" textAnchor="middle" fontSize="26" fill="#e2e8f0" fontWeight="600">
          {clampedScore}
        </text>
      </svg>
      <span className="text-xs uppercase tracking-wide text-slate-500">Institution Risk DNA</span>
      <div className="flex gap-3 text-[10px] text-slate-600 font-mono">
        <span>F:{typeof data.frequency === "number" ? data.frequency : 0}</span>
        <span>S:{typeof data.severity === "number" ? data.severity : 0}</span>
        <span>O:{typeof data.overlap === "number" ? data.overlap : 0}</span>
        <span>A:{typeof data.ageing === "number" ? data.ageing : 0}</span>
      </div>
    </div>
  );
}
