export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type ApiResult<T> = { data: T; source: "live" | "fallback"; error?: string };

export async function apiGetSafe<T>(path: string, fallback: T): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as T;
    console.log(`[VIGIL API] GET ${path} -> live response`);
    return { data, source: "live" };
  } catch (err: any) {
    console.warn(`[VIGIL API] GET ${path} -> using fallback (${err.message})`);
    return { data: fallback, source: "fallback", error: err.message };
  }
}

export async function apiPostSafe<T>(path: string, body: unknown, fallback: T): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as T;
    console.log(`[VIGIL API] POST ${path} -> live response`);
    return { data, source: "live" };
  } catch (err: any) {
    console.warn(`[VIGIL API] POST ${path} -> using fallback (${err.message})`);
    return { data: fallback, source: "fallback", error: err.message };
  }
}

export async function apiGet<T>(path: string, fallback: T): Promise<T> {
  const result = await apiGetSafe<T>(path, fallback);
  return result.data;
}

export async function apiPost<T>(path: string, body: unknown, fallback: T): Promise<T> {
  const result = await apiPostSafe<T>(path, body, fallback);
  return result.data;
}
