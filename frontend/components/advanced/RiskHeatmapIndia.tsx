"use client";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

const INDIA_TOPOJSON =
  "https://raw.githubusercontent.com/deldersveld/topojson/master/countries/india/india-states.json";

type RiskPoint = { name: string; coordinates: [number, number]; risk: "GREEN" | "AMBER" | "RED" };

export default function RiskHeatmapIndia() {
  const [points, setPoints] = useState<RiskPoint[]>([]);

  useEffect(() => {
    apiGet<RiskPoint[]>("/api/v1/dashboard/risk-map", [
      { name: "ABC Institute of Tech", coordinates: [77.1, 28.6], risk: "RED" },
      { name: "XYZ Engineering College", coordinates: [72.8, 19.0], risk: "AMBER" },
      { name: "PQR Polytechnic", coordinates: [80.2, 13.0], risk: "GREEN" },
    ]).then(setPoints);
  }, []);

  const color = { GREEN: "#14b8a6", AMBER: "#f59e0b", RED: "#ef4444" };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <h3 className="text-sm font-semibold text-teal-400 tracking-wide uppercase mb-3">
        Regional Risk Heatmap — India
      </h3>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 900, center: [82, 22] }}
        width={500}
        height={480}
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
            <circle r={6} fill={color[p.risk]} stroke="#000" strokeWidth={0.5} />
            <text textAnchor="middle" y={-10} fontSize={8} fill="#e2e8f0">
              {p.name}
            </text>
          </Marker>
        ))}
      </ComposableMap>
    </div>
  );
}
