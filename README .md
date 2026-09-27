# HR-Assist RAG

## What is this?

HR-Assist is a RAG-based HR Policy Q&A bot that gives employees instant answers to common questions about leave, insurance, WFH, and reimbursement — grounded in the company's actual HR policy documents, not guesswork. If a question isn't covered, it's escalated to HR with the employee's name and email attached, so a real person can follow up.

## How it works

An employee asks a question through the chat interface. The system retrieves the most relevant section of the HR policy documents using embeddings and cosine similarity, then passes that context to an LLM (Groq) to generate a grounded answer. If the question isn't covered, it's escalated via email instead of risking an incorrect answer. Every interaction is logged to Google Sheets.

See [Architecture](docs/Architecture.md) for the full diagram and design decisions.

## Try it

Open `frontend/index.html` in a browser (requires the n8n workflow running locally — see below).

## Tech Stack

* n8n (workflow orchestration, self-hosted via Docker)
* Groq — `openai/gpt-oss-20b` for answer generation
* Hugging Face — `sentence-transformers/all-MiniLM-L6-v2` for embeddings
* Google Sheets — structured logging
* SMTP (Gmail App Password) — escalation email delivery
* Plain HTML/CSS/JS — two-page frontend (landing + chat), no build tooling

## Result

**15/15 (100%) accuracy** on a 15-question test set (10 in-scope, 5 out-of-scope). Full methodology and results in [Testing & QA](docs/Testing-QA.md).

## Project Docs

* [PRD](docs/PRD.md)
* [TRD](docs/TRD.md)
* [Architecture](docs/Architecture.md)
* [Feature List](docs/Feature.md)
* [API/Integration](docs/API-Integration.md)
* [Testing & QA](docs/Testing-QA.md)
* [Workflow notes & concepts](notes.md)
* [Full project diary — planning, decisions, and every bug hit](project_diary.md)

## Lessons Learned

This project surfaced several real engineering lessons worth calling out (full detail in the project diary):

- **APIs change underneath you.** Hugging Face fully deprecated its old inference endpoint mid-project, and Groq's available model lineup shifted twice. The fix each time was the same: verify directly against the provider's current docs or, better, query their API's own "list available models" endpoint rather than trusting external tutorials or memory.
- **A workflow's failure behavior matters as much as its happy path.** n8n stops an entire execution when any single node fails — even on what looks like a separate branch. A stale credential on a logging node was silently preventing employees from getting responses at all. The fix was both a settings change ("On Error: Continue") and a real architecture improvement (parallel branches instead of one sequential chain).
- **Don't template untrusted text into raw JSON strings.** AI-generated answers can contain quotes and line breaks that break naive string substitution. Building request/response bodies with a real expression/object syntax instead of string templating fixes this permanently, not just for the specific text that happened to break it.
- **Not every OAuth problem is worth fully solving.** When Gmail's OAuth credential broke, switching to SMTP with an app password was the pragmatic, still-secure choice for a single-account project — properly diagnosing and fixing broken OAuth (as was eventually done for Google Sheets) is valuable, but knowing when a simpler alternative is good enough is also a real engineering skill.
- **Check the real execution log, not the idle editor view.** A significant chunk of debugging time was lost looking at an idle canvas instead of n8n's actual Executions history, which showed the real error immediately once checked.

## Status

✅ Complete — full RAG pipeline, escalation, logging, and two-page frontend all built and tested end-to-end.
