import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, Pill, Score } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { StepLog, useSimulation } from "@/components/Pipeline";
import { useCollection } from "@/lib/store";
import { createContract } from "@/lib/actions";

export const Route = createFileRoute("/_shell/renewals")({
  head: () => ({ meta: [
    { title: "Renewals — Provider Contract Intelligence" },
    { name: "description", content: "AI-driven renewal recommendations." },
    { property: "og:title", content: "Renewals — Provider Contract Intelligence" },
    { property: "og:description", content: "AI-driven renewal recommendations." },
  ] }),
  component: Renewals,
});

const STEPS = ["Copying base agreement", "Applying recommended rate changes", "Upgrading clauses to current standard", "Resetting term dates", "Compliance Agent: re-scoring"];

function Renewals() {
  const [contracts] = useCollection("contracts");
  const list = [...contracts].sort((a, b) => a.expiry.localeCompare(b.expiry)).slice(0, 6);
  const [sel, setSel] = useState(list[0]?.id);
  const [running, setRunning] = useState(false);
  const nav = useNavigate();
  const c = contracts.find((x) => x.id === sel)!;
  const rec = c.compliance >= 85 ? "Renew as-is with escalator" : c.compliance >= 75 ? "Renew with amendments" : "Renegotiate before renewal";
  const done = useSimulation(STEPS, running, 500, () => { const id = createContract({ provider: c.provider, type: c.type, mode: "Renewal", compliance: Math.max(90, c.compliance) }); toast.success("Renewal draft generated"); setRunning(false); nav({ to: "/contracts/viewer/$id", params: { id } }); });
  const rates = [["Medical PEPM", "$4.25", "$4.36", "+2.5%"], ["Pharmacy PEPM", "$2.10", "$2.15", "+2.5%"], ["Retail 30 Generic", "AWP − 82%", "AWP − 83%", "+1 pt"], ["Specialty Brand", "AWP − 21%", "AWP − 22%", "+1 pt"]];
  return (
    <div>
      <PageHeader title="Renewals" subtitle="AI renewal briefs for contracts approaching expiry" />
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="space-y-2">{list.map((x) => (
          <button key={x.id} onClick={() => setSel(x.id)} className={`w-full rounded-lg border p-3 text-left text-sm ${sel === x.id ? "border-primary bg-accent" : "bg-card hover:bg-muted"}`}>
            <div className="font-medium">{x.provider}</div><div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">Expires {x.expiry}<Score v={x.compliance} /></div></button>))}</div>
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-lg font-semibold">{c.name}</h2><Pill t={c.compliance >= 85 ? "good" : c.compliance >= 75 ? "warn" : "bad"}>{rec}</Pill></div>
            <p className="mt-2 text-sm text-muted-foreground">AI brief: {c.provider} has a {c.type.toLowerCase()} agreement in the {c.region} region valued at ${(c.value / 1000).toFixed(0)}K annually, expiring {c.expiry}. Utilization is stable and claims performance meets timely-filing targets.</p>
            <div className="mt-4 text-sm font-semibold">Rationale</div>
            <ul className="mt-1 space-y-1 text-sm">
              <li>• Compliance score of {c.compliance}% {c.compliance < 85 ? "requires clause upgrades (Termination, Indemnification)" : "meets playbook thresholds"}.</li>
              <li>• Network adequacy in {c.region} depends on this provider for {c.type}.</li>
              <li>• Proposed escalator of 2.5% stays within Finance Policy FP-12.</li>
            </ul>
          </div>
          <div className="rounded-lg border bg-card"><div className="border-b px-4 py-2 text-sm font-semibold">Rate comparison</div>
            <table className="w-full text-sm"><thead className="text-left text-xs text-muted-foreground"><tr>{["Item", "Current", "Proposed", "Change"].map((h) => <th key={h} className="px-4 py-2">{h}</th>)}</tr></thead>
              <tbody>{rates.map((r) => <tr key={r[0]} className="border-t">{r.map((v, i) => <td key={i} className={`px-4 py-2 ${i ? "font-mono" : ""}`}>{v}</td>)}</tr>)}</tbody></table></div>
          {running ? <StepLog steps={STEPS} done={done} /> : <Button onClick={() => setRunning(true)}>Generate renewal draft</Button>}
        </div>
      </div>
    </div>
  );
}
