# HR-Assist RAG — Workflow Notes

These are the core concept notes for the RAG workflow, step by step, written during the planning phase before any n8n building began.

---

**1. Employee asks a question**
This is just the input — a real person typing something like "How many WFH days do I get?" into a form, chat, or Slack message. Nothing technical happens here yet; it's just the trigger event that kicks off everything else.
> Note: Employee submits a question in plain language — this is the trigger for the whole workflow.

**2. Webhook receives the question**
A webhook is basically a public URL that "listens" for incoming data. When the employee submits their question, it gets sent as an HTTP request to this URL, and n8n wakes up and starts running our workflow with that question as the input.
> Note: Webhook = n8n's "front door" — it receives the question over the internet and starts the workflow.

**3. Convert question to an embedding**
We send the question's text to an embedding model (via Hugging Face's API). It returns a list of numbers (a vector) that represents the *meaning* of the sentence. This is necessary because computers can't compare "meaning" directly — they can only compare numbers.
> Note: Embedding = turning the question's meaning into a list of numbers so it can be mathematically compared.

**4. Search pre-built policy embeddings for the closest match (retrieval)**
We compare the question's embedding against all the pre-stored policy chunk embeddings, using cosine similarity (a way to measure "how close" two vectors are). Whichever chunk is mathematically closest is probably the most relevant piece of policy text.
> Note: Retrieval = comparing the question's numbers to our stored policy numbers, picking the closest match.

**4a. (One-time setup, done ahead of time) Chunk + embed the policy document**
Before any employee ever asks a question, we split our HR policy doc into smaller sections (chunks — e.g., one chunk per topic: leave, WFH, insurance) and run each chunk through the embedding model once, storing the results. This only needs to happen once (or whenever the policy doc changes) — not on every question.
> Note: One-time prep — break policy doc into chunks, embed each chunk, store the results for later comparison.

**5. Decision: Is the similarity score above our threshold?**
The similarity search gives us a number (e.g., 0.85 = very close match, 0.2 = not close at all). We pick a cutoff score — if the best match is above it, we trust it's genuinely relevant; if it's below, we assume our docs don't actually cover this question.
> Note: Decision point — a high similarity score means "we probably have the answer"; a low score means "we don't."

**6. Build a prompt with the matched policy text + question (if YES)**
We construct a message to send the LLM that includes both the retrieved policy text and the original question, with an instruction like "answer using only this context." This is what makes the LLM's answer *grounded* instead of made up.
> Note: Combine the matched policy text + the question into one prompt, instructing the LLM to answer only from that text.

**7. Send prompt to Groq LLM**
This is a straightforward API call — we send our constructed prompt to Groq's API (running Llama 3.1), the same way you'd call any AI API.
> Note: Send the prompt to Groq's LLM API to generate a response.

**8. Groq generates the answer**
The LLM reads the context we gave it and writes a natural-language answer using only that information (assuming our prompt instructions work correctly — to be tested).
> Note: The LLM writes an answer based only on the policy text we handed it, not from its own general knowledge.

**9. Build "escalate" email (if NO)**
If the similarity score was too low, instead of answering, we prepare a message to send to HR containing the employee's original question, so a human can address it.
> Note: If confidence is low, prepare an email containing the original question, instead of generating an answer.

**10. Send email to HR (Gmail node)**
n8n has a built-in Gmail node that can send an actual email — we use it to notify HR that a question needs their attention.
> Note: Use n8n's Gmail node to actually send the escalation email to the HR team.

**11. Log to Sheets: "ESCALATED"**
We record this interaction in Google Sheets, marking it clearly as an escalated (not directly answered) case.
> Note: Record the escalated question in Google Sheets, tagged as "escalated."

**12. Return answer / return escalation message to employee**
Whichever path was taken, the employee gets a response — either the actual answer, or a message like "Your question has been forwarded to HR."
> Note: Employee receives either the generated answer or a "forwarded to HR" confirmation.

