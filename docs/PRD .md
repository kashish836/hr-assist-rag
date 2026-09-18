# Product Requirements Document (PRD) — HR-Assist RAG

## 1. Problem Statement

HR teams, especially in startups, receive a high volume of repetitive questions from employees — leave balances, WFH policy, insurance coverage, travel reimbursement, etc. Answering these manually does not scale and takes HR staff time away from higher-value work. Employees also experience delays waiting for a human response to questions that are often already documented in company policy.

## 2. Goal

Build a system that lets employees ask HR policy questions in natural language and receive an instant, accurate answer grounded in the company's actual policy documents. If a question isn't covered by the available documents, the system should escalate it to a human HR contact rather than guessing.

## 3. Target User

- **Primary:** Employees at a small-to-mid-size company who need quick answers to common HR policy questions
- **Secondary:** HR team members, who benefit from reduced repetitive query volume and visibility into recurring/unanswered topics via logged data

## 4. Market Context

This is a validated, real-world pattern — not a hypothetical problem:
- n8n's own internal People Ops team runs a similar internal bot ("Lucy") to handle policy questions at scale (300+ employees, 3-person team)
- Multiple public implementations exist using various stacks (OpenAI + Pinecone, Slack-based assistants, Teams-embedded bots), confirming this is a common automation pattern, not a niche idea
- Most existing public examples rely on paid APIs; this project is built entirely on free tiers, which is a deliberate differentiator

## 5. Scope — v1 (In Scope)

- Accept a natural-language HR policy question via webhook
- Retrieve the most relevant section of a company policy document using embeddings + similarity search (true RAG, not prompt-stuffing the entire document)
- Generate a grounded answer using an LLM, constrained to only use retrieved context
- Apply a confidence/similarity threshold: if no sufficiently relevant match is found, escalate instead of answering
- Escalate unanswered questions to HR via email
- Log every interaction (answered or escalated) with structured fields: timestamp, question, matched chunk, confidence score, outcome, response time
- Provide a minimal web frontend (single page: text input + submit + response display) as the final phase, for demo purposes

## 6. Out of Scope (v1) — Future Work

- Multilingual support (e.g., Hindi/English)
- India-specific labor law / compliance-specific Q&A
- Multi-turn conversational memory (each question is treated independently in v1)
- Authentication/login for employees
- Admin dashboard for HR to manage/update policy documents through a UI
- Integration with Slack/Teams (v1 uses a simple webhook + web form only)

*Rationale: these are legitimate future directions but were deliberately excluded from v1 to keep scope explainable and avoid the risk of shipping inaccurate legal/compliance content in a learning project.*

## 7. Success Criteria

- A test set of 15-20 sample HR questions (mix of answerable and out-of-scope) is run through the system
- Target: correctly answers ≥80% of in-scope questions, correctly escalates ≥80% of out-of-scope questions (measured, not assumed — see Testing & QA doc)
- Every interaction is logged with complete, structured data (no missing fields)
- No hardcoded secrets/API keys in the workflow (managed via n8n credentials store)

## 8. Assumptions

- Policy documents are provided as plain text/markdown, written by the project owner for this learning project (not real company data)
- Users interact in English only (v1)
- Free-tier API rate limits are sufficient for demo/testing volume (not production employee-count scale)

## 9. Reference / Inspiration

Inspired by the general pattern of AI-based HR helpdesk bots seen in the community (e.g., n8n's internal "Lucy," and various public n8n + LLM HR bot examples). Architecture, code, and documents in this repository were built independently, not copied from any specific existing project.
