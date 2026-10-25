import asyncio
import sys
from pathlib import Path
from contextlib import asynccontextmanager

# Ensure backend root is on sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from routers import institutions, dashboard, copilot, overlaps, audit, workflow, agents_stream

async def sla_breach_monitor():
    """
    Automated background task that evaluates complaints against 72-hr statutory SLA.
    Runs periodically to transition overdue complaints to 'escalated' status.
    """
    print(f"[SLA-MONITOR] Daemon started. Checking breaches every {settings.SLA_CHECK_INTERVAL_SECONDS}s...")
    while True:
        try:
            from agents.workflow_sla import check_sla_breaches
            escalated = check_sla_breaches()
            if escalated:
                print(f"[SLA-MONITOR] Auto-escalated {len(escalated)} breached complaints: {escalated}")
        except Exception as e:
            print(f"[SLA-MONITOR] Check error: {e}")
        await asyncio.sleep(settings.SLA_CHECK_INTERVAL_SECONDS)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Launch SLA auto-escalation daemon
    sla_task = asyncio.create_task(sla_breach_monitor())
    yield
    # Shutdown: Cleanly cancel background tasks
    sla_task.cancel()

app = FastAPI(
    title="VIGIL Backend — Multi-Bureau Coordination Platform",
    description="Real agentic decision-support backend for AICTE Regulation Bureau and PGRC (SIH 2026 PS 26264)",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(institutions.router)
app.include_router(dashboard.router)
app.include_router(copilot.router)
app.include_router(overlaps.router)
app.include_router(audit.router)
app.include_router(workflow.router)
app.include_router(agents_stream.router)

@app.get("/")
@app.get("/healthz")
def health():
    return {
        "status": "ok",
        "service": "vigil-backend",
        "engine": "Institution DNA Engine + Overlap Coordination Network",
        "sla_monitor": "active",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
