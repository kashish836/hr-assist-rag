# API / Integration Documentation — HR-Assist RAG

## 1. Hugging Face Inference API (Embeddings)

- **Purpose:** Convert text (policy chunks and questions) into embedding vectors
- **Model:** `sentence-transformers/all-MiniLM-L6-v2` (or similar free, CPU-friendly sentence-transformer model)
- **Auth:** API key from Hugging Face account, stored in n8n credentials store (never hardcoded)
- **Free tier limits:** Subject to Hugging Face's rate limits for the free Inference API — must be checked at build time, as limits can change
- **Docs:** https://huggingface.co/docs/api-inference/index

## 2. Groq API (LLM Inference)

- **Purpose:** Generate the final answer, grounded in retrieved policy context
- **Model:** Llama 3.1 (specific size TBD during build, based on free-tier availability)
- **Auth:** API key from Groq console, stored in n8n credentials store
- **Free tier limits:** Groq's free tier has request-per-minute and token limits — must be checked at build time
- **Docs:** https://console.groq.com/docs/quickstart

## 3. Google Sheets API (Logging)

- **Purpose:** Store structured logs of every interaction
- **Auth:** Google account OAuth via n8n's built-in Google Sheets node
- **Schema (columns):** `timestamp`, `question`, `matched_chunk`, `confidence_score`, `outcome`, `response_time_ms`
- **Docs:** https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets/

## 4. Gmail API (Escalation)

- **Purpose:** Send escalation emails to HR when confidence is below threshold
- **Auth:** Google account OAuth via n8n's built-in Gmail node
- **Content:** Original question, timestamp, and a note that it was not confidently answerable by the system
- **Docs:** https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.gmail/

## 5. n8n Webhook (Entry Point)

- **Purpose:** Receives the incoming question from the frontend (or any HTTP client, e.g., Postman during testing)
- **Method:** POST
- **Expected payload:** `{ "question": "How many sick days do I get?" }`
- **Docs:** https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/

## 6. Credential Management

All API keys (Hugging Face, Groq) and OAuth connections (Google Sheets, Gmail) are stored using n8n's built-in credentials system, never hardcoded into workflow nodes or committed to the GitHub repo. Any local config files containing secrets are excluded via `.gitignore`.
