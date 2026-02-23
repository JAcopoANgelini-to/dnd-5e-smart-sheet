import React, { useEffect, useState } from 'react';
import { valutaConEspressione } from '../utils';
import './SimpleStat.css';

export default function SimpleStat({ value, modifiers = [], onChange }) {
  const [nome, setNome] = useState(value?.nome ?? '');
  const [espressione, setEspressione] = useState(value?.espressione ?? '');
  const [risultato, setRisultato] = useState(value?.risultato ?? '');

  useEffect(() => {
    if (value) {
      setNome(value.nome ?? '');
      setEspressione(value.espressione ?? '');
      setRisultato(value.risultato ?? '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.nome, value?.espressione, value?.risultato]);

  useEffect(() => {
    const expr = espressione.trim();
    if (!expr) {
      if (risultato !== '') {
        setRisultato('');
      }
      if (onChange && risultato !== '') onChange({ nome, espressione, risultato: '' });
      return;
    }
    const res = valutaConEspressione(modifiers, expr);
    if (res && res.errore) {
      if (risultato !== 'Errore') {
        setRisultato('Errore');
      }
      if (onChange && risultato !== '') onChange({ nome, espressione, risultato: '' });
      return;
    }
    if (typeof res?.totale !== 'undefined') {
      const tot = String(res.totale);
      if (risultato !== tot) {
        setRisultato(tot);
        if (onChange) onChange({ nome, espressione, risultato: tot });
      }
    } else {
      if (risultato !== '') {
        setRisultato('');
        if (onChange) onChange({ nome, espressione, risultato: '' });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [espressione, JSON.stringify(modifiers)]);

  return (
    <div className="simple-stat">
      <div className="stat-inputs">
        <input
          className="stat-input"
          type="text"
          value={nome}
          onChange={(e) => {
            setNome(e.target.value);
            if (onChange) onChange({ nome: e.target.value, espressione, risultato });
          }}
          placeholder="Nome"
        />
        <input
          className="stat-input"
          type="text"
          value={espressione}
          onChange={(e) => setEspressione(e.target.value)}
          placeholder="Espressione"
        />
      </div>
      <div className="stat-result" aria-live="polite">
        {risultato || '-'}
      </div>
    </div>
  );
}
