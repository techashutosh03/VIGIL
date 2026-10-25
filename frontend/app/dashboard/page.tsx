"use client";
import { useState, useEffect } from "react";
import DashboardShell from "@/components/layout/DashboardShell";

import DNAHelixVisualizer from "@/components/advanced/DNAHelixVisualizer";
import OverlapForceGraph from "@/components/advanced/OverlapForceGraph";
import WarRoomPanel from "@/components/advanced/WarRoomPanel";
import RiskDNAGauge from "@/components/advanced/RiskDNAGauge";
import RiskHeatmapIndia from "@/components/advanced/RiskHeatmapIndia";
import WorkflowSLATracker from "@/components/advanced/WorkflowSLATracker";
import VoiceCoPilot from "@/components/advanced/VoiceCoPilot";
import ReasoningConsole from "@/components/advanced/ReasoningConsole";
import AuditTicker from "@/components/advanced/AuditTicker";
import ExplainHoverCard from "@/components/advanced/ExplainHoverCard";

export default function DashboardPage() {
  const [section, setSection] = useState("overview");

  useEffect(() => {
    function parseQuery() {
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      const sec = params.get("section");
      const bureau = params.get("bureau");

      if (sec && ["overview", "dna", "overlap", "risk", "workflow", "copilot", "audit"].includes(sec)) {
        setSection(sec);
      } else if (bureau) {
        const b = bureau.toUpperCase();
        if (b === "RB") setSection("workflow");
        else if (b === "PGRC") setSection("overlap");
        else if (b === "APPROVALS" || b === "APPROVAL") setSection("dna");
      }
    }

    parseQuery();
    window.addEventListener("popstate", parseQuery);
    return () => window.removeEventListener("popstate", parseQuery);
  }, []);

  return (
    <DashboardShell activeSection={section} onSectionChange={setSection}>

      {section === "overview" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                VIGIL Command Center
              </h1>
              <p className="text-slate-400 text-sm max-w-2xl mt-1">
                Agentic institution intelligence across AICTE bureaus. Press{" "}
                <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-xs text-teal-300 font-mono">⌘K</kbd>{" "}
                anytime to query the AI Co-Pilot.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span className="text-slate-300 font-medium">Neural Orchestrator Active</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Institutions Tracked</div>
              <div className="text-3xl font-bold text-teal-400 mt-2">18</div>
              <div className="text-xs text-slate-500 mt-1">Expanded registry (AICTE North/West/South/East)</div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Active Bureau Overlaps</div>
              <div className="text-3xl font-bold text-amber-400 mt-2">5</div>
              <div className="text-xs text-slate-500 mt-1">RB &bull; PGRC &bull; Approvals Collisions</div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">SLA Critical Cases</div>
              <div className="text-3xl font-bold text-red-400 mt-2">3</div>
              <div className="text-xs text-slate-500 mt-1">Approaching 72h statutory deadline</div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Provenance Security</div>
              <div className="text-3xl font-bold text-blue-400 mt-2">SHA-256</div>
              <div className="text-xs text-slate-500 mt-1">Immutable hash-chained audit ledger</div>
            </div>
          </div>

          {/* Quick links to workflow modules */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <button
              onClick={() => setSection("dna")}
              className="text-left p-4 rounded-xl border border-slate-800 bg-slate-900/20 hover:bg-slate-800/40 transition group"
            >
              <div className="flex items-center gap-2 text-teal-400 font-semibold text-sm">
                <span>🧬</span>
                <span>Institution DNA Engine</span>
                <span className="text-slate-600 group-hover:translate-x-1 transition-transform">→</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Test 4-stage canonical entity matching on noisy complaints.
              </p>
            </button>
            <button
              onClick={() => setSection("overlap")}
              className="text-left p-4 rounded-xl border border-slate-800 bg-slate-900/20 hover:bg-slate-800/40 transition group"
            >
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                <span>🕸️</span>
                <span>Overlap Graph & War Room</span>
                <span className="text-slate-600 group-hover:translate-x-1 transition-transform">→</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Inspect 3-bureau overlap network and bilateral arbitration panel.
              </p>
            </button>
            <button
              onClick={() => setSection("risk")}
              className="text-left p-4 rounded-xl border border-slate-800 bg-slate-900/20 hover:bg-slate-800/40 transition group"
            >
              <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
                <span>📊</span>
                <span>Risk DNA & Forecast</span>
                <span className="text-slate-600 group-hover:translate-x-1 transition-transform">→</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Predictive outbreak trends (95% CI) and HDBSCAN spatial heatmaps.
              </p>
            </button>
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
        </div>
      )}

      {section === "dna" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Institution DNA Engine</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              4-tier canonical identity resolution: Exact Permanent ID &bull; RapidFuzz / Double Metaphone &bull; MiniLM 384-dim Embeddings &bull; Groq Llama-3.1 70B Judge.
            </p>
          </div>
          <DNAHelixVisualizer complaintText="Infra complaint against ABC Inst of Tech, Noida" />
        </div>
      )}

      {section === "overlap" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Cross-Bureau Overlap Graph & War Room</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Interactive collision topology bridging Regulation Bureau, PGRC, and Approvals Bureau.
            </p>
          </div>
          <OverlapForceGraph />
          <WarRoomPanel overlapId="inst-1" />
        </div>
      )}

      {section === "risk" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Risk DNA & Predictive Intelligence</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-signal risk weighting (0–100) and time-series outbreak projection with 95% CI bands.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <RiskDNAGauge institutionId="inst-1" />
            <RiskHeatmapIndia />
          </div>
        </div>
      )}

      {section === "workflow" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Workflow & SLA Governance Agent</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated 72-hour statutory SLA tracking and bilateral case progression.
            </p>
          </div>
          <WorkflowSLATracker />
        </div>
      )}

      {section === "copilot" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">AI Complaint Co-Pilot</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Natural-language regulatory reasoning with real-time Chain-of-Thought token streaming.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <VoiceCoPilot />
            <ReasoningConsole />
          </div>
        </div>
      )}

      {section === "audit" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Immutable Audit Ledger & Provenance</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Cryptographically verified SHA-256 hash-chained event logs for all agent actions and human decisions.
            </p>
          </div>
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/30 p-4 text-sm text-slate-400">
            This decision was auto-linked{" "}
            <ExplainHoverCard decisionId="log-9981">by the Institution DNA Engine</ExplainHoverCard>.
          </div>
          <AuditTicker />
        </div>
      )}
    </DashboardShell>
  );
}
