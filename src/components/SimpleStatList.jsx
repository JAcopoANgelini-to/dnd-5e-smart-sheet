import React, { useEffect, useState } from 'react';
import SimpleStat from './SimpleStat';
import './SimpleStatList.css';

export default function SimpleStatList({ value, onChangeItems, onChangeModifiers }) {
  const [items, setItems] = useState([{ id: 0, nome: '', espressione: '', risultato: '' }]);
  const [nextId, setNextId] = useState(1);
  const [dragId, setDragId] = useState(null);

  useEffect(() => {
    if (Array.isArray(value)) {
      const normalized = value.map((it, idx) => ({
        id: it.id ?? idx,
        nome: it.nome ?? '',
        espressione: it.espressione ?? '',
        risultato: it.risultato ?? '',
      }));
      const same =
        normalized.length === items.length &&
        normalized.every((nv, i) => {
          const ov = items[i];
          return (
            ov &&
            ov.id === nv.id &&
            ov.nome === nv.nome &&
            ov.espressione === nv.espressione &&
            ov.risultato === nv.risultato
          );
        });
      if (!same) {
        setItems(normalized);
      }
      const maxId = normalized.reduce((m, it) => Math.max(m, it.id), -1);
      const targetNext = maxId + 1;
      if (targetNext !== nextId) {
        setNextId(targetNext);
      }
    }
  }, [value, items, nextId]);

  const addItem = () => {
    const updated = [...items, { id: nextId, nome: '', espressione: '', risultato: '' }];
    setItems(updated);
    if (onChangeItems) onChangeItems(updated);
    setNextId((n) => n + 1);
  };

  const removeItem = (id) => {
    const updated = items.filter((x) => x.id !== id);
    setItems(updated);
    if (onChangeItems) onChangeItems(updated);
  };

  useEffect(() => {
    if (onChangeModifiers) {
      const mods = items
        .filter((it) => it.nome && it.risultato !== '')
        .map((it) => ({ nome: it.nome, valore: Number(it.risultato) || 0 }));
      onChangeModifiers(mods);
    }
  }, [items, onChangeModifiers]);

  const updateItem = (id, updated) => {
    const next = items.map((it) => (it.id === id ? { ...it, ...updated } : it));
    setItems(next);
    if (onChangeItems) onChangeItems(next);
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
    setItems(next);
    if (onChangeItems) onChangeItems(next);
    setDragId(null);
  };

  return (
    <div className="simple-stat-list">
      <div className="list-header">
        <h3 className="list-title">Statistiche</h3>
      </div>
      <button className="add-btn" title="Aggiungi" onClick={addItem} aria-label="Aggiungi statistica">＋</button>
      <div className="list-body">
        {items.map((it) => {
          const otherMods = items
            .filter((x) => x.id !== it.id && x.nome && x.risultato !== '')
            .map((x) => ({ nome: x.nome, valore: Number(x.risultato) || 0 }));
          return (
          <div
            key={it.id}
            className="list-item"
            draggable
            onDragStart={() => onDragStart(it.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDropOn(it.id)}
          >
            <button
              className="remove-btn"
              title="Rimuovi"
              onClick={() => removeItem(it.id)}
              aria-label="Rimuovi statistica"
            >
              ✖
            </button>
            <SimpleStat
              value={it}
              modifiers={otherMods}
              onChange={(v) => updateItem(it.id, v)}
            />
          </div>
          );
        })}
        {items.length === 0 && (
          <div className="list-empty">Nessuna statistica. Aggiungine una.</div>
        )}
      </div>
    </div>
  );
}
