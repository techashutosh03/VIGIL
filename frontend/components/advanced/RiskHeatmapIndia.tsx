"use client";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { useEffect, useState } from "react";
import { apiGetSafe } from "@/lib/api";
import { LoadingCard } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";

const INDIA_TOPOJSON =
  "https://raw.githubusercontent.com/deldersveld/topojson/master/countries/india/india-states.json";

type RiskPoint = { name: string; coordinates: [number, number]; risk: "GREEN" | "AMBER" | "RED" };

export default function RiskHeatmapIndia() {
  const [points, setPoints] = useState<RiskPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"live" | "fallback" | null>(null);

  async function loadMap() {
    setLoading(true);
    const result = await apiGetSafe<RiskPoint[]>("/api/v1/dashboard/risk-map", [
      { name: "ABC Inst of Tech (Noida)", coordinates: [77.36, 28.62], risk: "RED" },
      { name: "XYZ Engineering (Mumbai)", coordinates: [72.86, 19.11], risk: "AMBER" },
      { name: "PQR Polytechnic (Chennai)", coordinates: [80.27, 13.08], risk: "GREEN" },
      { name: "Sahyadri School of Engg (Pune)", coordinates: [73.85, 18.52], risk: "RED" },
      { name: "Shivalik College (Dehradun)", coordinates: [78.03, 30.31], risk: "RED" },
      { name: "Vindhya Inst (Bhopal)", coordinates: [77.41, 23.25], risk: "RED" },
      { name: "Karnataka Polytechnic (Bengaluru)", coordinates: [77.59, 12.92], risk: "AMBER" },
    ]);
    setPoints(result.data);
    setSource(result.source);
    setLoading(false);
  }

  useEffect(() => {
    loadMap();
  }, []);

  const color = { GREEN: "#14b8a6", AMBER: "#f59e0b", RED: "#ef4444" };

  if (loading) return <LoadingCard />;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
      {source === "fallback" && (
        <ErrorState message="Backend unreachable — showing spatial seed markers." onRetry={loadMap} />
      )}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-teal-400 tracking-wide uppercase">
          Regional Risk Heatmap — India
        </h3>
        <span className="text-[10px] text-slate-500 font-mono">HDBSCAN Spatial Cluster</span>
      </div>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 800, center: [80, 22] }}
        width={450}
        height={380}
      >
        <Geographies geography={INDIA_TOPOJSON}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#0f172a"
                stroke="#1e293b"
                strokeWidth={0.5}
              />
            ))
          }
        </Geographies>
        {points.map((p) => (
          <Marker key={p.name} coordinates={p.coordinates}>
            <circle r={5} fill={color[p.risk]} stroke="#000" strokeWidth={0.5} />
            <text textAnchor="middle" y={-8} fontSize={7} fill="#e2e8f0" fontWeight="500">
              {p.name.split(" ")[0]}
            </text>
          </Marker>
        ))}
      </ComposableMap>
    </div>
  );
}
