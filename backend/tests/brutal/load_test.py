"""
Run manually: python tests/brutal/load_test.py
Not part of pytest/CI — measures real latency distribution under concurrent load.
Requires backend running on localhost:8000.
"""
import asyncio
import time
import httpx
import statistics

CONCURRENT_USERS = 30
REQUESTS_PER_USER = 5
BASE_URL = "http://localhost:8000/api/v1"

async def hit_resolve(client, i):
    start = time.perf_counter()
    try:
        resp = await client.post(f"{BASE_URL}/institutions/resolve", json={
            "institution_name_raw": f"Load Test Institute {i % 10}",
            "region": "Test"
        }, timeout=10)
        elapsed = (time.perf_counter() - start) * 1000
        return {"status": resp.status_code, "ms": elapsed}
    except Exception as e:
        return {"status": "ERROR", "ms": (time.perf_counter() - start) * 1000, "error": str(e)}

async def main():
    async with httpx.AsyncClient() as client:
        tasks = [hit_resolve(client, i) for i in range(CONCURRENT_USERS * REQUESTS_PER_USER)]
        results = await asyncio.gather(*tasks)

    latencies = [r["ms"] for r in results]
    errors = [r for r in results if r["status"] != 200]
    latencies.sort()

    print(f"\n--- VIGIL Brutal Load Test: {len(results)} requests, {CONCURRENT_USERS} concurrent ---")
    print(f"Success: {len(results) - len(errors)}/{len(results)}  |  Errors: {len(errors)}")
    if latencies:
        print(f"p50: {latencies[len(latencies)//2]:.1f}ms")
        print(f"p95: {latencies[int(len(latencies)*0.95)]:.1f}ms")
        print(f"p99: {latencies[int(len(latencies)*0.99)]:.1f}ms")
        print(f"max: {max(latencies):.1f}ms")
    if errors:
        print(f"\nSample errors: {errors[:3]}")

if __name__ == "__main__":
    asyncio.run(main())
