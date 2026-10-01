# CAPSTONE DELIVERABLES

## Provider Contract Intelligence (PCI)
### Enterprise Architecture Specification for an Agentic Solution

**Student:** Divya Shree K  
**Roll No:** 2023103058  
**Class:** CSE – 'N'

---

## Contents

1. Architecture Diagram
2. Agent Workflow Design
3. Deployment Strategy
4. Security Model
5. Monitoring Dashboard Design

---

# Deliverable 1: Architecture Diagram

**Layers, components, trust boundaries, and integrations**

The PCI platform is organized into six layers separated by three explicit trust boundaries: the Edge API Gateway, the Secure Enclave hosting agentic orchestration, and the boundary to external enterprise systems.

**Figure 1. Layered architecture with trust boundaries**

## Layer Summary

| Layer | Key Components | Trust Boundary |
|---|---|---|
| Presentation | SPA/SSR for Contract Loader, Legal/Compliance, and Claims & Finance Admins; contract viewer, redline studio, rate matrix review | Crosses TB1 via mTLS / HTTPS / JWT OIDC |
| Ingress & API Gateway | WAF (OWASP Top 10), rate limiting, TLS termination, JWT/RBAC, PII/PHI tokenization proxy | TB1: Edge API Gateway |
| Agentic Orchestration | Multi-Agent Orchestrator (Temporal/LangGraph), Context & Prompt Engine, Tool Execution & Schema Validator; Intake, Extraction, Compliance, Redlining, Downstream agents | TB2: Secure Enclave (gRPC / service mesh) |
| Data & Knowledge | Vector DB, PostgreSQL with RLS, encrypted S3/Blob store, Redis, regulatory knowledge base, immutable audit ledger | Inside enclave |
| Enterprise Integrations | CAQH/NPPES credentialing, Facets/QNXT claims core, DocuSign/Adobe Sign, Okta/Azure AD | TB3: External Systems |

---

# Deliverable 2: Agent Workflow Design

**Roles, states, tools, handoffs, approvals, and failure paths**

## 1. Agent Roles & Specialization

1. **Intake & OCR Agent:** Ingests unstructured legacy contracts (PDF/TIFF up to 52+ pages), performs layout analysis, deskewing, and deterministic table boundary detection for EXHIBIT A.
2. **Extraction & Matching Agent:** Matches text segments to the standard taxonomy (Financial, Legal, Operational), extracts 23-row rate schedules, and calculates confidence intervals.
3. **Compliance & Risk Agent:** Evaluates clauses against regulatory baselines (e.g., flags a 68% score on Termination Without Cause for missing auto-renewal or 90-day member notice).
4. **Redline & Drafting Agent:** Generates co-authoring suggestions and redline diffs based on corporate playbooks.
5. **Downstream Feed Agent:** Transforms agreed fee schedules into machine-readable claim engine schemas.

## 2. Workflow State Machine & Lifecycle

**Figure 2. Contract lifecycle state machine**

```text
[INTAKE] ──(OCR Pass >90%)──> [EXTRACTION] ──(Confidence >85%)──> [COMPLIANCE EVAL]
    │                               │                                     │
(OCR Fail <90%)             (Low Confidence)                   (Score <80% Flagged)
    │                               │                                     │
    v                               v                                     v
[Manual Review Queue]       [Human Field Anchor]              [Auto-Redline Generator]
                                                                         │
                                                                         v
[PUBLISHED / LOADED] <── [LEGAL SIGN-OFF] <── [HUMAN APPROVAL] <── [LEGAL NEGOTIATION]
```

## 3. Tools & Safe Function Bindings

| Function | Purpose |
|---|---|
| `ocr_extract_document(blob_uri, confidence_threshold=0.88)` | Extract text and layout from stored contract blob |
| `match_clause_playbook(clause_text, category, state_jurisdiction)` | Match clause to playbook standard by category and jurisdiction |
| `evaluate_compliance_rubric(clause_id, regulatory_set=["HIPAA", "ACA", "CMS_MEDICARE"])` | Score clause against regulatory baselines |
| `parse_rate_schedule(table_grid, target_format="CMS_RVU_AWP")` | Normalize rate tables into target format |
| `stage_downstream_payload(contract_id, system="FACETS")` | Stage approved terms for the claims system |

