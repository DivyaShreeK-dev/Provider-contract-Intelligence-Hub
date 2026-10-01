import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, Pill } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { useCollection } from "@/lib/store";
import { defaultSections } from "@/lib/seed";
import { log } from "@/lib/actions";

export const Route = createFileRoute("/_shell/review")({
  head: () => ({ meta: [
    { title: "Contract Review — Provider Contract Intelligence" },
    { name: "description", content: "Version comparison and approvals." },
    { property: "og:title", content: "Contract Review — Provider Contract Intelligence" },
    { property: "og:description", content: "Version comparison and approvals." },
  ] }),
  component: Review,
});

const V2: Record<string, string> = { s5: "Rates shall increase annually on each anniversary by the lesser of two and one-half percent (2.5%) or the CPI-U Medical Care index.", s7: "Either party may terminate this Agreement without cause upon ninety (90) days' prior written notice, with continuation of care for Members in active treatment." };

function Review() {
  const [reqs, setReqs] = useCollection("reviewRequests");
  const [contracts] = useCollection("contracts");
  const [sel, setSel] = useState(reqs[0].id);
  const [comment, setComment] = useState("");
  const r = reqs.find((x) => x.id === sel)!;
  const c = contracts.find((x) => x.id === r.contractId);
  const secs = defaultSections(c?.provider ?? "Provider").filter((s) => V2[s.id]);
  const setStatus = (status: string) => { setReqs((l) => l.map((x) => x.id === sel ? { ...x, status } : x)); log(`${status}: ${r.title}`); toast.success(status); };
  return (
    <div>
      <PageHeader title="Contract Review" subtitle="Version comparison, comments and approvals" />
      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <div className="space-y-2">{reqs.map((x) => <button key={x.id} onClick={() => setSel(x.id)} className={`w-full rounded-lg border p-3 text-left text-sm ${sel === x.id ? "border-primary bg-accent" : "bg-card hover:bg-muted"}`}>
          <div className="font-medium">{x.title}</div><div className="mt-1 flex justify-between text-xs text-muted-foreground">{x.reviewer}<Pill>{x.status}</Pill></div></button>)}</div>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-4">
            <div className="mr-auto"><div className="font-semibold">{r.title}</div><div className="text-xs text-muted-foreground">{c?.name}</div></div>
            <Button size="sm" onClick={() => setStatus("Accepted")}>Approve</Button><Button size="sm" variant="outline" onClick={() => setStatus("On hold")}>Hold</Button>
            <Button size="sm" variant="outline" onClick={() => setStatus("Rejected")}>Reject</Button>
            {c && <Button size="sm" variant="ghost" asChild><Link to="/contracts/viewer/$id" params={{ id: c.id }}>Open contract</Link></Button>}
          </div>
          {secs.map((s) => <div key={s.id} className="grid gap-2 rounded-lg border bg-card p-4 text-sm md:grid-cols-2">
            <div><div className="mb-1 text-xs text-muted-foreground">v1 · {s.title}</div><p className="rounded-sm bg-destructive/10 p-2">{s.body}</p></div>
            <div><div className="mb-1 text-xs text-muted-foreground">v2 · {s.title}</div><p className="rounded-sm bg-success/15 p-2">{V2[s.id]}</p></div></div>)}
          <div className="rounded-lg border bg-card p-4 text-sm"><div className="mb-2 font-semibold">Comments</div>
            {r.comments.length ? r.comments.map((m, i) => <div key={i} className="mb-1 rounded-sm bg-muted px-2 py-1">{m}</div>) : <div className="text-muted-foreground">No comments yet.</div>}
            <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (!comment.trim()) return; setReqs((l) => l.map((x) => x.id === sel ? { ...x, comments: [...x.comments, comment] } : x)); setComment(""); }}>
              <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment…" className="h-9 flex-1 rounded-md border bg-background px-3" /><Button size="sm" type="submit">Post</Button></form></div>
        </div>
      </div>
    </div>
  );
}
