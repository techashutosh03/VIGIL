"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { apiGetSafe } from "@/lib/api";
import { LoadingCard } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

type GraphNode = { id: string; label: string; type: "institution" | "complaint"; risk?: string };
type GraphLink = { source: string; target: string; bureau?: string };

export default function OverlapForceGraph() {
  const [data, setData] = useState<{ nodes: GraphNode[]; links: GraphLink[] }>({
    nodes: [],
    links: [],
  });
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"live" | "fallback" | null>(null);

  async function loadGraph() {
    setLoading(true);
    const result = await apiGetSafe(
      "/api/v1/dashboard/overlap-graph",
      {
        nodes: [
          { id: "inst-1", label: "ABC Institute of Tech", type: "institution", risk: "RED" },
          { id: "c-101", label: "RB Complaint #101", type: "complaint" },
          { id: "c-102", label: "PGRC Complaint #102", type: "complaint" },
          { id: "c-103", label: "Approvals Complaint #103", type: "complaint" },
          { id: "inst-2", label: "XYZ Engineering College", type: "institution", risk: "AMBER" },
          { id: "c-201", label: "RB Complaint #201", type: "complaint" },
          { id: "c-202", label: "PGRC Complaint #202", type: "complaint" },
          { id: "inst-6", label: "Sahyadri School of Engineering", type: "institution", risk: "RED" },
          { id: "c-601", label: "RB Complaint #601", type: "complaint" },
          { id: "c-602", label: "PGRC Complaint #602", type: "complaint" },
          { id: "c-603", label: "Approvals Complaint #603", type: "complaint" },
        ] as GraphNode[],
        links: [
          { source: "c-101", target: "inst-1", bureau: "RB" },
          { source: "c-102", target: "inst-1", bureau: "PGRC" },
          { source: "c-103", target: "inst-1", bureau: "Approvals" },
          { source: "c-201", target: "inst-2", bureau: "RB" },
          { source: "c-202", target: "inst-2", bureau: "PGRC" },
          { source: "c-601", target: "inst-6", bureau: "RB" },
          { source: "c-602", target: "inst-6", bureau: "PGRC" },
          { source: "c-603", target: "inst-6", bureau: "Approvals" },
        ] as GraphLink[],
      }
    );
    setData(result.data);
    setSource(result.source);
    setLoading(false);
  }

  useEffect(() => {
    loadGraph();
  }, []);

  if (loading) return <LoadingCard />;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
      {source === "fallback" && (
        <ErrorState message="Backend unreachable — showing pre-computed 3-bureau overlap graph." onRetry={loadGraph} />
      )}
      <div className="h-[400px] overflow-hidden rounded-xl bg-slate-950">
        <ForceGraph2D
          graphData={data}
          backgroundColor="transparent"
          nodeLabel={(n: any) => `${n.label}${n.risk ? ` — Risk: ${n.risk}` : ""}`}
          nodeColor={(n: any) =>
            n.type === "institution"
              ? n.risk === "RED"
                ? "#ef4444"
                : n.risk === "AMBER"
                ? "#f59e0b"
                : "#14b8a6"
              : "#2563eb"
          }
          linkColor={() => "rgba(56,189,248,0.35)"}
          nodeRelSize={6}
          linkDirectionalParticles={2}
          linkDirectionalParticleColor={() => "#2563eb"}
          linkDirectionalParticleSpeed={0.006}
        />
      </div>
    </div>
  );
}
