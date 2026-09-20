# RAG HR Policy Q&A Bot — Project Diary

## Project Rules (agreed on Day 0)
1. Beginner-friendly: step-by-step commands + explanations + examples + docs links
2. Small tasks assigned along the way
3. Mentor mode: reading/practice recommendations for deeper learning
4. Go at learner's pace, always explain *why* before *how*
5. Everything must be free, no GPU required
6. This diary logs: why we chose X over Y, bugs hit, how we fixed them
7. A "recovery prompt" exists to resume in a new chat if this one runs out of tokens
8. Workflow gets sketched on pen & paper BEFORE touching n8n
9. Regular quizzes to check understanding
10. Sessions start "tomorrow morning" (Day 1) onward
11. Maintain a GitHub repo with **daily commits**, containing 7 core docs:
    1. PRD (Product Requirements Doc)
    2. TRD (Technical Requirements Doc)
    3. Architecture doc
    4. Feature doc
    5. API/Integration doc
    6. Testing & QA doc
    7. README
    (Repo + docs get scaffolded on Day 1, alongside the pen-and-paper workflow sketch)
12. After every phase/session, Claude gives a ready-to-paste **GPT update prompt** so the user can keep a second AI (ChatGPT) informed of progress. First GPT prompt = full plan overview.

## Tech Stack (all free, no GPU)
| Component | Tool | Why |
|---|---|---|
| Automation | n8n (self-hosted via Docker, or n8n.cloud free) | Visual workflow builder, huge free node library |
| LLM inference | Groq (free tier, Llama 3.1) | Fast, generous free tier, OpenAI-compatible API |
| Embeddings | Hugging Face Inference API (sentence-transformers) | Free, no GPU needed, runs on HF's servers |
| Vector storage | TBD — deciding when we reach that step | Options: in-memory, free vector DB (Supabase/Chroma) |
| Logging | Google Sheets | Easy n8n integration, free |
| Docs corpus | Our own sample HR policy text | Real, usable, no legal-accuracy risk |

## Project Idea (recap)
**Goal:** Employee asks a question ("How many sick days do I get?") → bot answers using OUR documents (RAG), not just general LLM knowledge. If not covered → escalate to HR. Every interaction logged.

**Why RAG and not other options considered:**
- Rejected "Health Symptom Triage Bot" → high-stakes medical domain, too many moving parts for a first project
- Rejected "AI News Summarizer" → good project, but AI logic is a single prompt call, doesn't teach embeddings/retrieval
- Chose RAG → teaches the pattern used in real production AI products: embeddings → similarity search → LLM generates grounded answer

## Reference Projects (inspiration only — not copied)
- **ai-hr-helpdesk-agent** (n8n + Groq + Gmail + Sheets), shared by user. Confirms the pattern is real and commonly built. Borrowed idea: **escalate to HR via email when the question isn't covered by policy docs**, rather than letting the AI guess. Added as a v1 feature.
- We build our own architecture/code from scratch — inspiration for scope only, not a source to copy.

## Market Research (feeds into PRD)
- Confirmed real, validated pattern: n8n's own People Ops team runs an internal HR bot ("Lucy") for policy Q&A.
- Most public implementations use paid stacks (OpenAI, Pinecone); ours is 100% free-tier — worth noting in README/PRD.
- Decided AGAINST scope creep: India-specific labor law compliance + multilingual support are real ideas, filed under "Future Work" — not v1. Legal-domain accuracy is high-stakes, out of scope for a first learning project.
- v1 stays focused: sample HR docs (written by us) + Q&A + escalation + logging. Explainable in an interview in under 2 minutes.

---

## Session Log

### Day 0 — Setup & Planning
- Decided on final project: RAG-based HR Policy Q&A Bot
- Agreed on 12 ground rules for how we'll work together
- Chose free tech stack
- Did market research + reviewed a reference project
- Next session (Day 1): sketch the workflow on paper first, no tools yet

### Day 1 — COMPLETE
What we did:
- Sketched the full 13-step RAG workflow on pen & paper
- Verified understanding with a quiz (80% → 100% after review)
- Created GitHub repo (hr-assist-rag), verified git installed (v2.53.0.windows.2)
- Set up repo structure: README.md (root) + docs/ folder
- Wrote full README, PRD, TRD, Architecture, Feature, API-Integration, Testing-QA docs
- Created notes.md with full workflow explanation + glossary + quiz recap
- All committed with descriptive messages and pushed to GitHub, verified live

