import os
from typing import List
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "VIGIL Backend"
    API_V1_STR: str = "/api/v1"
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    _raw_origins = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://localhost:3001"
    )
    CORS_ORIGINS: List[str] = [o.strip() for o in _raw_origins.split(",") if o.strip()]
    ALLOWED_ORIGINS: List[str] = CORS_ORIGINS

settings = Settings()
