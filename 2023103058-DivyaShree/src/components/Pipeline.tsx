import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Circle } from "lucide-react";

export const AGENTS = ["Intake Agent", "Clause Matching Agent", "Redlining Agent", "Workflow Agent", "Compliance Agent"];

/** Deterministic simulated step log. */
export function useSimulation(steps: string[], running: boolean, stepMs = 700, onDone?: () => void) {
  const [i, setI] = useState(0);
  useEffect(() => { if (!running) { setI(0); return; } }, [running]);
  useEffect(() => {
    if (!running) return;
    if (i >= steps.length) { onDone?.(); return; }
    const t = setTimeout(() => setI((x) => x + 1), stepMs);
    return () => clearTimeout(t);
  }, [i, running]); // eslint-disable-line
  return i;
}

export function StepLog({ steps, done }: { steps: string[]; done: number }) {
  return (
    <div className="space-y-1.5 rounded-md border bg-muted/40 p-3 font-mono text-xs">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center gap-2">
          {i < done ? <CheckCircle2 className="size-3.5 text-success" /> : i === done ? <Loader2 className="size-3.5 animate-spin text-primary" /> : <Circle className="size-3.5 text-muted-foreground" />}
          <span className={i <= done ? "" : "text-muted-foreground"}>{s}</span>
        </div>
      ))}
    </div>
  );
}
