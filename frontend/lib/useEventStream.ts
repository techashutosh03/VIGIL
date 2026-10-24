import { useEffect, useRef, useState } from "react";
import { API_BASE } from "./api";

/**
 * Connects to a backend SSE endpoint. If it's unavailable,
 * falls back to a provided demo generator so the UI still
 * streams believable live data during offline demos.
 */
export function useEventStream<T>(
  path: string,
  demoGenerator: () => Generator<T>,
  intervalMs = 900
) {
  const [events, setEvents] = useState<T[]>([]);
  const genRef = useRef<Generator<T> | null>(null);

  useEffect(() => {
    let es: EventSource | null = null;
    let timer: ReturnType<typeof setInterval> | null = null;

    function startDemo() {
      if (timer) clearInterval(timer);
      console.warn(`[VIGIL SSE] Stream ${path} offline (${API_BASE}); initiating demo generator fallback.`);
      genRef.current = demoGenerator();
      timer = setInterval(() => {
        const next = genRef.current!.next();
        if (!next.done) setEvents((prev) => [...prev.slice(-49), next.value]);
      }, intervalMs);
    }

    try {
      es = new EventSource(`${API_BASE}${path}`);
      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data) as T;
          setEvents((prev) => [...prev.slice(-49), data]);
        } catch (err) {
          console.error(`[VIGIL SSE] Parse error on ${path}:`, err);
        }
      };
      es.onerror = () => {
        es?.close();
        startDemo();
      };
    } catch {
      startDemo();
    }

    return () => {
      es?.close();
      if (timer) clearInterval(timer);
    };
  }, [path, intervalMs]);

  return events;
}
