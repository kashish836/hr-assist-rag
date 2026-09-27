# Testing & QA — HR-Assist RAG

## 1. Testing Philosophy
A defined test set with measurable accuracy was used, rather than ad-hoc manual testing — matching how real RAG systems are evaluated.

## 2. Test Set & Results

15 questions were run against the live production workflow: 10 in-scope (answerable from policy docs), 5 out-of-scope (should escalate).

| # | Question | Category | Expected | Actual Outcome | Correct? |
|---|---|---|---|---|---|
| 1 | How many sick days do I get? | In-scope | Answered | Answered correctly | ✅ |
| 2 | How many total leave days per year? | In-scope | Answered | Answered correctly | ✅ |
| 3 | Can I work from home whenever I want? | In-scope | Answered | Answered correctly (correctly said no, conditional) | ✅ |
| 4 | What if I need WFH for a family reason? | In-scope | Answered | Answered correctly | ✅ |
| 5 | Do I get travel reimbursement for personal trips? | In-scope | Answered | Answered correctly (correctly said no) | ✅ |
| 6 | Are company-related travel costs covered? | In-scope | Answered | Answered correctly | ✅ |
| 7 | What happens to my insurance if I leave the company? | In-scope | Answered | Answered correctly | ✅ |
| 8 | When is health insurance signed up for? | In-scope | Answered | Answered correctly | ✅ |
| 9 | How much notice do I need to give before resigning? | In-scope | Answered | Answered correctly | ✅ |
| 10 | Can I resign after 2 months of joining? | In-scope | Answered | Answered correctly (correctly said no) | ✅ |
| 11 | What is the office WiFi password? | Out-of-scope | Escalated | Escalated correctly | ✅ |
| 12 | Can I get a company laptop? | Out-of-scope | Escalated | Escalated correctly | ✅ |
| 13 | What is the dress code policy? | Out-of-scope | Escalated | Escalated correctly | ✅ |
| 14 | How do I book a conference room? | Out-of-scope | Escalated | Escalated correctly | ✅ |
| 15 | What's the parking policy? | Out-of-scope | Escalated | Escalated correctly | ✅ |

**Final result: 15/15 (100%) accuracy** — well above the ≥80% target set in the PRD.

## 3. Confidence Score Observations

Real similarity scores from testing showed a clear separation:
- **Correct matches:** ranged ~0.35–0.75
- **Incorrect/unrelated chunks:** ranged ~-0.001–0.25

This gap validated the chosen **0.35 confidence threshold** — comfortably below real matches, comfortably above noise.

## 4. Bugs Found During Testing (see project_diary.md for full detail)

- Hugging Face's old embedding API endpoint was fully deprecated mid-project
- n8n's default behavior stops an entire execution on any node failure, even on a separate branch — a stale Sheets credential was silently blocking employee responses
- Google Sheets and Gmail OAuth credentials both went stale/broken at different points; handled differently (Sheets: fixed properly with a fresh OAuth client; Gmail: worked around with SMTP)
- Two separate instances of a JSON-templating bug, where AI-generated text containing quotes or line breaks broke raw string substitution in JSON bodies — fixed with n8n's Expression mode using real object syntax
- Groq deprecated/restricted model access twice during the project; resolved by querying the account's actual available models directly via Groq's API rather than trusting external documentation

## 5. Manual QA Checklist — Final Status

- [x] Webhook accepts a request and returns a response without error
- [x] Embeddings generated successfully for both chunks and live questions
- [x] Similarity scores are sensible (clear separation between correct/incorrect matches)
- [x] Confidence threshold correctly routes to answer vs. escalation
- [x] Escalation emails are actually received, including employee identity
- [x] Every test run appears correctly in Google Sheets with all fields populated, including employee identity
- [x] No API keys visible anywhere in the committed repo

## 6. Bug Tracking

All bugs encountered during development and testing are logged in `project_diary.md` under "Bugs & Fixes Log," including root cause analysis and resolution for each — this is the most detailed record of the project's actual engineering process.
