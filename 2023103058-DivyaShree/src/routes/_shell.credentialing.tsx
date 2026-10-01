import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader, Pill } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { useCollection } from "@/lib/store";
import { log } from "@/lib/actions";

export const Route = createFileRoute("/_shell/credentialing")({
  head: () => ({ meta: [
    { title: "Credentialing — Provider Contract Intelligence" },
    { name: "description", content: "Provider credential verification." },
    { property: "og:title", content: "Credentialing — Provider Contract Intelligence" },
    { property: "og:description", content: "Provider credential verification." },
  ] }),
  component: Cred,
});

function Cred() {
  const [list, setList] = useCollection("credentialing");
  const set = (id: string, k: string, v: string, override = false) => {
    setList((l) => l.map((x) => x.id !== id ? x : { ...x, checks: { ...x.checks, [k]: v }, overrides: override ? [...x.overrides, `${k} override`] : x.overrides }));
    if (override) log(`Overrode ${k} check`); toast.success(`${k}: ${v}`);
  };
  return (
    <div>
      <PageHeader title="Credentialing" subtitle="Primary source verification for provider intake" />
      <div className="grid gap-4 md:grid-cols-2">{list.map((p) => {
        const vals = Object.values(p.checks); const ready = vals.every((v) => v === "Pass" || v === "Overridden");
        return (
          <div key={p.id} className="rounded-lg border bg-card p-4">
            <div className="mb-3 flex items-center justify-between"><div><div className="font-semibold">{p.provider}</div><div className="font-mono text-xs text-muted-foreground">{p.intake}</div></div><Pill t={ready ? "good" : "warn"}>{ready ? "Ready to contract" : "Verification pending"}</Pill></div>
            <div className="space-y-2">{Object.entries(p.checks).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between text-sm"><span>{k}</span><div className="flex items-center gap-2"><Pill>{v}</Pill>
                {v === "Pending" && <Button size="sm" variant="outline" onClick={() => set(p.id, k, "Pass")}>Verify</Button>}
                {v === "Fail" && <Button size="sm" variant="outline" onClick={() => set(p.id, k, "Overridden", true)}>Override</Button>}</div></div>))}</div>
            {p.overrides.length > 0 && <div className="mt-3 text-xs text-muted-foreground">Overrides: {p.overrides.join(", ")}</div>}
          </div>); })}</div>
    </div>
  );
}
