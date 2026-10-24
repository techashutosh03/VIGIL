#!/usr/bin/env python3
"""
VIGIL — Seed Supabase Database with AICTE Registry & Multi-Bureau Complaints
Usage:
    export SUPABASE_URL="https://xxxx.supabase.co"
    export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
    python3 mock-data/seed_supabase.py
"""

import os
import sys
import json
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = ROOT_DIR / "backend"
sys.path.insert(0, str(BACKEND_DIR))

from core.database import supabase
from services.embedding_service import embed_text

def seed():
    if supabase is None:
        print("[ERROR] Supabase client is not connected. Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.")
        sys.exit(1)

    print("🚀 Seeding Supabase database with VIGIL datasets...")

    # 1. Institutions
    inst_path = ROOT_DIR / "mock-data" / "institutions.json"
    with open(inst_path, "r") as f:
        institutions = json.load(f)

    print(f"► Ingesting {len(institutions)} institutions and generating 384-dim Sentence-Transformers embeddings...")
    for inst in institutions:
        embedding_text = f"{inst['name']} {inst.get('address', '')}"
        inst["embedding"] = embed_text(embedding_text)
        try:
            supabase.table("institutions").upsert(inst, on_conflict="id").execute()
            print(f"  ✓ {inst['name']} ({inst['aicte_permanent_id']})")
        except Exception as e:
            print(f"  ✗ Error inserting {inst['name']}: {e}")

    # 2. Complaints
    comp_path = ROOT_DIR / "mock-data" / "complaints_seed.json"
    with open(comp_path, "r") as f:
        complaints = json.load(f)

    print(f"► Ingesting {len(complaints)} multi-bureau complaints (RB / PGRC / Approvals)...")
    for comp in complaints:
        try:
            supabase.table("complaints").upsert(comp, on_conflict="id").execute()
            print(f"  ✓ Complaint {comp['id'][:12]}... [{comp['bureau']}] -> Inst: {comp['institution_id'][:12]}...")
        except Exception as e:
            print(f"  ✗ Error inserting complaint: {e}")

    print("🎉 Database seeding completed successfully!")

if __name__ == "__main__":
    seed()
