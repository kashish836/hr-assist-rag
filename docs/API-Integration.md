# API / Integration Documentation — HR-Assist RAG

## 1. Hugging Face Inference Providers (Embeddings)

- **Purpose:** Convert text into embedding vectors
- **Endpoint (current, as of this project):** `https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction`
- **Note:** the older `api-inference.huggingface.co` endpoint is fully deprecated and no longer resolves — confirmed the hard way mid-project. Always verify current endpoints against Hugging Face's own docs rather than older tutorials.
- **Auth:** Header Auth credential (`Authorization: Bearer <token>`), stored in n8n's credentials store
- **Response handling:** requires "Include Response" enabled in the HTTP Request node's Options to prevent n8n from splitting the returned array into hundreds of separate items

## 2. Groq API (LLM Inference)

- **Purpose:** Generate the final grounded answer
- **Model used:** `openai/gpt-oss-20b`
- **Note:** the account had no Llama-family chat models available at all — confirmed by querying Groq's own `/v1/models` endpoint directly rather than trusting documentation or search results, after two different assumed model names both failed
- **Auth:** Header Auth credential
- **Request body:** built using n8n Expression mode with real object syntax (`{{ {...} }}`), not string templating — necessary because prompt text can contain quotes or line breaks that break raw JSON string substitution

## 3. Google Sheets API (Logging)

- **Purpose:** Store structured logs of every interaction
- **Auth:** OAuth2, via a Client ID + Secret created in Google Cloud Console (APIs & Services → Clients), with redirect URI `http://localhost:5678/rest/oauth2-credential/callback`
- **Note:** the initial credential was broken (Client ID field somehow contained an email address instead of a real OAuth client) — fixed by creating a fresh Client ID rather than debugging the broken one
- **Schema (columns):** timestamp, question, matched_topic, confidence_score, outcome, answer_or_action, employee_name, employee_email
- **Error handling:** node set to "On Error: Continue" so a Sheets failure never blocks the employee's response

## 4. Email Delivery (Escalation)

- **Method used:** SMTP via n8n's generic "Send Email" node, not Gmail's OAuth-based node
- **Why:** the Gmail OAuth credential was broken and unreconnectable ("Client authentication failed"); properly fixing it would have required significant additional Google Cloud Console setup for marginal benefit on a single-account demo project
- **Credential:** Gmail SMTP (`smtp.gmail.com`, port 465, SSL) with a Gmail App Password (not the account's real password)
- **Content:** includes the employee's name, email, the original question, and the confidence score, so HR can follow up directly

## 5. n8n Webhook (Entry Point)

- **Method:** POST
- **Payload:** `{ "question": "...", "employeeName": "...", "employeeEmail": "..." }`
- **Response mode:** "Using Respond to Webhook Node" (not "Immediately"), so the actual generated answer is returned, not an empty acknowledgment
- **Note:** n8n's Production webhook runs whatever was last explicitly **Published** — live editor changes do not take effect until published again. This caused real confusion during debugging and is worth remembering for any future n8n project.
- **CORS:** Allowed Origins set to `*` on the Webhook node so the frontend can call it directly from a file opened in a browser (`file://`) or from a Vercel-hosted page, without a server-side proxy in between

## 6. Frontend → Backend Connection

- `frontend/hr-assist.html` calls `http://localhost:5678/webhook/hr-question` directly via `fetch()` — no proxy layer
- This means the chat only responds for whoever has their own local n8n instance running and reachable at that address; `localhost` always resolves to the machine making the request, not the machine that deployed the page
- Chosen deliberately after a public-hosting attempt on Render hit free-tier resource limits (see [Architecture.md](Architecture.md) §6) — documented as a known limitation rather than solved with additional infrastructure

## 7. Public Hosting Attempt: Render + Supabase (not adopted)

- **Target:** host n8n itself on Render's free Web Service tier, using Supabase's free Postgres instance as persistent storage (`DB_TYPE=postgresdb`, `DB_POSTGRESDB_HOST/PORT/DATABASE/USER/PASSWORD` pointed at Supabase's Session Pooler — the Transaction Pooler was avoided since it defaults to IPv6-only without a paid add-on)
- **Outcome:** the service crashed on startup with `FATAL ERROR: Ineffective mark-compacts near heap limit — JavaScript heap out of memory`, caused by Render's free tier capping the instance at 512MB RAM, less than n8n needs by default
- **Partial fix applied:** `NODE_OPTIONS=--max-old-space-size=460` environment variable, capping Node's own heap size to fit inside the container limit
- **Reason not pursued further:** even past the crash, a freshly provisioned n8n instance has no credentials or workflow — every credential (Groq, Hugging Face, SMTP, Google Sheets OAuth) would need to be re-created from scratch, and Google Sheets OAuth specifically requires a new redirect URI registration per domain. The time cost outweighed the benefit for a project whose primary audience is a portfolio reviewer, not production traffic.

## 8. Credential Management

All API keys and OAuth connections are stored using n8n's built-in credentials system. No secrets are committed to the GitHub repo.
