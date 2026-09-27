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
| 10 | Web frontend | ✅ Delivered, expanded | Two pages: landing + chat, light/dark theme |
| 11 | Test set evaluation | ✅ Delivered | 15/15 (100%) accuracy — see Testing-QA.md |

## Delivered Beyond Original Plan

| Feature | Description |
|---|---|
| Employee identity capture | Frontend collects name/email, threaded through to escalation emails and logs |
| Two-page frontend | Landing page (feature grid, direct email-to-HR) + full chat interface, not a single basic form |
| Light/dark theme toggle | Synced across both pages via localStorage |
| Chat-style UI | Message bubbles, typing indicator, timestamps, conversation reset |
| Parallel branch architecture | More robust than originally planned sequential chain — logging/email failures can't block the employee's answer |

## v2 / Future Work (Unchanged, Out of Scope for v1)

| # | Feature | Description |
|---|---|---|
| 12 | Multilingual support | Handle questions in Hindi/English |
| 13 | India-specific compliance Q&A | Labor law, PF, gratuity-specific content |
| 14 | Multi-turn conversation | Follow-up questions with real backend memory |
| 15 | Admin dashboard | HR-facing UI to update policy documents |
| 16 | Slack/Teams integration | Accept questions via chat platforms |
| 17 | Authentication | Employee login/identity verification |
| 18 | Public hosting | Currently runs against a local n8n instance only |

## Related but Separate Project

- **Relocation/Transfer Request Automation** — a process-automation workflow (approvals + reminders + validation) inspired by a real internal-transfer delay case. Kept as its own future project since it solves a different problem class (workflow/state automation, not knowledge retrieval).
