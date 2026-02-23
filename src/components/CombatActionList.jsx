import React, { useEffect, useState } from 'react';
import CombatAction from './CombatAction';
import './CombatActionList.css';

export default function CombatActionList({ modifiers = [], value, onChange }) {
  const [items, setItems] = useState([{ id: 0, nome: '', gittata: '', descrizione: '', localModsItems: [], diceList: [{ id: 0, name: '', text: '', result: '' }], collapsed: false }]);
  const [nextId, setNextId] = useState(1);
  const [dragId, setDragId] = useState(null);

  useEffect(() => {
    if (Array.isArray(value)) {
      const normalized = value.map((it, idx) => ({
        id: it.id ?? idx,
        nome: it.nome ?? '',
        gittata: it.gittata ?? '',
        descrizione: it.descrizione ?? '',
        localModsItems: it.localModsItems ?? [],
        diceList: it.diceList ?? [{ id: 0, name: '', text: '', result: '' }],
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
    const newItem = { id: nextId, nome: '', gittata: '', descrizione: '', localModsItems: [], diceList: [{ id: 0, name: '', text: '', result: '' }], collapsed: false };
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
  
  const toggleCollapsed = (id) => {
    pushChange(items.map((x) => (x.id === id ? { ...x, collapsed: !x.collapsed } : x)));
  };

  return (
    <div className="combat-action-list">
      <div className="list-header">
        <h3 className="list-title">Azioni da combattimento</h3>
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
      <button className="add-btn" title="Aggiungi" onClick={addItem} aria-label="Aggiungi azione">＋</button>
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
              aria-label={it.collapsed ? 'Espandi azione' : 'Comprimi azione'}
            >
              {it.collapsed ? '▸' : '▾'}
            </button>
            <button
              className="remove-btn"
              title="Rimuovi"
              onClick={() => removeItem(it.id)}
              aria-label="Rimuovi azione"
            >
              ✖
            </button>
            <CombatAction
              modifiers={modifiers}
              value={it}
              collapsed={it.collapsed}
              onChange={(v) => updateItem(it.id, v)}
            />
          </div>
        ))}
        {items.length === 0 && (
          <div className="list-empty">Nessuna azione. Aggiungine una.</div>
        )}
      </div>
    </div>
  );
}
