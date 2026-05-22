import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Brain, Frown, PartyPopper, Rocket, Smile, Sparkles } from 'lucide-react';
import { getDeck, getDueCards, getCards, reviewCard } from '../api';
import { useToast } from '../hooks/useToast';

const RATINGS = [
  { quality: 0, label: 'Blackout', Icon: Brain, color: 'rating-0' },
  { quality: 1, label: 'Hard', Icon: Frown, color: 'rating-1' },
  { quality: 3, label: 'Good', Icon: Smile, color: 'rating-3' },
  { quality: 5, label: 'Easy', Icon: Rocket, color: 'rating-4' },
];

function formatNext(days) {
  if (days === 0) return 'again today';
  if (days === 1) return 'tomorrow';
  return `in ${days}d`;
}

export default function ReviewPage() {
  const { id } = useParams();
  const toast = useToast();

  const [deck, setDeck] = useState(null);
  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);
  const [stats, setStats] = useState({ again: 0, good: 0, easy: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const [deckData, dueCards] = await Promise.all([getDeck(id), getDueCards(id)]);
        setDeck(deckData);
        if (dueCards.length === 0) {
          const all = await getCards(id);
          setQueue(all);
        } else {
          setQueue(dueCards);
        }
      } catch {
        toast('Failed to load review', 'error');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [id]);

  const handleRate = async (quality) => {
    const card = queue[current];
    try {
      await reviewCard(card._id, quality);
      setStats(s => ({
        again: s.again + (quality < 3 ? 1 : 0),
        good:  s.good  + (quality === 3 ? 1 : 0),
        easy:  s.easy  + (quality >= 4 ? 1 : 0),
      }));

      if (current + 1 >= queue.length) {
        setDone(true);
      } else {
        setCurrent(c => c + 1);
        setFlipped(false);
      }
    } catch {
      toast('Failed to save review', 'error');
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  if (queue.length === 0) return (
    <div className="page-container">
      <div className="review-complete">
        <div className="review-complete-icon"><Sparkles size={64} strokeWidth={1.5} aria-hidden="true" /></div>
        <h2>No cards to review!</h2>
        <p>All caught up. Come back later.</p>
        <Link to={`/deck/${id}`} className="btn btn-primary btn-lg" style={{ marginTop: 24, display: 'inline-flex' }}>
          Back to Deck
        </Link>
      </div>
    </div>
  );

  if (done) return (
    <div className="page-container">
      <div className="review-container">
        <div className="review-complete">
          <div className="review-complete-icon"><PartyPopper size={64} strokeWidth={1.5} aria-hidden="true" /></div>
          <h2>Session Complete!</h2>
          <p>You reviewed {queue.length} card{queue.length !== 1 ? 's' : ''}</p>
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-value" style={{ color: 'var(--rose)' }}>{stats.again}</div>
              <div className="stat-label">Again</div>
            </div>
            <div className="stat-box">
              <div className="stat-value" style={{ color: 'var(--gold)' }}>{stats.good}</div>
              <div className="stat-label">Good</div>
            </div>
            <div className="stat-box">
              <div className="stat-value" style={{ color: 'var(--sage)' }}>{stats.easy}</div>
              <div className="stat-label">Easy</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-ghost btn-lg" onClick={() => { setCurrent(0); setFlipped(false); setDone(false); setStats({ again: 0, good: 0, easy: 0 }); }}>
              Review Again
            </button>
            <Link to={`/deck/${id}`} className="btn btn-primary btn-lg" style={{ display: 'inline-flex' }}>
              Back to Deck
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  const card = queue[current];
  const progress = (current / queue.length) * 100;

  return (
    <main className="page-container">
      <div className="page-content">
        <div className="review-container">
          <Link to={`/deck/${id}`} className="back-link">
            <ArrowLeft size={14} aria-hidden="true" />
            {deck?.name}
          </Link>

          <div className="review-progress">
            <span>{current + 1} / {queue.length}</span>
            <div className="review-progress-bar">
              <div className="review-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span style={{ color: 'var(--gold)' }}>
              {queue.length - current} left
            </span>
          </div>

          <div className="flashcard-flip-wrapper" onClick={() => setFlipped(f => !f)}>
            <div className={`flashcard-flip${flipped ? ' flipped' : ''}`}>
              <div className="flashcard-face">
                <div className="flashcard-label">Question</div>
                <div className="flashcard-text">{card.front}</div>
                {!flipped && <div className="flashcard-hint">Click to reveal answer</div>}
              </div>
              <div className="flashcard-face flashcard-face-back">
                <div className="flashcard-label">Answer</div>
                <div className="flashcard-text">{card.back}</div>
              </div>
            </div>
          </div>

          {flipped ? (
            <div>
              <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--cream-dim)', marginBottom: 12 }}>
                How well did you know this?
              </p>
              <div className="review-rating-grid">
                {RATINGS.map(({ Icon, ...r }) => (
                  <button
                    key={r.quality}
                    className={`rating-btn ${r.color}`}
                    onClick={() => handleRate(r.quality)}
                  >
                    <Icon size={22} aria-hidden="true" />
                    <span className="rating-btn-label">{r.label}</span>
                    <span className="rating-btn-next">
                      {r.quality < 3 ? formatNext(1) : r.quality === 3 ? formatNext(6) : formatNext(Math.max(1, card.interval || 1) * Math.round(card.easeFactor || 2.5))}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button className="btn btn-primary btn-lg" onClick={() => setFlipped(true)}>
                Show Answer
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
