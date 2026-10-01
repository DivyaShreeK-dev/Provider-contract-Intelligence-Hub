import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, Pill } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { StepLog, useSimulation } from "@/components/Pipeline";
import { useCollection } from "@/lib/store";
import { log } from "@/lib/actions";

export const Route = createFileRoute("/_shell/feed")({
  head: () => ({ meta: [
    { title: "Downstream Feed — Provider Contract Intelligence" },
    { name: "description", content: "Field mapping to claims systems." },
    { property: "og:title", content: "Downstream Feed — Provider Contract Intelligence" },
    { property: "og:description", content: "Field mapping to claims systems." },
  ] }),
  component: Feed,
});

const STEPS = ["Validating mapped fields", "Building FACETS payload", "Building QNXT payload", "Transmitting to claims systems", "Acknowledgement received"];

function Feed() {
  const [maps, setMaps] = useCollection("feedMappings");
  const [ok, setOk] = useState<string[]>(maps.filter((m) => m.confidence >= 90).map((m) => m.field));
  const [run, setRun] = useState(false);
  const done = useSimulation(STEPS, run, 500, () => { log("Published downstream feed"); toast.success("Feed delivered to FACETS & QNXT"); });
  return (
    <div>
      <PageHeader title="Downstream Feed" subtitle="Map contract fields to claims and directory systems" actions={<Button disabled={ok.length < maps.length || run} onClick={() => setRun(true)}>Send feed</Button>} />
      <div className="overflow-x-auto rounded-lg border bg-card"><table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs text-muted-foreground"><tr>{["Contract field", "Target field", "Confidence", "Status", ""].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr></thead>
        <tbody>{maps.map((m) => { const a = ok.includes(m.field); return <tr key={m.field} className="border-t">
          <td className="px-3 py-2">{m.field}</td>
          <td className="px-3 py-2"><input className="w-56 rounded-sm border bg-background px-2 py-1 font-mono text-xs" value={m.target} onChange={(e) => setMaps((l) => l.map((x) => x.field === m.field ? { ...x, target: e.target.value } : x))} /></td>
          <td className="px-3 py-2"><Pill t={m.confidence >= 90 ? "good" : "warn"}>{m.confidence}%</Pill></td>
          <td className="px-3 py-2"><Pill t={a ? "good" : "warn"}>{a ? "Approved" : "Needs review"}</Pill></td>
          <td className="px-3 py-2 text-right">{!a && <Button size="sm" variant="outline" onClick={() => setOk([...ok, m.field])}>Approve</Button>}</td></tr>; })}</tbody></table></div>
      {ok.length < maps.length && <p className="mt-2 text-xs text-muted-foreground">Approve all mappings to enable sending.</p>}
      {run && <div className="mt-4"><StepLog steps={STEPS} done={done} /></div>}
    </div>
  );
}
