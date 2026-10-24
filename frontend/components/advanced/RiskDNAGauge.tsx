"use client";
import { motion } from "framer-motion";

export default function RiskDNAGauge({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? "#ef4444" : score >= 40 ? "#f59e0b" : "#14b8a6";

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="140" height="140" viewBox="0 0 140 140">
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
          {score}
        </text>
      </svg>
      <span className="text-xs uppercase tracking-wide text-slate-500">Institution Risk DNA</span>
    </div>
  );
}
