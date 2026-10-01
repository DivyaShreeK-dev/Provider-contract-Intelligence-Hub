// Deterministic seeded demo data for Provider Contract Intelligence.

export type RateRow = { group: string; item: string; channel: string; tier: string; rate: string; fee: string; notes: string };
export const RATE_COLUMNS = ["Group", "Item", "Channel", "Tier", "Rate / Discount", "Dispensing Fee", "Notes"];

export function defaultRateSchedule(effective = "01/01/2026"): RateRow[] {
  return [
    { group: "Contract Terms", item: "Effective Date", channel: "—", tier: "—", rate: effective, fee: "—", notes: "Commencement of services" },
    { group: "Contract Terms", item: "Term", channel: "—", tier: "—", rate: "36 months", fee: "—", notes: "Initial term" },
    { group: "Contract Terms", item: "Auto-Renewal", channel: "—", tier: "—", rate: "12-month periods", fee: "—", notes: "Unless notice given" },
    { group: "Contract Terms", item: "Termination Notice", channel: "—", tier: "—", rate: "90 days", fee: "—", notes: "Written notice" },
    { group: "Base Administrative Fees", item: "Medical PEPM", channel: "All", tier: "—", rate: "$4.25", fee: "—", notes: "Per employee per month" },
    { group: "Base Administrative Fees", item: "Pharmacy PEPM", channel: "All", tier: "—", rate: "$2.10", fee: "—", notes: "Per employee per month" },
    { group: "Base Administrative Fees", item: "Behavioral Health PEPM", channel: "All", tier: "—", rate: "$1.35", fee: "—", notes: "Per employee per month" },
    { group: "Broker/Paper Claim Fees", item: "Electronic Claim", channel: "EDI", tier: "—", rate: "$0.00", fee: "—", notes: "Per claim" },
    { group: "Broker/Paper Claim Fees", item: "Broker-Submitted Claim", channel: "Broker", tier: "—", rate: "$1.50", fee: "—", notes: "Per claim" },
    { group: "Broker/Paper Claim Fees", item: "Paper Claim", channel: "Mail", tier: "—", rate: "$2.75", fee: "—", notes: "Per claim" },
    { group: "AWP-based Pricing", item: "Retail 30", channel: "Retail", tier: "Generic", rate: "AWP − 82%", fee: "$0.85", notes: "30-day supply" },
    { group: "AWP-based Pricing", item: "Retail 30", channel: "Retail", tier: "Brand", rate: "AWP − 19%", fee: "$0.85", notes: "30-day supply" },
    { group: "AWP-based Pricing", item: "Retail 90", channel: "Retail", tier: "Generic", rate: "AWP − 85%", fee: "$0.50", notes: "90-day supply" },
    { group: "AWP-based Pricing", item: "Retail 90", channel: "Retail", tier: "Brand", rate: "AWP − 22%", fee: "$0.50", notes: "90-day supply" },
    { group: "AWP-based Pricing", item: "Specialty", channel: "Specialty", tier: "Generic", rate: "AWP − 60%", fee: "$0.00", notes: "Limited distribution" },
    { group: "AWP-based Pricing", item: "Specialty", channel: "Specialty", tier: "Brand", rate: "AWP − 21%", fee: "$0.00", notes: "Limited distribution" },
    { group: "Client Rebate Share", item: "Brand Rebate", channel: "Retail", tier: "Brand", rate: "100% pass-through", fee: "—", notes: "Quarterly" },
    { group: "Client Rebate Share", item: "Brand Rebate", channel: "Mail", tier: "Brand", rate: "95%", fee: "—", notes: "Quarterly" },
    { group: "Client Rebate Share", item: "Brand Rebate", channel: "Specialty", tier: "Brand", rate: "90%", fee: "—", notes: "Quarterly" },
    { group: "Example Brand Drugs (metadata only)", item: "Lipitor", channel: "Retail 30", tier: "Brand", rate: "AWP − 19%", fee: "$0.85", notes: "Reference only" },
    { group: "Example Brand Drugs (metadata only)", item: "Humira", channel: "Specialty", tier: "Brand", rate: "AWP − 21%", fee: "$0.00", notes: "Reference only" },
    { group: "Example Brand Drugs (metadata only)", item: "Enbrel", channel: "Specialty", tier: "Brand", rate: "AWP − 21%", fee: "$0.00", notes: "Reference only" },
    { group: "Example Brand Drugs (metadata only)", item: "Keytruda", channel: "Specialty", tier: "Brand", rate: "AWP − 18%", fee: "$0.00", notes: "Reference only" },
  ];
}

