import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import {
  LayoutDashboard, FileText, ScanLine, PenTool, BookOpen, GitCompare, DollarSign, ShieldCheck,
  BadgeCheck, Workflow, ListChecks, RefreshCw, Users, Bell, Search, ChevronDown, Database, LogOut,
} from "lucide-react";
import { useCollection, personas } from "@/lib/store";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; icon: typeof FileText; children?: NavItem[] };
const nav: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/contracts", label: "Contracts", icon: FileText, children: [
    { to: "/contracts", label: "Overview", icon: FileText },
    { to: "/contracts/digitize", label: "Digitize Legacy", icon: ScanLine },
    { to: "/contracts/newgen", label: "NewGen Contract Creation", icon: PenTool },
  ] },
  { to: "/clauses", label: "Standard Clauses", icon: BookOpen },
  { to: "/review", label: "Contract Review", icon: GitCompare },
  { to: "/rates", label: "Rates & Reimbursement", icon: DollarSign },
  { to: "/compliance", label: "Compliance Hub", icon: ShieldCheck },
  { to: "/credentialing", label: "Credentialing", icon: BadgeCheck },
  { to: "/pipeline", label: "Pipeline", icon: Workflow },
  { to: "/obligations", label: "Obligation Tracker", icon: ListChecks },
  { to: "/renewals", label: "Renewals", icon: RefreshCw },
  { to: "/feed", label: "Downstream Feed", icon: Database },
  { to: "/users", label: "User Management", icon: Users },
];

function NavLink({ item, nested }: { item: NavItem; nested?: boolean }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const active = item.to === "/contracts" && nested ? path === "/contracts" : path === item.to || path.startsWith(item.to + "/");
  const Icon = item.icon;
  return (
    <Link to={item.to} className={cn("flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors",
      nested && "pl-8", active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground")}>
      {!nested && <Icon className={cn("size-4", active && "text-sidebar-primary")} />}
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function GlobalSearch() {
  const [q, setQ] = useState("");
  const [contracts] = useCollection("contracts");
  const [clauses] = useCollection("standardClauses");
  const [obs] = useCollection("obligations");
  const navigate = useNavigate();
  const results = useMemo(() => {
    if (q.length < 2) return [];
    const s = q.toLowerCase();
    return [
      ...contracts.filter((c) => c.name.toLowerCase().includes(s)).slice(0, 4).map((c) => ({ k: "Contract", label: c.name, go: () => navigate({ to: "/contracts/viewer/$id", params: { id: c.id } }) })),
      ...clauses.filter((c) => (c.title + c.tags.join(" ")).toLowerCase().includes(s)).slice(0, 3).map((c) => ({ k: "Clause", label: c.title, go: () => navigate({ to: "/clauses" }) })),
      ...obs.filter((o) => o.obligation.toLowerCase().includes(s)).slice(0, 3).map((o) => ({ k: "Obligation", label: o.obligation, go: () => navigate({ to: "/obligations" }) })),
    ];
  }, [q, contracts, clauses, obs, navigate]);
  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search contracts, clauses, obligations…"
        className="h-9 w-full rounded-md border bg-background pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
      {results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 shadow-lg">
          {results.map((r, i) => (
            <button key={i} onClick={() => { r.go(); setQ(""); }} className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-muted">
              <span className="w-20 shrink-0 text-[11px] uppercase tracking-wide text-muted-foreground">{r.k}</span>
              <span className="truncate">{r.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [session, setSession] = useCollection("session");
  const [notes, setNotes] = useCollection("notifications");
  const navigate = useNavigate();
  const p = personas[session.persona];
  const unread = notes.filter((n) => !n.read).length;

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
        <div className="border-b border-sidebar-border px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded bg-sidebar-primary font-mono text-xs font-bold text-sidebar-primary-foreground">CI</div>
            <div className="leading-tight">
              <div className="text-[13px] font-semibold text-sidebar-accent-foreground">Provider Contract</div>
              <div className="text-[13px] text-sidebar-primary">Intelligence</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
          {nav.map((item) => item.children ? (
            <div key={item.label} className="py-1">
              <div className="flex items-center gap-2.5 px-2.5 py-1.5 text-[13px] text-sidebar-foreground/80"><item.icon className="size-4" />{item.label}</div>
              {item.children.map((c) => <NavLink key={c.to} item={c} nested />)}
            </div>
          ) : <NavLink key={item.to} item={item} />)}
        </nav>
        <div className="border-t border-sidebar-border p-3 text-[11px] text-sidebar-foreground/60">Demo data · stored in this browser</div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-card/95 px-6 backdrop-blur">
          <GlobalSearch />
          <div className="ml-auto flex items-center gap-3">
            <Popover>
              <PopoverTrigger className="relative rounded-md p-2 hover:bg-muted" aria-label="Notifications">
                <Bell className="size-4" />
                {unread > 0 && <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-destructive text-[10px] text-destructive-foreground">{unread}</span>}
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0">
                <div className="flex items-center justify-between border-b px-3 py-2 text-sm font-medium">Notifications
                  <button className="text-xs text-primary" onClick={() => setNotes(notes.map((n) => ({ ...n, read: true })))}>Mark all read</button></div>
                {notes.map((n) => <div key={n.id} className={cn("border-b px-3 py-2 text-sm last:border-0", !n.read && "bg-accent/40")}>{n.text}</div>)}
              </PopoverContent>
            </Popover>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-md border px-2 py-1 hover:bg-muted">
                <span className="grid size-7 place-items-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">{p.initials}</span>
                <span className="text-left leading-tight"><span className="block text-[13px] font-medium">{p.name}</span><span className="block text-[11px] text-muted-foreground">{p.role}</span></span>
                <ChevronDown className="size-3.5 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Switch User</DropdownMenuLabel>
                {Object.values(personas).map((x) => (
                  <DropdownMenuItem key={x.id} onClick={() => { setSession({ ...session, persona: x.id }); navigate({ to: x.landing }); }}>
                    <span className="font-medium">{x.name}</span><span className="ml-auto text-xs text-muted-foreground">{x.role}</span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { setSession({ ...session, loggedIn: false }); navigate({ to: "/" }); }}><LogOut className="size-4" /> Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
