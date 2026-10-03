# Product Requirements Document (PRD) — HR-Assist RAG

## 1. Problem Statement

HR teams, especially in startups, receive a high volume of repetitive questions from employees — leave balances, WFH policy, insurance coverage, travel reimbursement, etc. Answering these manually does not scale and takes HR staff time away from higher-value work. Employees also experience delays waiting for a human response to questions that are often already documented in company policy.

## 2. Goal

Build a system that lets employees ask HR policy questions in natural language and receive an instant, accurate answer grounded in the company's actual policy documents. If a question isn't covered by the available documents, the system escalates it to a human HR contact rather than guessing.

## 3. Target User

- **Primary:** Employees at a small-to-mid-size company who need quick answers to common HR policy questions
- **Secondary:** HR team members, who benefit from reduced repetitive query volume and visibility into recurring/unanswered topics via logged data

## 4. Market Context

This is a validated, real-world pattern — not a hypothetical problem:
- n8n's own internal People Ops team runs a similar internal bot ("Lucy") to handle policy questions at scale (300+ employees, 3-person team)
- Multiple public implementations exist using various stacks, confirming this is a common automation pattern
- Most existing public examples rely on paid APIs; this project is built entirely on free tiers

## 5. Scope — v1 (Delivered)

- Accept a natural-language HR policy question via a chat-style web interface
- Retrieve the most relevant section of a company policy document using embeddings + cosine similarity (true RAG)
- Generate a grounded answer using an LLM, constrained to only use retrieved context
- Apply a confidence threshold: if no sufficiently relevant match is found, escalate instead of answering
- Escalate unanswered questions to HR via email, including the employee's name and email for follow-up
- Log every interaction (answered or escalated) with structured fields, including employee identity
- **Delivered beyond original plan:** a single-file frontend — landing view (feature grid, direct "email HR" option) and a full chat interface in one page, switched client-side, with light/dark theme, timestamps, and conversation reset

## 6. Out of Scope (v1) — Future Work

- Multilingual support
- India-specific labor law / compliance-specific Q&A
- Multi-turn conversational memory (each question is treated independently)
- Authentication/login for employees
- Admin dashboard for HR to manage/update policy documents through a UI
- Publicly hosting the backend (n8n). A public hosting attempt (Render + Supabase) was made and reverted after hitting free-tier resource limits — see [Architecture.md](Architecture.md) §6. The frontend alone is publicly hosted (Vercel); the chat still requires the visitor's own local n8n instance.

## 7. Success Criteria — RESULTS

| Criterion | Target | Actual |
|---|---|---|
| Answer accuracy (in-scope questions) | ≥80% | **100% (10/10)** |
| Escalation accuracy (out-of-scope questions) | ≥80% | **100% (5/5)** |
| Overall test set accuracy | ≥80% | **100% (15/15)** |
| Structured logging completeness | No missing fields | Achieved, including employee identity fields |
| No hardcoded secrets in repo | Required | Achieved (n8n credentials store used throughout) |

Full test set and methodology documented in `Testing-QA.md`.

## 8. Assumptions

- Policy documents are provided as plain text/markdown, written by the project owner for this learning project (not real company data)
- Users interact in English only (v1)
- Free-tier API rate limits are sufficient for demo/testing volume

## 9. Reference / Inspiration

Inspired by the general pattern of AI-based HR helpdesk bots seen in the community (e.g., n8n's internal "Lucy"). Architecture, code, and documents in this repository were built independently.