export type Section = { id: string; title: string; body: string };
export type Clause = { id: string; name: string; category: "Financial" | "Legal" | "Operational"; confidence: number; compliance: number; sectionId: string };

export function defaultSections(provider: string): Section[] {
  return [
    { id: "s1", title: "Definitions", body: `"Provider" means ${provider}, including its employed and contracted practitioners. "Covered Services" means medically necessary services rendered to Members under the Plan.` },
    { id: "s2", title: "Term and Renewal", body: "This Agreement commences on the Effective Date and continues for thirty-six (36) months. Thereafter it renews automatically for successive twelve (12) month periods unless either party provides ninety (90) days' written notice." },
    { id: "s3", title: "Provider Obligations", body: "Provider shall maintain all licenses, submit quarterly utilization reports, participate in credentialing renewal verification every thirty-six months, and comply with network adequacy standards." },
    { id: "s4", title: "Compensation and Rate Schedule", body: "Plan shall reimburse Provider in accordance with Exhibit A – Rate Schedule. Rates are extracted per service category and are inclusive of all administrative fees except as stated." },
    { id: "s5", title: "Rate Escalator", body: "Rates shall increase annually on each anniversary by the lesser of three percent (3%) or the CPI-U Medical Care index, subject to annual rate escalator review by Finance." },
    { id: "s6", title: "Claims Submission and Payment", body: "Provider shall submit clean claims within ninety (90) days of service. Plan shall pay clean claims within thirty (30) days. Claims reconciliation audits shall occur semi-annually." },
    { id: "s7", title: "Termination Without Cause", body: "Either party may terminate this Agreement without cause upon one hundred twenty (120) days' prior written notice to the other party." },
    { id: "s8", title: "HIPAA and Confidentiality", body: "The parties shall comply with HIPAA, HITECH, and 45 C.F.R. Parts 160 and 164. Provider shall execute the Business Associate Agreement attached hereto and report breaches within five (5) business days." },
    { id: "s9", title: "Risk Allocation and Indemnification", body: "Each party shall indemnify the other against third-party claims arising from its negligence. Liability is capped at fees paid in the preceding twelve (12) months, excluding gross negligence." },
    { id: "s10", title: "Dispute Resolution", body: "Disputes shall first be escalated to executive leadership for thirty (30) days, then to binding arbitration under AAA Healthcare rules in the state of the Plan's domicile." },
  ];
}

export const defaultClauses: Clause[] = [
  { id: "c1", name: "Definitions", category: "Legal", confidence: 97, compliance: 94, sectionId: "s1" },
  { id: "c2", name: "Term & Auto-Renewal", category: "Legal", confidence: 95, compliance: 90, sectionId: "s2" },
  { id: "c3", name: "Provider Obligations", category: "Operational", confidence: 92, compliance: 88, sectionId: "s3" },
  { id: "c4", name: "Rate Schedule Extraction", category: "Financial", confidence: 96, compliance: 91, sectionId: "s4" },
  { id: "c5", name: "Rate Escalator", category: "Financial", confidence: 93, compliance: 82, sectionId: "s5" },
  { id: "c6", name: "Claims Submission", category: "Operational", confidence: 90, compliance: 86, sectionId: "s6" },
  { id: "c7", name: "Termination Without Cause", category: "Legal", confidence: 94, compliance: 68, sectionId: "s7" },
  { id: "c8", name: "HIPAA & Confidentiality", category: "Legal", confidence: 98, compliance: 95, sectionId: "s8" },
  { id: "c9", name: "Indemnification", category: "Legal", confidence: 89, compliance: 79, sectionId: "s9" },
  { id: "c10", name: "Dispute Resolution", category: "Operational", confidence: 91, compliance: 87, sectionId: "s10" },
];

export type Contract = {
  id: string; name: string; provider: string; type: string; source: "Digitized" | "NewGen";
  status: "Draft" | "In Review" | "Redlining" | "Pending Signature" | "Active" | "Expiring";
  stage: string; pipeline: "Delegated" | "Non-Delegated"; owner: string;
  effective: string; expiry: string; compliance: number; value: number; region: string;
  sections?: Section[]; clauses?: Clause[]; rateScheduleTable?: RateRow[]; signed?: boolean;
};

