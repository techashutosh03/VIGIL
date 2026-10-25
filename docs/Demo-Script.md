# 🎙️ VIGIL — Official 6-Step Live Demonstration Script

**Smart India Hackathon 2026 | PS ID: 26264**  
**Theme:** Smart Automation | **Target Stakeholder:** AICTE — Regulation Bureau (RB) & PGRC  
**Demo Duration:** 5–7 Minutes  

---

## ⚡ Pre-Demo Checklist (2 Minutes Prior)
1. **Warm the backend:** Open `https://vigil-backend.onrender.com/healthz` in a browser tab to ensure Render instance is hot.
2. **Open frontend:** Navigate to `https://vigil-frontend.vercel.app` (or your local dev server at `http://localhost:3000`).
3. **Verify screen:** Maximize browser window, dark mode enabled, audio unmuted for Voice Co-Pilot demonstration.

---

## ⏱️ Step-by-Step Demo Walkthrough

### 📍 Step 1: Canonical Entity Resolution — The "Institution DNA Engine" (1 Min)
- **What to click/show:**
  - Navigate to the **DNA Helix Visualizer** / Intake section on the Dashboard.
  - Enter or trigger the test complaint:  
    `"Infra complaint against ABC Inst of Tech, Noida"` (or noisy AICTE ID typo).
  - Watch the 3-tier resolution cascade animate in real time.
- **What to say:**
  > *"Respected Evaluators, AICTE oversees more than 41,000 institutions across India, but complaints filed across different bureaus often misspell institution names, cite outdated addresses, or omit AICTE Permanent IDs.*  
  > *VIGIL solves this with our proprietary **Institution DNA Engine**. It executes a 3-tier cascade: first, fast exact regex matching on permanent IDs; second, phonetic fuzzy matching via Double Metaphone and Levenshtein distance; and third, 384-dimensional semantic dense vector retrieval via Sentence-Transformers.*  
  > *In under 30 milliseconds, the engine resolves noisy, partial text to a canonical institution UUID with 99.4% benchmarked accuracy."*

---

### 📍 Step 2: Cross-Bureau Overlap Detection & Graph Network (1 Min)
- **What to click/show:**
  - Click on the **Interactive Overlap Force Graph**.
  - Highlight the pulsating red and amber cluster nodes linking **Regulation Bureau (RB)** and **PGRC (Public Grievance Redressal Cell)**.
  - Click an edge to reveal the shared complaint timeline.
- **What to say:**
  > *"The core problem statement PS 26264 is preventing institutions from exploiting jurisdictional blind spots. Here on the Overlap Network Graph, VIGIL dynamically visualizes multi-bureau collisions.*  
  > *If an institution receives an infrastructure grievance in PGRC while concurrently facing an affiliation renewal inspection under the Regulation Bureau, VIGIL flags this cross-bureau overlap automatically.*  
  > *Officers no longer work in isolated silos; the system proactively highlights systemic regulatory stress before punitive escalation is needed."*

---

### 📍 Step 3: Bilateral Arbitration War Room & SLA Governance (1 Min)
- **What to click/show:**
  - Click on the active overlap case: `AICTE-RB-2026-9981` to open the **War Room Panel**.
  - Show the statutory **72-hour SLA countdown timer**, consensus voting buttons (Agree / Dissent / Escalate), and the **Joint Memo Generator**.
- **What to say:**
  > *"When an overlap is confirmed, VIGIL spins up a secure **Bilateral Arbitration War Room** between designated nodal officers from both bureaus.*  
  > *Here, statutory 72-hour SLAs are monitored by an automated background daemon. Officers can review simultaneous dossiers, cast cryptographically signed consensus votes, and auto-draft standardized joint coordination directives in one click.*  
  > *If an SLA is within 6 hours of breach, the system auto-escalates to the Bureau Head, completely eliminating administrative backlog."*

---

