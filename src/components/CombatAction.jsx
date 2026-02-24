import React, { useMemo, useState } from 'react';
import DiceWidgetList from './DiceWidgetList';
import SimpleStatList from './SimpleStatList';
import './CombatAction.css';

export default function CombatAction({ modifiers = [], value, onChange, collapsed = false }) {
  const v = value ?? { nome: '', gittata: '', descrizione: '', localModsItems: [], diceList: [{ id: 0, name: '', text: '', result: '' }] };
  const [localMods, setLocalMods] = useState([]);
  const combinedMods = useMemo(() => [...modifiers, ...localMods], [modifiers, localMods]);

  if (collapsed) {
    return (
      <div className="combat-action collapsed">
        <div className="action-collapsed-name">{v.nome || '-'}</div>
      </div>
    );
  }

  return (
    <div className="combat-action">
      <div className="action-left">
        <div className="action-fields">
          <label className="field">
            <span className="field-label">Nome</span>
            <input
              className="field-input"
              type="text"
              value={v.nome}
              onChange={(e) => onChange?.({ ...v, nome: e.target.value })}
              placeholder="Nome"
            />
          </label>
          <label className="field">
            <span className="field-label">Gittata</span>
            <input
              className="field-input"
              type="text"
              value={v.gittata}
              onChange={(e) => onChange?.({ ...v, gittata: e.target.value })}
              placeholder="Gittata"
            />
          </label>
          <label className="field">
            <span className="field-label">Descrizione</span>
            <textarea
              className="field-textarea"
              value={v.descrizione}
              onChange={(e) => onChange?.({ ...v, descrizione: e.target.value })}
              placeholder="Descrizione"
              rows={3}
            />
          </label>
        </div>
        <div className="action-mods">
          <div className="mods-title">Modificatori locali</div>
          <SimpleStatList
            value={v.localModsItems}
            onChangeModifiers={setLocalMods}
            onChangeItems={(arr) => onChange?.({ ...v, localModsItems: arr })}
          />
        </div>
      </div>
      <div className="action-dice">
        <DiceWidgetList
          modifiers={combinedMods}
          value={v.diceList}
          onChange={(arr) => onChange?.({ ...v, diceList: arr })}
        />
      </div>
    </div>
  );
}
