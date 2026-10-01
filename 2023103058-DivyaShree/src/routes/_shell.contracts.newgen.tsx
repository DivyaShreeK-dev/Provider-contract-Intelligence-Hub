import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, ListChecks, ShieldCheck, Copy, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Pill } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { StepLog, useSimulation } from "@/components/Pipeline";
import { ChatPanel } from "@/components/ChatPanel";
import { useCollection } from "@/lib/store";
import { createContract, PROVIDERS } from "@/lib/actions";
import { defaultClauses, defaultSections } from "@/lib/seed";

export const Route = createFileRoute("/_shell/contracts/newgen")({
  head: () => ({ meta: [
    { title: "NewGen Contract Creation — Provider Contract Intelligence" },
    { name: "description", content: "Guided provider agreement drafting." },
    { property: "og:title", content: "NewGen Contract Creation — Provider Contract Intelligence" },
    { property: "og:description", content: "Guided provider agreement drafting." },
  ] }),
  component: NewGen,
});

const MODES = [
  { key: "Full Draft", title: "Full Draft Generation", icon: FileText, desc: "Generate a complete agreement from provider, type and term inputs." },
  { key: "Clause-by-Clause", title: "Clause-by-Clause Co-Authoring", icon: ListChecks, desc: "Assemble the agreement one standard clause at a time." },
  { key: "Playbook-Guided", title: "Playbook-Guided with AI Review", icon: ShieldCheck, desc: "Draft against the playbook, then get an AI compliance review." },
  { key: "Existing", title: "Start Draft with Existing Contract", icon: Copy, desc: "Use an existing agreement as the base in a 3-step flow." },
] as const;
type Mode = (typeof MODES)[number]["key"];

const sel = "h-9 w-full rounded-md border bg-background px-3 text-sm";

function NewGen() {
  const [mode, setMode] = useState<Mode | null>(null);
  const [drafts] = useCollection("generatedDrafts");
  if (mode) return (
    <div>
      <Button variant="ghost" size="sm" className="mb-3" onClick={() => setMode(null)}><ArrowLeft className="size-4" />All modes</Button>
      <PageHeader title={MODES.find((m) => m.key === mode)!.title} subtitle="NewGen Contract Creation" />
      {mode === "Existing" ? <ExistingFlow /> : <Generator mode={mode} />}
    </div>
  );
  return (
    <div>
      <PageHeader title="NewGen Contract Creation" subtitle="Choose how you want to draft a provider agreement" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {MODES.map((m) => (
          <button key={m.key} onClick={() => setMode(m.key)} className="rounded-lg border bg-card p-5 text-left transition hover:border-primary hover:shadow-md">
            <m.icon className="mb-3 size-6 text-primary" /><div className="font-semibold">{m.title}</div><p className="mt-1 text-sm text-muted-foreground">{m.desc}</p>
          </button>))}
      </div>
      <h2 className="mb-2 mt-8 text-lg font-semibold">My Generated Contracts</h2>
      <div className="rounded-lg border bg-card">
        <table className="w-full text-sm"><thead className="bg-muted/50 text-left text-xs text-muted-foreground"><tr><th className="px-3 py-2">Contract</th><th className="px-3 py-2">Mode</th><th className="px-3 py-2">Created</th><th /></tr></thead>
          <tbody>{drafts.map((d) => <tr key={d.id + d.created} className="border-t"><td className="px-3 py-2">{d.name}</td><td className="px-3 py-2"><Pill t="info">{d.mode}</Pill></td><td className="px-3 py-2 font-mono text-xs">{d.created}</td>
            <td className="px-3 py-2 text-right"><Button size="sm" variant="outline" asChild><Link to="/contracts/viewer/$id" params={{ id: d.id }}>Open</Link></Button></td></tr>)}</tbody></table>
      </div>
    </div>
  );
}

function Generator({ mode }: { mode: Exclude<Mode, "Existing"> }) {
  const nav = useNavigate();
  const [provider, setProvider] = useState(PROVIDERS[0]);
  const [type, setType] = useState("Professional Services");
  const [term, setTerm] = useState("36");
  const [picked, setPicked] = useState<string[]>(defaultClauses.slice(0, 6).map((c) => c.id));
  const [running, setRunning] = useState(false);
  const [id, setId] = useState<string | null>(null);
  const steps = mode === "Playbook-Guided"
    ? ["Loading Provider Playbook v4.1", "Drafting 10 sections from standard clauses", "Compliance Agent: reviewing against playbook", "Flag: Termination clause missing member notification → auto-inserted", "Flag: Indemnification carve-outs added", "Compliance score: 93%"]
    : mode === "Clause-by-Clause" ? picked.map((p) => `Co-authoring: ${defaultClauses.find((c) => c.id === p)!.name}`).concat("Assembling agreement")
    : ["Collecting provider profile", "Generating 10 sections", "Building Exhibit A rate schedule", "Final formatting"];
  const done = useSimulation(steps, running, 550, () => { if (!id) { setId(createContract({ provider, type, mode, compliance: mode === "Playbook-Guided" ? 93 : 87 })); toast.success("Draft generated"); } });
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-3 rounded-lg border bg-card p-5">
        <label className="block text-sm">Provider<select className={sel} value={provider} onChange={(e) => setProvider(e.target.value)}>{PROVIDERS.map((p) => <option key={p}>{p}</option>)}</select></label>
        <label className="block text-sm">Agreement type<select className={sel} value={type} onChange={(e) => setType(e.target.value)}>{["Professional Services", "Facility", "Ancillary", "Behavioral Health"].map((p) => <option key={p}>{p}</option>)}</select></label>
        <label className="block text-sm">Term (months)<input className={sel} value={term} onChange={(e) => setTerm(e.target.value)} /></label>
        {mode === "Clause-by-Clause" && <div className="space-y-1 text-sm"><div className="font-medium">Clauses</div>{defaultClauses.map((c) => (
          <label key={c.id} className="flex items-center gap-2"><input type="checkbox" checked={picked.includes(c.id)} onChange={(e) => setPicked(e.target.checked ? [...picked, c.id] : picked.filter((x) => x !== c.id))} />{c.name}<span className="text-xs text-muted-foreground">{c.category}</span></label>))}</div>}
        <Button disabled={running} onClick={() => setRunning(true)}>Generate draft</Button>
      </div>
      <div className="space-y-3">
        {running ? <StepLog steps={steps} done={done} /> : <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">Agent progress will appear here.</div>}
        {id && <Button onClick={() => nav({ to: "/contracts/viewer/$id", params: { id } })}>Open draft in Contract Viewer</Button>}
      </div>
    </div>
  );
}

