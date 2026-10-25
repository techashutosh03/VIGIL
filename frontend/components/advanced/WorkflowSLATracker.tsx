"use client";
import { useState, useEffect } from "react";
import { apiGetSafe, apiPostSafe } from "@/lib/api";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";

interface CaseItem {
  id: string;
  institution: string;
  bureau: string;
  state: string;
  createdAt: string;
  slaDeadline: string;
  actionHistory?: { action: string; by: string; at: string }[];
}

export default function WorkflowSLATracker() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"live" | "fallback" | null>(null);
  const [checkingSla, setCheckingSla] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  async function loadCases() {
    setLoading(true);
    const result = await apiGetSafe<CaseItem[]>("/api/v1/workflow/cases", [
      {
        id: "case-rb-101",
        institution: "ABC Institute of Technology",
        bureau: "RB",
        state: "under-process",
        createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
        slaDeadline: new Date(Date.now() + 36 * 3600 * 1000).toISOString(),
        actionHistory: [{ action: "Show-cause notice served", by: "RB Officer", at: "2026-03-12T10:00:00Z" }]
      },
      {
        id: "case-pgrc-204",
        institution: "ABC Institute of Technology",
        bureau: "PGRC",
        state: "pending",
        createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
        slaDeadline: new Date(Date.now() + 60 * 3600 * 1000).toISOString(),
        actionHistory: [{ action: "Grievance ingested", by: "Citizen Portal", at: "2026-03-14T11:30:00Z" }]
      },
      {
        id: "case-appr-301",
        institution: "Sahyadri School of Engineering",
        bureau: "Approvals",
        state: "escalated",
        createdAt: new Date(Date.now() - 80 * 3600 * 1000).toISOString(),
        slaDeadline: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
        actionHistory: [{ action: "72h SLA Breached — Auto Escalated to Bureau Head", by: "SLA Daemon", at: "2026-03-15T09:00:00Z" }]
      }
    ]);
    setCases(result.data);
    setSource(result.source);
    setLoading(false);
  }

  useEffect(() => {
    loadCases();
  }, []);

  async function runSlaCheck() {
    setCheckingSla(true);
    setActionMsg(null);
    const result = await apiPostSafe<{ escalated_case_ids: string[] }>(
      "/api/v1/workflow/check-sla",
      {},
      { escalated_case_ids: ["c-103", "c-601", "c-1301"] }
    );
    setCheckingSla(false);
    const count = result.data.escalated_case_ids?.length || 0;
    setActionMsg(`SLA Audit complete: evaluated active complaints (${count} cases escalated or confirmed).`);
    loadCases();
  }

  async function transitionCase(id: string, newState: string) {
    await apiPostSafe(
      `/api/v1/workflow/cases/${id}/transition`,
      { new_state: newState, performed_by: "Regulation Nodal Officer" },
      { status: "ok" }
    );
    loadCases();
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 space-y-6">
      {source === "fallback" && (
        <ErrorState message="Backend unreachable — showing local workflow simulation." onRetry={loadCases} />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <span>Statutory 72-Hour SLA Monitor</span>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300">
              Active Daemon
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Auto-escalates multi-bureau disputes nearing breach. Background check runs every 300s.
          </p>
        </div>

        <button
          onClick={runSlaCheck}
          disabled={checkingSla}
          className="px-4 py-2 text-xs font-medium rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white transition flex items-center gap-2 self-start"
        >
          {checkingSla ? (
            <>
              <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Auditing SLAs...</span>
            </>
          ) : (
            <>
              <span>⚡</span>
              <span>Trigger SLA Check</span>
            </>
          )}
        </button>
      </div>

      {actionMsg && (
        <div className="text-xs px-3 py-2 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-300">
          {actionMsg}
        </div>
      )}

      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-medium">
                <th className="pb-3 pl-2">Case ID</th>
                <th className="pb-3">Institution</th>
                <th className="pb-3">Bureau</th>
                <th className="pb-3">State</th>
                <th className="pb-3">SLA Status</th>
                <th className="pb-3 text-right pr-2">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {cases.map((c) => {
                const deadline = new Date(c.slaDeadline).getTime();
                const now = Date.now();
                const diffHours = Math.round((deadline - now) / (1000 * 3600));
                const isBreached = diffHours <= 0 || c.state === "escalated";

                return (
                  <tr key={c.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3 pl-2 font-mono text-slate-300">{c.id}</td>
                    <td className="py-3 font-medium text-slate-200">{c.institution}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          c.bureau === "RB"
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                            : c.bureau === "PGRC"
                            ? "bg-purple-500/10 text-purple-400 border border-purple-500/30"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {c.bureau}
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${
                          c.state === "escalated"
                            ? "bg-red-500/10 text-red-400 border border-red-500/30"
                            : c.state === "under-process"
                            ? "bg-teal-500/10 text-teal-400 border border-teal-500/30"
                            : c.state === "disposed"
                            ? "bg-slate-700 text-slate-300"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {c.state}
                      </span>
                    </td>
                    <td className="py-3">
                      {isBreached ? (
                        <span className="text-red-400 font-semibold flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                          Breached ({Math.abs(diffHours)}h overdue)
                        </span>
                      ) : (
                        <span className="text-teal-400">
                          {diffHours}h remaining
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right pr-2">
                      {c.state !== "disposed" && (
                        <button
                          onClick={() => transitionCase(c.id, c.state === "escalated" ? "disposed" : "under-process")}
                          className="px-2.5 py-1 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                        >
                          {c.state === "escalated" ? "Mark Disposed" : "Advance State"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
