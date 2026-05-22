const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Card = require('../models/Card');
const Deck = require('../models/Deck');
const { sm2 } = require('../utils/sm2');

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function pickDefined(values) {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined));
}

async function syncDeckCount(deckId) {
  const count = await Card.countDocuments({ deckId });
  await Deck.findByIdAndUpdate(deckId, { cardCount: count });
}

router.get('/deck/:deckId', async (req, res) => {
  try {
    if (!isValidId(req.params.deckId)) {
      return res.status(400).json({ error: 'Invalid deck id' });
    }

    const cards = await Card.find({ deckId: req.params.deckId }).sort({ createdAt: -1 });
    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/deck/:deckId/due', async (req, res) => {
  try {
    if (!isValidId(req.params.deckId)) {
      return res.status(400).json({ error: 'Invalid deck id' });
    }

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

router.get('/:id', async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid card id' });
    }

    const card = await Card.findById(req.params.id);
    if (!card) return res.status(404).json({ error: 'Card not found' });
    res.json(card);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { deckId, front, back } = req.body;

    if (!isValidId(deckId)) {
      return res.status(400).json({ error: 'Invalid deck id' });
    }

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

router.put('/:id', async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid card id' });
    }

    const { front, back } = req.body;
    const card = await Card.findByIdAndUpdate(
      req.params.id,
      pickDefined({ front, back }),
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

router.delete('/:id', async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid card id' });
    }

    const card = await Card.findByIdAndDelete(req.params.id);
    if (!card) return res.status(404).json({ error: 'Card not found' });
    await syncDeckCount(card.deckId);
    res.json({ message: 'Card deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/review', async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid card id' });
    }

    const rating = Number(req.body.quality);
    if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
      return res.status(400).json({ error: 'quality must be a number from 0 to 5' });
    }

    const card = await Card.findById(req.params.id);
    if (!card) return res.status(404).json({ error: 'Card not found' });

    const result = sm2(rating, card.repetitions, card.easeFactor, card.interval);

    const updated = await Card.findByIdAndUpdate(
      req.params.id,
      {
        ...result,
        lastReviewedAt: new Date(),
        lastQuality: rating,
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
