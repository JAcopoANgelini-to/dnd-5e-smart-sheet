import React, { useState, useRef } from 'react';
import AllStatsAndRoll from './AllStatsAndRoll';
import Azioni from './Azioni';
import './Character.css';

const Character = () => {
  const [characterData, setCharacterData] = useState({
    stats: [],
    azioni: [],
    combatData: [], // Nei dati iniziali del character
    notes: '' // Aggiunto campo per le note
  });

  const [savedTurnData, setSavedTurnData] = useState(null); // Per azioni e azioni bonus
  const [savedSlotData, setSavedSlotData] = useState(null); // Per gli slot

  const fileInputRef = useRef(null);

  const aggiornaSezione = (sezione, valore) => {
    setCharacterData(prev => ({
      ...prev,
      [sezione]: valore,
    }));
  };

  // Salva i dati del turno (azioni, azioni bonus) con i risultati
  const salvaTurno = () => {
    const azioni = characterData.combatData.find(item => item.nome === 'azioni');
    const azioniBonus = characterData.combatData.find(item => item.nome === 'azioni_bonus');

    setSavedTurnData({
      azioni: azioni ? {
        espressione: azioni.espressione,
        risultato: azioni.risultato
      } : { espressione: '0', risultato: null },
      azioni_bonus: azioniBonus ? {
        espressione: azioniBonus.espressione,
        risultato: azioniBonus.risultato
      } : { espressione: '0', risultato: null }
    });
  };

  // Salva i dati degli slot con i risultati
  const salvaSlot = () => {
    const slots = {};
    for (let i = 1; i <= 9; i++) {
      const slotName = `slot_liv_${i}`;
      const slot = characterData.combatData.find(item => item.nome === slotName);
      slots[slotName] = slot ? {
        espressione: slot.espressione,
        risultato: slot.risultato
      } : { espressione: '0', risultato: null };
    }
    setSavedSlotData(slots);
  };

  // Resetta le azioni del turno con i risultati salvati
  const resetTurno = () => {
    if (!savedTurnData) {
      alert("Prima salva i dati del turno con 'Set Turno'!");
      return;
    }

    setCharacterData(prev => {
      const nuoveCombatData = [...prev.combatData];

      // Aggiorna 'azioni' con i dati salvati
      const azioniIndex = nuoveCombatData.findIndex(item => item.nome === 'azioni');
      if (azioniIndex !== -1) {
        nuoveCombatData[azioniIndex] = {
          ...nuoveCombatData[azioniIndex],
          espressione: savedTurnData.azioni.espressione,
          risultato: savedTurnData.azioni.risultato
        };
      } else {
        nuoveCombatData.push({
          nome: 'azioni',
          espressione: savedTurnData.azioni.espressione,
          risultato: savedTurnData.azioni.risultato
        });
      }

      // Aggiorna 'azioni_bonus' con i dati salvati
      const azioniBonusIndex = nuoveCombatData.findIndex(item => item.nome === 'azioni_bonus');
      if (azioniBonusIndex !== -1) {
        nuoveCombatData[azioniBonusIndex] = {
          ...nuoveCombatData[azioniBonusIndex],
          espressione: savedTurnData.azioni_bonus.espressione,
          risultato: savedTurnData.azioni_bonus.risultato
        };
      } else {
        nuoveCombatData.push({
          nome: 'azioni_bonus',
          espressione: savedTurnData.azioni_bonus.espressione,
          risultato: savedTurnData.azioni_bonus.risultato
        });
      }

      return {
        ...prev,
        combatData: nuoveCombatData
      };
    });
  };

  // Resetta gli slot con i risultati salvati
  const resetSlot = () => {
    if (!savedSlotData) {
      alert("Prima salva i dati degli slot con 'Set Slot'!");
      return;
    }

    setCharacterData(prev => {
      const nuoveCombatData = [...prev.combatData];

      // Aggiorna ogni slot con i dati salvati
      for (let i = 1; i <= 9; i++) {
        const slotName = `slot_liv_${i}`;
        const slotIndex = nuoveCombatData.findIndex(item => item.nome === slotName);

        if (slotIndex !== -1) {
          nuoveCombatData[slotIndex] = {
            ...nuoveCombatData[slotIndex],
            espressione: savedSlotData[slotName].espressione,
            risultato: savedSlotData[slotName].risultato
          };
        } else {
          nuoveCombatData.push({
            nome: slotName,
            espressione: savedSlotData[slotName].espressione,
            risultato: savedSlotData[slotName].risultato
          });
        }
      }

      return {
        ...prev,
        combatData: nuoveCombatData
      };
    });
  };

  // Aggiorna anche la funzione importaJSON per gestire i risultati
  const importaJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const dati = JSON.parse(event.target.result);
        if (typeof dati === 'object' && dati !== null) {
          setCharacterData(dati);

          // Inizializza i dati salvati per turno e slot con i risultati
          const combatData = dati.combatData || [];

          // Prepara i dati del turno (azioni e azioni bonus)
          const turnData = {
            azioni: {
              espressione: combatData.find(item => item.nome === 'azioni')?.espressione || '0',
              risultato: combatData.find(item => item.nome === 'azioni')?.risultato || null
            },
            azioni_bonus: {
              espressione: combatData.find(item => item.nome === 'azioni_bonus')?.espressione || '0',
              risultato: combatData.find(item => item.nome === 'azioni_bonus')?.risultato || null
            }
          };
          setSavedTurnData(turnData);

          // Prepara i dati degli slot con i risultati
          const slots = {};
          for (let i = 1; i <= 9; i++) {
            const slotName = `slot_liv_${i}`;
            const slot = combatData.find(item => item.nome === slotName);
            slots[slotName] = {
              espressione: slot?.espressione || '0',
              risultato: slot?.risultato || null
            };
          }
          setSavedSlotData(slots);
        } else {
          alert('Formato JSON non valido');
        }
      } catch {
        alert('Errore nel parsing del file JSON');
      }
    };
    reader.readAsText(file);
  };

  const esportaJSON = () => {
    const json = JSON.stringify(characterData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'character.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Converti le stats in modificatori nel formato atteso da Azioni
  const getModificatoriEsterni = () => {
    return characterData.stats
      .filter(stat => stat.nome && stat.risultato && stat.risultato !== undefined)
      .map(stat => ({
        nome: stat.nome,
        risultato: stat.risultato.totale
      }));
  };

  return (
    <div className="character-container">
      <h1>Character Sheet</h1>

      <div className="button-group">
        <button onClick={esportaJSON}>Esporta JSON</button>
        <button onClick={() => fileInputRef.current.click()}>Importa JSON</button>
        <input
          type="file"
          accept=".json"
          ref={fileInputRef}
          onChange={importaJSON}
          className="hidden-file-input"
        />
      </div>

      <div className="flex-row">
        <div className="flex-child">
          <AllStatsAndRoll
            righe={characterData.stats}
            setRighe={(nuoveStats) => aggiornaSezione('stats', nuoveStats)}
          />
        </div>

        <div className="flex-child">
          <div className="combat-data-container">
            <h2>Dati variabili per combattimento</h2>

            <div className="combat-buttons">
              <button onClick={salvaTurno} className="combat-btn set-turno">
                Set Turno
              </button>
              <button onClick={salvaSlot} className="combat-btn set-slot">
                Set Slot
              </button>
              <button onClick={resetTurno} className="combat-btn reset-turno">
                Reset Turno
              </button>
              <button onClick={resetSlot} className="combat-btn reset-slot">
                Reset Slot
              </button>
            </div>

            <AllStatsAndRoll
              righe={characterData.combatData || []}
              setRighe={(nuoviDati) => aggiornaSezione('combatData', nuoviDati)}
              showTitle={false}
            />
          </div>

          <Azioni
            azioni={characterData.azioni || []}
            setAzioni={(nuoveAzioni) => aggiornaSezione('azioni', nuoveAzioni)}
            modificatoriEsterni={getModificatoriEsterni()}
            combatStats={characterData.combatData}
            setCombatStats={(nuoviCombatStats) => aggiornaSezione('combatData', nuoviCombatStats)}
          />
        </div>

        {/* Nuova colonna per le note */}
        <div className="flex-child notes-container">
          <h2>Note</h2>
          <textarea
            className="notes-textarea"
            value={characterData.notes || ''}
            onChange={(e) => aggiornaSezione('notes', e.target.value)}
            placeholder="Scrivi qui le tue note..."
          />
        </div>
      </div>
    </div>
  );
};

export default Character;