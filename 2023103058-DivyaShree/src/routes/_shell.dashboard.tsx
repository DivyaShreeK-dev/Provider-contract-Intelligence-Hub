import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader, Pill, Score } from "@/components/ui-bits";
import { useCollection } from "@/lib/store";

export const Route = createFileRoute("/_shell/dashboard")({
  head: () => ({ meta: [
    { title: "Dashboard — Provider Contract Intelligence" },
    { name: "description", content: "Executive overview of provider contract KPIs, compliance and pending actions." },
    { property: "og:title", content: "Dashboard — Provider Contract Intelligence" },
    { property: "og:description", content: "Executive overview of provider contract KPIs, compliance and pending actions." },
  ] }),
  component: Dashboard,
});

const trend = [
  { m: "Apr", score: 78 }, { m: "May", score: 80 }, { m: "Jun", score: 79 }, { m: "Jul", score: 83 }, { m: "Aug", score: 84 }, { m: "Sep", score: 85 },
];

function Dashboard() {
  const [contracts] = useCollection("contracts");
  const [docs] = useCollection("digitizationDocs");
  const [drafts] = useCollection("generatedDrafts");
  const [redlines] = useCollection("redlineDocs");
  const [activity] = useCollection("activity");
  const [obs] = useCollection("obligations");
  const [reviews] = useCollection("reviewRequests");
  const navigate = useNavigate();
  const avg = Math.round(contracts.reduce((a, c) => a + c.compliance, 0) / contracts.length);
  const kpis = [
    { label: "Total Contracts", value: docs.length + drafts.length, to: "/contracts", hint: "Digitized + Created" },
    { label: "Contracts Created", value: drafts.length, to: "/contracts/newgen", hint: "NewGen" },
    { label: "Contracts Digitized", value: docs.length, to: "/contracts/digitize", hint: "Digitize Legacy" },
    { label: "Compliance Score", value: `${avg}%`, to: "/compliance", hint: "Average" },
    { label: "Redlining Pending", value: redlines.length, to: "/compliance", hint: "Documents" },
  ];
  const stages = ["Intake", "Credentialing", "Drafting", "Review", "Signature", "Published"].map((s) => ({ s, n: contracts.filter((c) => c.stage === s).length }));
  const expiring = [...contracts].sort((a, b) => a.expiry.localeCompare(b.expiry)).slice(0, 5);

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Contract portfolio health across every module" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {kpis.map((k) => (
          <button key={k.label} onClick={() => navigate({ to: k.to })} className="rounded-lg border bg-card p-4 text-left transition hover:border-ring hover:shadow-sm">
            <div className="text-xs text-muted-foreground">{k.label}</div>
            <div className="mt-1 font-mono text-3xl font-semibold">{k.value}</div>
            <div className="mt-1 text-[11px] text-muted-foreground">{k.hint} →</div>
          </button>
        ))}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card><CardHeader><CardTitle className="text-sm">Stage distribution</CardTitle></CardHeader><CardContent className="h-56">
          <ResponsiveContainer><BarChart data={stages}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="s" fontSize={10} /><YAxis fontSize={10} allowDecimals={false} /><Tooltip /><Bar dataKey="n" fill="var(--chart-1)" radius={[3, 3, 0, 0]} /></BarChart></ResponsiveContainer>
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Compliance trend</CardTitle></CardHeader><CardContent className="h-56">
          <ResponsiveContainer><LineChart data={trend}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="m" fontSize={10} /><YAxis domain={[70, 90]} fontSize={10} /><Tooltip /><Line dataKey="score" stroke="var(--chart-2)" strokeWidth={2} /></LineChart></ResponsiveContainer>
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Expiring contracts</CardTitle></CardHeader><CardContent className="space-y-2">
          {expiring.map((c) => <Link key={c.id} to="/renewals" className="flex items-center justify-between rounded p-1 text-sm hover:bg-muted"><span className="truncate">{c.provider}</span><span className="font-mono text-xs text-muted-foreground">{c.expiry}</span></Link>)}
        </CardContent></Card>
        <Card className="lg:col-span-2"><CardHeader><CardTitle className="text-sm">Recent activity</CardTitle></CardHeader><CardContent className="space-y-2">
          {activity.map((a, i) => <div key={i} className="flex gap-3 text-sm"><span className="w-24 shrink-0 text-xs text-muted-foreground">{a.at}</span>{a.text}</div>)}
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Task summary</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
          <Link to="/obligations" className="flex justify-between hover:underline">Open obligations <span className="font-mono">{obs.filter((o) => o.status !== "Compliant").length}</span></Link>
          <Link to="/obligations" className="flex justify-between hover:underline">Overdue <Pill t="bad">{obs.filter((o) => o.status === "Overdue").length}</Pill></Link>
          <Link to="/review" className="flex justify-between hover:underline">Reviews awaiting action <span className="font-mono">{reviews.filter((r) => r.status !== "Sent for approval").length}</span></Link>
          <Link to="/compliance" className="flex justify-between hover:underline">Lowest clause score <Score v={68} /></Link>
        </CardContent></Card>
      </div>
    </div>
  );
}
