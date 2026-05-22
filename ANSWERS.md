# ANSWERS.md

## 1. How to run

**Prerequisites:**
- Node.js ≥ 18 ([https://nodejs.org](https://nodejs.org))
- MongoDB running locally — start it with `mongod` in a terminal, OR use a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster and paste the URI into `server/.env`

**Steps on a fresh machine:**

```bash
# 1. Clone / unzip the project, then:
npm run install:all

# 2. Set up environment
cp server/.env.example server/.env
# Edit server/.env if you want to use MongoDB Atlas instead of local

# 3. Start both server and client
npm run dev
```

Open **http://localhost:3000** in your browser.

- Server runs on http://localhost:5000
- Client proxies `/api` requests to the server automatically

---

## 2. Stack choice

**Chosen stack:** React + Node/Express + MongoDB (MERN)

**Why:**
- React's component model maps cleanly to the UI — deck grid, card list, review flow are all naturally isolated components with their own state.
- Express is minimal and fast to set up for a REST API with a few routes; no boilerplate overhead.
- MongoDB/Mongoose fits well because flashcard data is document-shaped — each card carries its own SM-2 state (easeFactor, interval, repetitions, nextReviewDate) without needing joins.
- The whole stack is JavaScript end-to-end, meaning no context switching between languages.

**Worse choice:** A relational DB like PostgreSQL with an ORM like Sequelize would work, but it adds migration overhead for what is essentially a self-contained document per card. A framework like Next.js would be overkill — this is a simple SPA with a local API, not a content site needing SSR.

---

## 3. One real edge case

**File:** `server/routes/cards.js`, lines 85–90 (the `/review` endpoint)

**Edge case:** A client submits a review with `quality` as `undefined`, `null`, or a non-numeric string (e.g. a malformed request body).

**Code:**
```js
if (quality === undefined || quality === null || isNaN(quality)) {
  return res.status(400).json({ error: 'quality must be a number 0–5' });
}
```

**Without this:** `isNaN(undefined)` is `true` and `Number(undefined)` is `NaN`. The SM-2 algorithm would receive `NaN` as the quality score, causing all arithmetic to produce `NaN`. The card would be saved with `easeFactor: NaN`, `interval: NaN`, and `nextReviewDate: Invalid Date` — permanently breaking that card's spaced repetition schedule with no error surfaced to the user.

---

## 4. AI usage

| Where | Tool | What I asked | What it gave |
|---|---|---|---|
| SM-2 algorithm | Claude | "Implement the SM-2 spaced repetition algorithm in JavaScript" | Full implementation including ease factor update formula |
| Server structure | Claude | "Build an Express + Mongoose REST API for flashcard decks and cards" | Models, routes, index.js with MongoDB connection |
| React UI | Claude | "Build React pages for a flashcard app: deck list, deck detail, review mode with flip animation" | Full component tree with CSS variables design system |
| Review page ratings | Claude | "Show next-review interval on each rating button based on current card state" | The `formatNext()` helper and dynamic interval display in `ReviewPage.js` |

**One thing I changed:** In the SM-2 implementation Claude initially set the minimum ease factor floor at `1.3` but didn't clamp the input quality value. I added explicit clamping (`if (quality < 0) quality = 0; if (quality > 5) quality = 5;`) at the top of the function because API callers could pass out-of-range values, and the formula breaks down outside [0, 5] — the ease factor update term becomes very large or negative.

---

## 5. Honest gap

**What isn't good enough:** The review queue is built once when the page loads and never reorders during a session. In Anki and proper SM-2 implementations, cards rated "Again" (quality < 3) are re-inserted into the queue later in the same session — you keep seeing them until they stick. Currently, a card rated "Blackout" just moves on and won't reappear until the next day.

**What I'd do with another day:** After a failed review, push the card back into the queue at a random position (e.g. 3–5 cards ahead) and mark it with a `requeue: true` flag so it can be distinguished from a fresh due card. Cap re-queues at 2–3 times per session to avoid infinite loops. This is the most meaningful UX gap between this app and a real spaced repetition tool.
