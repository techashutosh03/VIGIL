"use client";
import DNAHelixVisualizer from "@/components/advanced/DNAHelixVisualizer";
import OverlapForceGraph from "@/components/advanced/OverlapForceGraph";
import WarRoomPanel from "@/components/advanced/WarRoomPanel";
import RiskDNAGauge from "@/components/advanced/RiskDNAGauge";
import ReasoningConsole from "@/components/advanced/ReasoningConsole";
import RiskHeatmapIndia from "@/components/advanced/RiskHeatmapIndia";
import AuditTicker from "@/components/advanced/AuditTicker";
import VoiceCoPilot from "@/components/advanced/VoiceCoPilot";
import ExplainHoverCard from "@/components/advanced/ExplainHoverCard";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-teal-400 flex items-center justify-center font-bold text-white shadow-lg shadow-teal-500/20">
            V
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                VIGIL
              </h1>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 font-semibold">
                AICTE Co-Pilot Live
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Agentic Multi-Bureau Coordination Platform &bull; PS 26264
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-1.5">
            <span>Ask Co-Pilot</span>
            <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-700 text-teal-300 rounded font-mono">⌘K</kbd>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-slate-300 font-medium">Neural Orchestrator Active</span>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="p-6 space-y-6 max-w-7xl mx-auto w-full flex-1">
        {/* Metric Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <span className="text-xs text-slate-400">Canonical Institutions</span>
            <div className="text-2xl font-bold text-slate-100 mt-1">41,280</div>
            <span className="text-[11px] text-teal-400">99.4% resolution accuracy</span>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <span className="text-xs text-slate-400">Active Overlaps Detected</span>
            <div className="text-2xl font-bold text-amber-400 mt-1">14</div>
            <span className="text-[11px] text-amber-300/80">RB &bull; PGRC &bull; Approvals</span>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <span className="text-xs text-slate-400">Avg Arbitration Time</span>
            <div className="text-2xl font-bold text-teal-400 mt-1">640 ms</div>
            <span className="text-[11px] text-teal-300/80">Groq Llama-3.1 70B</span>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <span className="text-xs text-slate-400">Audit Trail Security</span>
            <div className="text-2xl font-bold text-blue-400 mt-1">SHA-256</div>
            <span className="text-[11px] text-blue-300/80">Immutable hash chain</span>
          </div>
        </div>

        {/* 10 Advanced Feature Modules */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DNAHelixVisualizer complaintText="Infra complaint against ABC Institute of Technology" />
          <OverlapForceGraph />
          <WarRoomPanel overlapId="demo-overlap-1" />
          <ReasoningConsole />
          <RiskHeatmapIndia />
          <div className="flex items-center justify-around rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
            <RiskDNAGauge score={82} />
            <VoiceCoPilot />
          </div>
        </div>

        <div className="rounded-xl border border-slate-800/80 bg-slate-900/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-slate-400">
          <div>
            This decision was auto-linked{" "}
            <ExplainHoverCard decisionId="log-9981">
              by the Institution DNA Engine
            </ExplainHoverCard>
            . Hover to inspect Groq Llama-3.1-70B Chain-of-Thought provenance.
          </div>
          <div className="text-xs font-mono text-slate-500">
            Case ID: AICTE-RB-2026-9981
          </div>
        </div>
      </main>

      {/* Ticker at the bottom */}
      <footer className="w-full">
        <AuditTicker />
      </footer>
    </div>
  );
}
