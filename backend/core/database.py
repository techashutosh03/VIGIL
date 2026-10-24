from supabase import create_client, Client
from core.config import settings

def get_supabase() -> Client:
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        raise RuntimeError("Supabase credentials not configured")
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

supabase = None
try:
    supabase = get_supabase()
except Exception as e:
    print(f"[WARN] Supabase not connected: {e}")
