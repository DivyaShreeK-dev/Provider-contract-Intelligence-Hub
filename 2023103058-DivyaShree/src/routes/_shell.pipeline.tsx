import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PenLine } from "lucide-react";
import { PageHeader, Pill, Score } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCollection } from "@/lib/store";
import { DELEGATED_STAGES, NONDELEGATED_STAGES } from "@/lib/seed";

export const Route = createFileRoute("/_shell/pipeline")({
  head: () => ({ meta: [
    { title: "Pipeline — Provider Contract Intelligence" },
    { name: "description", content: "Intake through signature and publication." },
    { property: "og:title", content: "Pipeline — Provider Contract Intelligence" },
    { property: "og:description", content: "Intake through signature and publication." },
  ] }),
  component: PipelinePage,
});

function PipelinePage() {
  const [contracts, setContracts] = useCollection("contracts");
  const [tab, setTab] = useState<"Delegated" | "Non-Delegated">("Delegated");
  const [stage, setStage] = useState<string | null>(null);
  const stages = tab === "Delegated" ? DELEGATED_STAGES : NONDELEGATED_STAGES;
  const inTab = contracts.filter((c) => c.pipeline === tab);
  const rows = stage ? inTab.filter((c) => c.stage === stage) : inTab;
  const advance = (id: string) => setContracts((l) => l.map((c) => { if (c.id !== id) return c; const i = stages.findIndex((s) => s.key === c.stage); return { ...c, stage: stages[Math.min(i + 1, stages.length - 1)].key }; }));
  return (
    <div>
      <PageHeader title="Pipeline" subtitle="Intake through signature and publication" />
      <Tabs value={tab} onValueChange={(v) => { setTab(v as typeof tab); setStage(null); }}><TabsList><TabsTrigger value="Delegated">Delegated</TabsTrigger><TabsTrigger value="Non-Delegated">Non-Delegated</TabsTrigger></TabsList></Tabs>
      <div className="my-4 grid grid-cols-2 gap-2 md:grid-cols-6">
        {stages.map((s, i) => { const n = inTab.filter((c) => c.stage === s.key).length; const on = stage === s.key; return (
          <button key={s.key} onClick={() => setStage(on ? null : s.key)} className={`rounded-lg border p-3 text-left transition ${on ? "border-primary bg-accent" : "bg-card hover:bg-muted"}`}>
            <div className="text-[11px] text-muted-foreground">Stage {i + 1}</div><div className="font-semibold">{s.key}</div>
            <div className="text-xs text-muted-foreground">{s.sub || "\u00a0"}</div>
            <div className="mt-2 text-xs"><span className="font-mono text-lg font-semibold">{n}</span> contracts · {n * 3 + i} docs</div>
          </button>); })}
      </div>
      {stage && <div className="mb-2 text-sm">Filtered by <Pill t="info">{stage}</Pill> <button className="ml-2 text-xs underline" onClick={() => setStage(null)}>clear</button></div>}
      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full text-sm"><thead className="bg-muted/50 text-left text-xs text-muted-foreground"><tr>{["Contract", "Provider", "Stage", "Status", "Owner", "Compliance", ""].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr></thead>
          <tbody>{rows.map((c) => <tr key={c.id} className="border-t">
            <td className="px-3 py-2"><Link to="/contracts/viewer/$id" params={{ id: c.id }} className="hover:underline">{c.name}</Link></td><td className="px-3 py-2">{c.provider}</td>
            <td className="px-3 py-2"><Pill t="neutral">{c.stage}</Pill></td><td className="px-3 py-2"><Pill>{c.status}</Pill></td><td className="px-3 py-2">{c.owner}</td><td className="px-3 py-2"><Score v={c.compliance} /></td>
            <td className="space-x-1 whitespace-nowrap px-3 py-2 text-right">
              {c.stage === "Signature" && <Button size="sm" asChild><Link to="/contracts/viewer/$id" params={{ id: c.id }} search={{ focus: "signature", from: "pipeline" }}><PenLine className="size-3.5" />Sign</Link></Button>}
              {c.stage !== "Published" && <Button size="sm" variant="outline" onClick={() => advance(c.id)}>Advance</Button>}
            </td></tr>)}
            {!rows.length && <tr><td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">No contracts in this stage.</td></tr>}</tbody></table>
      </div>
    </div>
  );
}
