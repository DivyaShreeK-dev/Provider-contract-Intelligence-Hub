import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Pill } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { useCollection } from "@/lib/store";

export const Route = createFileRoute("/_shell/clauses")({
  head: () => ({ meta: [
    { title: "Standard Clauses — Provider Contract Intelligence" },
    { name: "description", content: "Pre-approved clause library." },
    { property: "og:title", content: "Standard Clauses — Provider Contract Intelligence" },
    { property: "og:description", content: "Pre-approved clause library." },
  ] }),
  component: Clauses,
});

function Clauses() {
  const [list, setList] = useCollection("standardClauses");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [sel, setSel] = useState(list[0].id);
  const [edit, setEdit] = useState<string | null>(null);
  const rows = list.filter((c) => (cat === "All" || c.category === cat) && (c.title + c.tags.join(" ") + c.text).toLowerCase().includes(q.toLowerCase()));
  const c = list.find((x) => x.id === sel)!;
  const save = () => {
    const [maj, min] = c.version.slice(1).split(".").map(Number);
    const version = `v${maj}.${min + 1}`;
    setList((l) => l.map((x) => x.id === c.id ? { ...x, text: edit!, version, updated: new Date().toISOString().slice(0, 10), history: [`${version} – edited`, ...x.history] } : x));
    setEdit(null); toast.success(`Saved as ${version}`);
  };
  return (
    <div>
      <PageHeader title="Standard Clauses" subtitle="Pre-approved clause library with versions and guidance" />
      <div className="mb-3 flex flex-wrap gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search clauses…" className="h-9 w-64 rounded-md border bg-background px-3 text-sm" />
        {["All", "Legal", "Financial", "Operational"].map((k) => <Button key={k} size="sm" variant={cat === k ? "default" : "outline"} onClick={() => setCat(k)}>{k}</Button>)}
      </div>
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <div className="space-y-2">{rows.map((x) => (
          <button key={x.id} onClick={() => { setSel(x.id); setEdit(null); }} className={`w-full rounded-lg border p-3 text-left text-sm ${sel === x.id ? "border-primary bg-accent" : "bg-card hover:bg-muted"}`}>
            <div className="flex justify-between font-medium">{x.title}<span className="font-mono text-xs text-muted-foreground">{x.version}</span></div>
            <div className="mt-1 flex gap-1"><Pill t="neutral">{x.category}</Pill>{x.tags.map((t) => <Pill key={t} t="info">{t}</Pill>)}</div></button>))}</div>
        <div className="rounded-lg border bg-card p-5 text-sm">
          <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">{c.title}</h2><span className="text-xs text-muted-foreground">{c.version} · updated {c.updated}</span></div>
          {edit !== null ? <textarea className="mt-3 h-32 w-full rounded-md border bg-background p-3" value={edit} onChange={(e) => setEdit(e.target.value)} /> : <p className="mt-3 rounded-md bg-muted/50 p-3 font-serif leading-relaxed">{c.text}</p>}
          <div className="mt-3 flex gap-2">
            {edit !== null ? <><Button size="sm" onClick={save}>Save new version</Button><Button size="sm" variant="outline" onClick={() => setEdit(null)}>Cancel</Button></>
              : <><Button size="sm" variant="outline" onClick={() => { navigator.clipboard?.writeText(c.text); toast.success("Clause copied"); }}><Copy className="size-3.5" />Copy</Button><Button size="sm" variant="outline" onClick={() => setEdit(c.text)}>Edit</Button></>}
          </div>
          <div className="mt-5 font-semibold">Guidance</div><p className="text-muted-foreground">{c.guidance}</p>
          <div className="mt-4 font-semibold">Version history</div><ul className="mt-1 space-y-1 text-muted-foreground">{c.history.map((h) => <li key={h}>• {h}</li>)}</ul>
        </div>
      </div>
    </div>
  );
}