const providers = ["Sunrise Health", "Northeast Medical Group", "Southeast Care Partners", "Midwest Regional Hospital", "Lakeside Pediatrics", "Summit Orthopedics", "Valley Behavioral Health", "Coastal Imaging Center", "Pinecrest Family Practice", "Riverbend Oncology", "Harbor Dialysis", "Metro Cardiology Associates"];
const stagesD = ["Intake", "Credentialing", "Drafting", "Review", "Signature", "Published"];
const statuses: Contract["status"][] = ["Active", "In Review", "Redlining", "Pending Signature", "Draft", "Expiring"];

export const DELEGATED_STAGES = [
  { key: "Intake", sub: "Delegate roster" }, { key: "Credentialing", sub: "Delegate attested" }, { key: "Drafting", sub: "" },
  { key: "Review", sub: "Legal & Finance" }, { key: "Signature", sub: "" }, { key: "Published", sub: "Loaded downstream" },
];
export const NONDELEGATED_STAGES = [
  { key: "Intake", sub: "Application" }, { key: "Credentialing", sub: "Primary source" }, { key: "Drafting", sub: "" },
  { key: "Review", sub: "Legal" }, { key: "Signature", sub: "" }, { key: "Published", sub: "Claims & directory" },
];

function mkContracts(): Contract[] {
  return providers.map((p, i) => {
    const source = i % 3 === 0 ? "NewGen" : "Digitized";
    const status = statuses[i % statuses.length];
    const exp = new Date(2026, 9 + (i % 8) * 2, 1 + i);
    return {
      id: `ctr-${1001 + i}`,
      name: `Optum – ${p} – Provider Agreement`,
      provider: p,
      type: ["Professional Services", "Facility", "Ancillary", "Behavioral Health"][i % 4],
      source, status,
      stage: stagesD[i % stagesD.length],
      pipeline: i % 2 === 0 ? "Delegated" : "Non-Delegated",
      owner: i % 2 === 0 ? "Emily Chen" : "Mark Thompson",
      effective: `2024-${String((i % 12) + 1).padStart(2, "0")}-01`,
      expiry: exp.toISOString().slice(0, 10),
      compliance: [92, 68, 85, 77, 94, 81, 88, 73, 90, 86, 79, 95][i],
      value: 400000 + i * 137000,
      region: ["Northeast", "Southeast", "Midwest", "West"][i % 4],
    };
  });
}

