# Testing & QA — HR-Assist RAG

## 1. Testing Philosophy
Rather than eyeballing a few manual test questions, this project uses a **defined test set with measurable accuracy**, matching how real RAG systems are evaluated.

## 2. Test Set Structure

A set of 15-20 sample questions will be created, split into two categories:

| Category | Description | Expected outcome |
|---|---|---|
| **In-scope** | Questions clearly answerable from the policy document | Should be answered directly, correctly, with high confidence score |
| **Out-of-scope** | Questions not covered by the policy document (e.g., unrelated or oddly specific topics) | Should be escalated, not guessed at |

Example test set format (to be filled in once the policy doc content exists):

| # | Question | Category | Expected Outcome |
|---|---|---|---|
| 1 | How many sick days do I get per year? | In-scope | Answered |
| 2 | Can I work from home on Fridays? | In-scope | Answered |
| 3 | What's the process for international relocation? | Out-of-scope | Escalated |
| ... | ... | ... | ... |

## 3. Metrics Tracked

- **Answer accuracy:** % of in-scope questions correctly answered (matches expected policy content)
- **Escalation accuracy:** % of out-of-scope questions correctly escalated (not falsely answered)
- **False confidence rate:** % of out-of-scope questions incorrectly answered instead of escalated (most important failure mode to catch — a wrong HR answer is worse than an unnecessary escalation)
- **Response time:** average time from question submission to response

## 4. Target Thresholds
- ≥80% answer accuracy on in-scope questions
- ≥80% correct escalation on out-of-scope questions
- 0% unhandled errors (every request gets a graceful, logged response, even API failures)

## 5. Manual QA Checklist (before considering a phase "done")
- [ ] Webhook accepts a request and returns a response without error
- [ ] Embeddings are generated for both chunks and questions successfully
- [ ] Similarity scores are sensible (high for relevant matches, low for unrelated questions)
- [ ] Confidence threshold correctly routes to answer vs. escalation
- [ ] Escalation emails are actually received
- [ ] Every test run appears correctly in Google Sheets with all fields populated
- [ ] No API keys visible anywhere in the repo (manual scan of committed files)

## 6. Bug Tracking
All bugs encountered during testing are logged in the project diary (`project_diary.md`) under "Bugs & Fixes Log," including: what broke, why, and how it was fixed. This becomes part of the project's documented engineering story.