No bugs hit yet — smooth setup day. Next: Day 2 — write actual HR policy document content (skeleton drafted by Claude, content filled by user) + set up Groq/HF/n8n accounts.

---

## Future Projects (separate from this one — not features to bolt on)
- **Project #2 idea: Relocation/Transfer Request Automation** (inspired by a real case: sister's inter-branch relocation took 2 months due to invisible approval delays + an unlisted destination office surfacing late)
  - Problem type: process/workflow automation with approvals, NOT knowledge retrieval — no RAG needed here
  - Would involve: multi-step approval state machine, automatic reminders on stalled steps, upfront validation against a master office list
  - Deliberately kept separate from the HR Q&A bot to avoid scope creep and to teach a genuinely different skill (workflow/state automation vs. retrieval)
  - To be scoped properly once Project #1 (RAG bot) is done

## v1 Scope — "Interview-grade," not tutorial-basic
Decided to go beyond a bare-minimum build. Same core architecture, built properly:
- Proper chunking strategy (by topic/heading, not arbitrary splits) instead of dumping whole doc into prompt
- Test set of ~15-20 sample Q&A pairs (answerable + should-escalate) to measure accuracy, not just eyeball testing
- Error handling for API failures (Groq/HF timeouts, rate limits) — retry/fallback instead of silent breakage
- Confidence/similarity threshold to decide answer-vs-escalate, not just "found some text"
- Secrets via n8n credentials store, not hardcoded keys
- Structured logging schema (timestamp, question, matched chunk, confidence, answered/escalated, response time)
- All tradeoffs documented in diary + PRD/TRD (this IS the interview story)

**Policy doc approach:** Claude drafts a skeleton (section headings + placeholders only, explaining why each section is shaped that way for RAG-friendliness), user fills in real content. User chose "help me learn" over either extreme — this hybrid teaches document structuring for RAG while keeping momentum. Scheduled for Day 1, after the pen-and-paper sketch.

## Estimated Timeline
~12 working days at ~45-90 min/session/day, beginner pace with explanations + tasks:
Day 1: pen&paper + repo + PRD/TRD | Day 2: remaining docs + policy content + accounts |
Day 3: n8n basics + webhook | Day 4: chunking + embeddings | Day 5: retrieval/similarity |
Day 6: prompt + Groq call (first end-to-end answer) | Day 7: confidence threshold + escalation |
Day 8: Sheets logging | Day 9-10: test set + debugging | Day 11: error handling + secrets |
Day 12: polish + final commit. Range 5-20 days depending on session frequency/bugs encountered.

## Project Name
Chose: **HR-Assist RAG** (repo slug: `hr-assist-rag`)
- User's instinct: professional + helpful → "HR-Assist"
- Checked GitHub first — "HR-Assist" already exists as multiple public repo names, so we avoided a naming collision
- Final name keeps the original intent but adds "-rag" to signal the actual technique used (good for a technical audience skimming GitHub)

## Phase: Final Website (Frontend)
- Decided to build a simple website as the LAST phase, after the n8n workflow (backend logic) is fully working and tested
- Purpose: makes the project demo-able to non-technical people (recruiters, interviewers) — a live "ask a question" page beats showing raw n8n workflow screenshots
- Scope (kept intentionally minimal — this is a demo UI, not a product): a single page with a text input for the question, a "submit" button that calls our n8n webhook, and a display area for the response. No login, no styling framework needed beyond basics, no multi-page navigation.
- Deliberately sequenced LAST so it doesn't distract from learning the core RAG mechanics first
- Tech choice TBD when we reach this phase (options: plain HTML/JS calling the webhook directly, or a simple hosted form — free tier only, no GPU, consistent with all other project rules)

