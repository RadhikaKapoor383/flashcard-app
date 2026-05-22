# Recall — Flashcard App with Spaced Repetition

A full-stack MERN flashcard app where you can create decks, add cards, and study using the **SM-2 spaced repetition algorithm** — the same science behind Anki.

## Stack

- **Frontend**: React 18, React Router v6, Axios
- **Backend**: Node.js, Express
- **Database**: MongoDB + Mongoose
- **Algorithm**: SM-2 spaced repetition (custom implementation)

## Quick Start (fresh machine)

### Prerequisites
- Node.js ≥ 18
- MongoDB running locally (`mongod`) — or set `MONGO_URI` to a MongoDB Atlas URL

### 1. Install all dependencies

```bash
npm run install:all
```

### 2. Configure environment

```bash
cp server/.env.example server/.env
# Edit server/.env if needed (default: mongodb://127.0.0.1:27017/flashcards)
```

### 3. Run the app

```bash
npm run dev
```

This starts:
- **Server** on http://localhost:5000
- **Client** on http://localhost:3000

Open http://localhost:3000 in your browser.

## Features

- ✅ Create, edit, delete **decks** (with color coding)
- ✅ Create, edit, delete **flashcards** (front/back)
- ✅ **Spaced repetition review** using SM-2 algorithm
- ✅ Due-card tracking per deck (shown as badge on deck cards)
- ✅ Session stats (Again / Good / Easy breakdown)
- ✅ Persistent storage in MongoDB — data survives restarts

## Project Structure

```
flashcard-app/
├── server/
│   ├── index.js          # Express entry point
│   ├── models/
│   │   ├── Deck.js       # Deck schema
│   │   └── Card.js       # Card schema + SM-2 fields
│   ├── routes/
│   │   ├── decks.js      # CRUD for decks
│   │   └── cards.js      # CRUD + /review endpoint
│   └── utils/
│       └── sm2.js        # SM-2 algorithm
└── client/
    ├── public/index.html
    └── src/
        ├── App.js
        ├── api.js         # Axios API layer
        ├── hooks/useToast.js
        ├── pages/
        │   ├── DecksPage.js
        │   ├── DeckDetailPage.js
        │   └── ReviewPage.js
        └── components/
            ├── DeckModal.js
            ├── CardModal.js
            └── ConfirmModal.js
```
