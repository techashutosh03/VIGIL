# VIGIL — Technical Architecture & Implementation Documentation
**Smart India Hackathon 2026 | Problem Statement ID: 26264**  
**Theme:** Smart Automation | **Stakeholder:** AICTE — Regulation Bureau (RB) & PGRC  
**Team:** Clutch Crew (Team ID: 197488)  

---

## 1. Executive Summary & Problem Context
AICTE regulates over 41,000 technical education institutions across India through multiple operational bureaus:
- **Regulation Bureau (RB):** Compliance monitoring, periodic inspection, infrastructure norms, and disciplinary sanctions.
- **Public Grievance Redressal Cell (PGRC):** Student, faculty, and stakeholder grievances, fee disputes, and administrative complaints.
- **Approvals Bureau:** Annual Extension of Approvals (EoA), course expansions, and affiliation validations.

Historically, complaint and compliance workflows operate in disjointed databases. Discrepant naming conventions, address changes, and lack of canonical linkage enable fraudulent institutions to engage in **regulatory arbitrage** (e.g., resolving a PGRC complaint without RB awareness, or masking infrastructure deficits during EoA inspections).

VIGIL provides an agentic, multi-bureau intelligence and coordination platform that unifies institutional identity, proactively surfaces jurisdictional overlaps, automates bilateral dispute war rooms, and generates predictive early-warning signals.

---

