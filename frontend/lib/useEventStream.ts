import { useEffect, useRef, useState } from "react";
import { API_BASE } from "./api";

export function useEventStream<T>(
  path: string,
  demoGenerator: () => Generator<T>,
  intervalMs = 900
) {
  const [events, setEvents] = useState<T[]>([]);
  const [source, setSource] = useState<"live" | "fallback" | "connecting">("connecting");
  const genRef = useRef<Generator<T> | null>(null);

  useEffect(() => {
    let es: EventSource | null = null;
    let timer: ReturnType<typeof setInterval> | null = null;

    function startDemo() {
      setSource("fallback");
      genRef.current = demoGenerator();
      timer = setInterval(() => {
        const next = genRef.current!.next();
        if (!next.done) setEvents((prev) => [...prev.slice(-49), next.value]);
      }, intervalMs);
    }

    try {
      es = new EventSource(`${API_BASE}${path}`);
      es.onopen = () => {
        console.log(`[VIGIL Stream] ${path} -> live connection established`);
        setSource("live");
      };
      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data) as T;
          setEvents((prev) => [...prev.slice(-49), data]);
        } catch (err) {
          console.error(`[VIGIL Stream] Parse error on ${path}:`, err);
        }
      };
      es.onerror = () => {
        console.warn(`[VIGIL Stream] ${path} -> connection failed, switching to demo mode`);
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

  return { events, source };
}