### Day 3 — COMPLETE: One-time embedding setup workflow
What we did:
- Fixed n8n login lockout (Docker Basic Auth confusion → actually n8n's own user-management, reset via CLI)
- Learned Docker container lifecycle (--rm removes container on stop; named volumes persist data independently)
- Built "HR-Assist - Embed Setup" workflow: Manual Trigger → Code (5 policy chunks as structured data) → HTTP Request (HF embeddings) → Code (recombine topic/text/embedding) → Aggregate → Convert to File → Read/Write Files from Disk
- Hit and fixed 2 real bugs (see Bugs & Fixes Log): HF API endpoint deprecation, n8n's built-in .n8n folder write restriction (security feature, not a bug)
- Verified final output: policy_embeddings.json (41.8 kB) correctly saved with topic + text + 384-dim embedding per chunk, persisted in dedicated n8n_files Docker volume
- Also completed webhook trigger setup for the live workflow (path: hr-question), verified request/response shape

Next: Day 4 — build the LIVE question-answering workflow (webhook → embed question → read policy_embeddings.json → cosine similarity → threshold decision → answer/escalate → log)

### Day 4 — Live workflow: retrieval working
- Built HTTP Request (embed question) → Read/Write (read policy_embeddings.json) → Extract from File → Code (cosine similarity) chain
- Bugs hit: (1) same 384-item array-splitting issue as before, fixed with "Include Response" toggle again; (2) wrong assumed path for question embedding (`body[0].embedding` vs actual `body` directly) — fixed by checking Schema view instead of guessing
- First real end-to-end retrieval test: "How many sick days do I get?" correctly matched to "Leave Policy" chunk, cosine similarity score 0.603
- Next: check full score spread across all 5 chunks to set a data-driven confidence threshold (not just the TRD's estimated 0.6-0.7 guess)

**Threshold decision (data-driven):** First real test showed a huge gap — correct match (Leave Policy) scored 0.603, while all other chunks scored 0.10-0.18 (Travel scored slightly negative, correctly indicating "unrelated"). Set confidence threshold to **0.35-0.40** based on this real gap, not the TRD's earlier guessed range. Will refine further once the full 15-20 question test set is run.

### Bug 3: Groq "model does not exist" — llama-3.1-8b-instant
- **What happened:** HTTP Request to Groq's chat completions endpoint returned "the model llama-3.1-8b-instant does not exist or you do not have access to it"
- **Root cause:** Groq retired this model; current standard model is `llama-3.3-70b-versatile` (confirmed via web search) — TURNED OUT ALSO WRONG, this model wasn't in the actual account's available list either
- **Follow-up:** queried Groq's own `/v1/models` endpoint directly to see the account's real available models — discovered NO Llama chat models are available at all anymore; account only has `openai/gpt-oss-20b`, `openai/gpt-oss-120b`, `openai/gpt-oss-safeguard-20b`, plus specialized audio/prompt-guard models
- **Final fix:** switched to `openai/gpt-oss-20b` (general-purpose, right-sized for our use case, not the oversized 120b variant)
- **Fix:** updated model name in the request body
- **Also fixed in same session:** JSON body needed to be built via n8n's Expression mode (`{{ {...} }}`) rather than templating `{{ $json.prompt }}` into a raw JSON string — the prompt's embedded quotes/apostrophes broke raw string substitution
- **Lesson:** same pattern as Bug 1 — AI provider APIs change their model lineup over time; always verify current model names rather than assuming a model name from documentation/memory is still valid

### Day 4 — MILESTONE: Full RAG pipeline working end-to-end (TRUE/answer branch)
- Complete chain verified working: Webhook → embed question → read policy embeddings → cosine similarity → confidence check (IF, true branch) → build prompt → Groq LLM call → extract answer → Respond to Webhook
- Real test: "How many sick days do I get?" → correctly answered "You get 12 sick days." — accurate, grounded in the actual policy doc, no hallucination
- Bugs hit and fixed along the way (see Bugs & Fixes Log): wrong code pasted into wrong Code node (3 similarly-named nodes caused a mixup), raw-string JSON templating breaking on embedded quotes (fixed via n8n Expression mode), Groq model name deprecated twice in a row (llama-3.1-8b-instant, then llama-3.3-70b-versatile both unavailable) — resolved by querying Groq's own /v1/models endpoint directly instead of trusting docs, landed on openai/gpt-oss-20b. Also hit a "Respond to Webhook" field stuck in Fixed mode instead of Expression mode, returning literal unevaluated `{{ }}` text instead of the real answer.
- Next: build the FALSE (escalation) branch, then add Google Sheets logging on both paths

### Day 4/5 — MILESTONE: Escalation branch working, both branches complete
- Built FALSE branch: Code (packages question+confidence+outcome) → Send Email → Respond to Webhook
- Hit Gmail OAuth credential failure (stale token from old project, reconnect attempt failed with "client authentication failed" — likely a broken/deleted Google Cloud OAuth client behind the scenes)
- **Decision:** switched from Gmail OAuth node to generic SMTP "Send Email" node with a Gmail App Password, rather than debugging Google Cloud OAuth setup from scratch. Documented as a deliberate tradeoff: OAuth is the "proper" approach for production/multi-user apps, but SMTP+app password is a legitimate, standard approach for a single-account demo project, and saved significant time against our 2-day deadline.
- Tested live: "What is the office WiFi password?" → correctly identified as low-confidence (0.234, below 0.35 threshold) → escalation email sent and received successfully → employee received "forwarded to HR" response
- **Both branches (answer + escalate) now fully functional end-to-end.** Core project logic complete.
- Next: Google Sheets logging on both branches, then the test set, then frontend

### Day 4 (cont.) — MILESTONE: Escalation branch complete, both branches working end-to-end
- Built FALSE branch: Code (pass question/confidence/outcome) → Send Email (SMTP) → Respond to Webhook
- Bug: Gmail OAuth credential had gone stale, reconnect failed with "Client authentication failed" (broken/misconfigured underlying Google Cloud OAuth app). Rather than debugging full OAuth setup (real hours of Google Cloud Console work, not worth it for a single-account demo project under a 2-day deadline), switched to n8n's generic SMTP "Send Email" node with a Gmail App Password instead. Documented as a deliberate, reasonable tradeoff for a learning project, not a hidden shortcut.
- Verified live: asked "What is the office WiFi password?" (correctly outside policy scope, confidence 0.234, well below 0.35 threshold) → correctly escalated → email actually received in inbox → employee-facing response correctly said "forwarded to HR"
- **Both core branches of the entire RAG pipeline are now fully functional and tested.**
- Remaining: Google Sheets logging (both branches), test set + accuracy measurement, frontend page, final docs polish

### Day 5 — MILESTONE: Google Sheets logging complete on both branches
- Added "Append row in sheet" node on both the answer branch and escalation branch, right before each branch's "Respond to Webhook" node
- Bug: Google Sheets OAuth credential was stale (same root cause as the earlier Gmail issue) — fixed by reconnecting (this one worked, unlike Gmail which needed the SMTP fallback)
- Bug: forgot to add a second "Respond to Webhook" node on the escalation branch after adding logging — employee would get no reply at all after escalation. Caught before it became a real issue.
- Verified both branches fully end-to-end: in-scope question → correct answer + logged row; out-of-scope question → escalation email received + "forwarded to HR" reply + logged row
- **The entire core backend (both branches, retrieval, generation, escalation, logging) is now complete and tested.**
- Remaining: run the full 15-20 question test set, build the frontend page, final docs/README polish

## Bugs & Fixes Log

### Bug 1: Hugging Face embedding API — "connection cannot be established, incorrect host domain"
- **What happened:** HTTP Request node to `https://api-inference.huggingface.co/models/...` failed with a DNS-style connection error
- **Diagnosis process:** tested the same node against `https://api.github.com` first — that succeeded, proving Docker networking itself was fine and the issue was specific to the HF URL, not general connectivity
- **Root cause (found via web search):** Hugging Face fully deprecated `api-inference.huggingface.co` — it no longer resolves via DNS at all. They migrated everyone to a new "Inference Providers" router system with a different URL structure and a credit-based billing model (still has a free tier/monthly allowance).
- **Fix:** updated URL to `https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction`
- **Lesson:** API endpoints from any provider can change over time — always verify against current docs/community reports when a "should work" request fails, rather than assuming the mistake is on our side

### Bug 2: "Access to the file is not allowed" / "file or directory does not exist" writing to /home/node/.n8n
- **What happened:** Read/Write Files from Disk node couldn't write to any path under `/home/node/.n8n/`, even though that folder exists and is writable by the container user
- **Root cause (found via web search):** n8n has a deliberate default security setting, `N8N_BLOCK_FILE_ACCESS_TO_N8N_FILES=true`, which blocks file read/write access to the `.n8n` config directory specifically — because it contains credentials and the database. This is intentional (confirmed via a real n8n security advisory, CVE-2025-68697, which recommends this exact restriction as a safeguard).
- **Fix:** added a second, separate Docker volume (`n8n_files:/files`) dedicated to data files, plus `N8N_RESTRICT_FILE_ACCESS_TO=/files` to explicitly allow it. Updated the file path to `/files/policy_embeddings.json`.
- **Lesson:** security restrictions that look like bugs are sometimes intentional guardrails — worth understanding *why* something is blocked before working around it, not just finding any path that "works."
*(Nothing yet — fills up once we start building)*

## Quiz Results
*(Track scores/topics here as we go)*

## Reading List / Homework Assigned
*(Mentor recommendations logged here)*

## GPT Sync Log
*(Track which GPT update prompts were given after which phase)*
