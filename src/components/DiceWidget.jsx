import React, { useState } from 'react';
import { valutaConEspressione } from '../utils';
import './DiceWidget.css';

export default function DiceWidget({ modifiers = [], value, onChange }) {
  const [name, setName] = useState(value?.name ?? '');
  const [text, setText] = useState(value?.text ?? '');
  const [result, setResult] = useState(value?.result ?? '');

  React.useEffect(() => {
    if (value) {
      setName(value.name ?? '');
      setText(value.text ?? '');
      setResult(value.result ?? '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.name, value?.text, value?.result]);

  const onRoll = () => {
    const expr = text.trim();
    if (!expr) return;
    const res = valutaConEspressione(modifiers, expr);
    if (res && res.errore) {
      const r = `Errore: ${res.errore}`;
      setResult(r);
      if (onChange) onChange({ name, text, result: r });
      return;
    }
    if (res && res.stringaRisultato) {
      const r = res.stringaRisultato;
      setResult(r);
      if (onChange) onChange({ name, text, result: r });
      return;
    }
    if (res && typeof res.totale !== 'undefined') {
      const r = `${expr} = ${res.totale}`;
      setResult(r);
      if (onChange) onChange({ name, text, result: r });
      return;
    }
    setResult('Nessun risultato');
    if (onChange) onChange({ name, text, result: 'Nessun risultato' });
  };

  return (
    <div className="dice-widget">
      <div className="dice-inputs">
        <input
          className="dice-name"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (onChange) onChange({ name: e.target.value, text, result });
          }}
          placeholder="Nome"
        />
        <input
          className="dice-input"
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (onChange) onChange({ name, text: e.target.value, result });
          }}
          placeholder="Espressione (es: 1d20+3)"
        />
      </div>
      <button className="dice-button" onClick={onRoll} title="Lancia">
        🎲
      </button>
      <div className="dice-result" aria-live="polite">
        {result || 'Risultato'}
      </div>
    </div>
  );
}
