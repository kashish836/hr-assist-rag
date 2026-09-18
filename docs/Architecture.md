# Architecture — HR-Assist RAG

## 1. Overview
This document describes how the system's components fit together, expanding on the 13-step workflow diagram from `notes.md`.

## 2. High-Level Architecture

```
                 ┌─────────────────────┐
                 │   Frontend (HTML)    │
                 │  text input + submit │
                 └──────────┬───────────┘
                            │ POST question
                            ▼
                 ┌─────────────────────┐
                 │   n8n Webhook Node   │  ← entry point
                 └──────────┬───────────┘
                            ▼
                 ┌─────────────────────┐
                 │ HF Embedding API call│  ← question → vector
                 └──────────┬───────────┘
                            ▼
                 ┌─────────────────────┐
                 │  Similarity Search   │  ← compare vs. stored
                 │  (vs. stored chunks) │     policy chunk vectors
                 └──────────┬───────────┘
                            ▼
                    ◇ Confidence check ◇
                    /                  \
                  YES                  NO
                   │                    │
         ┌─────────▼────────┐  ┌────────▼─────────┐
         │  Build prompt +   │  │  Build escalation │
         │  call Groq LLM    │  │  email content     │
         └─────────┬────────┘  └────────┬─────────┘
                   │                    │
         ┌─────────▼────────┐  ┌────────▼─────────┐
         │  Return answer to │  │  Send email via    │
         │  employee         │  │  Gmail node         │
         └─────────┬────────┘  └────────┬─────────┘
                   └─────────┬──────────┘
                             ▼
                 ┌─────────────────────┐
                 │  Log to Google Sheets│  ← both paths land here
                 └─────────────────────┘
```

## 3. Component Breakdown

| Component | Responsibility | Technology |
|---|---|---|
| Frontend | Collect question, display response | Static HTML/JS |
| Webhook | Entry point, receives HTTP requests | n8n Webhook node |
| Embedding service | Converts text → vector | Hugging Face Inference API |
| Vector comparison | Finds closest policy chunk | n8n Code node (cosine similarity calculation) |
| LLM | Generates grounded answer | Groq API (Llama 3.1) |
| Escalation | Notifies HR of unanswered question | n8n Gmail node |
| Logging | Records every interaction | n8n Google Sheets node |

## 4. One-Time Setup Flow (separate from live request flow)

```
Policy Document (markdown)
        ↓
   Split into chunks (by topic)
        ↓
   Generate embedding per chunk (HF API)
        ↓
   Store chunk text + embedding (e.g., in a JSON file or simple in-memory store
   loaded at workflow start — decision to be finalized during build)
```

This runs once, or whenever the policy document changes — never on a per-question basis.

## 5. Data Flow Summary
1. Employee submits question → webhook
2. Question embedded
3. Compared against pre-computed chunk embeddings
4. Threshold decision made
5. Either LLM-generated answer OR escalation email is produced
6. Response returned to employee
7. Interaction logged regardless of path taken

## 6. Design Decisions & Rationale
- **True embeddings-based retrieval chosen over prompt-stuffing:** scales properly if the policy document grows, and demonstrates the actual RAG pattern rather than a shortcut
- **Escalation over guessing:** prioritizes trustworthiness — a wrong HR policy answer has real consequences for an employee, so the system is designed to admit uncertainty
- **n8n as orchestrator:** avoids writing a full backend server; keeps the project buildable without hosting infrastructure beyond free tiers
