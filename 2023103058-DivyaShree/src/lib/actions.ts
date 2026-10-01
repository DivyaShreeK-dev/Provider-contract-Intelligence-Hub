import { mockApi } from "./store";
import { seed, type Contract } from "./seed";

type Contracts = typeof seed.contracts;

export function createContract(p: Partial<Contract> & { provider: string; mode?: string }): string {
  const list = mockApi.get<Contracts>("contracts");
  const id = `ctr-${1001 + list.length + Math.floor(Math.random() * 900)}`;
  const today = new Date().toISOString().slice(0, 10);
  const c: Contract = {
    id, name: `Optum – ${p.provider} – Provider Agreement`, provider: p.provider, type: p.type ?? "Professional Services",
    source: p.source ?? "NewGen", status: p.status ?? "Draft", stage: p.stage ?? "Drafting", pipeline: p.pipeline ?? "Non-Delegated",
    owner: p.owner ?? "Mark Thompson", effective: p.effective ?? today, expiry: p.expiry ?? "2029-12-31",
    compliance: p.compliance ?? 88, value: p.value ?? 750000, region: p.region ?? "Northeast",
  };
  mockApi.set("contracts", [c, ...list]);
  if (p.mode) {
    const d = mockApi.get<typeof seed.generatedDrafts>("generatedDrafts");
    mockApi.set("generatedDrafts", [{ id, name: c.name, mode: p.mode, created: today }, ...d]);
  }
  log(`Created ${c.name}`);
  return id;
}

export function log(what: string, who = mockApi.get<typeof seed.session>("session").persona === "legal" ? "Mark Thompson" : "Emily Chen") {
  const at = new Date().toISOString().slice(0, 16).replace("T", " ");
  mockApi.set("auditLog", [{ at, who, what }, ...mockApi.get<typeof seed.auditLog>("auditLog")]);
}

export const PROVIDERS = seed.contracts.map((c) => c.provider);
