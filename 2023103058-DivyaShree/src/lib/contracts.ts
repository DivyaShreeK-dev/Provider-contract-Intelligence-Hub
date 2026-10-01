import { defaultClauses, defaultRateSchedule, defaultSections, type Contract } from "./seed";

/** Fill in defaults without overwriting existing data. */
export function hydrateContract(c: Contract): Required<Pick<Contract, "sections" | "clauses" | "rateScheduleTable">> & Contract {
  const clauses = c.clauses ?? defaultClauses.map((cl) => cl.id === "c7" ? { ...cl, compliance: c.compliance < 80 ? 68 : 68 } : cl);
  return {
    ...c,
    sections: c.sections ?? defaultSections(c.provider),
    clauses,
    rateScheduleTable: c.rateScheduleTable ?? defaultRateSchedule(c.effective),
  };
}

type Improvement = { why: string; changes: string[]; projected: number };
const improvements: Record<string, Improvement> = {
  "Termination Without Cause": {
    why: "The clause sets a notice period but omits four provisions regulators and our playbook expect.",
    changes: [
      "Add an auto-renewal interaction statement so notice cannot be defeated by the renewal date (Playbook §2.3).",
      "Add an effect-of-termination provision covering continuation of care for Members in active treatment (42 C.F.R. § 422.504(g)(2)).",
      "Add a records retention requirement of ten (10) years (42 C.F.R. § 422.504(d)).",
      "Add member notification at least 30 days before termination (42 C.F.R. § 422.111(e)).",
    ],
    projected: 93,
  },
  "Indemnification": {
    why: "The cap lacks carve-outs for willful misconduct and HIPAA breaches.",
    changes: ["Carve out willful misconduct and breach of Section 8 from the liability cap (Playbook §9.1).", "Add a mutual insurance requirement of $1M/$3M."],
    projected: 90,
  },
  "Rate Escalator": {
    why: "The escalator has no floor or review mechanism, and exceeds the CPI-U guidance in 2 regions.",
    changes: ["Cap annual escalation at 2.5% for professional agreements (Finance Policy FP-12).", "Require written annual rate escalator review 60 days before anniversary."],
    projected: 89,
  },
};

const answerMap: [RegExp, string][] = [
  [/terminat/i, "Termination Without Cause (Section 7) allows either party to terminate on 120 days' notice. It currently lacks effect-of-termination and member notification provisions."],
  [/hipaa|privacy|breach/i, "Section 8 requires HIPAA/HITECH compliance and breach reporting within five business days. A Business Associate Agreement is attached."],
  [/rate|fee|awp|pepm/i, "Exhibit A contains 23 rate rows: Medical PEPM $4.25, Pharmacy PEPM $2.10, Retail 30 Generic at AWP − 82%, and 100% retail brand rebate pass-through."],
  [/term|renew/i, "The initial term is 36 months, renewing automatically for 12-month periods unless 90 days' written notice is given (Section 2)."],
  [/claim/i, "Clean claims must be submitted within 90 days and are paid within 30 days (Section 6)."],
  [/indemn|liab/i, "Liability is capped at 12 months of fees, excluding gross negligence (Section 9)."],
];

export function answerQuestion(q: string, clauses: { name: string; compliance: number }[]): { text: string; citations: number[] } {
  if (/improve|why .*\d+%|recommend|what changes/i.test(q)) {
    const target = clauses.find((c) => q.toLowerCase().includes(c.name.toLowerCase())) ;
    const list = target ? [target] : clauses.filter((c) => c.compliance < 85);
    const parts = list.map((c) => {
      const imp = improvements[c.name] ?? { why: "Minor gaps against playbook language.", changes: ["Align wording with the current Standard Clause version."], projected: Math.min(95, c.compliance + 8) };
      return `**${c.name}** — current score **${c.compliance}%**\n\n*Why:* ${imp.why}\n\n*Recommended changes:*\n${imp.changes.map((x) => `- ${x}`).join("\n")}\n\n*Projected score:* **${imp.projected}%**`;
    });
    return { text: parts.join("\n\n---\n\n") || "All clauses are at or above 85%.", citations: [14, 22] };
  }
  for (const [re, a] of answerMap) if (re.test(q)) return { text: a, citations: [3 + (a.length % 40), 12] };
  return { text: "I couldn't find a direct match. Try asking about termination, HIPAA, rates, renewal, claims, or indemnification.", citations: [] };
}
