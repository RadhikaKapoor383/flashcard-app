const express = require('express');
const router = express.Router();
const Deck = require('../models/Deck');
const Card = require('../models/Card');

// GET all decks
router.get('/', async (req, res) => {
  try {
    const decks = await Deck.find().sort({ createdAt: -1 });

    // Attach due card count to each deck
    const now = new Date();
    const decksWithDue = await Promise.all(
      decks.map(async (deck) => {
        const dueCount = await Card.countDocuments({
          deckId: deck._id,
          nextReviewDate: { $lte: now },
        });
        return { ...deck.toObject(), dueCount };
      })
    );

    res.json(decksWithDue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single deck
router.get('/:id', async (req, res) => {
  try {
    const deck = await Deck.findById(req.params.id);
    if (!deck) return res.status(404).json({ error: 'Deck not found' });
    res.json(deck);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create deck
router.post('/', async (req, res) => {
  try {
    const { name, description, color } = req.body;
    const deck = await Deck.create({ name, description, color });
    res.status(201).json(deck);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT update deck
router.put('/:id', async (req, res) => {
  try {
    const { name, description, color } = req.body;
    const deck = await Deck.findByIdAndUpdate(
      req.params.id,
      { name, description, color },
      { new: true, runValidators: true }
    );
    if (!deck) return res.status(404).json({ error: 'Deck not found' });
    res.json(deck);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

// DELETE deck and all its cards
router.delete('/:id', async (req, res) => {
  try {
    const deck = await Deck.findByIdAndDelete(req.params.id);
    if (!deck) return res.status(404).json({ error: 'Deck not found' });

    // Cascade delete all cards in this deck
    await Card.deleteMany({ deckId: req.params.id });

    res.json({ message: 'Deck and all cards deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
