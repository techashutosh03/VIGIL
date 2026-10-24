export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function apiGet<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const data = (await res.json()) as T;
    console.debug(`[VIGIL API] GET ${path} -> live response`, data);
    return data;
  } catch (err) {
    console.warn(`[VIGIL API] GET ${path} failed (${API_BASE}); using stage fallback:`, err);
    return fallback;
  }
}

export async function apiPost<T>(path: string, body: unknown, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const data = (await res.json()) as T;
    console.debug(`[VIGIL API] POST ${path} -> live response`, data);
    return data;
  } catch (err) {
    console.warn(`[VIGIL API] POST ${path} failed (${API_BASE}); using stage fallback:`, err);
    return fallback;
  }
}
