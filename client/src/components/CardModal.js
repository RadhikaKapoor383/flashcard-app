import React, { useState } from 'react';

export default function CardModal({ title, initial = {}, onSave, onClose }) {
  const [front, setFront] = useState(initial.front || '');
  const [back, setBack] = useState(initial.back || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!front.trim() || !back.trim()) return;
    setSaving(true);
    await onSave({ front: front.trim(), back: back.trim() });
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="btn btn-icon" onClick={onClose}>✕</button>
        </div>

        <div className="form-group">
          <label className="form-label">Front (Question)</label>
          <textarea
            className="form-textarea"
            placeholder="What is the question or term?"
            value={front}
            onChange={e => setFront(e.target.value)}
            autoFocus
            maxLength={1000}
            rows={3}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Back (Answer)</label>
          <textarea
            className="form-textarea"
            placeholder="What is the answer or definition?"
            value={back}
            onChange={e => setBack(e.target.value)}
            maxLength={1000}
            rows={3}
          />
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={!front.trim() || !back.trim() || saving}
          >
            {saving ? 'Saving…' : 'Save Card'}
          </button>
        </div>
      </div>
    </div>
  );
}
