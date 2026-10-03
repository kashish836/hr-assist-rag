# Architecture — HR-Assist RAG

## 1. Overview
This describes the system as actually built, including design changes made during development (parallel branching, employee identity flow, and the frontend's move to a single-file structure).

## 2. High-Level Architecture

```
                              ┌──────────────────────────┐
                              │   frontend/hr-assist.html  │
                              │  (landing + chat, single   │
                              │  file, client-side switch) │
                              └─────────────┬─────────────┘
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

## 5. Frontend: Single-File Redesign (replaces original two-page version)

**Original design:** `index.html` (landing page) and `chat.html` (chat interface) as two separate pages, sharing a `style.css` and `theme.js`, linked to each other by relative paths.

**Problem found in practice:** the two-page structure depended on every file (`index.html`, `chat.html`, `style.css`, `theme.js`) staying together in the same folder with exact filenames. When any file went missing or got renamed slightly, the cross-page links and styling silently broke.

**Fix:** rebuilt as a single file, `frontend/hr-assist.html`, containing the landing page and chat interface as two views toggled client-side with JavaScript (no page navigation, no external CSS/JS dependencies). This removes the entire class of cross-file linking failures.

**Visual design:** rebuilt as a dark-by-default "glass" UI — frosted translucent cards, blurred background glow, rounded corners, pill-shaped buttons — on a blue/near-black color palette (no green or amber), with a light theme toggle. Message states (answered vs. escalated) are distinguished by two shades of blue rather than by color category, keeping the palette restrained while still visually distinguishable.

## 6. Hosting: Public Backend Attempted, Not Adopted

To get a fully public live demo (not dependent on the local machine being on), n8n was deployed to Render's free tier, with Supabase Postgres configured as persistent storage (`DB_TYPE=postgresdb` + Supabase connection parameters), since Render's free tier has no persistent disk.

**Result:** the deployment crashed on boot with a `JavaScript heap out of memory` error — Render's free 512MB instance wasn't enough for n8n's default memory footprint. A partial fix (`NODE_OPTIONS=--max-old-space-size=460`, capping Node's heap to fit the container) got past the crash, but re-entering every credential (Groq, SMTP, Google Sheets OAuth) into the fresh instance, with no guarantee the free tier would hold up under real traffic, wasn't worth the time for a portfolio demo.

**Decision:** reverted to local-only hosting, matching the project's original scope (see [PRD](PRD.md) §6, [Feature List](Feature.md) item 18). `hr-assist.html` is deployed to Vercel as a **static page only** — the landing page works for any visitor, but the chat connects to `localhost:5678`, so it only functions live when the viewer has their own n8n instance running. Full detail in `project_diary.md`.

## 7. Component Breakdown

| Component | Responsibility | Technology |
|---|---|---|
| Frontend (landing + chat) | Entry point, feature overview, direct HR email option, question/answer UI | Single-file HTML/CSS/JS (`hr-assist.html`) |
| Webhook | Entry point into n8n | n8n Webhook node |
| Embedding service | Converts text → vector | Hugging Face Inference Providers |
| Vector comparison | Finds closest policy chunk | n8n Code node (custom cosine similarity) |
| LLM | Generates grounded answer | Groq API (openai/gpt-oss-20b) |
| Escalation | Notifies HR, includes employee identity | n8n Send Email node (SMTP) |
| Logging | Records every interaction, including employee identity | n8n Google Sheets node |

## 8. One-Time Setup Flow (unchanged from original design)

Policy document → split into 5 topic chunks → each embedded once via HF API → saved to `/files/policy_embeddings.json` inside the n8n Docker volume, read by the live workflow on every request.

## 9. Design Decisions & Rationale (updated)

- **True embeddings-based retrieval over prompt-stuffing:** as originally planned — validated by real test results (100% accuracy)
- **Parallel branching over sequential chaining:** added after discovering cascading-failure behavior; a genuinely more robust pattern for production-style systems
- **SMTP over Gmail OAuth for escalation email:** the original OAuth credential was broken and unreconnectable; SMTP with an app password is equally secure for a single-account project and avoids real hours of Google Cloud Console debugging for marginal benefit
- **Fresh Google OAuth Client ID for Sheets:** unlike the Gmail case, this was fixed properly (not worked around), since Sheets logging benefits more from being reconnectable long-term
- **Single-file frontend over two-page frontend:** removed cross-file dependency failures; simpler to share, test, and reason about for a project this size
- **Local-only n8n hosting over public Render deployment:** attempted public hosting, hit free-tier memory limits, and judged the remaining setup cost not worth it relative to the benefit for a portfolio project — see §6
