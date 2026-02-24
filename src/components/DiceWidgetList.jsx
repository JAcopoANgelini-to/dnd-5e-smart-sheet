import React, { useEffect, useState } from 'react';
import DiceWidget from './DiceWidget';
import './DiceWidgetList.css';

export default function DiceWidgetList({ modifiers = [], value, onChange }) {
  const [items, setItems] = useState([{ id: 0, name: '', text: '', result: '' }]);
  const [nextId, setNextId] = useState(1);
  const [dragId, setDragId] = useState(null);

  useEffect(() => {
    if (Array.isArray(value)) {
      const normalized = value.map((it, idx) => ({
        id: it.id ?? idx,
        name: it.name ?? '',
        text: it.text ?? '',
        result: it.result ?? '',
      }));
      setItems(normalized);
      const maxId = normalized.reduce((m, it) => Math.max(m, it.id), -1);
      setNextId(maxId + 1);
    }
  }, [value]);

  const pushChange = (arr) => {
    setItems(arr);
    if (onChange) onChange(arr);
  };

  const addItem = () => {
    const newItem = { id: nextId, name: '', text: '', result: '' };
    pushChange([...items, newItem]);
    setNextId((n) => n + 1);
  };

  const removeItem = (id) => {
    pushChange(items.filter((x) => x.id !== id));
  };

  const updateItem = (id, patch) => {
    pushChange(items.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  };

  const onDragStart = (id) => setDragId(id);
  const onDropOn = (targetId) => {
    if (dragId == null || dragId === targetId) return;
    const fromIndex = items.findIndex((x) => x.id === dragId);
    const toIndex = items.findIndex((x) => x.id === targetId);
    if (fromIndex === -1 || toIndex === -1) return;
    const next = items.slice();
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setDragId(null);
    pushChange(next);
  };

  return (
    <div className="dice-widget-list">
      <div className="dwl-header">
        <h4 className="dwl-title">Tiri azione</h4>
      </div>
      <button className="dwl-add-btn" title="Aggiungi" onClick={addItem} aria-label="Aggiungi tiro">＋</button>
      <div className="dwl-body">
        {items.map((it) => (
          <div
            key={it.id}
            className="dwl-item"
            draggable
            onDragStart={() => onDragStart(it.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDropOn(it.id)}
          >
            <button
              className="dwl-remove-btn"
              title="Rimuovi tiro"
              onClick={() => removeItem(it.id)}
              aria-label="Rimuovi tiro"
            >
              ✖
            </button>
            <DiceWidget
              modifiers={modifiers}
              value={it}
              onChange={(v) => updateItem(it.id, v)}
            />
          </div>
        ))}
        {items.length === 0 && (
          <div className="dwl-empty">Nessun tiro. Aggiungine uno.</div>
        )}
      </div>
    </div>
  );
}