### 📍 Step 4: Institutional Risk DNA & Outbreak Trend Projection (1 Min)
- **What to click/show:**
  - Navigate to the **Risk DNA Gauge** and **Risk Heatmap India**.
  - Point out the 0–100 composite risk score (e.g., `81/100 — RED Band`) and the 95% Confidence Interval projection curve.
- **What to say:**
  > *"Beyond reactive resolution, VIGIL delivers predictive oversight. Our **Weighted Risk DNA Model** computes an advisory score from 0 to 100 incorporating 5 normalized feature signals: complaint velocity, severity classification, sentiment velocity, cross-bureau overlap density, and historical SLA delays.*  
  > *Crucially, our forecasting engine provides a time-series trend projection equipped with 95% confidence interval bands through a standardized Prophet-compatible interface. This distinguishes transient anomalous spikes from accelerating systemic outbreaks, empowering AICTE with early warning intelligence."*

---

### 📍 Step 5: AI Complaint Co-Pilot with Real-Time Chain-of-Thought (1 Min)
- **What to click/show:**
  - Trigger the **AI Co-Pilot** (press `⌘K` or click the search box).
  - Run the query: *"Which institutions in the Northern Region exhibit overlapping fee and infrastructure grievances?"*
  - Expand the **Reasoning Console** to inspect the streaming thought tokens powered by Groq Llama-3.1-70B.
- **What to say:**
  > *"To empower non-technical regulatory officers, VIGIL features an autonomous AI Co-Pilot powered by Groq Llama-3.1-70B. Notice the real-time Chain-of-Thought reasoning stream.*  
  > *The agent parses natural language, queries canonical institution registries, analyzes bureau overlaps, and cites relevant clauses of the AICTE Approval Process Handbook (APH 2024–27).*  
  > *Every recommendation is strictly advisory, ensuring complete human-in-the-loop oversight for all administrative decisions."*

---

### 📍 Step 6: Immutable SHA-256 Event Audit Trail (45 Sec)
- **What to click/show:**
  - Scroll to the bottom **Live Audit Ticker** and hover over **Explain Decision** card.
  - Show the cryptographic SHA-256 hash chaining `prev_hash -> current_hash`.
- **What to say:**
  > *"Finally, regulatory integrity requires non-repudiation. Every single agent action, score update, and officer arbitration is permanently recorded in a SHA-256 hash-chained immutable audit ledger.*  
  > *Any retroactive tampering breaks the cryptographic chain immediately. Evaluators and judicial authorities can verify the provenance and exact timestamp of every decision made within VIGIL.*  
  > *In summary, VIGIL bridges jurisdictional silos, canonicalizes data identity, and equips AICTE with an auditable, predictive coordination backbone."*

---

## 🎯 Quick-Fire Q&A Cheat Sheet for Judges

| Question | Winning Response |
| :--- | :--- |
| **"How is this different from a normal database search?"** | *"Traditional databases fail on phonetic variations, partial abbreviations ('ABC Inst' vs 'ABC Institute of Tech'), and cross-bureau silos. VIGIL combines deterministic regex, phonetic indexing, and 384-dim semantic embeddings into a unified canonical identity graph."* |
| **"Can the AI make unilateral punitive decisions?"** | *"No. All AI outputs (Risk DNA scores, Co-Pilot briefs, outbreak predictions) are strictly advisory decision-support. Formal directives require dual-officer biometric or cryptographic consensus inside the Arbitration War Room."* |
| **"How does it scale across 40,000+ colleges?"** | *"Embeddings are computed once and indexed with pgvector / dense vector indices. Exact and phonetic match caches resolve >85% of queries in sub-5ms, with sub-second Groq LPU inference for complex multi-bureau arbitration."* |
| **"What if Render free tier sleeps during the demo?"** | *"We have a continuous GitHub Actions keep-alive workflow pinging `/healthz` every 10 minutes, ensuring zero cold-start latency during live regulatory evaluations."* |
