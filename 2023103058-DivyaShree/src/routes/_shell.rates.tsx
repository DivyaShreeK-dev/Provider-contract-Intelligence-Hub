import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader, Pill } from "@/components/ui-bits";
import { useCollection } from "@/lib/store";

export const Route = createFileRoute("/_shell/rates")({
  head: () => ({ meta: [
    { title: "Rates & Reimbursement — Provider Contract Intelligence" },
    { name: "description", content: "Fee schedules and escalators." },
    { property: "og:title", content: "Rates & Reimbursement — Provider Contract Intelligence" },
    { property: "og:description", content: "Fee schedules and escalators." },
  ] }),
  component: Rates,
});

function Rates() {
  const [rates] = useCollection("rates");
  const [esc, setEsc] = useState(3);
  const rows = rates.map((r) => ({ ...r, projected: +(r.current * (1 + esc / 100)).toFixed(2) }));
  return (
    <div>
      <PageHeader title="Rates & Reimbursement" subtitle="Fee schedules, methodologies and escalator modeling" />
      <div className="mb-4 flex items-center gap-3 rounded-lg border bg-card p-4 text-sm">
        <span className="font-medium">Escalator scenario</span>
        <input type="range" min={0} max={6} step={0.5} value={esc} onChange={(e) => setEsc(+e.target.value)} />
        <span className="font-mono">{esc}%</span>{esc > 2.5 && <Pill t="warn">Above FP-12 cap (2.5%)</Pill>}
      </div>
      <div className="mb-4 h-64 rounded-lg border bg-card p-4">
        <ResponsiveContainer><BarChart data={rows.filter((r) => r.current < 2000)}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="code" fontSize={11} /><YAxis fontSize={11} /><Tooltip />
          <Bar dataKey="current" fill="var(--muted-foreground)" name="Current" /><Bar dataKey="projected" fill="var(--primary)" name="Projected" /></BarChart></ResponsiveContainer>
      </div>
      <div className="overflow-x-auto rounded-lg border bg-card"><table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs text-muted-foreground"><tr>{["Code", "Description", "Method", "Current", "Projected", "Extraction confidence"].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr></thead>
        <tbody>{rows.map((r) => <tr key={r.id} className="border-t"><td className="px-3 py-2 font-mono">{r.code}</td><td className="px-3 py-2">{r.desc}</td><td className="px-3 py-2">{r.method}</td>
          <td className="px-3 py-2 font-mono">${r.current.toLocaleString()}</td><td className="px-3 py-2 font-mono">${r.projected.toLocaleString()}</td>
          <td className="px-3 py-2"><Pill t={r.confidence >= 90 ? "good" : r.confidence >= 80 ? "warn" : "bad"}>{r.confidence}%</Pill></td></tr>)}</tbody></table></div>
    </div>
  );
}
