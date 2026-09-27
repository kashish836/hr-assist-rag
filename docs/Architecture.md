# Architecture — HR-Assist RAG

## 1. Overview
This describes the system as actually built, including two design changes made during development (parallel branching, employee identity flow).

## 2. High-Level Architecture

```
        ┌──────────────┐        ┌──────────────┐
        │ index.html   │───────▶│  chat.html    │
        │ (landing)    │        │ (chat UI)     │
        └──────────────┘        └───────┬───────┘
                                         │ POST question + employee info
                                         ▼
                              ┌─────────────────────┐
                              │   n8n Webhook Node    │
                              └──────────┬───────────┘
                                         ▼
                              ┌─────────────────────┐
                              │ HF Embedding API call │
                              └──────────┬───────────┘
                                         ▼
                              ┌─────────────────────┐
                              │  Cosine Similarity    │
                              │  (vs. stored chunks)  │
                              └──────────┬───────────┘
                                         ▼
                                ◇ Confidence check ◇
                                /                  \
                              YES                  NO
                               │                    │
                     ┌─────────▼────────┐  ┌────────▼─────────┐
                     │  Build prompt +   │  │  Build escalation  │
                     │  call Groq LLM    │  │  content (incl.     │
                     │  (gpt-oss-20b)    │  │  employee info)     │
                     └─────────┬────────┘  └────────┬─────────┘
                               │                     │
                    ┌──────────┼──────────┐  ┌───────┼────────┐
                    ▼                     ▼  ▼                ▼
          ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐
          │ Respond to        │  │ Append row to     │  │ Send email    │
          │ Webhook (answer)  │  │ Google Sheet      │  │ via SMTP      │
          └──────────────────┘  └──────────────────┘  └──────┬───────┘
                                                                ▼
                                                       ┌──────────────────┐
                                                       │ Append row to     │
                                                       │ Google Sheet      │
                                                       └──────┬───────────┘
                                                                ▼
                                                       ┌──────────────────┐
                                                       │ Respond to        │
                                                       │ Webhook (escalate)│
                                                       └──────────────────┘
```

## 3. Key Design Change: Parallel Branching (not sequential)

**Original plan:** Groq answer → log to Sheets → respond to employee, in a single chain.

**Problem found during testing:** n8n stops an entire execution when any node fails, even mid-chain. A stale Google Sheets credential silently killed the "Respond to Webhook" node too, because it sat *after* Sheets in the chain — the employee got no response at all, with no visible error.

**Fix:** the Groq-answer node (and the escalation-prep node) now fan out to **parallel, independent branches** — one to Respond-to-Webhook, one to Sheets logging (and, on the escalation side, one to Send Email). Each branch is set to "On Error: Continue" where appropriate, so a logging or email failure never blocks the employee's actual answer. This is a more correct design for a real system, not just a workaround.

## 4. Employee Identity Flow (added after initial build)

The frontend collects optional `employeeName` and `employeeEmail` fields. These are read once from the Webhook payload in the cosine-similarity Code node, then threaded through to both branches (answer and escalation) so they appear in the Google Sheet log and, on the escalation path, in the email sent to HR — allowing HR to follow up with the specific employee.

## 5. Component Breakdown

| Component | Responsibility | Technology |
|---|---|---|
| Landing page | Entry point, feature overview, direct HR email option | Static HTML/CSS/JS |
| Chat interface | Collect question + employee info, display conversation | Static HTML/CSS/JS |
| Webhook | Entry point into n8n | n8n Webhook node |
| Embedding service | Converts text → vector | Hugging Face Inference Providers |
| Vector comparison | Finds closest policy chunk | n8n Code node (custom cosine similarity) |
| LLM | Generates grounded answer | Groq API (openai/gpt-oss-20b) |
| Escalation | Notifies HR, includes employee identity | n8n Send Email node (SMTP) |
| Logging | Records every interaction, including employee identity | n8n Google Sheets node |

## 6. One-Time Setup Flow (unchanged from original design)

Policy document → split into 5 topic chunks → each embedded once via HF API → saved to `/files/policy_embeddings.json` inside the n8n Docker volume, read by the live workflow on every request.

## 7. Design Decisions & Rationale (updated)

- **True embeddings-based retrieval over prompt-stuffing:** as originally planned — validated by real test results (100% accuracy)
- **Parallel branching over sequential chaining:** added after discovering cascading-failure behavior; a genuinely more robust pattern for production-style systems
- **SMTP over Gmail OAuth for escalation email:** the original OAuth credential was broken and unreconnectable; SMTP with an app password is equally secure for a single-account project and avoids real hours of Google Cloud Console debugging for marginal benefit
- **Fresh Google OAuth Client ID for Sheets:** unlike the Gmail case, this was fixed properly (not worked around), since Sheets logging benefits more from being reconnectable long-term
