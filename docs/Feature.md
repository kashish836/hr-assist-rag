# Feature List — HR-Assist RAG

## v1 Features (In Scope)

| # | Feature | Description | Priority |
|---|---|---|---|
| 1 | Natural-language question input | Employee submits a question via webhook/frontend | Must-have |
| 2 | Document chunking (setup) | Policy doc split into topic-based sections | Must-have |
| 3 | Embedding generation | Both chunks (once) and questions (per request) converted to vectors | Must-have |
| 4 | Similarity-based retrieval | Finds the most relevant policy chunk for a given question | Must-have |
| 5 | Confidence threshold check | Decides whether to answer or escalate | Must-have |
| 6 | Grounded answer generation | LLM answers using only retrieved context | Must-have |
| 7 | Escalation to HR | Emails HR when confidence is too low | Must-have |
| 8 | Structured logging | Every interaction logged to Google Sheets with consistent fields | Must-have |
| 9 | Error handling & retries | Graceful handling of API failures | Should-have |
| 10 | Minimal web frontend | Single-page UI for demo purposes | Should-have (final phase) |
| 11 | Test set evaluation | 15-20 sample Q&A pairs used to measure accuracy | Should-have |

## v2 / Future Work (Out of Scope for v1)

| # | Feature | Description |
|---|---|---|
| 12 | Multilingual support | Handle questions in Hindi/English |
| 13 | India-specific compliance Q&A | Labor law, PF, gratuity-specific content |
| 14 | Multi-turn conversation | Follow-up questions with memory of prior context |
| 15 | Admin dashboard | HR-facing UI to update policy documents without editing files directly |
| 16 | Slack/Teams integration | Accept questions via chat platforms instead of just webhook/web form |
| 17 | Authentication | Employee login/identity tied to logged interactions |

## Related but Separate Project

- **Relocation/Transfer Request Automation** (Project #2, not a feature of this project) — a process-automation workflow (approvals + reminders + validation) inspired by a real internal-transfer delay case. Intentionally kept as its own project since it solves a different problem (workflow/state automation, not knowledge retrieval).
