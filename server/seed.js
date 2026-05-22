const mongoose = require('mongoose');
require('dotenv').config();

const Deck = require('./models/Deck');
const Card = require('./models/Card');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/flashcards';

// Edit this section to keep only the exact decks and cards you want.
const seedDecks = [
  {
    name: 'JavaScript Basics',
    description: 'Core JavaScript questions',
    color: '#6366f1',
    cards: [
      {
        front: 'What is React?',
        back: 'React is a JavaScript library for building user interfaces.',
      },
      {
        front: 'What does const mean in JavaScript?',
        back: 'const declares a block-scoped variable that cannot be reassigned.',
      },
    ],
  },
];

async function seedDatabase() {
  await mongoose.connect(MONGO_URI);

  await Card.deleteMany({});
  await Deck.deleteMany({});

  for (const deckData of seedDecks) {
    const deck = await Deck.create({
      name: deckData.name,
      description: deckData.description,
      color: deckData.color,
      cardCount: deckData.cards.length,
    });

    const cards = deckData.cards.map(card => ({
      ...card,
      deckId: deck._id,
    }));

    await Card.insertMany(cards);
  }

  console.log(`Seeded ${seedDecks.length} deck(s).`);
  await mongoose.disconnect();
}

seedDatabase().catch(async (err) => {
  console.error('Seed failed:', err.message);
  await mongoose.disconnect();
  process.exit(1);
});
