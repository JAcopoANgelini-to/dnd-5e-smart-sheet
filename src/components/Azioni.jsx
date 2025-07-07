import React, { useState } from 'react'; // <-- Aggiungi { useState }
import './Azioni.css';
import { valutaConEspressione } from '../utils';

const Azioni = ({
  azioni,
  setAzioni,
  combatStats,          // Nuova prop
  setCombatStats,       // Nuova prop
  modificatoriEsterni
}) => {

  const [errorMessage, setErrorMessage] = useState(null);

  const aggiornaAzione = (index, campo, valore) => {
    const nuoveAzioni = azioni.map((azione, i) =>
      i === index ? { ...azione, [campo]: valore } : azione
    );
    setAzioni(nuoveAzioni);
  };

  const aggiornaCosto = (index, campo, valore) => {
    const nuoveAzioni = azioni.map((azione, i) =>
      i === index
        ? { ...azione, costo: { ...azione.costo, [campo]: valore } }
        : azione
    );
    setAzioni(nuoveAzioni);
  };

  const aggiornaTiro = (azioneIdx, tiroIdx, campo, valore) => {
    const nuoveAzioni = azioni.map((azione, i) => {
      if (i !== azioneIdx) return azione;
      const nuoviTiri = azione.tiri.map((tiro, j) =>
        j === tiroIdx ? { ...tiro, [campo]: valore } : tiro
      );
      return { ...azione, tiri: nuoviTiri };
    });
    setAzioni(nuoveAzioni);
  };

  const aggiornaModificatore = (azioneIdx, tiroIdx, modIdx, campo, valore) => {
    const nuoveAzioni = azioni.map((azione, i) => {
      if (i !== azioneIdx) return azione;
      const nuoviTiri = azione.tiri.map((tiro, j) => {
        if (j !== tiroIdx) return tiro;
        const nuoviMod = tiro.modificatoriLocali.map((mod, k) =>
          k === modIdx ? { ...mod, [campo]: valore } : mod
        );
        return { ...tiro, modificatoriLocali: nuoviMod };
      });
      return { ...azione, tiri: nuoviTiri };
    });
    setAzioni(nuoveAzioni);
  };

  const simulaTiro = (azioneIdx, tiroIdx) => {
    // 1. Clona gli stati profondi
    const nuoveAzioni = JSON.parse(JSON.stringify(azioni));
    const nuoviCombatStats = JSON.parse(JSON.stringify(combatStats));
    const azione = nuoveAzioni[azioneIdx];
    const tiro = azione.tiri[tiroIdx];

    const applicaCosti = tiro.applicaCosti !== false; // Default true se non specificato

    // 2. Controllo risorse
    const verificaRisorse = () => {
      const getRisorsa = (nome) => {
        const risorsa = nuoviCombatStats.find(c => c.nome === nome);
        return risorsa ? parseInt(risorsa.risultato.totale) || 0 : 0;
      };
      if (applicaCosti) { // <-- Aggiungi questo controllo
        // Controllo azioni normali
        if (azione.costo.azione && getRisorsa('azioni') <= 0) {
          setErrorMessage("❌ Non hai abbastanza azioni disponibili!");
          return false;
        }

        // Controllo azioni bonus
        if (azione.costo.azioneBonus && getRisorsa('azioni_bonus') <= 0) {
          setErrorMessage("❌ Non hai abbastanza azioni bonus disponibili!");
          return false;
        }

        // Controllo slot incantesimo
        if (azione.costo.slotIncantesimoCheckbox && azione.costo.slotIncantesimoOption) {
          const slotName = `slot_liv_${azione.costo.slotIncantesimoOption}`;
          if (getRisorsa(slotName) <= 0) {
            setErrorMessage(`❌ Non hai più slot di livello ${azione.costo.slotIncantesimoOption} disponibili!`);
            return false;
          }
        }
      }
      return true;
    };

    // 3. Interrompi se risorse insufficienti
    if (!verificaRisorse()) {
      return;
    }

    try {
      // 4. Preparazione modificatori
      const modificatori = [
        ...tiro.modificatoriLocali.map(m => ({
          nome: m.nome,
          valore: m.valore
        })),
        ...(modificatoriEsterni || []).map(m => ({
          nome: m.nome,
          valore: m.risultato
        })),
        ...(azione.costo.slotIncantesimoCheckbox && azione.costo.slotIncantesimoOption
          ? [{
            nome: "slot_incantesimo",
            valore: azione.costo.slotIncantesimoOption.toString()
          }]
          : [])
      ].filter(m => m.nome && m.valore);

      // 5. Esecuzione tiro
      const risultato = valutaConEspressione(modificatori, tiro.espressione);

      // 6. Aggiornamento risultato
      tiro.risultato = risultato.totale.toString();
      tiro.dettaglio = risultato.stringaRisultato;
      tiro.dataUltimoTiro = new Date().toISOString();

      // 7. Applicazione costi
      const applicaCosto = (nome) => {
        const contatore = nuoviCombatStats.find(c => c.nome === nome);
        if (contatore) {
          const current = parseInt(contatore.risultato.totale) || 0;
          contatore.espressione = Math.max(0, current - 1).toString();
          contatore.risultato.totale = Math.max(0, current - 1).toString();
          contatore.ultimoUtilizzo = new Date().toISOString();
        }
      };

      if (azione.costo.azione) applicaCosto('azioni');
      if (azione.costo.azioneBonus) applicaCosto('azioni_bonus');
      if (azione.costo.slotIncantesimoCheckbox && azione.costo.slotIncantesimoOption) {
        applicaCosto(`slot_liv_${azione.costo.slotIncantesimoOption}`);
      }

      // 8. Aggiornamento stato
      setAzioni(nuoveAzioni);
      setCombatStats(nuoviCombatStats);
      setErrorMessage(null); // Resetta eventuali errori precedenti

    } catch (error) {
      console.error("Errore durante il tiro:", error);
      setErrorMessage("⚠️ Errore nel calcolo del tiro!");
      setAzioni(nuoveAzioni); // Mantiene lo stato con l'errore
    }
  };
  const aggiungiAzione = () => {
    setAzioni([
      ...azioni,
      {
        nome: '',
        gittata: '',
        descrizione: '',
        costo: {
          azione: false,
          azioneBonus: false,
          slotIncantesimoCheckbox: false,
          slotIncantesimoOption: '1',
        },
        tiri: [
          {
            nome: '',
            modificatoriLocali: [{ nome: '', valore: '' }],
            espressione: '',
            dettaglio: '',
            risultato: ''
          },
        ],
      },
    ]);
  };

  const aggiungiTiro = (azioneIdx) => {
    const nuoveAzioni = azioni.map((azione, i) =>
      i === azioneIdx
        ? {
          ...azione,
          tiri: [
            ...azione.tiri,
            {
              nome: '',
              modificatoriLocali: [{ nome: '', valore: '' }],
              espressione: '',
              dettaglio: '',
              risultato: '',
              applicaCosti: true // <-- Aggiungi questo campo con default true
            },
          ],
        }
        : azione
    );
    setAzioni(nuoveAzioni);
  };

  const aggiungiModificatore = (azioneIdx, tiroIdx) => {
    const nuoveAzioni = azioni.map((azione, i) => {
      if (i !== azioneIdx) return azione;
      const nuoviTiri = azione.tiri.map((tiro, j) =>
        j === tiroIdx
          ? {
            ...tiro,
            modificatoriLocali: [...tiro.modificatoriLocali, { nome: '', valore: '' }],
          }
          : tiro
      );
      return { ...azione, tiri: nuoviTiri };
    });
    setAzioni(nuoveAzioni);
  };

  const eliminaAzione = (index) => {
    setAzioni(azioni.filter((_, i) => i !== index));
  };

  const eliminaTiro = (azioneIdx, tiroIdx) => {
    const nuoveAzioni = azioni.map((azione, i) =>
      i === azioneIdx
        ? { ...azione, tiri: azione.tiri.filter((_, j) => j !== tiroIdx) }
        : azione
    );
    setAzioni(nuoveAzioni);
  };

  const eliminaModificatore = (azioneIdx, tiroIdx, modIdx) => {
    const nuoveAzioni = azioni.map((azione, i) => {
      if (i !== azioneIdx) return azione;
      const nuoviTiri = azione.tiri.map((tiro, j) =>
        j === tiroIdx
          ? {
            ...tiro,
            modificatoriLocali: tiro.modificatoriLocali.filter((_, k) => k !== modIdx),
          }
          : tiro
      );
      return { ...azione, tiri: nuoviTiri };
    });
    setAzioni(nuoveAzioni);
  };

  return (
    <div className="azioni">
      {errorMessage && (
        <div className="error-message">
          {errorMessage}
          <button
            onClick={() => setErrorMessage(null)}
            className="close-button"
          >
            ×
          </button>
        </div>
      )}
      <table className="tabella-principale">
        <thead>
          <tr>
            <th className="col-anagrafica">Anagrafica</th>
            <th className="col-costo">Costo</th>
            <th className="col-tiri">Tiri</th>
            <th className="col-dettaglio">Dettaglio</th>
            <th className="col-risultato">Risultato</th>
            <th className="col-azioni">Azioni</th>
          </tr>
        </thead>
        <tbody>
          {azioni.map((azione, azioneIdx) => (
            <tr key={`azione-${azioneIdx}`}>
              {/* Colonna Anagrafica */}
              <td className="col-anagrafica">
                <table className="tabella-anagrafica">
                  <tbody>
                    <tr>
                      <td className="etichetta">Nome</td>
                      <td>
                        <textarea
                          value={azione.nome}
                          onChange={(e) => aggiornaAzione(azioneIdx, 'nome', e.target.value)}
                          placeholder="Nome azione"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="etichetta">Gittata</td>
                      <td>
                        <textarea
                          value={azione.gittata}
                          onChange={(e) => aggiornaAzione(azioneIdx, 'gittata', e.target.value)}
                          placeholder="Gittata"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="etichetta">Descrizione</td>
                      <td>
                        <textarea
                          rows={3}
                          value={azione.descrizione}
                          onChange={(e) => aggiornaAzione(azioneIdx, 'descrizione', e.target.value)}
                          placeholder="Descrizione"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>

              {/* Colonna Costo */}
              <td className="col-costo">
                <table className="tabella-costo">
                  <tbody>
                    <tr>
                      <td>1 azione</td>
                      <td className="allineamento-destra">
                        <input
                          type="checkbox"
                          checked={azione.costo.azione}
                          onChange={() => aggiornaCosto(azioneIdx, 'azione', !azione.costo.azione)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>1 azione bonus</td>
                      <td className="allineamento-destra">
                        <input
                          type="checkbox"
                          checked={azione.costo.azioneBonus}
                          onChange={() => aggiornaCosto(azioneIdx, 'azioneBonus', !azione.costo.azioneBonus)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>1 slot incantesimo</td>
                      <td className="allineamento-destra">
                        <input
                          type="checkbox"
                          checked={azione.costo.slotIncantesimoCheckbox}
                          onChange={() => aggiornaCosto(azioneIdx, 'slotIncantesimoCheckbox', !azione.costo.slotIncantesimoCheckbox)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Slot incantesimo:</td>
                      <td className="allineamento-destra">
                        <select
                          value={azione.costo.slotIncantesimoOption}
                          onChange={(e) => aggiornaCosto(azioneIdx, 'slotIncantesimoOption', e.target.value)}
                        >
                          {[...Array(9)].map((_, i) => (
                            <option key={`slot-${i + 1}`} value={i + 1}>
                              {i + 1}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>

              {/* Colonna Tiri */}
              <td className="col-tiri">
                <table className="tabella-tiri">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Modificatori</th>
                      <th>Espressione</th>
                      <th>Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {azione.tiri.map((tiro, tiroIdx) => (
                      <tr key={`tiro-${azioneIdx}-${tiroIdx}`}>
                        <td>
                          <textarea
                            value={tiro.nome}
                            onChange={(e) => aggiornaTiro(azioneIdx, tiroIdx, 'nome', e.target.value)}
                            placeholder="Nome tiro"
                          />
                        </td>

                        <td>
                          <table className="tabella-modificatori">
                            <thead>
                              <tr>
                                <th>Nome</th>
                                <th>Valore</th>
                                <th>Azioni</th>
                              </tr>
                            </thead>
                            <tbody>
                              {tiro.modificatoriLocali.map((mod, modIdx) => (
                                <tr key={`mod-${azioneIdx}-${tiroIdx}-${modIdx}`}>
                                  <td>
                                    <textarea
                                      value={mod.nome}
                                      onChange={(e) => aggiornaModificatore(azioneIdx, tiroIdx, modIdx, 'nome', e.target.value)}
                                      placeholder="Nome modificatore"
                                    />
                                  </td>
                                  <td>
                                    <textarea
                                      value={mod.valore}
                                      onChange={(e) => aggiornaModificatore(azioneIdx, tiroIdx, modIdx, 'valore', e.target.value)}
                                      placeholder="Valore modificatore"
                                    />
                                  </td>
                                  <td>
                                    <button
                                      className="btn-elimina"
                                      onClick={() => eliminaModificatore(azioneIdx, tiroIdx, modIdx)}
                                    >
                                      X
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <button
                            className="btn-aggiungi"
                            onClick={() => aggiungiModificatore(azioneIdx, tiroIdx)}
                          >
                            + Modificatore
                          </button>
                        </td>

                        <td>
                          <textarea
                            value={tiro.espressione}
                            onChange={(e) => aggiornaTiro(azioneIdx, tiroIdx, 'espressione', e.target.value)}
                            placeholder="Espressione"
                          />
                        </td>

                        <td>
                          <div className="dado-elimina-stack">
                            <button
                              className="btn-dado"
                              onClick={() => simulaTiro(azioneIdx, tiroIdx)}
                              title="Simula questo tiro"
                            >
                              🎲
                            </button>
                            <label className="checkbox-applica-costi">
                              <input
                                type="checkbox"
                                checked={tiro.applicaCosti !== false}
                                onChange={(e) => aggiornaTiro(azioneIdx, tiroIdx, 'applicaCosti', e.target.checked)}
                              />
                              Applica costi
                            </label>
                            <button
                              className="btn-elimina"
                              onClick={() => eliminaTiro(azioneIdx, tiroIdx)}
                              title="Elimina tiro"
                            >
                              X
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  className="btn-aggiungi"
                  onClick={() => aggiungiTiro(azioneIdx)}
                >
                  + Tiro
                </button>
              </td>
              {/* Colonna Dettaglio */}
              <td className="col-dettaglio">
                <div className="dettagli-container">
                  {azione.tiri.map((tiro, tiroIdx) => (
                    <div key={`dettaglio-${azioneIdx}-${tiroIdx}`} className="dettaglio-tiro">
                      {tiro.dettaglio || 'Nessun dettaglio disponibile'}
                    </div>
                  ))}
                </div>
              </td>

              {/* Colonna Risultato */}
              <td className="col-risultato">
                <div className="risultati-container">
                  {azione.tiri.map((tiro, tiroIdx) => (
                    <div key={`risultato-${azioneIdx}-${tiroIdx}`} className="risultato-tiro">
                      {tiro.risultato || '-'}
                    </div>
                  ))}
                </div>
              </td>

              {/* Colonna Azioni */}
              <td className="col-azioni">
                <button
                  className="btn-elimina"
                  onClick={() => eliminaAzione(azioneIdx)}
                >
                  Elimina
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        className="btn-aggiungi btn-azione-principale"
        onClick={aggiungiAzione}
      >
        + Nuova Azione
      </button>
    </div>
  );
};

export default Azioni;