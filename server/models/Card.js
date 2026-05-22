const mongoose = require('mongoose');

// SM-2 spaced repetition algorithm fields
const cardSchema = new mongoose.Schema(
  {
    deckId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Deck',
      required: [true, 'Deck ID is required'],
    },
    front: {
      type: String,
      required: [true, 'Card front is required'],
      trim: true,
      maxlength: [1000, 'Front cannot exceed 1000 characters'],
    },
    back: {
      type: String,
      required: [true, 'Card back is required'],
      trim: true,
      maxlength: [1000, 'Back cannot exceed 1000 characters'],
    },
    // SM-2 spaced repetition fields
    easeFactor: {
      type: Number,
      default: 2.5,     // Starting ease factor
      min: 1.3,
    },
    interval: {
      type: Number,
      default: 0,       // Days until next review (0 = new card)
    },
    repetitions: {
      type: Number,
      default: 0,       // How many times reviewed successfully
    },
    nextReviewDate: {
      type: Date,
      default: Date.now, // Due immediately for new cards
    },
    lastReviewedAt: {
      type: Date,
      default: null,
    },
    // Quality rating from last review (0-5)
    lastQuality: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for efficient "due cards" queries
cardSchema.index({ deckId: 1, nextReviewDate: 1 });

// Virtual: is this card due for review?
cardSchema.virtual('isDue').get(function () {
  return this.nextReviewDate <= new Date();
});

module.exports = mongoose.model('Card', cardSchema);
