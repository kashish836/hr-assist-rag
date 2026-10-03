### Day 7 — Frontend rebuild, failed public-hosting attempt, final deployment decision

**Frontend rebuilt from two pages into one file.**
The original `index.html` + `chat.html` + `style.css` + `theme.js` setup broke in practice — opening the pages outside the original folder structure (or a slightly renamed file) caused the CSS to silently fail to load, with no visible error. Rebuilt as a single self-contained file, `frontend/hr-assist.html`: landing view and chat view in one HTML file, toggled client-side with JavaScript, no external CSS/JS dependencies at all. Removes the whole class of cross-file linking failures.

**Visual redesign: blue/black glass UI.**
Replaced the original teal/amber light-and-dark theme with a frosted-glass design — translucent cards, blurred background glow, rounded corners, pill buttons — restricted to blue and near-black only (no green, no amber/orange). Message states (answered vs. escalated) are now distinguished by two shades of blue instead of color category; red is reserved for actual connection errors.

**Attempted public hosting of n8n itself — reverted.**
Goal: get a fully public live demo (not dependent on a local machine being on) for a LinkedIn post. Tried deploying n8n to Render's free Web Service tier, using Supabase's free Postgres as persistent storage (Render's free tier has no persistent disk). Hit a `JavaScript heap out of memory` crash on boot — Render's free tier caps instances at 512MB RAM, not enough for n8n's default memory footprint. Partial fix: `NODE_OPTIONS=--max-old-space-size=460` to cap Node's heap and fit inside the container. Got past the crash, but re-entering every credential (Groq, Hugging Face, SMTP, Google Sheets OAuth — the last requiring a new redirect URI per domain) into a brand-new n8n instance, with no certainty the free tier would hold up under real use anyway, wasn't worth the remaining time for a portfolio demo.

**Decision:** abandoned the public-backend route. Reverted to local-only n8n hosting, matching the project's original documented scope. `frontend/hr-assist.html` is deployed to Vercel as a **static page only** — it calls `http://localhost:5678` directly, so the landing page works for any visitor but the chat only responds when the person viewing it has their own n8n running locally. This is an explicit, documented tradeoff, not an oversight — see Architecture.md §6 for the full reasoning.

**Old frontend files removed from the repo:** `index.html`, `chat.html`, `style.css`, `theme.js`, and an abandoned `api/ask.js` Vercel proxy (built during the brief period when public hosting still seemed viable) were all deleted. `frontend/` now contains only `hr-assist.html`.

**Docs updated to match:** README, PRD, TRD, Architecture, Feature List, API-Integration, and Testing-QA all updated in this session to reflect the single-file frontend, the new visual design, and the Render/Supabase attempt-and-revert, so the written record matches what's actually in the repo.

**Next:** push to GitHub, confirm the Vercel deployment points at the new `hr-assist.html`, take final screenshots (landing, answered question, escalated question, n8n workflow canvas, Google Sheet log, escalation email), and post to LinkedIn.
