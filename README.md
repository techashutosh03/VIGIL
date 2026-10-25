# VIGIL — Agentic Institution Intelligence & Coordination Platform

**Smart India Hackathon 2026 · Problem Statement 26264**  
**Team:** Clutch Crew (Team ID: 197488) · **Organization:** AICTE · **Theme:** Smart Automation

> Centralized, AI-assisted tracking of institution-related complaints across AICTE bureaus
> (Regulation Bureau, PGRC, Approvals) — resolving duplicate/overlapping cases through a
> 4-stage Institution DNA matching engine, with full human-in-the-loop governance.

---

## 🎯 Problem

AICTE complaints against the same institution are handled independently by different
bureaus (RB, PGRC, etc.) with no centralized tracking — causing duplicated investigations,
conflicting actions, and no visibility into cross-bureau overlap.

## 💡 Solution

VIGIL introduces the **Institution DNA Engine** — a 4-stage hybrid identity-resolution
pipeline (Exact ID → Fuzzy/Phonetic → Semantic Vector → LLM Judge) that canonicalizes
institution identities across bureaus despite inconsistent names, IDs, or descriptions —
then layers real-time overlap detection, risk scoring, SLA tracking, and an AI Co-Pilot
on top, all governed by mandatory human review below 0.85 confidence.

## 🏗️ Architecture

```text
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Intake     │────▶│  DNA Engine       │────▶│  Graph & Overlap │
│   Agent      │     │  (4-stage match)  │     │  Orchestrator    │
└─────────────┘     └──────────────────┘     └─────────────────┘
                                                        │
      ┌─────────────────────────────────────────────────┘
      ▼
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Risk &      │     │  Workflow &       │     │  Analytics &     │
│  Predictive  │     │  SLA Agent        │     │  Co-Pilot        │
└─────────────┘     └──────────────────┘     └─────────────────┘
      │                                                 │
      └─────────────────┬───────────────────────────────┘
                         ▼
              SHA-256 Hash-Chained Audit Log
           (All decisions, human-reviewable, tamper-evident)
```

## 🧬 Core Feature: Institution DNA Engine

| Stage | Method | Confidence Trigger |
|---|---|---|
| 1 | Exact AICTE Permanent ID match | 100% if found |
| 2 | RapidFuzz (token-sort + partial) + Double Metaphone phonetic | >75 combined score |
| 3 | Sentence-Transformers (`all-MiniLM-L6-v2`) + pgvector cosine similarity | >0.80 |
| 4 | Groq Llama-3.1-70B Chain-of-Thought LLM Judge | Triggered only in 0.70–0.92 ambiguous zone |

Confidence < 0.85 → **mandatory human review**. AI never has final authority.

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, Framer Motion, Cytoscape.js |
| Backend | FastAPI (Python), LangGraph-style agent orchestration |
| AI/ML | Sentence-Transformers, Groq (Llama-3.1-70B), RapidFuzz, Metaphone, Prophet (with graceful fallback) |
| Database | PostgreSQL + pgvector (Supabase) |
| Deployment | Vercel (frontend) · Render (backend) · Supabase (DB) |

## 🚀 Getting Started

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # fill in SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GROQ_API_KEY
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

### Seed mock data
```bash
cd mock-data
python3 seed_supabase.py
```

### Run tests
```bash
cd backend
python3 -m unittest discover tests
```

## 📊 Key Metrics (measured on synthetic test data)

| Metric | Target |
|---|---|
| Institution matching accuracy | ≥92% |
| Overlap detection precision | ≥88% |
| False positive rate | <10% |
| Manual review reduction | ≥60% |
| SLA alert timeliness | <30 sec |

> **Honesty note:** These metrics are measured against our own synthetic test cases, not
> validated production AICTE data. See [`docs/Judge-QA-Prep.md`](docs/Judge-QA-Prep.md) for
> full scope transparency.

## 📁 Project Structure

```text
vigil-sih-26264/
├── frontend/        # Next.js dashboard → Vercel
├── backend/         # FastAPI + agents → Render
├── mock-data/       # Seed institutions/complaints + Supabase loader
├── docs/            # Technical docs, demo script, judge Q&A
└── landing/         # Marketing/demo landing page
```

## 📄 Documentation

- [Full Technical Documentation](docs/SIH-Documentation.md)
- [Demo Script](docs/Demo-Script.md)
- [Judge Q&A Prep](docs/Judge-QA-Prep.md)

## 👥 Team

**Clutch Crew** — SIH 2026, Team ID 197488

## 📜 License

MIT — see [LICENSE](LICENSE)
