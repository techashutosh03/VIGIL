# VIGIL — Anticipated Judge Questions & Honest Answers

## Technical Depth

**Q: Is this real AI or just string matching?**
A: Both, layered intentionally. Stage 1-2 (exact ID + RapidFuzz/Metaphone) are deterministic
algorithms — fast, explainable, zero cost. Stage 3 uses real Sentence-Transformers
(all-MiniLM-L6-v2) semantic embeddings with pgvector cosine similarity. Stage 4 invokes
Groq's Llama-3.1-70B as an LLM judge, but ONLY for the 0.70-0.92 ambiguous confidence zone —
not every request. This is a deliberate cost/accuracy tradeoff: cheap deterministic methods
resolve ~70% of cases instantly; AI is reserved for genuinely ambiguous cases.

**Q: What happens if the Groq API is down or rate-limited?**
A: The LLM Judge stage fails gracefully — the system falls back to the semantic similarity
score alone and flags the case for mandatory human review (since confidence can't be
verified), rather than silently guessing. This is logged in the audit trail as
"LLM_JUDGE_UNAVAILABLE" so officials know AI assistance was degraded, not absent.

**Q: Is the forecasting real machine learning?**
A: We use Meta's Prophet library when available (additive time-series model with weekly
seasonality and 95% confidence intervals). If Prophet isn't installed in a given environment,
we automatically fall back to a linear trend-projection model with the same output schema,
clearly labeled via an `engine_used` field in the API response. We never claim Prophet ran
when it didn't — this is enforced in code, not just documentation.

**Q: Why RapidFuzz + Metaphone instead of just embeddings?**
A: Pure semantic embeddings are expensive to run on every request and can miss simple
abbreviation differences (e.g., "Inst." vs "Institute") that a fuzzy string matcher catches
instantly. Layering cheap-to-expensive methods (exact → fuzzy → semantic → LLM) mirrors how
real fraud/entity-resolution systems are built in production (e.g., similar to techniques
used in deduplication systems at scale).

## Data & Scope Honesty

**Q: Is this data real AICTE data?**
A: No — and we're upfront about this. This is a working prototype with realistic synthetic
mock data (18 institutions, 25+ complaints) modeled on plausible AICTE complaint patterns,
not live production data. There is no live integration with AICTE's actual systems,
CPGRAMS, or any government database. That would require official API access/MOUs we don't
have at the prototype stage.

**Q: How would this scale to AICTE's actual 11,000+ institutions?**
A: The architecture is designed for it — pgvector with IVFFlat indexing scales to millions
of vectors; RapidFuzz pre-filtering reduces the candidate pool before expensive semantic
search runs. The main scaling consideration would be LLM Judge cost at volume, which is
why it's gated to only the ambiguous 0.70-0.92 confidence band rather than every request.

## Security & Trust

**Q: Is the authentication real?**
A: RBAC and JWT scaffolding exists in the codebase (`core/security.py`) and is functional,
but for demo convenience we currently run with a dev-mode bypass when no token is present.
In a production deployment this bypass would be removed and all routes would require valid
officer JWTs tied to roles (RB officer, PGRC officer, admin).

**Q: How tamper-evident is the audit log, really?**
A: Every agent action and human decision writes a SHA-256 hash of its payload + the previous
entry's hash, forming a genuine hash chain (similar structure to blockchain, without the
distributed consensus overhead we don't need for a single-institution audit trail). Altering
any past entry breaks the hash chain verifiably — we don't claim blockchain, because that
would be dishonest; this is a hash-chained ledger, which is the correct technical term.

**Q: Can officials actually override AI decisions?**
A: Yes — the `/api/v1/institutions/override` endpoint allows a human officer to approve or
reject an AI match/decision. This write is itself logged to the same hash chain with the
officer's identity and reasoning, so overrides are auditable too, not silent.

## Architecture & Design Decisions

**Q: Why 6 separate agents instead of one big model?**
A: Separation of concerns and failure isolation. If the Risk Predictive agent fails (e.g.
insufficient data for forecasting), the DNA Engine and Workflow agents keep functioning
independently. It also matches how AICTE's real bureaus are organizationally separated —
each agent's boundary mirrors a real regulatory function.

**Q: Why FastAPI + Next.js instead of a simpler stack?**
A: FastAPI gives us async support needed for LLM calls and SSE streaming without blocking;
Next.js App Router gives server components for fast initial loads plus client components
for the interactive visualizations (graphs, DNA helix). Both have first-class deployment
support on Render/Vercel respectively, keeping infra simple for a prototype timeline.

**Q: What's the single biggest limitation of this prototype right now?**
A: Honestly — data volume and real-world validation. Our matching accuracy figures (92%+)
are measured against our own synthetic test cases, not validated against real AICTE
complaint data, because we don't have access to it. We'd want a pilot with a real (even if
small) AICTE dataset before claiming those numbers hold in production.

## "Gotcha" Questions

**Q: Can you show me this working live, right now, with a complaint I give you?**
A: Yes — the DNA Engine resolve endpoint is live and will process any text you give it
through all 4 stages in real time, including showing you the actual confidence scores at
each stage, not just the final answer.

**Q: What if two institutions have genuinely identical names in different cities?**
A: This is exactly why we don't rely on name-matching alone — region/address is factored
into the semantic embedding (we embed name + address together), and the LLM Judge stage
explicitly reasons about geographic plausibility in its chain-of-thought before confirming
a match. It's also why human review is mandatory below 0.85 confidence — genuinely
ambiguous cases like this are supposed to reach a human, not be auto-resolved.
