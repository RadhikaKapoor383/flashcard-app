import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function DeckModal({ title, initial = {}, colors, onSave, onClose }) {
  const [name, setName] = useState(initial.name || '');
  const [description, setDescription] = useState(initial.description || '');
  const [color, setColor] = useState(initial.color || colors[0]);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await onSave({ name: name.trim(), description: description.trim(), color });
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="btn btn-icon" aria-label="Close" onClick={onClose}>
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="form-group">
          <label className="form-label">Name</label>
          <input
            className="form-input"
            placeholder="e.g. Spanish Vocabulary"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
            maxLength={100}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-textarea"
            placeholder="Optional description..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            maxLength={300}
            rows={2}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Color</label>
          <div className="color-swatches">
            {colors.map(c => (
              <button
                key={c}
                className={`color-swatch${color === c ? ' selected' : ''}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
                title={c}
              />
            ))}
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={!name.trim() || saving}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
