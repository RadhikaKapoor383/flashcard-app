import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDecks, createDeck, updateDeck, deleteDeck } from '../api';
import { useToast } from '../hooks/useToast';
import DeckModal from '../components/DeckModal';
import ConfirmModal from '../components/ConfirmModal';

const COLORS = ['#6366f1','#d4a853','#7bb89a','#c97b7b','#7ba8c9','#9b7bc9','#e08a5a','#5a9e7a'];

export default function DecksPage() {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editDeck, setEditDeck] = useState(null);
  const [deletingDeck, setDeletingDeck] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();

  const load = async () => {
    try {
      const data = await getDecks();
      setDecks(data);
    } catch {
      toast('Failed to load decks', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (form) => {
    try {
      await createDeck(form);
      toast('Deck created!');
      setShowCreate(false);
      load();
    } catch {
      toast('Failed to create deck', 'error');
    }
  };

  const handleEdit = async (form) => {
    try {
      await updateDeck(editDeck._id, form);
      toast('Deck updated!');
      setEditDeck(null);
      load();
    } catch {
      toast('Failed to update deck', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDeck(deletingDeck._id);
      toast('Deck deleted');
      setDeletingDeck(null);
      load();
    } catch {
      toast('Failed to delete deck', 'error');
    }
  };

  if (loading) return (
    <div className="loading-center"><div className="spinner" /></div>
  );

  return (
    <main className="page-container">
      <div className="page-content">
        <div className="page-header">
          <div className="page-header-left">
            <h1>My Decks</h1>
            <p style={{ marginTop: 6 }}>
              {decks.length} deck{decks.length !== 1 ? 's' : ''} · spaced repetition
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            + New Deck
          </button>
        </div>

        {decks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📚</div>
            <h3>No decks yet</h3>
            <p>Create your first deck to start studying</p>
            <button className="btn btn-primary btn-lg" style={{ marginTop: 20 }} onClick={() => setShowCreate(true)}>
              Create a Deck
            </button>
          </div>
        ) : (
          <div className="deck-grid">
            {decks.map(deck => (
              <div
                key={deck._id}
                className="card card-hover deck-card"
                onClick={() => navigate(`/deck/${deck._id}`)}
              >
                <div className="deck-card-accent" style={{ background: deck.color || '#6366f1' }} />
                <div className="deck-card-body">
                  <div className="deck-card-name">{deck.name}</div>
                  <div className="deck-card-desc">{deck.description || 'No description'}</div>
                  <div className="deck-card-meta">
                    <div className="deck-card-count">
                      <span>🃏</span>
                      <span>{deck.cardCount} card{deck.cardCount !== 1 ? 's' : ''}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {deck.dueCount > 0 && (
                        <span className="badge badge-due">⏰ {deck.dueCount} due</span>
                      )}
                      {deck.dueCount === 0 && deck.cardCount > 0 && (
                        <span className="badge badge-done">✓ All done</span>
                      )}
                      <div className="deck-card-actions" onClick={e => e.stopPropagation()}>
                        <button className="btn-icon btn" title="Edit" onClick={() => setEditDeck(deck)}>✎</button>
                        <button className="btn-icon btn" title="Delete" onClick={() => setDeletingDeck(deck)}>🗑</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <DeckModal
          title="New Deck"
          colors={COLORS}
          onSave={handleCreate}
          onClose={() => setShowCreate(false)}
        />
      )}
      {editDeck && (
        <DeckModal
          title="Edit Deck"
          initial={editDeck}
          colors={COLORS}
          onSave={handleEdit}
          onClose={() => setEditDeck(null)}
        />
      )}
      {deletingDeck && (
        <ConfirmModal
          message={`Delete "${deletingDeck.name}" and all its cards?`}
          onConfirm={handleDelete}
          onClose={() => setDeletingDeck(null)}
        />
      )}
    </main>
  );
}
