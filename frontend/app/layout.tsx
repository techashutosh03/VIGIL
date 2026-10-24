import type { Metadata } from "next";
import "./globals.css";
import CommandPalette from "@/components/advanced/CommandPalette";

export const metadata: Metadata = {
  title: "VIGIL | Agentic Institution Intelligence & Multi-Bureau Coordination",
  description: "AICTE Decision-Support & Coordination Platform for Regulation Bureau (RB) and PGRC",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-teal-500/20 selection:text-teal-300">
        <CommandPalette />
        {children}
      </body>
    </html>
  );
}
