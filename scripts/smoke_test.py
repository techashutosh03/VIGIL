"""
Full smoke test against deployed VIGIL backend + frontend.
Run: python3 scripts/smoke_test.py --api https://vigil-backend.onrender.com
"""
import argparse
import requests
import time
import sys

def check(name, fn):
    try:
        start = time.time()
        result = fn()
        elapsed = round(time.time() - start, 2)
        print(f"✅ {name} ({elapsed}s)")
        return True
    except Exception as e:
        print(f"❌ {name} — {e}")
        return False

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--api", required=True, help="Backend base URL")
    args = parser.parse_args()
    base = args.api.rstrip("/")

    results = []

    print("\n🔥 Waking up Render free-tier instance (cold start)...")
    results.append(check("Health check (cold start)", lambda: requests.get(f"{base}/healthz", timeout=90).raise_for_status()))

    results.append(check(
        "DNA Engine resolve",
        lambda: requests.post(f"{base}/api/v1/institutions/resolve",
                               json={"text": "ABC Inst of Tech", "address": "Noida"}, timeout=30).raise_for_status()
    ))
    results.append(check(
        "Overlap graph",
        lambda: requests.get(f"{base}/api/v1/dashboard/overlap-graph", timeout=30).raise_for_status()
    ))
    results.append(check(
        "Risk map",
        lambda: requests.get(f"{base}/api/v1/dashboard/risk-map", timeout=30).raise_for_status()
    ))
    results.append(check(
        "HDBSCAN clusters",
        lambda: requests.get(f"{base}/api/v1/dashboard/clusters", timeout=30).raise_for_status()
    ))
    results.append(check(
        "AI Co-Pilot query",
        lambda: requests.post(f"{base}/api/v1/copilot/query", json={"query": "institutions at risk"}, timeout=30).raise_for_status()
    ))
    results.append(check(
        "Workflow cases",
        lambda: requests.get(f"{base}/api/v1/workflow/cases", timeout=30).raise_for_status()
    ))
    results.append(check(
        "Audit recent logs",
        lambda: requests.get(f"{base}/api/v1/audit/recent", timeout=30).raise_for_status()
    ))
    results.append(check(
        "SLA check trigger",
        lambda: requests.post(f"{base}/api/v1/workflow/check-sla", timeout=30).raise_for_status()
    ))

    print(f"\n{'='*50}")
    passed = sum(results)
    total = len(results)
    print(f"RESULT: {passed}/{total} passed")
    if passed < total:
        print("⚠️  Fix failing endpoints BEFORE demo.")
        sys.exit(1)
    else:
        print("🎉 All systems live. Ready to demo.")

if __name__ == "__main__":
    main()
