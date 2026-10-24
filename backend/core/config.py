import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "dev-secret-change-me")
    SLA_HOURS: int = 72
    SLA_CHECK_INTERVAL_SECONDS: int = int(os.getenv("SLA_CHECK_INTERVAL_SECONDS", "300"))
    AMBIGUOUS_LOW: float = 0.70
    AMBIGUOUS_HIGH: float = 0.92
    HUMAN_REVIEW_THRESHOLD: float = 0.85
    ALLOWED_ORIGINS: list[str] = [
        origin.strip() for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001,https://vigil-ai-sih.vercel.app,https://vigil-frontend.vercel.app,*"
        ).split(",") if origin.strip()
    ]

settings = Settings()
