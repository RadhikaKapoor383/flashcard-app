const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Deck = require('../models/Deck');
const Card = require('../models/Card');

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function pickDefined(values) {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined));
}

router.get('/', async (req, res) => {
  try {
    const decks = await Deck.find().sort({ createdAt: -1 });
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

router.get('/:id', async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid deck id' });
    }

    const deck = await Deck.findById(req.params.id);
    if (!deck) return res.status(404).json({ error: 'Deck not found' });
    res.json(deck);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, description, color } = req.body;
    const deck = await Deck.create(pickDefined({ name, description, color }));
    res.status(201).json(deck);
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
      return res.status(400).json({ error: 'Invalid deck id' });
    }

    const { name, description, color } = req.body;
    const deck = await Deck.findByIdAndUpdate(
      req.params.id,
      pickDefined({ name, description, color }),
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

router.delete('/:id', async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid deck id' });
    }

    const deck = await Deck.findByIdAndDelete(req.params.id);
    if (!deck) return res.status(404).json({ error: 'Deck not found' });

    await Card.deleteMany({ deckId: req.params.id });
    res.json({ message: 'Deck and all cards deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
