import { Fragment, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, MessageSquare, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCollection } from "@/lib/store";
import { hydrateContract } from "@/lib/contracts";
import { RATE_COLUMNS, type RateRow } from "@/lib/seed";
import { ChatPanel } from "./ChatPanel";
import { Pill, Score } from "./ui-bits";
import { cn } from "@/lib/utils";

function RateTable({ rows, editable, onChange }: { rows: RateRow[]; editable?: boolean; onChange?: (r: RateRow[]) => void }) {
  const keys: (keyof RateRow)[] = ["group", "item", "channel", "tier", "rate", "fee", "notes"];
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead><tr className="bg-muted">{RATE_COLUMNS.map((c) => <th key={c} className="border px-2 py-1 text-left font-semibold">{c}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => (
          <tr key={i}>{keys.map((k) => (
            <td key={k} className="border px-2 py-1">
              {editable ? <input className="w-full bg-transparent outline-none focus:bg-highlight" value={r[k]} onChange={(e) => onChange?.(rows.map((x, j) => j === i ? { ...x, [k]: e.target.value } : x))} /> : r[k]}
            </td>))}</tr>
        ))}</tbody>
      </table>
    </div>
  );
}

function SignaturePad({ onApply }: { onApply: (data: string) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const pos = (e: React.PointerEvent) => { const r = ref.current!.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  return (
    <div>
      <canvas ref={ref} width={420} height={120} className="w-full max-w-[420px] touch-none rounded border border-dashed bg-card"
        onPointerDown={(e) => { drawing.current = true; const c = ref.current!.getContext("2d")!; const [x, y] = pos(e); c.beginPath(); c.moveTo(x, y); }}
        onPointerMove={(e) => { if (!drawing.current) return; const c = ref.current!.getContext("2d")!; c.lineWidth = 2; c.lineCap = "round"; c.strokeStyle = getComputedStyle(document.body).color; const [x, y] = pos(e); c.lineTo(x, y); c.stroke(); }}
        onPointerUp={() => (drawing.current = false)} onPointerLeave={() => (drawing.current = false)} />
      <div className="mt-2 flex gap-2">
        <Button size="sm" variant="outline" onClick={() => ref.current!.getContext("2d")!.clearRect(0, 0, 420, 120)}>Clear</Button>
        <Button size="sm" onClick={() => onApply(ref.current!.toDataURL())}>Apply signature</Button>
      </div>
    </div>
  );
}

export function ContractViewer({ id, focus, fromPipeline }: { id: string; focus?: string; fromPipeline?: boolean }) {
  const [contracts, setContracts] = useCollection("contracts");
  const [obligations] = useCollection("obligations");
  const navigate = useNavigate();
  const raw = contracts.find((c) => c.id === id);
  const [active, setActive] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<string | null>(null);
  const [rateOpen, setRateOpen] = useState(true);
  const [fullTable, setFullTable] = useState(false);
  const [editTable, setEditTable] = useState(false);
  const [tab, setTab] = useState("intel");
  const [prefill, setPrefill] = useState<string>();
  const [sig, setSig] = useState<string | null>(null);
  const center = useRef<HTMLDivElement>(null);

  const c = raw ? hydrateContract(raw) : null;
  const update = (patch: Partial<NonNullable<typeof raw>>) => setContracts(contracts.map((x) => x.id === id ? { ...hydrateContract(x), ...patch } : x));

  const goTo = (sid: string) => {
    setCollapsed((s) => { const n = new Set(s); n.delete(sid); return n; });
    setActive(sid);
    setTimeout(() => document.getElementById(`sec-${sid}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };
  useEffect(() => { if (focus) setTimeout(() => focus === "signature" ? document.getElementById("sec-signature")?.scrollIntoView({ behavior: "smooth" }) : goTo(focus), 200); }, [focus]); // eslint-disable-line

  if (!c) return <div className="p-8 text-muted-foreground">Contract not found. <Link to="/contracts" className="text-primary underline">Back to contracts</Link></div>;

  const move = (i: number, d: number) => { const s = [...c.sections]; const j = i + d; if (j < 0 || j >= s.length) return; [s[i], s[j]] = [s[j], s[i]]; update({ sections: s }); };
  const del = (sid: string) => { update({ sections: c.sections.filter((s) => s.id !== sid) }); toast.success("Clause removed; sections renumbered"); };
  const cats = ["Financial", "Legal", "Operational"] as const;
  const myObs = obligations.filter((o) => o.contractId === id);
  const intel = [
    { label: "HIPAA", detail: "BAA attached · 5-day breach notice", sid: "s8" },
    { label: "Risk Signals", detail: "Liability cap lacks carve-outs", sid: "s9" },
    { label: "Termination Gaps", detail: "Missing member notification", sid: "s7" },
    { label: "Rate Escalator", detail: "Lesser of 3% or CPI-U", sid: "s5" },
  ];

  return (
    <div className="-m-6 flex h-[calc(100vh-3.5rem)] flex-col">
      {fromPipeline && (
        <div className="flex items-center gap-3 border-b bg-accent px-4 py-2 text-sm text-accent-foreground">
          <ArrowLeft className="size-4" /><Link to="/pipeline" className="font-medium underline">Back to Pipeline</Link>
          <span>You opened this contract from the Signature stage.</span>
        </div>
      )}
      <div className="flex items-center gap-2 overflow-x-auto border-b bg-card px-4 py-2">
        <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">Sections</span>
        {c.sections.map((s, i) => (
          <span key={s.id} className={cn("flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs", active === s.id && "border-ring bg-accent")}>
            <button onClick={() => goTo(s.id)}>{i + 1}. {s.title}</button>
            <button title="Open redlining for this section" onClick={() => navigate({ to: "/compliance", search: { tab: "redlining", section: s.id } })}><MessageSquare className="size-3 text-muted-foreground hover:text-primary" /></button>
          </span>
        ))}
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-[260px_1fr_340px]">
        {/* Left: clauses */}
        <div className="overflow-y-auto border-r bg-card p-3">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Extracted clauses</div>
          {cats.map((cat) => (
            <div key={cat} className="mb-4">
              <div className="mb-1 text-[11px] font-semibold text-primary">{cat}</div>
              {c.clauses.filter((cl) => cl.category === cat).map((cl) => (
                <div key={cl.id} onClick={() => goTo(cl.sectionId)} className={cn("mb-1.5 cursor-pointer rounded-md border p-2 hover:border-ring", active === cl.sectionId && "border-ring bg-accent/50")}>
                  <div className="text-[13px] font-medium">{cl.name}</div>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">Conf. <span className="font-mono">{cl.confidence}%</span> · Compliance <Score v={cl.compliance} /></div>
                  {cl.compliance < 85 && (
                    <button onClick={(e) => { e.stopPropagation(); setTab("chat"); setPrefill(`How can I improve ${cl.name}? Why ${cl.compliance}%?`); }} className="mt-1.5 text-[11px] font-medium text-primary hover:underline">Improve Compliance →</button>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
        {/* Center: document */}
        <div ref={center} className="overflow-y-auto bg-muted p-6">
          <article className="mx-auto max-w-3xl rounded-sm bg-paper p-10 font-serif shadow-sm">
            <h2 className="text-center text-xl font-semibold">{c.name.replace(/–/g, "—")}</h2>
            <p className="mt-1 text-center text-sm text-muted-foreground">Effective {c.effective} · {c.type}</p>
            {c.sections.map((s, i) => {
              const isCol = collapsed.has(s.id);
              return (
                <section id={`sec-${s.id}`} key={s.id} className={cn("group mt-6 scroll-mt-4 rounded p-2 transition-colors", active === s.id && "bg-highlight/60")}>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setCollapsed((st) => { const n = new Set(st); n.has(s.id) ? n.delete(s.id) : n.add(s.id); return n; })}>{isCol ? <ChevronRight className="size-4" /> : <ChevronDown className="size-4" />}</button>
                    <h3 className="font-semibold">Section {i + 1}. {s.title}</h3>
                    <div className="ml-auto flex gap-1 font-sans opacity-0 group-hover:opacity-100">
                      <button title="Edit" onClick={() => setEditing(s.id)} className="rounded p-1 hover:bg-muted"><Pencil className="size-3.5" /></button>
                      <button title="Move up" onClick={() => move(i, -1)} className="rounded p-1 hover:bg-muted"><ArrowUp className="size-3.5" /></button>
                      <button title="Move down" onClick={() => move(i, 1)} className="rounded p-1 hover:bg-muted"><ArrowDown className="size-3.5" /></button>
                      <button title="Delete clause" onClick={() => del(s.id)} className="rounded p-1 text-destructive hover:bg-muted"><Trash2 className="size-3.5" /></button>
                    </div>
                  </div>
                  {!isCol && (editing === s.id ? (
                    <textarea autoFocus defaultValue={s.body} rows={5} className="mt-2 w-full rounded border bg-card p-2 text-sm"
                      onBlur={(e) => { update({ sections: c.sections.map((x) => x.id === s.id ? { ...x, body: e.target.value } : x) }); setEditing(null); toast.success("Clause updated"); }} />
                  ) : <p onClick={() => setEditing(s.id)} className="mt-2 cursor-text text-[15px] leading-7">{s.body}</p>)}
                </section>
              );
            })}
            <section className="mt-10">
              <h3 className="mb-3 text-center font-semibold tracking-wide">EXHIBIT A – RATE SCHEDULE</h3>
              <div className="font-sans"><RateTable rows={c.rateScheduleTable} /></div>
            </section>
            <section id="sec-signature" className="mt-10 scroll-mt-4 border-t pt-6 font-sans">
              <h3 className="font-serif font-semibold">Signature Page</h3>
              <p className="mt-1 text-sm text-muted-foreground">IN WITNESS WHEREOF, the parties have executed this Provider Agreement.</p>
              <div className="mt-4 grid gap-6 sm:grid-cols-2">
                <div>
                  <div className="text-xs text-muted-foreground">For the Plan</div>
                  {sig || c.signed ? (sig ? <img src={sig} alt="Signature" className="h-20" /> : <div className="font-serif text-2xl italic">Mark Thompson</div>) : <SignaturePad onApply={(d) => { setSig(d); toast.success("Signature applied"); }} />}
                  <div className="mt-1 border-t pt-1 text-xs">Mark Thompson, Legal Manager</div>
                </div>
                <div><div className="text-xs text-muted-foreground">For the Provider</div><div className="h-20" /><div className="mt-1 border-t pt-1 text-xs">{c.provider}</div></div>
              </div>
              <Button className="mt-4" disabled={!sig && !c.signed} onClick={() => { update({ signed: true, stage: "Published", status: "Active" }); toast.success("Submitted back to pipeline — moved to Published"); navigate({ to: "/pipeline" }); }}>Submit to pipeline</Button>
            </section>
          </article>
        </div>
        {/* Right: intelligence */}
        <div className="flex min-h-0 flex-col border-l bg-card">
          <Tabs value={tab} onValueChange={setTab} className="flex min-h-0 flex-1 flex-col">
            <TabsList className="m-2 grid grid-cols-3"><TabsTrigger value="intel">Intelligence</TabsTrigger><TabsTrigger value="obs">Obligations</TabsTrigger><TabsTrigger value="chat">Assistant</TabsTrigger></TabsList>
            <TabsContent value="intel" className="flex-1 space-y-3 overflow-y-auto px-3 pb-4">
              <div className="rounded-md border p-3">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contract Metadata</div>
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[13px]">
                  {[["Provider", c.provider], ["Type", c.type], ["Source", c.source], ["Effective", c.effective], ["Expires", c.expiry], ["Region", c.region], ["Owner", c.owner]].map(([k, v]) => (<Fragment key={k}><dt className="text-muted-foreground">{k}</dt><dd>{v}</dd></Fragment>))}
                  <dt className="text-muted-foreground">Status</dt><dd><Pill>{c.status}</Pill></dd>
                  <dt className="text-muted-foreground">Compliance</dt><dd><Score v={c.compliance} /></dd>
                </dl>
              </div>
              <div className="rounded-md border">
                <div className="flex items-center justify-between px-3 py-2">
                  <button onClick={() => setRateOpen(!rateOpen)} className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide">{rateOpen ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}Rate Schedule</button>
                  <button title="Edit rate schedule" onClick={() => { setEditTable(true); setFullTable(true); }} className="rounded p-1 hover:bg-muted"><Pencil className="size-3.5" /></button>
                </div>
                {rateOpen && (
                  <div className="px-3 pb-3">
                    <table className="w-full text-[11px]"><tbody>{c.rateScheduleTable.slice(0, 7).map((r, i) => (
                      <tr key={i} className="border-b last:border-0"><td className="py-1 pr-2">{r.item}</td><td className="py-1 text-right font-mono">{r.rate}</td></tr>
                    ))}</tbody></table>
                    <button onClick={() => { setEditTable(false); setFullTable(true); }} className="mt-2 text-xs font-medium text-primary hover:underline">View full table ({c.rateScheduleTable.length} rows) →</button>
                  </div>
                )}
              </div>
              <div className="rounded-md border p-3">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contract Intelligence</div>
                {intel.map((it) => {
                  const idx = c.sections.findIndex((s) => s.id === it.sid);
                  return (
                    <button key={it.label} onClick={() => goTo(it.sid)} className="mb-1 flex w-full items-start justify-between rounded p-1.5 text-left hover:bg-muted">
                      <span><span className="block text-[13px] font-medium">{it.label}</span><span className="text-[11px] text-muted-foreground">{it.detail}</span></span>
                      <span className="shrink-0 text-[11px] text-primary">→ Section {idx + 1}</span>
                    </button>
                  );
                })}
              </div>
            </TabsContent>
            <TabsContent value="obs" className="flex-1 space-y-2 overflow-y-auto px-3 pb-4">
              {myObs.length === 0 && <p className="text-sm text-muted-foreground">No tracked obligations for this contract.</p>}
              {myObs.map((o) => <div key={o.id} className="rounded-md border p-2 text-sm"><div className="font-medium">{o.obligation}</div><div className="mt-1 flex flex-wrap gap-1 text-xs text-muted-foreground">{o.team} · {o.frequency} · due {o.due} <Pill>{o.status}</Pill></div></div>)}
            </TabsContent>
            <TabsContent value="chat" className="min-h-0 flex-1"><ChatPanel clauses={c.clauses} prefill={prefill} /></TabsContent>
          </Tabs>
        </div>
      </div>
      <Dialog open={fullTable} onOpenChange={setFullTable}>
        <DialogContent className="max-w-5xl">
          <DialogHeader><DialogTitle>Rate Schedule — {c.rateScheduleTable.length} rows × 7 columns {editTable && "(editing)"}</DialogTitle></DialogHeader>
          <div className="max-h-[65vh] overflow-y-auto"><RateTable rows={c.rateScheduleTable} editable={editTable} onChange={(r) => update({ rateScheduleTable: r })} /></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
