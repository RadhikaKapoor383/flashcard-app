const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const decksRouter = require('./routes/decks');
const cardsRouter = require('./routes/cards');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/flashcards';

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/decks', decksRouter);
app.use('/api/cards', cardsRouter);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Connect to MongoDB then start
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
