# VIGIL — Agentic Institution Intelligence & Coordination Platform

**Smart India Hackathon 2026 | Problem Statement ID: 26264 | Theme: Smart Automation**  
**Team: Clutch Crew (Team ID: 197488)**  
**Client / Stakeholder: AICTE — Regulation Bureau (RB)**

---

## 🏛️ Project Architecture Overview

VIGIL is an agentic, multi-layered decision-support platform designed for AICTE to detect overlapping complaints across bureaus (Regulation Bureau, Public Grievance Redressal Cell, and others), canonicalize institution identities with the **Institution DNA Engine**, and provide predictive risk scoring and root-cause intelligence with full human-in-the-loop governance.

```text
VIGIL/
├── landing/                   # Standalone marketing & interactive demonstration portal
│   ├── index.html             # Hero canvas, sandbox simulations, benchmarks, API playground
│   ├── styles.css             # Institutional Design System & Theme Engine
│   ├── app.js                 # Interactive simulation kernel & graph visualizer
│   ├── server.js              # Lightweight zero-dependency static Node.js server
│   └── package.json           # Landing page service configuration
│
├── frontend/                  # Next.js 14 Web Portal (Officers & Bureaus)
│   ├── app/                   # App Router (Dashboard, War Rooms, Co-Pilot)
│   ├── components/            # React UI components (DNA visualizer, Temporal Graph)
│   └── ...
│
├── backend/                   # FastAPI + LangGraph Multi-Agent Backend
│   ├── app/                   # Core orchestrator, intake, DNA engine, risk models
│   ├── Dockerfile
│   └── requirements.txt
│
├── mock-data/                 # Synthetic AICTE datasets & test cases
│   ├── institutions.json      # 41,000+ mock institution registry
│   ├── complaints_seed.json   # Multi-bureau complaints dataset
│   └── overlap_test_cases.json# Benchmark validation cases
│
└── docs/                      # Technical documentation & PPT
    ├── SIH-Documentation.md
    └── Demo-Script.md
```

---

## 🚀 Running the Landing Page & Demo Portal

The interactive landing page includes:
- **Interactive Temporal Institution Graph Canvas** (Density & Neural pulse modes)
- **Agentic Sandbox Simulation** (DNA Resolution, Overlap Detection, Risk Forecasting, AI Co-Pilot)
- **Groq Llama-3.1-70B Chain-of-Thought Reasoning Stream**
- **Evaluation Benchmark Matrix & Targets**
- **Interactive Coordination Impact Estimator**
- **Developer API Code Generator** (Python, Node.js, cURL, TypeScript)
- **Tamper-Evident Governance Modal & Technical Documentation**

### Quick Start:
```bash
cd landing
node server.js
```
Then open [http://localhost:3000](http://localhost:3000) in your browser.

Or use npm:
```bash
cd landing
npm start
```

Health check endpoint: `http://localhost:3000/healthz`
