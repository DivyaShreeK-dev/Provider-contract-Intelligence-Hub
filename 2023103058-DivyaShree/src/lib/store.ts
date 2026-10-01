import { useSyncExternalStore, useCallback } from "react";
import { seed } from "./seed";

const PREFIX = "pci:v1:";
const listeners = new Set<() => void>();
const cache = new Map<string, unknown>();

function read<T>(key: string): T {
  if (cache.has(key)) return cache.get(key) as T;
  let v: unknown = (seed as Record<string, unknown>)[key];
  if (typeof window !== "undefined") {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (raw) {
      try { v = JSON.parse(raw); } catch { /* ignore */ }
    }
  }
  cache.set(key, v);
  return v as T;
}

function write<T>(key: string, v: T) {
  cache.set(key, v);
  if (typeof window !== "undefined") window.localStorage.setItem(PREFIX + key, JSON.stringify(v));
  listeners.forEach((l) => l());
}

export const mockApi = {
  get: read,
  set: write,
  reset() {
    if (typeof window === "undefined") return;
    Object.keys(window.localStorage).filter((k) => k.startsWith(PREFIX)).forEach((k) => window.localStorage.removeItem(k));
    cache.clear();
    listeners.forEach((l) => l());
  },
};

type SeedKey = keyof typeof seed;

export function useCollection<K extends SeedKey>(key: K) {
  const value = useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => read<(typeof seed)[K]>(key),
    () => seed[key],
  );
  const set = useCallback((next: (typeof seed)[K] | ((prev: (typeof seed)[K]) => (typeof seed)[K])) => {
    const prev = read<(typeof seed)[K]>(key);
    write(key, typeof next === "function" ? (next as (p: (typeof seed)[K]) => (typeof seed)[K])(prev) : next);
  }, [key]);
  return [value, set] as const;
}

export type Persona = "loader" | "legal";
export const personas = {
  loader: { id: "loader" as const, name: "Emily Chen", role: "Contract Loader", initials: "EC", landing: "/contracts/digitize" },
  legal: { id: "legal" as const, name: "Mark Thompson", role: "Legal Manager", initials: "MT", landing: "/contracts/newgen" },
};
