import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Pill, Score, DataTable as Table } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCollection } from "@/lib/store";
import { defaultClauses } from "@/lib/seed";
import { log } from "@/lib/actions";

export const Route = createFileRoute("/_shell/compliance")({
  validateSearch: (s: Record<string, unknown>): { tab?: string; section?: string } => ({ tab: typeof s.tab === "string" ? s.tab : undefined, section: typeof s.section === "string" ? s.section : undefined }),
  head: () => ({ meta: [
    { title: "Compliance Hub — Provider Contract Intelligence" },
    { name: "description", content: "Compliance scoring and redlining." },
    { property: "og:title", content: "Compliance Hub — Provider Contract Intelligence" },
    { property: "og:description", content: "Compliance scoring and redlining." },
  ] }),
  component: Compliance,
});

const DETAILS: Record<string, string[]> = {
  "Termination Without Cause": ["Notice period present (+30)", "Missing auto-renewal interaction (−8)", "Missing effect-of-termination (−10)", "Missing records retention (−7)", "Missing member notification (−7)"],
  "Rate Escalator": ["Escalator defined (+40)", "No floor or review mechanism (−10)", "Exceeds CPI-U guidance in 2 regions (−8)"],
  "Indemnification": ["Mutual indemnity (+40)", "No carve-out for willful misconduct (−11)", "No HIPAA breach carve-out (−10)"],
};

function Compliance() {
  const { tab } = Route.useSearch();
  const [docs, setDocs] = useCollection("redlineDocs");
  const [obls] = useCollection("obligations");
  const [contracts] = useCollection("contracts");
  const [docId, setDocId] = useState(docs[0].id);
  const [clause, setClause] = useState("Termination Without Cause");
  const doc = docs.find((d) => d.id === docId)!;
  const decide = (gid: string, xid: string, status: string) => {
    setDocs((l) => l.map((d) => d.id !== docId ? d : { ...d, groups: d.groups.map((g) => g.id !== gid ? g : { ...g, changes: g.changes.map((x) => x.id === xid ? { ...x, status } : x) }) }));
    log(`${status === "accepted" ? "Accepted" : "Rejected"} redline ${xid} on ${doc.name}`); toast.success(`Change ${status}`);
  };
  const all = doc.groups.flatMap((g) => g.changes);
  return (
    <div>
      <PageHeader title="Compliance Hub" subtitle="Compliance scoring, redlining and integrity checks" />
      <Tabs defaultValue={tab ?? "redlining"}>
        <TabsList><TabsTrigger value="redlining">Redlining</TabsTrigger><TabsTrigger value="obligations">Obligation Compliance</TabsTrigger><TabsTrigger value="deviation">Deviation</TabsTrigger><TabsTrigger value="integrity">Integrity</TabsTrigger></TabsList>
        <TabsContent value="redlining" className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <select className="h-9 rounded-md border bg-background px-3 text-sm" value={docId} onChange={(e) => setDocId(e.target.value)}>{docs.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
              <span className="text-xs text-muted-foreground">{all.filter((x) => x.status === "pending").length} pending · {all.filter((x) => x.status === "accepted").length} accepted · {all.filter((x) => x.status === "rejected").length} rejected</span>
              <Button size="sm" variant="outline" className="ml-auto" asChild><Link to="/contracts/viewer/$id" params={{ id: doc.contractId }}>Open contract</Link></Button>
            </div>
            <div className="space-y-4">{doc.groups.map((g) => (
              <div key={g.id} className="rounded-lg border bg-card">
                <button className="w-full border-b px-4 py-2 text-left text-sm font-semibold hover:bg-muted" onClick={() => setClause(g.title)}>{g.title}</button>
                {g.changes.map((x) => (
                  <div key={x.id} className="space-y-2 border-b p-4 text-sm last:border-0">
                    <div className="rounded-sm bg-destructive/10 px-2 py-1 line-through decoration-destructive">{x.original}</div>
                    <div className="rounded-sm bg-success/15 px-2 py-1">{x.proposed}</div>
                    <div className="flex items-center gap-2"><Pill>{x.status}</Pill>
                      {x.status === "pending" && <><Button size="sm" onClick={() => decide(g.id, x.id, "accepted")}><Check className="size-3.5" />Accept</Button><Button size="sm" variant="outline" onClick={() => decide(g.id, x.id, "rejected")}><X className="size-3.5" />Reject</Button></>}</div>
                  </div>))}
              </div>))}</div>
          </div>
          <div className="space-y-3">
            <div className="rounded-lg border bg-card p-4"><div className="mb-2 text-sm font-semibold">Clause scores</div>
              {defaultClauses.map((c) => <button key={c.id} onClick={() => setClause(c.name)} className={`flex w-full items-center justify-between rounded-sm px-2 py-1 text-sm hover:bg-muted ${clause === c.name ? "bg-accent" : ""}`}>{c.name}<Score v={c.compliance} /></button>)}</div>
            <div className="rounded-lg border bg-card p-4 text-sm"><div className="mb-2 font-semibold">Scoring details · {clause}</div>
              <ul className="space-y-1">{(DETAILS[clause] ?? ["Matches Standard Clause language (+85)", "Minor wording variance (−3)"]).map((d) => <li key={d} className="flex gap-2"><span className="text-muted-foreground">•</span>{d}</li>)}</ul></div>
          </div>
        </TabsContent>
        <TabsContent value="obligations" className="mt-4">
          <Table head={["Obligation", "Contract", "Owner", "Due", "Status"]} rows={obls.map((o) => [o.obligation, contracts.find((c) => c.id === o.contractId)?.provider ?? o.contractId, o.owner, o.due, <Pill key="s">{o.status}</Pill>])} />
        </TabsContent>
        <TabsContent value="deviation" className="mt-4">
          <Table head={["Clause", "Standard", "Contract language", "Deviation"]} rows={[
            ["Termination Without Cause", "90 days + continuation of care", "120 days, no continuation", <Pill key="a" t="bad">High</Pill>],
            ["Rate Escalator", "≤ 2.5% (FP-12)", "lesser of 3% or CPI-U", <Pill key="b" t="warn">Medium</Pill>],
            ["Indemnification", "Carve-outs required", "Gross negligence only", <Pill key="c" t="warn">Medium</Pill>],
            ["HIPAA Breach Notice", "3 business days", "5 business days", <Pill key="d" t="info">Low</Pill>],
          ]} />
        </TabsContent>
        <TabsContent value="integrity" className="mt-4">
          <Table head={["Check", "Scope", "Result"]} rows={[
            ["Exhibit A rows sum to fee schedule", "12 contracts", <Pill key="a">Pass</Pill>],
            ["Effective date precedes expiry", "12 contracts", <Pill key="b">Pass</Pill>],
            ["Signature block present", "12 contracts", <Pill key="c" t="warn">2 missing</Pill>],
            ["Cross-references resolve", "120 sections", <Pill key="d">Pass</Pill>],
            ["Provider TIN matches credentialing", "12 contracts", <Pill key="e" t="bad">1 fail</Pill>],
          ]} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

