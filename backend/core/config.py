import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "dev-secret-change-me")
    SLA_HOURS: int = 72
    AMBIGUOUS_LOW: float = 0.70
    AMBIGUOUS_HIGH: float = 0.92
    HUMAN_REVIEW_THRESHOLD: float = 0.85
    SLA_CHECK_INTERVAL_SECONDS: int = int(os.getenv("SLA_CHECK_INTERVAL_SECONDS", "300"))

    _raw_origins = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://localhost:3001,https://vigil-rjcy.vercel.app,https://vigil-jade-ten.vercel.app"
    )
    CORS_ORIGINS: list[str] = [o.strip() for o in _raw_origins.split(",") if o.strip()]
    if "*" not in CORS_ORIGINS and os.getenv("ALLOW_ALL_CORS", "true").lower() in ("true", "1"):
        CORS_ORIGINS.append("*")
    ALLOWED_ORIGINS: list[str] = CORS_ORIGINS

settings = Settings()
