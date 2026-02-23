import React, { useRef, useState } from 'react';
import './App.css';

import NoteBlockList from './components/NoteBlockList';
import SimpleStatList from './components/SimpleStatList';
import CombatActionList from './components/CombatActionList';

function App() {
  const [modificatori, setModificatori] = useState([]);
  const [notes, setNotes] = useState([{ id: 0, title: '', notes: '' }]);
  const [stats, setStats] = useState([{ id: 0, nome: '', espressione: '', risultato: '' }]);
  const [actions, setActions] = useState([{ id: 0, nome: '', gittata: '', descrizione: '', localModsItems: [], diceList: [{ id: 0, name: '', text: '', result: '' }] }]);
  const fileInputRef = useRef(null);

  const toolbarExport = () => {
    const data = { notes, stats, actions };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sheet-data.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const toolbarImport = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result);
        if (Array.isArray(json.notes)) setNotes(json.notes.map((it, idx) => ({ id: it.id ?? idx, title: it.title ?? '', notes: it.notes ?? '', collapsed: it.collapsed ?? false })));
        if (Array.isArray(json.stats)) setStats(json.stats.map((it, idx) => ({ id: it.id ?? idx, nome: it.nome ?? '', espressione: it.espressione ?? '', risultato: it.risultato ?? '' })));
        if (Array.isArray(json.actions)) setActions(json.actions.map((it, idx) => ({
          id: it.id ?? idx,
          nome: it.nome ?? '',
          gittata: it.gittata ?? '',
          descrizione: it.descrizione ?? '',
          localModsItems: it.localModsItems ?? [],
          diceList: it.diceList ?? [{ id: 0, name: '', text: '', result: '' }],
          collapsed: it.collapsed ?? false,
        })));
      } catch {
        /* noop */
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(f);
  };
  return (
    <div className="App">
      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: '#fff', padding: '10px 0', borderBottom: '1px solid #eee' }}>
        <div style={{ display: 'flex', gap: 12, padding: '0 8px' }}>
          <button onClick={toolbarExport}>Esporta JSON</button>
          <button onClick={() => fileInputRef.current?.click()}>Importa JSON</button>
          <input type="file" accept="application/json" ref={fileInputRef} onChange={toolbarImport} style={{ display: 'none' }} />
        </div>
      </div>
      <div className="flex-row">
        <div className="flex-child">
          <NoteBlockList value={notes} onChange={setNotes} />
          <SimpleStatList value={stats} onChangeItems={setStats} onChangeModifiers={setModificatori} />
        </div>
        <div className="flex-child">
          <CombatActionList modifiers={modificatori} value={actions} onChange={setActions} />
        </div>
      </div>
    </div>
  );
}

export default App;
