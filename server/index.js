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

app.use('/api/decks', decksRouter);
app.use('/api/cards', cardsRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');

    const server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Set PORT in server/.env or stop the other process.`);
      } else {
        console.error('Server error:', err.message);
      }
      process.exit(1);
    });
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
