const express = require('express');
const router = express.Router();
const Card = require('../models/Card');
const Deck = require('../models/Deck');
const { sm2 } = require('../utils/sm2');

// Helper: sync deck's cardCount
async function syncDeckCount(deckId) {
  const count = await Card.countDocuments({ deckId });
  await Deck.findByIdAndUpdate(deckId, { cardCount: count });
}

// GET all cards in a deck
router.get('/deck/:deckId', async (req, res) => {
  try {
    const cards = await Card.find({ deckId: req.params.deckId }).sort({ createdAt: -1 });
    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET cards due for review in a deck
router.get('/deck/:deckId/due', async (req, res) => {
  try {
    const now = new Date();
    const dueCards = await Card.find({
      deckId: req.params.deckId,
      nextReviewDate: { $lte: now },
    }).sort({ nextReviewDate: 1 });

    res.json(dueCards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single card
router.get('/:id', async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) return res.status(404).json({ error: 'Card not found' });
    res.json(card);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create card
router.post('/', async (req, res) => {
  try {
    const { deckId, front, back } = req.body;

    // Validate deck exists
    const deck = await Deck.findById(deckId);
    if (!deck) return res.status(404).json({ error: 'Deck not found' });

    const card = await Card.create({ deckId, front, back });
    await syncDeckCount(deckId);

    res.status(201).json(card);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT update card content
router.put('/:id', async (req, res) => {
  try {
    const { front, back } = req.body;
    const card = await Card.findByIdAndUpdate(
      req.params.id,
      { front, back },
      { new: true, runValidators: true }
    );
    if (!card) return res.status(404).json({ error: 'Card not found' });
    res.json(card);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

// DELETE card
router.delete('/:id', async (req, res) => {
  try {
    const card = await Card.findByIdAndDelete(req.params.id);
    if (!card) return res.status(404).json({ error: 'Card not found' });
    await syncDeckCount(card.deckId);
    res.json({ message: 'Card deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST review a card (spaced repetition)
// Body: { quality: 0-5 }
router.post('/:id/review', async (req, res) => {
  try {
    const { quality } = req.body;

    // Edge case: quality must be a number between 0 and 5
    if (quality === undefined || quality === null || isNaN(quality)) {
      return res.status(400).json({ error: 'quality must be a number 0–5' });
    }

    const card = await Card.findById(req.params.id);
    if (!card) return res.status(404).json({ error: 'Card not found' });

    const result = sm2(
      Number(quality),
      card.repetitions,
      card.easeFactor,
      card.interval
    );

    const updated = await Card.findByIdAndUpdate(
      req.params.id,
      {
        ...result,
        lastReviewedAt: new Date(),
        lastQuality: Number(quality),
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
