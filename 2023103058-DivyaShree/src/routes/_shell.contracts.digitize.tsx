import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Upload, FileText, Eye } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Pill } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { StepLog, useSimulation } from "@/components/Pipeline";
import { useCollection } from "@/lib/store";
import { createContract, log } from "@/lib/actions";
import { defaultSections, seed } from "@/lib/seed";

export const Route = createFileRoute("/_shell/contracts/digitize")({
  head: () => ({ meta: [
    { title: "Digitize Legacy — Provider Contract Intelligence" },
    { name: "description", content: "AI-powered digitization of legacy provider contracts." },
    { property: "og:title", content: "Digitize Legacy — Provider Contract Intelligence" },
    { property: "og:description", content: "AI-powered digitization of legacy provider contracts." },
  ] }),
  component: Digitize,
});

type Doc = (typeof seed.digitizationDocs)[number];
const STEPS = ["Intake Agent: receiving file & classifying document", "OCR engine: page segmentation & text recognition", "Clause Matching Agent: mapping 10 clauses to library", "Intake Agent: extracting Exhibit A rate schedule (23 rows)", "Compliance Agent: scoring clauses against playbook", "Workflow Agent: creating contract record"];

function Digitize() {
  const [docs, setDocs] = useCollection("digitizationDocs");
  const [open, setOpen] = useState(false);
  const [reader, setReader] = useState<Doc | null>(null);
  const kpi = [["Documents", docs.length], ["Completed", docs.filter((d) => d.status === "Completed").length], ["In progress", docs.filter((d) => d.status !== "Completed").length], ["Avg OCR accuracy", Math.round(docs.filter((d) => d.ocr).reduce((a, d) => a + d.ocr, 0) / Math.max(1, docs.filter((d) => d.ocr).length)) + "%"]];
  const process = (id: string) => setDocs((l) => l.map((d) => d.id === id ? { ...d, status: "Completed", progress: 100, ocr: d.ocr || 94 } : d));
  return (
    <div>
      <PageHeader title="Digitize Legacy" subtitle="AI-powered OCR and clause extraction for legacy provider contracts" actions={<Button onClick={() => setOpen(true)}><Upload className="size-4" />Upload contracts</Button>} />
      <div className="mb-6 grid gap-3 sm:grid-cols-4">{kpi.map(([k, v]) => <div key={k} className="rounded-lg border bg-card p-4"><div className="text-xs text-muted-foreground">{k}</div><div className="mt-1 text-2xl font-semibold">{v}</div></div>)}</div>
      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full text-sm"><thead className="bg-muted/50 text-left text-xs text-muted-foreground"><tr>{["Document", "Provider", "Type", "Source", "Pages", "OCR", "Status", "Progress", ""].map((h) => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}</tr></thead>
          <tbody>{docs.map((d) => (
            <tr key={d.id} className="border-t">
              <td className="px-3 py-2"><div className="flex items-center gap-2"><FileText className="size-4 text-muted-foreground" />{d.name}</div></td>
              <td className="px-3 py-2">{d.provider}</td><td className="px-3 py-2">{d.type}</td><td className="px-3 py-2">{d.source}</td>
              <td className="px-3 py-2 font-mono">{d.pages}</td><td className="px-3 py-2 font-mono">{d.ocr ? d.ocr + "%" : "—"}</td>
              <td className="px-3 py-2"><Pill>{d.status}</Pill></td>
              <td className="w-32 px-3 py-2"><Progress value={d.progress} className="h-1.5" /></td>
              <td className="px-3 py-2 text-right">{d.status === "Completed" || d.status === "Review"
                ? <Button size="sm" variant="outline" onClick={() => setReader(d)}><Eye className="size-3.5" />Open</Button>
                : <Button size="sm" variant="secondary" onClick={() => { process(d.id); toast.success(`${d.name} processed`); }}>Run OCR</Button>}</td>
            </tr>))}</tbody></table>
      </div>
      <UploadModal open={open} onOpenChange={setOpen} onDone={(d) => setDocs((l) => [d, ...l])} />
      <Reader doc={reader} onClose={() => setReader(null)} />
    </div>
  );
}

