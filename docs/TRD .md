# Technical Requirements Document (TRD) — HR-Assist RAG

## 1. Purpose
Defines the technical requirements and constraints needed to implement the goals set out in the PRD.

## 2. Technical Constraints
- Must run entirely on **free-tier services** — no paid APIs, no GPU required
- Must be buildable and runnable using **n8n** as the orchestration layer
- Must not hardcode any API keys or secrets — all credentials managed via n8n's built-in credentials store
- Must handle external API failures gracefully (timeouts, rate limits) rather than crashing the workflow silently

## 3. System Requirements

### 3.1 Input
- Accepts a single natural-language text question via HTTP POST to an n8n webhook
- No authentication required for v1 (public demo webhook)

### 3.2 Embeddings
- Uses Hugging Face Inference API with a sentence-transformers model (e.g., `sentence-transformers/all-MiniLM-L6-v2`) to generate embeddings for both the policy chunks (one-time) and incoming questions (per request)
- Embeddings must be generated using the same model for both chunks and questions, so they're comparable

### 3.3 Chunking
- Policy document is split into chunks by topic/section (one chunk per policy topic, e.g., "Leave Policy," "WFH Policy"), not by arbitrary character count
- Chunking is a one-time preprocessing step, re-run only if the source policy document changes

### 3.4 Retrieval
- Cosine similarity is used to compare the question's embedding against all stored chunk embeddings
- The single highest-scoring chunk (or top-N, TBD during build) is selected as retrieved context

### 3.5 Confidence Threshold
- A similarity score threshold (exact value to be tuned during testing, starting estimate: 0.6-0.7 on a 0-1 cosine similarity scale) determines whether the match is trusted
- Below threshold → escalate; above threshold → proceed to answer generation

### 3.6 Answer Generation
- Uses Groq API (Llama 3.1 model) for LLM inference
- Prompt must explicitly instruct the model to answer only from provided context and to indicate if the context doesn't contain the answer

### 3.7 Escalation
- Triggered when similarity score is below threshold
- Sends an email (via n8n's Gmail node) to a configured HR contact address, containing the original question

### 3.8 Logging
- Every request (regardless of outcome) is written to a Google Sheet via n8n's Google Sheets node
- Required fields: `timestamp`, `question`, `matched_chunk` (or blank if none), `confidence_score`, `outcome` (answered/escalated), `response_time_ms`

### 3.9 Error Handling
- API calls to Hugging Face and Groq must have retry logic (e.g., 1-2 retries with basic backoff) before failing
- On unrecoverable failure, the workflow should log the failure and return a graceful error message to the user, not a raw error/stack trace

### 3.10 Frontend (final phase)
- A single static HTML/JS page with a text input, submit button, and response display area
- Calls the n8n webhook directly via a JS `fetch()` request
- No build tooling required — plain HTML/CSS/JS, hostable for free (e.g., GitHub Pages)

## 4. Non-Functional Requirements
- **Cost:** $0 — must operate fully within free-tier limits of all services used
- **Latency:** Best-effort; no strict SLA for a learning project, but response should feel reasonably responsive in a live demo (a few seconds is acceptable)
- **Security:** No secrets committed to the repo; use `.gitignore` for any local config/credential files

## 5. Dependencies
- n8n (self-hosted via Docker, or n8n.cloud free tier)
- Groq account + API key
- Hugging Face account + API key
- Google account (Sheets + Gmail API access)
- GitHub (version control, hosting frontend via Pages if used)