function ExistingFlow() {
  const [contracts] = useCollection("contracts");
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [base, setBase] = useState(contracts[1]?.id);
  const [page, setPage] = useState(1);
  const [provider, setProvider] = useState(PROVIDERS[5]);
  const [changes, setChanges] = useState({ term: true, rates: true, termination: true });
  const c = contracts.find((x) => x.id === base)!;
  const secs = defaultSections(c.provider);
  const s = secs[(page - 1) % secs.length];
  return (
    <div>
      <div className="mb-4 flex gap-2">{["Select base contract", "Review with intelligence", "Configure & generate"].map((t, i) => <div key={t} className={`flex-1 rounded-md border px-3 py-2 text-sm ${step === i + 1 ? "border-primary bg-accent font-medium" : "text-muted-foreground"}`}>{i + 1}. {t}</div>)}</div>
      {step === 1 && <div className="space-y-2">{contracts.slice(0, 8).map((x) => (
        <label key={x.id} className={`flex cursor-pointer items-center justify-between rounded-md border bg-card px-4 py-3 text-sm ${base === x.id ? "border-primary" : ""}`}>
          <span className="flex items-center gap-3"><input type="radio" checked={base === x.id} onChange={() => setBase(x.id)} />{x.name}</span><span className="flex gap-2"><Pill>{x.status}</Pill><Pill t="neutral">{x.compliance}%</Pill></span></label>))}
        <Button onClick={() => setStep(2)}>Next</Button></div>}
      {step === 2 && <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <div className="rounded-lg border bg-muted/40 p-4">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground"><span>{c.name} · Page {page} of 52</span>
            <div className="flex gap-1"><Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</Button><Button size="sm" variant="outline" disabled={page >= 52} onClick={() => setPage(page + 1)}>Next</Button></div></div>
          <div className="min-h-96 rounded-sm border bg-background p-6 font-serif text-sm leading-relaxed"><div className="mb-2 font-semibold">{s.title}</div><p>{s.body}</p><p className="mt-4 text-muted-foreground">— page {page} —</p></div>
          <div className="mt-2 flex flex-wrap gap-1">{Array.from({ length: 52 }, (_, i) => <button key={i} onClick={() => setPage(i + 1)} className={`size-6 rounded-sm text-[10px] ${page === i + 1 ? "bg-primary text-primary-foreground" : "bg-background border"}`}>{i + 1}</button>)}</div>
        </div>
        <div className="flex h-[560px] flex-col rounded-lg border bg-card"><div className="border-b px-3 py-2 text-sm font-medium">Contract intelligence</div>
          <div className="min-h-0 flex-1"><ChatPanel clauses={defaultClauses} onCite={(p) => setPage(p)} withTable /></div></div>
        <div className="lg:col-span-2 flex gap-2"><Button variant="outline" onClick={() => setStep(1)}>Back</Button><Button onClick={() => setStep(3)}>Next</Button></div>
      </div>}
      {step === 3 && <div className="max-w-lg space-y-3 rounded-lg border bg-card p-5 text-sm">
        <label className="block">New provider<select className={sel} value={provider} onChange={(e) => setProvider(e.target.value)}>{PROVIDERS.map((p) => <option key={p}>{p}</option>)}</select></label>
        {([["term", "Reset term to 36 months from today"], ["rates", "Apply 2026 rate schedule"], ["termination", "Upgrade Termination clause to Standard v3.2"]] as const).map(([k, l]) => (
          <label key={k} className="flex items-center gap-2"><input type="checkbox" checked={changes[k]} onChange={(e) => setChanges({ ...changes, [k]: e.target.checked })} />{l}</label>))}
        <div className="flex gap-2"><Button variant="outline" onClick={() => setStep(2)}>Back</Button>
          <Button onClick={() => { const id = createContract({ provider, type: c.type, mode: "From Existing", compliance: changes.termination ? 92 : c.compliance }); toast.success("Draft created from existing contract"); nav({ to: "/contracts/viewer/$id", params: { id } }); }}>Generate draft</Button></div>
      </div>}
    </div>
  );
}