function UploadModal({ open, onOpenChange, onDone }: { open: boolean; onOpenChange: (b: boolean) => void; onDone: (d: Doc) => void }) {
  const [files, setFiles] = useState<string[]>([]);
  const [drag, setDrag] = useState(false);
  const [running, setRunning] = useState(false);
  const [newId, setNewId] = useState<string | null>(null);
  const step = useSimulation(STEPS, running, 650, () => {
    if (newId) return;
    const name = files[0] ?? "Legacy_Contract.pdf";
    const provider = seed.contracts[(name.length) % seed.contracts.length].provider;
    const id = createContract({ provider, source: "Digitized", status: "In Review", stage: "Review", compliance: 84 });
    onDone({ id: "dg-" + Date.now(), name, provider, type: "Professional Services", source: "Manual Upload", pages: 30 + (name.length % 30), ocr: 95, status: "Completed", progress: 100 });
    log(`Digitized ${name}`); setNewId(id); toast.success("Digitization complete");
  });
  const reset = () => { setFiles([]); setRunning(false); setNewId(null); };
  return (
    <Dialog open={open} onOpenChange={(b) => { onOpenChange(b); if (!b) reset(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Upload legacy contracts</DialogTitle></DialogHeader>
        {!running ? (<>
          <label onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); setFiles(Array.from(e.dataTransfer.files).map((f) => f.name)); }}
            className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-8 text-center text-sm ${drag ? "border-primary bg-accent" : "border-border"}`}>
            <Upload className="size-6 text-muted-foreground" />
            <span>Drag & drop PDF, TIFF or scanned images, or click to browse</span>
            <input type="file" multiple className="hidden" onChange={(e) => setFiles(Array.from(e.target.files ?? []).map((f) => f.name))} />
          </label>
          {files.length > 0 && <ul className="space-y-1 text-sm">{files.map((f) => <li key={f} className="flex items-center gap-2"><FileText className="size-4" />{f}</li>)}</ul>}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setFiles(["Riverbend_Oncology_2013_Scan.pdf"])}>Use sample file</Button>
            <Button disabled={!files.length} onClick={() => setRunning(true)}>Start digitization</Button>
          </div>
        </>) : (<>
          <Progress value={(Math.min(step, STEPS.length) / STEPS.length) * 100} />
          <StepLog steps={STEPS} done={step} />
          {newId && <div className="flex justify-end"><Button asChild><Link to="/contracts/viewer/$id" params={{ id: newId }}>Open in Contract Viewer</Link></Button></div>}
        </>)}
      </DialogContent>
    </Dialog>
  );
}

function Reader({ doc, onClose }: { doc: Doc | null; onClose: () => void }) {
  const [page, setPage] = useState(1);
  if (!doc) return null;
  const secs = defaultSections(doc.provider);
  const s = secs[(page - 1) % secs.length];
  const fields = [["Provider", doc.provider], ["Agreement type", doc.type], ["Effective date", "01/01/2026"], ["Term", "36 months"], ["Termination notice", "120 days"], ["Rate rows extracted", "23"], ["OCR accuracy", doc.ocr + "%"]];
  return (
    <Dialog open onOpenChange={(b) => !b && onClose()}>
      <DialogContent className="max-w-5xl">
        <DialogHeader><DialogTitle>{doc.name}</DialogTitle></DialogHeader>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-md border bg-muted/40 p-4">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground"><span>Scanned page {page} / {doc.pages}</span>
              <div className="flex gap-1"><Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</Button><Button size="sm" variant="outline" disabled={page >= doc.pages} onClick={() => setPage(page + 1)}>Next</Button></div></div>
            <div className="min-h-72 rounded-sm border bg-background p-5 font-serif text-sm leading-relaxed">
              <div className="mb-2 font-semibold">Section {((page - 1) % secs.length) + 1}. {s.title}</div><p>{s.body}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Extracted fields</div>
            {fields.map(([k, v]) => <div key={k} className="flex justify-between rounded-md border px-3 py-2 text-sm"><span className="text-muted-foreground">{k}</span><span className="font-medium">{v}</span></div>)}
            <div className="pt-2 text-sm font-medium">Clause on this page</div>
            <div className="rounded-md border bg-highlight/40 px-3 py-2 text-sm">{s.title} <span className="ml-2"><Pill t="good">matched</Pill></span></div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
