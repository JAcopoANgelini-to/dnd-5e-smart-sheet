import React, { useRef } from 'react';
import './AllStatsAndRoll.css';
import { valutaConEspressione } from '../utils';

const contieneNome = (espressione, nome) => {
  if (!nome) return false;
  const regex = new RegExp(`\\b${nome}\\b`);
  return regex.test(espressione);
};

const AllStatsAndRoll = ({ righe, setRighe }) => {
  const updatingRef = useRef(false);

  const aggiungiRiga = () => {
    setRighe([...righe, { nome: '', espressione: '', risultato: null }]);
  };

  const calcolaRisultato = (righeArr, index) => {
    const riga = righeArr[index];
    if (!riga.espressione) {
      righeArr[index] = { ...riga, risultato: null };
      return;
    }
    const modificatori = righeArr
      .filter(r => r.nome)
      .map(r => ({
        nome: r.nome,
        valore: Number(r.risultato?.totale ?? r.risultato) || 0,
      }));

    try {
      const risultato = valutaConEspressione(modificatori, riga.espressione);
      righeArr[index] = { ...riga, risultato };
    } catch {
      righeArr[index] = { ...riga, risultato: { totale: 0, stringaRisultato: 'Errore' } };
    }
  };

  const ricalcolaDipendenti = (righeArr, index, nomeModificato, visitati = new Set()) => {
    if (visitati.has(index)) return;
    visitati.add(index);

    calcolaRisultato(righeArr, index);

    righeArr.forEach((riga, i) => {
      if (i !== index && riga.espressione && contieneNome(riga.espressione, nomeModificato)) {
        ricalcolaDipendenti(righeArr, i, righeArr[i].nome, visitati);
      }
    });
  };

  const aggiornaCampo = (index, campo, valore) => {
    if (updatingRef.current) return;
    updatingRef.current = true;

    const nuoveRighe = [...righe];
    nuoveRighe[index] = { ...nuoveRighe[index], [campo]: valore };

    const nomeModificato = nuoveRighe[index].nome;

    ricalcolaDipendenti(nuoveRighe, index, nomeModificato);

    setRighe(nuoveRighe);
    updatingRef.current = false;
  };

  const eliminaRiga = (index) => {
    if (updatingRef.current) return;
    updatingRef.current = true;

    const nuoveRighe = righe.filter((_, i) => i !== index);

    for (let i = 0; i < nuoveRighe.length; i++) {
      calcolaRisultato(nuoveRighe, i);
    }

    setRighe(nuoveRighe);
    updatingRef.current = false;
  };

  const calcolaRisultatoSingolo = (index) => {
    if (updatingRef.current) return;
    updatingRef.current = true;

    const nuoveRighe = [...righe];
    calcolaRisultato(nuoveRighe, index);

    setRighe(nuoveRighe);
    updatingRef.current = false;
  };

  return (
    <div className="allStatsAndRoll">
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Espressione</th>
            <th>Dettagli</th>
            <th>Risultato</th>
            <th>Tira</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {righe.map((riga, index) => (
            <tr key={index}>
              <td>
                <textarea
                  value={riga.nome}
                  onChange={(e) => aggiornaCampo(index, 'nome', e.target.value)}
                />
              </td>
              <td>
                <textarea
                  value={riga.espressione}
                  onChange={(e) => aggiornaCampo(index, 'espressione', e.target.value)}
                />
              </td>
              <td style={{ whiteSpace: 'pre-wrap' }}>
                {riga.risultato?.stringaRisultato || ''}
              </td>
              <td>{riga.risultato?.totale ?? ''}</td>
              <td>
                <button onClick={() => calcolaRisultatoSingolo(index)}>🎲</button>
              </td>
              <td>
                <button onClick={() => eliminaRiga(index)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={aggiungiRiga}>➕ Aggiungi riga</button>
    </div>
  );
};

export default AllStatsAndRoll;
