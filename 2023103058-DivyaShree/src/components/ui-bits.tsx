import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b pb-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

const tone: Record<string, string> = {
  good: "bg-success/15 text-success border-success/30",
  warn: "bg-warning/20 text-warning-foreground border-warning/40",
  bad: "bg-destructive/10 text-destructive border-destructive/30",
  info: "bg-accent text-accent-foreground border-accent-foreground/20",
  neutral: "bg-muted text-muted-foreground border-border",
};

export function toneFor(v: string): keyof typeof tone {
  const s = v.toLowerCase();
  if (/(active|completed|compliant|pass|accepted|published|sent for approval|signed)/.test(s)) return "good";
  if (/(overdue|fail|rejected|exception|critical|high)/.test(s)) return "bad";
  if (/(pending|review|redlining|progress|extracting|hold|expiring|medium|overridden|manual)/.test(s)) return "warn";
  if (/(open|queued|draft|low)/.test(s)) return "info";
  return "neutral";
}

export function Pill({ children, t, className }: { children: ReactNode; t?: keyof typeof tone; className?: string }) {
  const k = t ?? toneFor(String(children));
  return <span className={cn("inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[11px] font-medium whitespace-nowrap", tone[k], className)}>{children}</span>;
}

export function Score({ v }: { v: number }) {
  const t = v >= 85 ? "good" : v >= 75 ? "warn" : "bad";
  return <Pill t={t} className="font-mono">{v}%</Pill>;
}

export function DataTable({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-card"><table className="w-full text-sm">
      <thead className="bg-muted/50 text-left text-xs text-muted-foreground"><tr>{head.map((h) => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}</tr></thead>
      <tbody>{rows.map((r, i) => <tr key={i} className="border-t">{r.map((c, j) => <td key={j} className="px-3 py-2">{c}</td>)}</tr>)}</tbody></table></div>
  );
}
