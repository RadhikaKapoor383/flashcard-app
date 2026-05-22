import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getDeck, getCards, getDueCards, createCard, updateCard, deleteCard } from '../api';
import { useToast } from '../hooks/useToast';
import CardModal from '../components/CardModal';
import ConfirmModal from '../components/ConfirmModal';

export default function DeckDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [deck, setDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [dueCount, setDueCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editCard, setEditCard] = useState(null);
  const [deletingCard, setDeletingCard] = useState(null);

  const load = async () => {
    try {
      const [deckData, cardsData, dueData] = await Promise.all([
        getDeck(id),
        getCards(id),
        getDueCards(id),
      ]);
      setDeck(deckData);
      setCards(cardsData);
      setDueCount(dueData.length);
    } catch {
      toast('Failed to load deck', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleAdd = async (form) => {
    try {
      await createCard({ ...form, deckId: id });
      toast('Card added!');
      setShowAdd(false);
      load();
    } catch {
      toast('Failed to add card', 'error');
    }
  };

  const handleEdit = async (form) => {
    try {
      await updateCard(editCard._id, form);
      toast('Card updated!');
      setEditCard(null);
      load();
    } catch {
      toast('Failed to update card', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCard(deletingCard._id);
      toast('Card deleted');
      setDeletingCard(null);
      load();
    } catch {
      toast('Failed to delete card', 'error');
    }
  };

  if (loading) return (
    <div className="loading-center"><div className="spinner" /></div>
  );

  if (!deck) return (
    <div className="page-container">
      <div className="empty-state">
        <div className="empty-state-icon">❌</div>
        <h3>Deck not found</h3>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>Go Home</Link>
      </div>
    </div>
  );

  return (
    <main className="page-container">
      <div className="page-content">
        <div className="page-header">
          <div className="page-header-left">
            <Link to="/" className="back-link">← All Decks</Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 14, height: 14, borderRadius: 4, background: deck.color, flexShrink: 0 }} />
              <h2 style={{ margin: 0 }}>{deck.name}</h2>
            </div>
            {deck.description && <p style={{ marginTop: 6 }}>{deck.description}</p>}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {dueCount > 0 && (
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/deck/${id}/review`)}
              >
                ⚡ Study Now ({dueCount} due)
              </button>
            )}
            {dueCount === 0 && cards.length > 0 && (
              <button
                className="btn btn-ghost"
                onClick={() => navigate(`/deck/${id}/review`)}
              >
                🔁 Review All
              </button>
            )}
            <button className="btn btn-ghost" onClick={() => setShowAdd(true)}>
              + Add Card
            </button>
          </div>
        </div>

        {/* Stats bar */}
        {cards.length > 0 && (
          <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
            <div className="card" style={{ padding: '12px 20px', flex: 'none' }}>
              <div style={{ fontSize: 22, fontFamily: 'var(--font-display)', color: 'var(--cream)' }}>{cards.length}</div>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--cream-dim)' }}>Total Cards</div>
            </div>
            <div className="card" style={{ padding: '12px 20px', flex: 'none' }}>
              <div style={{ fontSize: 22, fontFamily: 'var(--font-display)', color: 'var(--gold)' }}>{dueCount}</div>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--cream-dim)' }}>Due Today</div>
            </div>
            <div className="card" style={{ padding: '12px 20px', flex: 'none' }}>
              <div style={{ fontSize: 22, fontFamily: 'var(--font-display)', color: 'var(--sage)' }}>{cards.filter(c => c.repetitions > 0).length}</div>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--cream-dim)' }}>Learned</div>
            </div>
          </div>
        )}

        {cards.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🃏</div>
            <h3>No cards yet</h3>
            <p>Add your first card to start studying</p>
            <button className="btn btn-primary btn-lg" style={{ marginTop: 20 }} onClick={() => setShowAdd(true)}>
              Add First Card
            </button>
          </div>
        ) : (
          <div className="cards-list">
            {cards.map(card => (
              <div key={card._id} className="flash-card-item">
                <div className="flash-card-side">
                  <div className="flash-card-side-label">Front</div>
                  <div className="flash-card-side-text">{card.front}</div>
                </div>
                <div className="flash-card-divider" />
                <div className="flash-card-side">
                  <div className="flash-card-side-label">Back</div>
                  <div className="flash-card-side-text">{card.back}</div>
                </div>
                <div className="flash-card-actions">
                  {card.nextReviewDate && new Date(card.nextReviewDate) <= new Date() ? (
                    <span className="badge badge-due" style={{ fontSize: 10 }}>Due</span>
                  ) : card.repetitions > 0 ? (
                    <span className="badge badge-done" style={{ fontSize: 10 }}>✓</span>
                  ) : null}
                  <button className="btn btn-icon btn-sm" onClick={() => setEditCard(card)}>✎</button>
                  <button className="btn btn-icon btn-sm" onClick={() => setDeletingCard(card)}>🗑</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && (
        <CardModal title="Add Card" onSave={handleAdd} onClose={() => setShowAdd(false)} />
      )}
      {editCard && (
        <CardModal title="Edit Card" initial={editCard} onSave={handleEdit} onClose={() => setEditCard(null)} />
      )}
      {deletingCard && (
        <ConfirmModal
          message="Delete this card?"
          onConfirm={handleDelete}
          onClose={() => setDeletingCard(null)}
        />
      )}
    </main>
  );
}