## 2. System Architecture & Component Topology
```
┌────────────────────────────────────────────────────────────────────────┐
│                        VIGIL Platform Topography                       │
└────────────────────────────────────────────────────────────────────────┘
       ▲                                                 ▲
       │                                                 │
┌───────────────┐                                 ┌───────────────┐
│ Next.js 14    │                                 │ Interactive   │
│ Web Portal    │                                 │ Landing Demo  │
│ (Officers)    │                                 │ (Public)      │
└───────┬───────┘                                 └───────┬───────┘
        │                                                 │
        ▼                                                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   FastAPI Asynchronous Gateway Engine                  │
│       • Dynamic CORS Control       • SLA Background Daemon             │
└────────────────────────────────────────────────────────────────────────┘
        │                      │                         │
        ▼                      ▼                         ▼
┌───────────────┐      ┌───────────────┐         ┌───────────────┐
│ Institution   │      │ Overlap       │         │ AI Complaint  │
│ DNA Engine    │      │ Detection &   │         │ Co-Pilot      │
│ (3-Tier Match)│      │ War Room      │         │ (Groq 70B)    │
└───────┬───────┘      └───────┬───────┘         └───────┬───────┘
        │                      │                         │
        ▼                      ▼                         ▼
┌────────────────────────────────────────────────────────────────────────┐
│                Predictive Risk & Outbreak Engine (§4)                  │
│       • Weighted Risk DNA Scoring (0–100)                              │
│       • Time-Series Trend Projection with 95% Confidence Intervals     │
│         (Prophet-Compatible Forecasting Interface)                     │
│       • HDBSCAN Geographic & Spatial Corridor Outbreak Clustering      │
└────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Immutable Provenance Ledger (§7)                     │
│       • SHA-256 Cryptographic Hash Chaining                            │
│       • Tamper-Evident Event Sourcing & Audit Ticker                   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Institution DNA Engine (Canonical Entity Resolution)
To reconcile non-standard institution references across disparate complaints:
1. **Tier 1 (Exact Match):** Regular expression extraction of AICTE Permanent IDs (`1-[0-9]{10}`) with sub-millisecond cache resolution.
2. **Tier 2 (Phonetic & Fuzzy Matching):**
   - Double Metaphone phonetic encoding for transliterated Hindi/regional college names.
   - Levenshtein string distance scoring across institute names and city names.
3. **Tier 3 (Semantic Vector Retrieval):**
   - 384-dimensional dense embeddings generated via `sentence-transformers/all-MiniLM-L6-v2`.
   - Cosine similarity thresholding (`>= 0.70` ambiguous review, `>= 0.85` automated linkage).

---

## 4. Predictive Risk DNA & Time-Series Trend Projection
The **Risk DNA Engine** calculates an advisory score ($0 \le S \le 100$) reflecting institutional vulnerability across 5 normalized dimensions:
1. **Complaint Frequency (60d window):** Weight $0.25$
2. **Classified Severity:** Weight $0.25$
3. **Sentiment Velocity:** Weight $0.15$
4. **Cross-Bureau Overlap Density:** Weight $0.20$
5. **Resolution Delay vs 72h Statutory SLA:** Weight $0.15$

### §4.1 Time-Series Trend Projection
> **Time-series trend projection with 95% confidence interval bands (Prophet-compatible forecasting interface), enabling future upgrade to full Prophet/ARIMA models without architecture changes.**

The engine projects 30-day incoming grievance velocity using empirical baseline regression combined with weekly cyclical seasonality components:
$$y(t) = \hat{\beta}_0 + \hat{\beta}_1 t + A \sin\left(\frac{2\pi t}{7}\right) \pm 1.96 \cdot \sigma_{\text{residual}}$$
Where:
- $\hat{\beta}_0, \hat{\beta}_1$ are fitted on 90-day trailing complaint volume.
- $\pm 1.96 \cdot \sigma_{\text{residual}}$ provides the two-tailed 95% confidence interval bounds.
- Distinguishes isolated transient spikes from accelerating systemic grievance outbreaks.

---

## 5. Cross-Bureau Overlap Detection & Arbitration War Room
When complaints targeting the same canonical institution are identified across different bureaus:
1. **Automated Collision Flagging:** Nodes and relationship edges are generated for the live D3/Three.js Overlap Force Graph.
2. **Bilateral Arbitration War Room:** A shared workspace is instantiated for designated Regulation Bureau and PGRC nodal officers.
3. **72-Hour SLA Daemon:** A non-blocking asynchronous task audits pending arbitrations every 300 seconds, escalating cases exceeding statutory thresholds.
4. **Joint Directive Synthesis:** Groq Llama-3.1-70B synthesizes cross-bureau evidence and drafts formal directives adhering to AICTE Approval Process Handbook (APH 2024–27).

---

## 6. AI Complaint Co-Pilot & Llama-3.1 Reasoning Engine
- **Model:** Groq-hosted Llama-3.1-70B running on ultra-low latency LPU hardware.
- **Chain-of-Thought Streaming:** Generates structured `<thought>` reasoning blocks prior to outputting actionable answers.
- **Context Injection:** Ingests canonical metadata, historical complaint dossiers, and regulatory rulebooks.
- **Human-in-the-Loop Safeguard:** All AI generated recommendations are strictly advisory; executive punitive sanctions require multi-officer sign-off.

---

## 7. Governance, Verification & Cryptographic Provenance
### §7.1 Immutable Hash-Chained Audit Ledger
Every state transition (complaint ingestion, DNA resolution, risk recalculation, SLA escalation, and officer voting) is recorded in an append-only cryptographic ledger:
$$\text{Hash}_i = \text{SHA-256}\left(\text{Hash}_{i-1} \parallel \text{Timestamp} \parallel \text{Event Payload} \parallel \text{Actor ID}\right)$$
- Guarantees complete non-repudiation and auditability during parliamentary inquiries or judicial reviews.
- Any attempt to retroactively modify scores or bypass regulatory oversight invalidates downstream hashes.

### §7.2 Verification & Smoke Testing
All endpoints and data structures are verified through automated test suites:
- `backend/tests/test_api_endpoints.py`: Verifies HTTP status codes and payloads for all 7 routers.
- `backend/tests/test_matcher.py`: Validates phonetic and token distance accuracy.
- `backend/tests/test_predictive_risk.py`: Validates Risk DNA formulas and 95% CI forecast ranges.
- `mock-data/verify_live_seed.py`: Verifies real UUID propagation against live Supabase instances.
- `scripts/smoke_test.py`: Full synthetic transaction smoke test for live deployed environments.