## 4. Approvals & Failure Paths

1. **Human-in-the-Loop (HITL) Gate:** Any financial term deviation exceeding 3% or overall compliance score below 85% halts automated progression and assigns a task to Legal Manager Mark Thompson.
2. **Dead Letter Queue (DLQ):** Failed OCR parsing retries 3 times with exponential backoff before isolating the document into the Exception & Unreadable Queue with a notification event.
3. **Rollback & Versioning:** Every accepted redline increments the document version (v1.0 -> v1.1) with a complete undo tree to prevent document corruption.

---

# Deliverable 3: Deployment Strategy

**Runtime, scaling, resilience, environments, and release**

## 1. Runtime & Microservices Architecture

- **Frontend:** Edge-distributed SSR/SPA (TanStack / React 19 / Vite) deployed to globally distributed edge nodes for near-zero latency.
- **Agent Services:** Containerized Python/Node.js microservices on Kubernetes (EKS/GKE) with Knative for event-driven serverless burst execution.
- **GPU Inference Clusters:** Dedicated autoscaling GPU worker nodes (NVIDIA A10G/L40S) hosting domain-specialized LLMs and vision transformers for document parsing.

## 2. Scaling & Load Management

- **Horizontal Pod Autoscaling (HPA):** Scales inference and OCR pods based on SQS/RabbitMQ ingestion depth rather than CPU utilization alone.
- **Rate-Limit & Queue Throttling:** Asynchronous job decoupling ensures a 200-page legacy batch upload does not starve interactive conversational assistant queries.

## 3. High Availability & Resilience

- **Multi-AZ Active-Active Deployment:** Distributed across three availability zones with automated failover.
- **Circuit Breakers:** Implemented via Envoy/Istio service mesh to fail gracefully to a fallback LLM or cached embeddings if the primary AI gateway experiences elevated latencies (>3000ms).
- **State Recovery:** Agent execution state is persisted per step in Redis/PostgreSQL; interrupted workflows resume from the last validated checkpoint.

## 4. Environment Topology & Release Strategy

| Stage | Environment |
|---|---|
| 1 | Local Dev |
| 2 | Isolated Preview (PR branch) |
| 3 | Staging / HIPAA Sandbox |
| 4 | Production |

- **Zero-Downtime Release:** Canary deployments with traffic splitting (95/5 -> 50/50 -> 100).
- **Model Shadowing:** New prompts and fine-tuned agent weights run in shadow mode alongside production agents to compare extracted rate schedule precision prior to public promotion.

---

# Deliverable 4: Security Model

**Identity, authorization, secrets, privacy, guardrails, and audit**

## 1. Identity & Authorization

- **OIDC / SAML 2.0 Integration:** Single Sign-On via Okta / Ping Identity with enforced MFA.
- **Persona-Based RBAC & ABAC:** Role permissions are summarized below.

| Persona | Permissions |
|---|---|
| Contract Loader | View queue, initiate OCR, edit preliminary metadata. No approval or publishing authority. |
| Legal Manager | Full redline authoring, risk score overrides, e-signature dispatch, final pipeline sign-off. |

- **Row-Level Security (RLS):** Database policies scope contract reads strictly by provider tenant, region, and authorized family network.

## 2. Secrets Management & Enclaves

- Zero hardcoded credentials; dynamic retrieval via HashiCorp Vault or AWS Secrets Manager.
- Ephemeral database credentials with automated 24-hour rotation.
- LLM API keys injected via secure sidecars with egress filtering.

## 3. Privacy & Guardrails (HIPAA / BAA Compliance)

- **Zero Data Retention (ZDR):** LLM Gateway operates under enterprise Business Associate Agreements (BAAs) where client prompts and contract texts are never cached for model training.
- **PHI/PII Sanitization Layer:** Microsoft Presidio / custom NER pipeline automatically redacts patient IDs, SSNs, and confidential practitioner home addresses prior to inference.
- **Input/Output Guardrails (NeMo / Llama-Guard):** Blocks prompt injection, jailbreaks, and hallucinations in legal advice by constraining model outputs to verified playbook schemas.

## 4. Auditability & Compliance Trail