**13. Log to Sheets (both paths reunite here)**
Regardless of which branch was taken, every interaction gets logged with the same structured fields: timestamp, question, matched chunk (if any), confidence score, answered-or-escalated, and response time. This is our data for measuring accuracy and spotting recurring questions later.
> Note: Every interaction — answered or escalated — gets logged with the same structured fields for tracking and analysis.

---

## Diagram (text form)

```
[1] Employee asks a question
        ↓
[2] Webhook receives the question (n8n's entry point)
        ↓
[3] Convert question to an embedding (turn text → numbers)
        ↓
[4] Search our pre-built policy embeddings for the closest match
    (this requires [4a] our policy doc to already be chunked +
     embedded ahead of time — a one-time setup step, separate box)
        ↓
[5] ◇ DECISION: Is the similarity score above our threshold?
        ↓                              ↓
     YES                              NO
        ↓                              ↓
[6] Build a prompt with the      [9] Build "escalate" email
    matched policy text +            with the question
    the employee's question          ↓
        ↓                        [10] Send email to HR (Gmail node)
[7] Send prompt to Groq LLM          ↓
        ↓                        [11] Log to Sheets: "ESCALATED"
[8] Groq generates the answer        ↓
        ↓                            ↓
[12] Return answer to employee   [12] Return "forwarded to HR" message
        ↓                            ↓
        └──────────→ [13] Log to Sheets: question, matched chunk,
                          confidence score, answered/escalated, timestamp
```

---

## Glossary — Key Concepts

**RAG (Retrieval-Augmented Generation)**
Instead of asking an LLM to answer purely from its training memory (closed-book), we first retrieve relevant text from our own documents and hand it to the LLM alongside the question (open-book). This grounds the answer in real, specific data instead of the model's general knowledge.

**Embedding**
A list of numbers (a vector) representing the *meaning* of a piece of text. Text with similar meaning produces numbers that are mathematically close together, even if the wording is completely different.

**Chunking**
Splitting a large document into smaller, meaningful sections (e.g., one chunk per policy topic) before embedding, so retrieval can pull back a focused, relevant piece of text instead of an entire document.

**Similarity search / Cosine similarity**
The method used to measure how "close" two embeddings are to each other mathematically. A high similarity score means the texts likely mean similar things; a low score means they're likely unrelated.

**Retrieval**
The step of comparing a question's embedding against all stored policy chunk embeddings, and pulling back the closest match(es).

**Confidence threshold**
A chosen cutoff similarity score that decides whether we trust the retrieved match enough to answer directly, or whether we escalate instead of risking a wrong/guessed answer.

**Prompt construction / context injection**
Building the message sent to the LLM so it includes both the retrieved policy text and the original question, with explicit instructions to answer only from that provided text.

**Escalation**
The fallback path taken when confidence is too low — instead of generating a possibly-wrong answer, the question is forwarded to a real HR person (via email), and logged as escalated.

**Structured logging**
Recording every interaction (answered or escalated) with consistent fields — timestamp, question, matched chunk, confidence score, outcome, response time — so the data can be reviewed and analyzed later.

**Webhook**
A public URL n8n exposes to "listen" for incoming data; when something is sent to it (like an employee's question), it triggers the workflow to run.

---

## Concept Check — Quiz Recap (Day 1)
Score: 4/5 (80%) on first attempt, 5/5 after review.

| # | Question | Key takeaway |
|---|---|---|
| 1 | Why not ask the LLM directly? | It has never seen our private docs — would guess/hallucinate without retrieval |
| 2 | What is an embedding? | A list of numbers representing text meaning, enabling mathematical comparison |
| 3 | When is the policy doc chunked + embedded? | **Once, ahead of time**, as a setup step — not re-done per question (missed on first attempt, corrected on review) |
| 4 | What decides answer-vs-escalate? | Similarity score vs. a chosen confidence threshold |
| 5 | When does logging happen? | On both paths — answered AND escalated — both branches reunite into the same logging step |

**Reinforced understanding (in own words):** the policy document only needs to be chunked and embedded one time, upfront, as a setup step — re-embedding it on every single employee question would be wasteful and pointless since the document itself isn't changing per question.