export const seed = {
  session: { persona: "loader" as "loader" | "legal", loggedIn: false },
  contracts: mkContracts(),
  contractFamilies: [
    { id: "fam-1", name: "Optum Professional Network", contracts: ["ctr-1001", "ctr-1005", "ctr-1009"] },
    { id: "fam-2", name: "Optum Facility Network", contracts: ["ctr-1002", "ctr-1006", "ctr-1010"] },
  ],
  digitizationDocs: [
    { id: "dg-1", name: "Northeast_Medical_2014_Scan.pdf", provider: "Northeast Medical Group", type: "Professional Services", source: "Scanned Archive", pages: 48, ocr: 96, status: "Completed", progress: 100 },
    { id: "dg-2", name: "Midwest_Regional_Facility_2011.pdf", provider: "Midwest Regional Hospital", type: "Facility", source: "Box Upload", pages: 72, ocr: 91, status: "Completed", progress: 100 },
    { id: "dg-3", name: "Lakeside_Peds_Amendment_3.tif", provider: "Lakeside Pediatrics", type: "Amendment", source: "Fax Inbox", pages: 12, ocr: 88, status: "Extracting", progress: 64 },
    { id: "dg-4", name: "Summit_Ortho_Legacy_2009.pdf", provider: "Summit Orthopedics", type: "Professional Services", source: "Scanned Archive", pages: 36, ocr: 0, status: "Queued", progress: 0 },
    { id: "dg-5", name: "Coastal_Imaging_Ancillary.pdf", provider: "Coastal Imaging Center", type: "Ancillary", source: "Email", pages: 22, ocr: 93, status: "Review", progress: 90 },
    { id: "dg-6", name: "Southeast_Care_Partners_2016.pdf", provider: "Southeast Care Partners", type: "Professional Services", source: "SharePoint", pages: 52, ocr: 97, status: "Completed", progress: 100 },
    { id: "dg-7", name: "Harbor_Dialysis_Facility_2012.pdf", provider: "Harbor Dialysis", type: "Facility", source: "Scanned Archive", pages: 40, ocr: 94, status: "Completed", progress: 100 },
    { id: "dg-8", name: "Pinecrest_FP_2015.pdf", provider: "Pinecrest Family Practice", type: "Professional Services", source: "Box Upload", pages: 28, ocr: 95, status: "Completed", progress: 100 },
  ],
  generatedDrafts: [
    { id: "ctr-1001", name: "Optum – Sunrise Health – Provider Agreement", mode: "Playbook-Guided", created: "2026-09-12" },
    { id: "ctr-1004", name: "Optum – Midwest Regional Hospital – Provider Agreement", mode: "Full Draft", created: "2026-09-20" },
  ],
  redlineDocs: [
    { id: "rd-ne", name: "Northeast Medical Group – Provider Agreement", contractId: "ctr-1002", groups: [
      { id: "g1", sectionId: "s7", title: "Termination Without Cause", changes: [
        { id: "x1", original: "upon one hundred twenty (120) days' prior written notice", proposed: "upon ninety (90) days' prior written notice, with continuation of care for Members in active treatment", status: "pending" },
        { id: "x2", original: "(no effect-of-termination provision)", proposed: "Upon termination, Provider shall cooperate in transition of Members and retain records for ten (10) years.", status: "pending" } ] },
      { id: "g2", sectionId: "s5", title: "Rate Escalator", changes: [
        { id: "x3", original: "the lesser of three percent (3%)", proposed: "the lesser of two and one-half percent (2.5%)", status: "pending" } ] },
      { id: "g3", sectionId: "s8", title: "HIPAA & Confidentiality", changes: [
        { id: "x4", original: "within five (5) business days", proposed: "within three (3) business days", status: "accepted" } ] } ] },
    { id: "rd-se", name: "Southeast Care Partners – Provider Agreement", contractId: "ctr-1003", groups: [
      { id: "g1", sectionId: "s2", title: "Term & Auto-Renewal", changes: [
        { id: "y1", original: "renews automatically for successive twelve (12) month periods", proposed: "renews automatically for one (1) additional twelve (12) month period", status: "pending" } ] },
      { id: "g2", sectionId: "s9", title: "Indemnification", changes: [
        { id: "y2", original: "capped at fees paid in the preceding twelve (12) months", proposed: "capped at two times (2x) fees paid in the preceding twelve (12) months", status: "pending" },
        { id: "y3", original: "excluding gross negligence", proposed: "excluding gross negligence, willful misconduct, and breach of Section 8", status: "rejected" } ] } ] },
    { id: "rd-mw", name: "Midwest Regional Hospital – Provider Agreement", contractId: "ctr-1004", groups: [
      { id: "g1", sectionId: "s6", title: "Claims Submission", changes: [
        { id: "z1", original: "within ninety (90) days of service", proposed: "within one hundred twenty (120) days of service", status: "pending" } ] },
      { id: "g2", sectionId: "s7", title: "Termination Without Cause", changes: [
        { id: "z2", original: "(no member notification provision)", proposed: "Plan shall notify affected Members at least thirty (30) days prior to the termination date.", status: "pending" } ] } ] },
  ],
  obligations: [
    { id: "ob-1", obligation: "Quarterly utilization report", contractId: "ctr-1001", owner: "Emily Chen", team: "Provider Relations", frequency: "Quarterly", due: "2026-10-15", status: "Compliant" },
    { id: "ob-2", obligation: "Annual rate escalator review", contractId: "ctr-1002", owner: "Mark Thompson", team: "Finance", frequency: "Annually", due: "2026-11-01", status: "Open" },
    { id: "ob-3", obligation: "Credentialing renewal verification", contractId: "ctr-1003", owner: "Priya Nair", team: "Credentialing Dept", frequency: "One-time", due: "2026-10-20", status: "In Progress" },
    { id: "ob-4", obligation: "Claims reconciliation audit", contractId: "ctr-1004", owner: "James Ortiz", team: "Claims Ops", frequency: "Monthly", due: "2026-09-15", status: "Overdue" },
    { id: "ob-5", obligation: "Network adequacy compliance filing", contractId: "ctr-1005", owner: "Mark Thompson", team: "Compliance Team", frequency: "Annually", due: "2026-12-31", status: "Open" },
    { id: "ob-6", obligation: "Business Associate Agreement attestation", contractId: "ctr-1006", owner: "Mark Thompson", team: "Legal & Compliance", frequency: "Annually", due: "2026-11-30", status: "Compliant" },
    { id: "ob-7", obligation: "Monthly encounter data submission", contractId: "ctr-1007", owner: "Emily Chen", team: "Provider Relations", frequency: "Monthly", due: "2026-10-05", status: "Open" },
  ],
  standardClauses: [
    { id: "sc-1", title: "Termination Without Cause", category: "Legal", tags: ["termination", "notice"], version: "v3.2", updated: "2026-07-12", text: "Either party may terminate upon ninety (90) days' written notice. Continuation of care and member notification obligations survive.", guidance: "Use for all professional agreements. Never exceed 120 days.", history: ["v3.2 – added member notification", "v3.1 – continuation of care", "v3.0 – initial"] },
    { id: "sc-2", title: "Rate Escalator (CPI-U)", category: "Financial", tags: ["rates", "escalator"], version: "v2.4", updated: "2026-05-02", text: "Rates increase annually by the lesser of 3% or CPI-U Medical Care.", guidance: "Finance approval required above 3%.", history: ["v2.4 – CPI-U cap", "v2.3 – fixed 3%"] },
    { id: "sc-3", title: "HIPAA Business Associate", category: "Legal", tags: ["hipaa", "privacy"], version: "v5.0", updated: "2026-08-20", text: "Parties comply with 45 C.F.R. Parts 160 and 164; breach notification within 3 business days.", guidance: "Mandatory in all agreements.", history: ["v5.0 – 3-day breach", "v4.1 – HITECH"] },
    { id: "sc-4", title: "Timely Filing", category: "Operational", tags: ["claims"], version: "v1.8", updated: "2026-03-11", text: "Clean claims submitted within 90 days of service.", guidance: "State-mandated minimums may override.", history: ["v1.8 – 90 days"] },
    { id: "sc-5", title: "Mutual Indemnification", category: "Legal", tags: ["risk", "liability"], version: "v2.0", updated: "2026-01-19", text: "Each party indemnifies the other for its negligence; cap equals 12 months of fees.", guidance: "Carve-outs for gross negligence required.", history: ["v2.0 – cap added"] },
    { id: "sc-6", title: "Records Retention", category: "Operational", tags: ["records", "cms"], version: "v1.3", updated: "2026-06-30", text: "Provider retains records for ten (10) years per 42 C.F.R. § 422.504(d).", guidance: "Required for Medicare Advantage.", history: ["v1.3 – 10 years"] },
  ],
  reviewRequests: [
    { id: "rv-1", contractId: "ctr-1002", title: "Northeast rate table Q4", status: "Manual review", reviewer: "Mark Thompson", comments: ["Escalator exceeds cap in row 12."] },
    { id: "rv-2", contractId: "ctr-1003", title: "Southeast specialty AWP", status: "On hold", reviewer: "Mark Thompson", comments: [] },
    { id: "rv-3", contractId: "ctr-1004", title: "Midwest facility DRG rates", status: "Exception", reviewer: "Emily Chen", comments: ["Outlier DRG 470."] },
    { id: "rv-4", contractId: "ctr-1005", title: "Lakeside peds fee schedule", status: "Sent for approval", reviewer: "Mark Thompson", comments: [] },
  ],
  rates: [
    { id: "rt-1", code: "99213", desc: "Office visit, est. patient", current: 92.4, escalated: 95.17, method: "% of Medicare", confidence: 98 },
    { id: "rt-2", code: "99214", desc: "Office visit, moderate", current: 131.2, escalated: 135.14, method: "% of Medicare", confidence: 97 },
    { id: "rt-3", code: "27447", desc: "Total knee arthroplasty", current: 1640.0, escalated: 1689.2, method: "Case rate", confidence: 91 },
    { id: "rt-4", code: "70553", desc: "MRI brain w/ & w/o contrast", current: 412.75, escalated: 425.13, method: "Fee schedule", confidence: 88 },
    { id: "rt-5", code: "90837", desc: "Psychotherapy, 60 min", current: 118.0, escalated: 121.54, method: "Fee schedule", confidence: 94 },
    { id: "rt-6", code: "DRG 470", desc: "Major joint replacement", current: 14250, escalated: 14677.5, method: "DRG", confidence: 76 },
    { id: "rt-7", code: "90960", desc: "ESRD monthly service", current: 298.6, escalated: 307.56, method: "% of Medicare", confidence: 83 },
  ],
  credentialing: [
    { id: "cr-1", provider: "Sunrise Health", intake: "IN-2201", checks: { License: "Pass", DEA: "Pass", Malpractice: "Pass", "Board Certification": "Pending" }, overrides: [] as string[] },
    { id: "cr-2", provider: "Summit Orthopedics", intake: "IN-2202", checks: { License: "Pass", DEA: "Fail", Malpractice: "Pass", "Board Certification": "Pass" }, overrides: [] as string[] },
    { id: "cr-3", provider: "Valley Behavioral Health", intake: "IN-2203", checks: { License: "Pass", DEA: "Pass", Malpractice: "Overridden", "Board Certification": "Pass" }, overrides: ["Malpractice overridden by Mark Thompson – carrier transition letter on file (2026-09-02)"] },
    { id: "cr-4", provider: "Riverbend Oncology", intake: "IN-2204", checks: { License: "Pending", DEA: "Pending", Malpractice: "Pending", "Board Certification": "Pending" }, overrides: [] as string[] },
  ],
  feedMappings: [
    { field: "Provider TIN", target: "FACETS.PRPR_TAX_ID", confidence: 99 },
    { field: "NPI", target: "FACETS.PRPR_NPI", confidence: 99 },
    { field: "Effective Date", target: "FACETS.PRCT_EFF_DT", confidence: 97 },
    { field: "Fee Schedule ID", target: "QNXT.FEESCHED_ID", confidence: 92 },
    { field: "Rate Escalator %", target: "QNXT.ESC_PCT", confidence: 84 },
    { field: "Network Tier", target: "FACETS.NWPR_TIER", confidence: 78 },
  ],
  users: [
    { id: "u1", name: "Emily Chen", email: "emily.chen@optum.example", role: "Contract Loader", active: true },
    { id: "u2", name: "Mark Thompson", email: "mark.thompson@optum.example", role: "Legal Manager", active: true },
    { id: "u3", name: "Priya Nair", email: "priya.nair@optum.example", role: "Credentialing Specialist", active: true },
    { id: "u4", name: "James Ortiz", email: "james.ortiz@optum.example", role: "Claims Analyst", active: false },
  ],
  permissions: {
    "Contract Loader": { Contracts: "Edit", Digitize: "Edit", Compliance: "View", Pipeline: "Edit", Users: "View" },
    "Legal Manager": { Contracts: "Approve", Digitize: "View", Compliance: "Approve", Pipeline: "Approve", Users: "Admin" },
    "Credentialing Specialist": { Contracts: "View", Digitize: "View", Compliance: "View", Pipeline: "Edit", Users: "View" },
    "Claims Analyst": { Contracts: "View", Digitize: "View", Compliance: "View", Pipeline: "View", Users: "View" },
  } as Record<string, Record<string, string>>,
  auditLog: [
    { at: "2026-09-30 09:12", who: "Mark Thompson", what: "Approved rate table rv-4" },
    { at: "2026-09-29 16:40", who: "Emily Chen", what: "Uploaded Summit_Ortho_Legacy_2009.pdf" },
    { at: "2026-09-29 11:05", who: "Mark Thompson", what: "Overrode malpractice check for Valley Behavioral Health" },
    { at: "2026-09-28 14:22", who: "Emily Chen", what: "Changed role permissions: Contract Loader → Pipeline Edit" },
  ],
  notifications: [
    { id: "n1", text: "Termination Without Cause scored 68% on Northeast agreement", read: false },
    { id: "n2", text: "Claims reconciliation audit is overdue", read: false },
    { id: "n3", text: "Summit Orthopedics DEA check failed", read: false },
    { id: "n4", text: "3 contracts expire in the next 90 days", read: true },
  ],
  activity: [
    { at: "10 min ago", text: "Redlining Agent proposed 2 changes to Northeast agreement" },
    { at: "42 min ago", text: "Intake Agent extracted 23 rate rows from Coastal Imaging" },
    { at: "2 h ago", text: "Mark Thompson signed Lakeside Pediatrics agreement" },
    { at: "Yesterday", text: "Compliance Agent flagged Midwest Regional termination clause" },
    { at: "Yesterday", text: "Workflow Agent moved Summit Orthopedics to Credentialing" },
  ],
  chatMessages: [] as { role: "user" | "assistant"; text: string; citations?: number[] }[],
};
