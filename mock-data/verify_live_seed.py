"""
Run this AFTER seed_supabase.py to confirm real UUIDs work end-to-end
through the actual FastAPI endpoints (not the mock loader).
"""
import os
import requests
from supabase import create_client

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
API_BASE = os.environ.get("API_BASE", "http://localhost:8000")

sb = create_client(SUPABASE_URL, SUPABASE_KEY)

print("=== STEP 1: Pull a real institution UUID from Supabase ===")
res = sb.table("institutions").select("id, name").limit(1).execute()
if not res.data:
    print("❌ No institutions found. Run seed_supabase.py first.")
    exit(1)

real_id = res.data[0]["id"]
real_name = res.data[0]["name"]
print(f"✅ Found: {real_name} -> {real_id}")

print("\n=== STEP 2: Hit /war-room with REAL uuid ===")
r = requests.get(f"{API_BASE}/api/v1/overlaps/{real_id}/war-room")
print(f"Status: {r.status_code}")
print(r.json())

print("\n=== STEP 3: Hit /forecast with REAL uuid ===")
r = requests.get(f"{API_BASE}/api/v1/dashboard/forecast/{real_id}")
print(f"Status: {r.status_code}")
print(r.json())

print("\n=== STEP 4: Resolve a complaint against REAL data ===")
r = requests.post(
    f"{API_BASE}/api/v1/institutions/resolve",
    json={"text": real_name, "address": ""}
)
print(f"Status: {r.status_code}")
data = r.json()
print(f"Matched: {data.get('matched')}, method: {data.get('method')}")

print("\n=== STEP 5: Overlap graph should include this institution ===")
r = requests.get(f"{API_BASE}/api/v1/dashboard/overlap-graph")
node_ids = [n["id"] for n in r.json().get("nodes", [])]
print("✅ Present in graph" if real_id in node_ids else "❌ MISSING from graph — check institution_id linkage on complaints")

print("\nDone. If all steps show real UUID (not 'inst-1'), live DB path is confirmed working.")
