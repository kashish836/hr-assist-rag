# Technical Requirements Document (TRD) — HR-Assist RAG

## 1. Purpose
Defines the technical requirements and constraints for HR-Assist RAG, updated to reflect actual implementation decisions.

## 2. Technical Constraints
- Runs entirely on free-tier services — no paid APIs, no GPU
- Orchestrated via n8n (self-hosted, Docker)
- No hardcoded secrets — all credentials managed via n8n's credentials store
- Handles external API failures without breaking the employee-facing response (see Error Handling below)

## 3. System Requirements (as built)

### 3.1 Input
- Single-file web frontend (`frontend/hr-assist.html`): landing view and chat view in one HTML file, switched client-side with JavaScript (no page reload)
- Chat view posts to an n8n webhook via `fetch()`, including `question`, `employeeName`, and `employeeEmail`

### 3.2 Embeddings
- Hugging Face's Inference Providers router: `https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction`
- **Note:** the original `api-inference.huggingface.co` endpoint was fully deprecated mid-project; migrated to the router endpoint (see diary Bug 1)
- Produces 384-dimension embeddings for both policy chunks (one-time) and live questions (per request)

### 3.3 Chunking
- Policy document split into 5 topic-based chunks (Leave, WFH, Insurance, Travel & Reimbursement, Notice Period)
- One-time preprocessing, stored to disk, not re-run per question

### 3.4 Retrieval
- Cosine similarity computed in a Code node (custom JS implementation, not a library)
- Highest-scoring chunk selected as retrieved context

### 3.5 Confidence Threshold
- Set to **0.35**, chosen from real observed data (correct matches scored ~0.6-0.75, incorrect/unrelated chunks scored 0.10-0.25) rather than an estimated range

### 3.6 Answer Generation
- **Model:** `openai/gpt-oss-20b` via Groq's API
- **Note:** original plan assumed Llama models would be available; discovered via Groq's own `/v1/models` endpoint that the account only has access to OpenAI's open-weight gpt-oss models (see diary Bug 3)
- Prompt instructs the model to answer only from provided context

### 3.7 Escalation
- Triggered when similarity score is below 0.35
- **Email delivery:** implemented via SMTP with a Gmail App Password, not Gmail's OAuth node — the OAuth credential was broken/unreconnectable and fixing it was deprioritized in favor of a simpler, equally-secure approach for a single-account project
- Escalation email includes employee name and email (added after initial build) so HR can follow up directly

### 3.8 Logging
- Google Sheets, via a properly configured OAuth Client ID (created fresh in Google Cloud Console after an initial broken credential)
- Fields: timestamp, question, matched_topic, confidence_score, outcome, answer_or_action, employee_name, employee_email
- **Both logging nodes set to "On Error: Continue"** — a logging failure must never block the employee's response (this was a real bug found and fixed; see diary)

### 3.9 Error Handling
- Sheets logging nodes configured to continue on failure rather than halting the whole execution
- JSON request/response bodies built using n8n Expression mode with real object syntax (`{{ {...} }}`), not string templating — this avoids breakage when AI-generated text contains quotes or line breaks (a real bug hit twice during the build)

### 3.10 Frontend (as built, current)
- `frontend/hr-assist.html` — single self-contained file: landing view (hero, feature grid, "how it works," direct email-to-HR option) and chat view (message bubbles, typing indicator, timestamps, clear-conversation button, suggested questions), toggled in-page via JavaScript
- Blue/near-black "glass" visual design (frosted cards, blurred background glow, rounded corners), with a light/dark theme toggle persisted via `localStorage`
- No build tooling; no external CSS/JS files — everything inlined into the one HTML file to eliminate cross-file dependency issues that affected the original two-page version
- Calls `http://localhost:5678/webhook/hr-question` directly; no server-side proxy

### 3.11 Deployment
- `frontend/hr-assist.html` is deployed to Vercel as a static page (no backend functions, no environment variables required)
- The page itself (landing view) renders correctly for any visitor
- The chat view only functions for a visitor who has their own local n8n instance running at `localhost:5678`, since that address always resolves to the requester's own machine
- A public backend hosting attempt (n8n on Render + Supabase Postgres) was made and reverted — see [Architecture.md](Architecture.md) §6 and [API-Integration.md](API-Integration.md) §7 for what was tried and why it wasn't adopted

## 4. Non-Functional Requirements
- **Cost:** $0
- **Latency:** a few seconds per response, acceptable for a demo/internal tool
- **Security:** no secrets committed to the repo

## 5. Dependencies
- n8n (self-hosted via Docker)
- Groq account + API key (Header Auth credential)
- Hugging Face account + API key (Header Auth credential)
- Google Cloud project with OAuth Client ID (Sheets) + Gmail App Password (SMTP)
- GitHub
- Vercel (static hosting for `hr-assist.html` only)
