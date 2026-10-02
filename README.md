# HR-Assist RAG

---

![GitHub last commit](https://img.shields.io/github/last-commit/kashish836/hr-assist-rag)
![GitHub repo size](https://img.shields.io/github/repo-size/kashish836/hr-assist-rag)
![n8n](https://img.shields.io/badge/n8n-workflow-EA4B71?logo=n8n)
![Groq](https://img.shields.io/badge/LLM-Groq%20gpt--oss--20b-orange)
![Hugging Face](https://img.shields.io/badge/Embeddings-HuggingFace-yellow?logo=huggingface)
![Test Accuracy](https://img.shields.io/badge/test%20accuracy-15%2F15%20(100%25)-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Status](https://img.shields.io/badge/status-complete-success)

---

A RAG-based HR policy assistant that gives employees instant, grounded answers to common HR questions — and escalates to a real person when it doesn't know, instead of guessing.

---

## Overview

HR-Assist reads a company's actual HR policy documents and answers employee questions in natural language, using retrieval-augmented generation (RAG) rather than relying on an LLM's general knowledge. If a question falls outside what's documented, it's routed to HR by email — with the employee's name and contact info attached — instead of producing an unreliable answer.

Built end-to-end with n8n as the orchestration layer, this project was also an exercise in debugging real production issues: deprecated APIs, broken OAuth credentials, and workflow failure-handling — all documented in the [project diary](project_diary.md).

---

## Try It

```
frontend/hr-assist.html   → landing page + chat, in one file
```
Requires the n8n workflow running locally (see [TRD](docs/TRD.md) for setup).

A static copy is also hosted on Vercel for browsing the UI: **[link]**. The landing page works for any visitor; the chat only responds when *you personally* have local n8n running, since the page talks to `localhost:5678` by design (see [Known Limitations](#known-limitations)).

---

## Tech Stack

| Category | Technology |
|---|---|
| Orchestration | n8n (self-hosted, Docker) |
| LLM | Groq — `openai/gpt-oss-20b` |
| Embeddings | Hugging Face — `sentence-transformers/all-MiniLM-L6-v2` |
| Retrieval | Cosine similarity (custom JS implementation) |
| Logging | Google Sheets (OAuth2) |
| Escalation delivery | SMTP (Gmail App Password) |
| Frontend | Single-file HTML/CSS/JS — no build tooling |

---

## Features

- Natural-language HR policy Q&A, grounded in real documents (no hallucinated answers)
- Confidence-threshold routing: answers when it knows, escalates when it doesn't
- Escalation emails include employee name + email for direct follow-up
- Every interaction logged (answered or escalated) with full structured detail
- Single-file frontend: landing page and chat interface in one page, switched client-side with no page reload
- Blue/black glass UI (frosted cards, rounded corners), with a light/dark theme toggle

---

## Pipeline

```text
Employee question (chat UI)
        ↓
 n8n Webhook
        ↓
 Embed question (Hugging Face)
        ↓
 Cosine similarity vs. pre-embedded policy chunks
        ↓
 Confidence ≥ 0.35? ──── NO ──→ Escalation email (SMTP) → Log → Respond
        │
       YES
        ↓
 Groq LLM generates grounded answer → Log → Respond
```

Full diagram and design rationale in [Architecture.md](docs/Architecture.md).

---

## Results

| Metric | Result |
|---|---|
| Test set | 15 questions (10 answerable, 5 out-of-scope) |
| Answer accuracy | 10/10 (100%) |
| Escalation accuracy | 5/5 (100%) |
| Overall accuracy | **15/15 (100%)** |
| Confidence threshold | 0.35 (set from real observed score gap) |
| Cost | $0 — free tier throughout |

Full test log in [Testing-QA.md](docs/Testing-QA.md).

---

## Notable Challenges & Fixes

- Hugging Face fully deprecated its old inference endpoint mid-project — migrated to their current router endpoint.
- Groq's available model lineup changed twice; resolved by querying the account's real available models via Groq's own API instead of trusting docs.
- n8n halts an entire execution when any node fails, even on a separate branch — a stale logging credential was silently blocking employee responses. Fixed with parallel branching + "Continue on error."
- AI-generated answers containing quotes/line breaks broke raw JSON string templating — fixed by building request/response bodies with real expression syntax instead.
- Attempted to host n8n itself on Render's free tier (with Supabase Postgres for persistence) to get a fully public demo; hit a memory crash on the 512MB free instance. Reverted to local-only hosting rather than sinking more time into a workaround with limited payoff for a portfolio demo.

Full root-cause writeups for every bug in [project_diary.md](project_diary.md).

---

## Known Limitations

- Runs against a local n8n instance — not publicly hosted. The Vercel-hosted frontend is a static copy of the UI; its chat only works when the viewer has local n8n running, since `localhost` always resolves to the viewer's own machine, not the deployer's.
- English only, no multilingual support
- No conversation memory — each question is handled independently
- No employee authentication (name/email are self-reported, not verified)

---

## Security

- No API keys or secrets committed to the repo — all credentials in n8n's credential store
- Policy documents used are sample/fictional data, not a real company's information

---

## Project Docs

[PRD](docs/PRD.md) · [TRD](docs/TRD.md) · [Architecture](docs/Architecture.md) · [Feature List](docs/Feature.md) · [API/Integration](docs/API-Integration.md) · [Testing & QA](docs/Testing-QA.md) · [Workflow Notes](notes.md) · [Full Project Diary](project_diary.md)

---

## Author

**Kashish Bhiwapurkar**

---

## License

This project is licensed under the MIT License.
