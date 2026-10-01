import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Eye } from "lucide-react";
import { PageHeader, Pill, Score } from "@/components/ui-bits";
import { useCollection } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/contracts/")({
  head: () => ({ meta: [
    { title: "Contracts — Provider Contract Intelligence" },
    { name: "description", content: "All provider contracts with status filters and search." },
    { property: "og:title", content: "Contracts — Provider Contract Intelligence" },
    { property: "og:description", content: "All provider contracts with status filters and search." },
  ] }),
  component: Overview,
});

function Overview() {
  const [contracts] = useCollection("contracts");
  const [status, setStatus] = useState("All");
  const [q, setQ] = useState("");
  const list = contracts.filter((c) => (status === "All" || c.status === status) && c.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <PageHeader title="Contracts" subtitle="Every provider agreement in one place" />
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {["All", "Active", "In Review", "Redlining", "Pending Signature", "Draft", "Expiring"].map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={cn("rounded-full border px-3 py-1 text-xs", status === s ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted")}>{s}</button>
        ))}
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by name…" className="ml-auto h-8 w-56 rounded-md border bg-card px-3 text-sm" />
      </div>
      <div className="overflow-hidden rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs text-muted-foreground"><tr>{["Contract", "Type", "Source", "Status", "Stage", "Expires", "Compliance", ""].map((h) => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}</tr></thead>
          <tbody>{list.map((c) => (
            <tr key={c.id} className="border-t hover:bg-muted/50">
              <td className="px-3 py-2 font-medium">{c.name}</td><td className="px-3 py-2">{c.type}</td><td className="px-3 py-2">{c.source}</td>
              <td className="px-3 py-2"><Pill>{c.status}</Pill></td><td className="px-3 py-2">{c.stage}</td>
              <td className="px-3 py-2 font-mono text-xs">{c.expiry}</td><td className="px-3 py-2"><Score v={c.compliance} /></td>
              <td className="px-3 py-2"><Link to="/contracts/viewer/$id" params={{ id: c.id }} className="inline-flex items-center gap-1 text-primary hover:underline"><Eye className="size-4" />Open</Link></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
