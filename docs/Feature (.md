# Feature List — HR-Assist RAG

## v1 Features — Status

| # | Feature | Status | Notes |
|---|---|---|---|
| 1 | Natural-language question input | ✅ Delivered | Via chat interface |
| 2 | Document chunking (setup) | ✅ Delivered | 5 topic-based chunks |
| 3 | Embedding generation | ✅ Delivered | Hugging Face, migrated endpoint mid-project |
| 4 | Similarity-based retrieval | ✅ Delivered | Custom cosine similarity in Code node |
| 5 | Confidence threshold check | ✅ Delivered | Tuned to 0.35 from real data |
| 6 | Grounded answer generation | ✅ Delivered | Groq, openai/gpt-oss-20b |
| 7 | Escalation to HR | ✅ Delivered | Via SMTP, includes employee identity |
| 8 | Structured logging | ✅ Delivered | Google Sheets, includes employee identity |
| 9 | Error handling & retries | ✅ Delivered | Parallel branching + "Continue on error" |
| 10 | Web frontend | ✅ Delivered, redesigned | Single file: landing + chat, blue/black glass UI, light/dark theme |
| 11 | Test set evaluation | ✅ Delivered | 15/15 (100%) accuracy — see Testing-QA.md |
| 12 | Static public hosting (frontend only) | ✅ Delivered | `hr-assist.html` deployed to Vercel as a static page |

## Delivered Beyond Original Plan

| Feature | Description |
|---|---|
| Employee identity capture | Frontend collects name/email, threaded through to escalation emails and logs |
| Single-file frontend | Landing view (feature grid, direct email-to-HR) and full chat interface in one HTML file, switched client-side — replaces the original two-page design to remove cross-file dependency issues |
| Glass UI redesign | Frosted-card, blue/black visual design with rounded corners and a light/dark theme toggle, replacing the original flat light/dark palette |
| Light/dark theme toggle | Synced across both views via localStorage |
| Chat-style UI | Message bubbles, typing indicator, timestamps, conversation reset, clickable suggested questions |
| Parallel branch architecture | More robust than originally planned sequential chain — logging/email failures can't block the employee's answer |

## v2 / Future Work (Updated)

| # | Feature | Description |
|---|---|---|
| 13 | Multilingual support | Handle questions in Hindi/English |
| 14 | India-specific compliance Q&A | Labor law, PF, gratuity-specific content |
| 15 | Multi-turn conversation | Follow-up questions with real backend memory |
| 16 | Admin dashboard | HR-facing UI to update policy documents |
| 17 | Slack/Teams integration | Accept questions via chat platforms |
| 18 | Authentication | Employee login/identity verification |
| 19 | Public backend hosting | Attempted on Render (free tier) + Supabase Postgres; hit a memory limit crash on Render's free 512MB instance and was reverted — see Architecture.md §6. Revisiting this would require either a paid Render tier or a different host with more free memory headroom. |

## Related but Separate Project

- **Relocation/Transfer Request Automation** — a process-automation workflow (approvals + reminders + validation) inspired by a real internal-transfer delay case. Kept as its own future project since it solves a different problem class (workflow/state automation, not knowledge retrieval).
