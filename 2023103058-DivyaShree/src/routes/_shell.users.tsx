import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader, Pill } from "@/components/ui-bits";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCollection } from "@/lib/store";
import { log } from "@/lib/actions";

export const Route = createFileRoute("/_shell/users")({
  head: () => ({ meta: [
    { title: "User Management — Provider Contract Intelligence" },
    { name: "description", content: "Roles, permissions and audit trail." },
    { property: "og:title", content: "User Management — Provider Contract Intelligence" },
    { property: "og:description", content: "Roles, permissions and audit trail." },
  ] }),
  component: Users,
});

const LEVELS = ["View", "Edit", "Approve", "Admin"];

function Users() {
  const [users, setUsers] = useCollection("users");
  const [perms, setPerms] = useCollection("permissions");
  const [audit] = useCollection("auditLog");
  const roles = Object.keys(perms);
  const areas = Object.keys(perms[roles[0]]);
  return (
    <div>
      <PageHeader title="User Management" subtitle="Users, role permissions and audit trail" />
      <Tabs defaultValue="users"><TabsList><TabsTrigger value="users">Users</TabsTrigger><TabsTrigger value="perms">Permissions</TabsTrigger><TabsTrigger value="audit">Audit log</TabsTrigger></TabsList>
        <TabsContent value="users" className="mt-4"><div className="rounded-lg border bg-card"><table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs text-muted-foreground"><tr>{["Name", "Email", "Role", "Active"].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr></thead>
          <tbody>{users.map((u) => <tr key={u.id} className="border-t"><td className="px-3 py-2 font-medium">{u.name}</td><td className="px-3 py-2 text-muted-foreground">{u.email}</td>
            <td className="px-3 py-2"><select className="h-8 rounded-md border bg-background px-2" value={u.role} onChange={(e) => { setUsers((l) => l.map((x) => x.id === u.id ? { ...x, role: e.target.value } : x)); log(`Changed ${u.name} role → ${e.target.value}`); toast.success("Role updated"); }}>{roles.map((r) => <option key={r}>{r}</option>)}</select></td>
            <td className="px-3 py-2"><Switch checked={u.active} onCheckedChange={(v) => { setUsers((l) => l.map((x) => x.id === u.id ? { ...x, active: v } : x)); log(`${v ? "Activated" : "Deactivated"} ${u.name}`); }} /></td></tr>)}</tbody></table></div></TabsContent>
        <TabsContent value="perms" className="mt-4"><div className="overflow-x-auto rounded-lg border bg-card"><table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs text-muted-foreground"><tr><th className="px-3 py-2">Role</th>{areas.map((a) => <th key={a} className="px-3 py-2">{a}</th>)}</tr></thead>
          <tbody>{roles.map((r) => <tr key={r} className="border-t"><td className="px-3 py-2 font-medium">{r}</td>{areas.map((a) => <td key={a} className="px-3 py-2">
            <select className="h-8 rounded-md border bg-background px-2 text-xs" value={perms[r][a]} onChange={(e) => { setPerms({ ...perms, [r]: { ...perms[r], [a]: e.target.value } }); log(`Changed role permissions: ${r} → ${a} ${e.target.value}`); }}>{LEVELS.map((l) => <option key={l}>{l}</option>)}</select></td>)}</tr>)}</tbody></table></div></TabsContent>
        <TabsContent value="audit" className="mt-4"><div className="space-y-1 rounded-lg border bg-card p-3">{audit.map((a, i) => <div key={i} className="flex gap-3 border-b py-1.5 text-sm last:border-0"><span className="w-36 font-mono text-xs text-muted-foreground">{a.at}</span><Pill t="neutral">{a.who}</Pill><span>{a.what}</span></div>)}</div></TabsContent>
      </Tabs>
    </div>
  );
}
