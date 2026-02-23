import React, { useEffect, useState } from 'react';
import NoteBlock from './NoteBlock';
import './NoteBlockList.css';

export default function NoteBlockList({ value, onChange }) {
  const [items, setItems] = useState([{ id: 0, title: '', notes: '', collapsed: false }]);
  const [nextId, setNextId] = useState(1);
  const [dragId, setDragId] = useState(null);

  useEffect(() => {
    if (Array.isArray(value)) {
      const normalized = value.map((it, idx) => ({
        id: it.id ?? idx,
        title: it.title ?? '',
        notes: it.notes ?? '',
        collapsed: it.collapsed ?? false,
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
    const newItem = { id: nextId, title: '', notes: '', collapsed: false };
    pushChange([...items, newItem]);
    setNextId((n) => n + 1);
  };

  const removeItem = (id) => {
    pushChange(items.filter((x) => x.id !== id));
  };

  const updateItem = (id, patch) => {
    pushChange(items.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  };

  const toggleCollapsed = (id) => {
    pushChange(items.map((x) => (x.id === id ? { ...x, collapsed: !x.collapsed } : x)));
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
    <div className="note-block-list">
      <div className="list-header">
        <h3 className="list-title">Note</h3>
        <button
          className="toggle-all-btn"
          onClick={() => {
            const allCollapsed = items.length > 0 && items.every((x) => x.collapsed);
            const target = !allCollapsed ? true : false;
            pushChange(items.map((x) => ({ ...x, collapsed: target })));
          }}
          aria-label="Espandi/Comprimi tutte"
          title="Espandi/Comprimi tutte"
        >
          {(items.length > 0 && items.every((x) => x.collapsed)) ? 'Espandi tutte' : 'Comprimi tutte'}
        </button>
      </div>
      <button className="add-btn" title="Aggiungi" onClick={addItem} aria-label="Aggiungi nota">＋</button>
      <div className="list-body">
        {items.map((it) => (
          <div
            key={it.id}
            className="list-item"
            draggable
            onDragStart={() => onDragStart(it.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDropOn(it.id)}
          >
            <button
              className="collapse-btn"
              title={it.collapsed ? 'Espandi' : 'Comprimi'}
              onClick={() => toggleCollapsed(it.id)}
              aria-label={it.collapsed ? 'Espandi nota' : 'Comprimi nota'}
            >
              {it.collapsed ? '▸' : '▾'}
            </button>
            <button
              className="remove-btn"
              title="Rimuovi nota"
              onClick={() => removeItem(it.id)}
              aria-label="Rimuovi nota"
            >
              ✖
            </button>
            <NoteBlock
              value={{ title: it.title, notes: it.notes }}
              collapsed={it.collapsed}
              onChange={(v) => updateItem(it.id, v)}
            />
          </div>
        ))}
        {items.length === 0 && (
          <div className="list-empty">Nessuna nota. Aggiungine una.</div>
        )}
      </div>
    </div>
  );
}
