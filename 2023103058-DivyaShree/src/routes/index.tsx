import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ScanLine, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCollection, personas, type Persona } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — Provider Contract Intelligence" },
      { name: "description", content: "Sign in as a Contract Loader or Legal Manager to manage provider contracts." },
      { property: "og:title", content: "Sign in — Provider Contract Intelligence" },
      { property: "og:description", content: "Sign in as a Contract Loader or Legal Manager to manage provider contracts." },
    ],
  }),
  component: Login,
});

function Login() {
  const [session, setSession] = useCollection("session");
  const [role, setRole] = useState<Persona>("loader");
  const navigate = useNavigate();
  const opts = [
    { id: "loader" as const, icon: ScanLine, desc: "Digitize legacy contracts, run OCR and load to the pipeline." },
    { id: "legal" as const, icon: Scale, desc: "Draft, redline, review compliance and sign provider agreements." },
  ];
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-sidebar p-12 text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-2"><div className="grid size-9 place-items-center rounded bg-sidebar-primary font-mono text-sm font-bold text-sidebar-primary-foreground">CI</div><span className="font-semibold text-sidebar-accent-foreground">Provider Contract Intelligence</span></div>
        <div>
          <p className="font-serif text-4xl leading-tight text-sidebar-accent-foreground">Every provider agreement, read, scored and tracked — from scanned archive to signed and loaded.</p>
          <div className="mt-8 grid grid-cols-3 gap-4 font-mono text-sm">
            {[["12", "agreements"], ["23", "rate rows / contract"], ["5", "AI agents"]].map(([a, b]) => <div key={b}><div className="text-2xl text-sidebar-primary">{a}</div><div className="text-sidebar-foreground/70">{b}</div></div>)}
          </div>
        </div>
        <div className="text-xs text-sidebar-foreground/60">Demo environment · data stays in your browser</div>
      </div>
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">Choose your role to open the right workspace.</p>
          <div className="mt-6 space-y-3">
            {opts.map((o) => {
              const p = personas[o.id];
              return (
                <button key={o.id} onClick={() => setRole(o.id)} className={cn("flex w-full gap-3 rounded-lg border p-4 text-left transition", role === o.id ? "border-primary ring-2 ring-primary/20" : "hover:border-ring")}>
                  <o.icon className="mt-0.5 size-5 text-primary" />
                  <div><div className="font-medium">{p.role} <span className="font-normal text-muted-foreground">· {p.name}</span></div><div className="text-sm text-muted-foreground">{o.desc}</div></div>
                </button>
              );
            })}
          </div>
          <Button className="mt-6 w-full" size="lg" onClick={() => { setSession({ ...session, persona: role, loggedIn: true }); navigate({ to: personas[role].landing }); }}>Continue as {personas[role].name}</Button>
        </div>
      </div>
    </div>
  );
}
