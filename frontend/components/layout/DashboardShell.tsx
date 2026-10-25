"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: "🏠" },
  { id: "dna", label: "Institution DNA Engine", icon: "🧬" },
  { id: "overlap", label: "Overlap & War Room", icon: "🕸️" },
  { id: "risk", label: "Risk DNA & Forecast", icon: "📊" },
  { id: "workflow", label: "Workflow & SLA", icon: "⏱️" },
  { id: "copilot", label: "AI Co-Pilot", icon: "🤖" },
  { id: "audit", label: "Audit & Governance", icon: "🔐" },
];

export default function DashboardShell({
  children,
  activeSection,
  onSectionChange,
}: {
  children: React.ReactNode;
  activeSection: string;
  onSectionChange: (id: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      {/* Sidebar */}
      <aside
        className={`${collapsed ? "w-16" : "w-64"} transition-all duration-300 border-r border-slate-800 bg-slate-900/50 flex flex-col shrink-0`}
      >
        <div className="flex items-center justify-between px-4 py-5 border-b border-slate-800">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-blue-600 to-teal-400 flex items-center justify-center font-bold text-white text-xs">
                V
              </div>
              <span className="font-bold text-teal-400 tracking-wide">VIGIL</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-500 hover:text-white text-sm p-1 rounded hover:bg-slate-800"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? "→" : "←"}
          </button>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                activeSection === item.id
                  ? "bg-blue-600/20 text-blue-300 border border-blue-500/30 font-medium"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          ))}
        </nav>

        {!collapsed && (
          <div className="px-4 py-3 border-t border-slate-800 text-xs text-slate-500 flex flex-col gap-1">
            <span className="font-medium text-slate-300">VIGIL Decision Support System</span>
            <span>AICTE Regulation Bureau & PGRC</span>
          </div>
        )}
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="p-6 max-w-7xl mx-auto w-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
