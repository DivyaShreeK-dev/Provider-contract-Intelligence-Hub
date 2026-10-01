import { createFileRoute, Link } from "@tanstack/react-router";
import { RefreshCw, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Pill } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { useCollection } from "@/lib/store";

export const Route = createFileRoute("/_shell/obligations")({
  head: () => ({ meta: [
    { title: "Obligation Tracker — Provider Contract Intelligence" },
    { name: "description", content: "Contractual obligations and owners." },
    { property: "og:title", content: "Obligation Tracker — Provider Contract Intelligence" },
    { property: "og:description", content: "Contractual obligations and owners." },
  ] }),
  component: Obligations,
});

function Obligations() {
  const [obls, setObls] = useCollection("obligations");
  const [contracts] = useCollection("contracts");
  const renewals = contracts.filter((c) => c.status === "Expiring" || new Date(c.expiry) < new Date("2027-03-01"));
  const kpi = [["Total obligations", obls.length], ["Open", obls.filter((o) => o.status === "Open").length], ["In progress", obls.filter((o) => o.status === "In Progress").length], ["Overdue", obls.filter((o) => o.status === "Overdue").length], ["Compliant", obls.filter((o) => o.status === "Compliant").length]];
  return (
    <div>
      <PageHeader title="Obligation Tracker" subtitle="Contractual obligations, owners and due dates" />
      <div className="mb-4 grid gap-3 sm:grid-cols-5">{kpi.map(([k, v]) => <div key={k} className="rounded-lg border bg-card p-4"><div className="text-xs text-muted-foreground">{k}</div><div className="mt-1 text-2xl font-semibold">{v}</div></div>)}</div>
      <Link to="/renewals" className="mb-6 flex items-center justify-between rounded-lg border bg-accent p-4 hover:border-primary">
        <div className="flex items-center gap-3"><RefreshCw className="size-5 text-primary" /><div><div className="font-semibold">Renewal Contracts</div><div className="text-sm text-muted-foreground">{renewals.length} contracts approaching renewal — AI briefs ready</div></div></div>
        <ArrowRight className="size-4" /></Link>
      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full text-sm"><thead className="bg-muted/50 text-left text-xs text-muted-foreground"><tr>{["Obligation", "Contract", "Owner", "Owning team", "Frequency", "Due", "Status", ""].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr></thead>
          <tbody>{obls.map((o) => <tr key={o.id} className="border-t">
            <td className="px-3 py-2 font-medium">{o.obligation}</td><td className="px-3 py-2">{contracts.find((c) => c.id === o.contractId)?.provider}</td>
            <td className="px-3 py-2">{o.owner}</td><td className="px-3 py-2">{o.team}</td>
            <td className="px-3 py-2"><span className="rounded-full border bg-muted px-2 py-0.5 text-[11px]">{o.frequency}</span></td>
            <td className="px-3 py-2 font-mono text-xs">{o.due}</td><td className="px-3 py-2"><Pill>{o.status}</Pill></td>
            <td className="space-x-1 whitespace-nowrap px-3 py-2 text-right">
              {o.status !== "Compliant" && <Button size="sm" variant="secondary" onClick={() => { setObls((l) => l.map((x) => x.id === o.id ? { ...x, status: "Compliant" } : x)); toast.success("Marked compliant"); }}>Complete</Button>}
              <Button size="sm" variant="outline" asChild><Link to="/contracts/viewer/$id" params={{ id: o.contractId }}>View</Link></Button></td></tr>)}</tbody></table>
      </div>
    </div>
  );
}