- **Immutable Audit Ledger:** Every agent action, clause change, score override, and human approval is cryptographically logged with user ID, timestamp, and diff snapshots.
- **Compliance:** Meets SOC 2 Type II, HITRUST CSF, and HIPAA Security Rule requirements.

---

# Deliverable 5: Monitoring Dashboard Design

**Health, trace, quality, safety, cost, and business outcomes**

The dashboard below provides a single operational view across six panels, including a distributed trace inspector built on OpenTelemetry / OpenInference. Values shown are illustrative.

**Figure 3. Enterprise agent observability and operations dashboard**

## Provider Contract Intelligence - Enterprise Agent Observability & Operations Engine

### 1. Agent & System Health
- System Uptime: 99.98% (Multi-AZ)
- Pipeline P95 Latency: 1.84s
- Active Workflows: 42 running, 3 DLQ
- Error Rate: 0.12% (Auto-recovering)

### 2. Extraction Quality & Accuracy
- OCR Median Confidence: 94.6%
- Rate Table Precision (EXHIBIT A): 99.2%
- False Positive Clause Identification: 0.8%
- Human Correction Rate: 4.3% (-1.2% MoM)

### 3. Safety, Guardrails & Audit
- PHI Tokenization Rate: 100% intercepted
- Guardrail Intervention Count: 2 (PII)
- Unapproved Model Hallucinations: 0%
- Override Audit Logs Recorded: 24

### 4. Cost & Token Telemetry
- Blended Cost per Processed Contract: $0.41
- Total Daily Tokens: 14.8M (In: 11.2M | Out: 3.6M)
- Prompt Cache Hit Ratio: 78.4%
- Budget Consumption: 43% of monthly ceiling

### 5. Business Outcomes & SLA Metrics
- Average Contract Turnaround Time: 3.2 Days (Baseline Legacy: 24.0 Days -> 86.6% Reduction)
- First-Pass Compliance Score: 88.4%
- Contracts Auto-Processed Without Escalation: 74%
- Downstream Claim Loading Errors: 0.02%
- Total Capital Cycle Value In-Flight: $48.6M

### 6. Distributed Trace Inspector - OpenTelemetry / OpenInference

```text
Trace ID: tr-9b48a1 | Document: Northeast_Medical_2014_Scan.pdf (48 Pages)
├── [0.00s] Ingress API Gate (POST /api/contracts/ocr) ─────────────── 200 OK (14ms)
├── [0.02s] Presidio PII Masking Pipeline ─────────────────────────── PASS (38ms)
├── [0.06s] Vision OCR Pipeline (Tesseract + LayoutLM) ───────────── 96% Conf (620ms)
├── [0.68s] Clause Segmentation & Semantic Chunking ───────────────── 10 Clauses (84ms)
├── [0.77s] Parallel Multi-Agent Evaluation:
│   ├── Compliance Agent (HIPAA / CMS checks) ─────────────────────── Score: 92% (410ms)
│   ├── Rate Extraction Agent (Exhibit A 23-row parsing) ─────────── 100% Valid (520ms)
│   └── Redline Suggestion Agent ─────────────────────────────────── Skipped (No delta)
└── [1.32s] State Persisted to PostgreSQL & Vector Store ─────────── Complete (42ms)
```

## Key Metrics Summary

| Panel | Headline Metrics |
|---|---|
| Agent & System Health | 99.98% uptime; P95 latency 1.84s; 42 workflows running, 3 in DLQ; 0.12% error rate |
| Extraction Quality | OCR median confidence 94.6%; Exhibit A rate table precision 99.2%; human correction rate 4.3% (-1.2% MoM) |
| Safety, Guardrails & Audit | 100% PHI tokenization; 2 guardrail interventions; 0% unapproved hallucinations; 24 override audit logs |
| Cost & Token Telemetry | $0.41 per contract; 14.8M daily tokens; 78.4% prompt cache hit ratio; 43% of monthly budget used |
| Business Outcomes | 3.2-day turnaround vs. 24.0-day baseline (86.6% reduction); 88.4% first-pass compliance; 74% auto-processed; 0.02% downstream loading errors; $48.6M in flight |

---

Together, these five deliverables provide the end-to-end architectural, governance, and operational foundation required for an enterprise-ready agentic AI deployment.

**Provider Contract Intelligence (PCI)**
