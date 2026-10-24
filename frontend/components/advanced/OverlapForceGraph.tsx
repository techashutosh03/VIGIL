"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

type GraphNode = { id: string; label: string; type: "institution" | "complaint"; risk?: string };
type GraphLink = { source: string; target: string; bureau?: string };

export default function OverlapForceGraph() {
  const [data, setData] = useState<{ nodes: GraphNode[]; links: GraphLink[] }>({
    nodes: [],
    links: [],
  });

  useEffect(() => {
    apiGet(
      "/api/v1/dashboard/overlap-graph",
      {
        nodes: [
          { id: "inst-1", label: "ABC Institute of Tech", type: "institution", risk: "RED" },
          { id: "c-101", label: "RB Complaint #101", type: "complaint" },
          { id: "c-204", label: "PGRC Complaint #204", type: "complaint" },
          { id: "inst-2", label: "XYZ Engineering College", type: "institution", risk: "AMBER" },
          { id: "c-305", label: "RB Complaint #305", type: "complaint" },
        ] as GraphNode[],
        links: [
          { source: "c-101", target: "inst-1", bureau: "RB" },
          { source: "c-204", target: "inst-1", bureau: "PGRC" },
          { source: "c-305", target: "inst-2", bureau: "RB" },
        ] as GraphLink[],
      }
    ).then(setData);
  }, []);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-2 h-[420px] overflow-hidden">
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
  );
}
