import { useState } from 'react';
//import { useEffect } from "react";
import './App.css'



function App() {
  const pageStyle = {
    display: 'flex',
    flexDirection: 'row'
  }

  const pageItemStyle = {
    border: '1px solid black',
    margin: '6px'
  }

  const [modifiers, setModifiers] = useState({});

  const handleModifierTableChange = (key, value) => {
    setModifiers(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        value: value
      }
    }));

    const updateOrAddModifier = (modifiers = []) => {
      const existing = modifiers.find(mod => mod.key === key);
      if (existing) {
        return modifiers.map(mod =>
          mod.key === key ? { ...mod, value } : mod
        );
      } else {
        return [...modifiers, { key, value }];
      }
    };

    if (combatAction.length > 0) {
      setcombatAction(prev =>
        prev.map(action => {
          // Filtra gli slot prima di aggiornare
          const shouldUpdateHit = action.selectedHitModifiers.some(mod => mod.key === key) && !modifiers[key]?.isASlot;
          const shouldUpdateDamage = action.selectedDamageModifiers.some(mod => mod.key === key) && !modifiers[key]?.isASlot;

          return {
            ...action,
            selectedDamageModifiers: shouldUpdateDamage ? updateOrAddModifier(action.selectedDamageModifiers) : action.selectedDamageModifiers,
            selectedHitModifiers: shouldUpdateHit ? updateOrAddModifier(action.selectedHitModifiers) : action.selectedHitModifiers,
          }
        })
      );
    }
  };


  const handleAdd = () => {
    const newKey = prompt('Inserisci nuova chiave:');
    if (!newKey) return;

    const newValue = prompt('Inserisci valore per la chiave "' + newKey + '":');
    const isASlot = confirm('È uno slot incantesimo?'); // Chiedi all'utente

    setModifiers((prev) => ({
      ...prev,
      [newKey]: {
        value: newValue,
        isASlot: isASlot
      }
    }));
  };

  const handleDelete = (keyToDelete) => {
    setModifiers((prev) => {
      const updated = { ...prev };
      delete updated[keyToDelete];
      return updated;
    });
  };

  const handleSlotToggle = (key) => {
    setModifiers(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        isASlot: !prev[key]?.isASlot
      }
    }));
  };




  const [anagrafic, setanAnagrafic] = useState({
    nome: '',
    gittata: '',
    descrizione: '',
  })

  const handleanagraficChange = (field, value) => {
    console.log(field, value)
    setanAnagrafic(prev => ({
      ...prev,
      [field]: value
    }));
  };



  const [selectedHitModifiers, setSelectedHitModifiers] = useState([{ key: "", value: "" }]);

  const addRowHit = () => {
    setSelectedHitModifiers([...selectedHitModifiers, { key: "", value: "" }]);
  };

  const handleSelectChangeHit = (index, newKey) => {
    // Se il modificatore selezionato è uno slot, non aggiungerlo
    if (modifiers[newKey]?.isASlot) {
      alert("Non puoi selezionare uno slot incantesimo come modificatore!");
      return;
    }

    const updated = [...selectedHitModifiers];
    updated[index] = {
      key: newKey,
      value: modifiers[newKey]?.value || ""
    };
    setSelectedHitModifiers(updated);
  };

  const handleDeleteRowHit = (indexToDelete) => {
    setSelectedHitModifiers((prev) => prev.filter((_, i) => i !== indexToDelete));
  };



  const [selectedDamageModifiers, setSelectedDamageModifiers] = useState([{ key: "", value: "" }]);

  const addRowDamage = () => {
    setSelectedDamageModifiers([...selectedDamageModifiers, { key: "", value: "" }]);
  };

  const handleSelectChangeDamage = (index, newKey) => {
    // Se il modificatore selezionato è uno slot, non aggiungerlo
    if (modifiers[newKey]?.isASlot) {
      alert("Non puoi selezionare uno slot incantesimo come modificatore!");
      return;
    }

    const updated = [...selectedDamageModifiers];
    updated[index] = {
      key: newKey,
      value: modifiers[newKey]?.value || ""
    };
    setSelectedDamageModifiers(updated);
  };

  const handleDeleteRowDamage = (indexToDelete) => {
    setSelectedDamageModifiers((prev) => prev.filter((_, i) => i !== indexToDelete));
  };

  const [selecteDices, setSelecteDices] = useState([{ type: "", howMany: undefined }]);

  const addRowDices = () => {
    setSelecteDices([...selecteDices, { type: "", howMany: undefined }]);
  };

  const handleSelectChangeDices = (index, newKey) => {
    const updatedKeys = [...selecteDices];
    updatedKeys[index].type = newKey;
    setSelecteDices(updatedKeys);
  };

  const handleSelectNumberDices = (index, newKey) => {
    const updatedKeys = [...selecteDices];
    updatedKeys[index].howMany = newKey;
    setSelecteDices(updatedKeys);
  };

  const handleDeleteRowDices = (indexToDelete) => {
    setSelecteDices((prev) => prev.filter((_, i) => i !== indexToDelete));
  };


  const [combatAction, setcombatAction] = useState([]); // <- dove accumulerai gli oggetti

  const handleAddData = () => {
    // Filtra gli slot dai modificatori di colpo e danno
    const filteredHitModifiers = selectedHitModifiers
      .filter(mod => !modifiers[mod.key]?.isASlot)
      .map(mod => ({ ...mod }));

    const filteredDamageModifiers = selectedDamageModifiers
      .filter(mod => !modifiers[mod.key]?.isASlot)
      .map(mod => ({ ...mod }));

    const newCombatAction = {
      anagrafic: { ...anagrafic },
      selectedHitModifiers: filteredHitModifiers,
      selectedDamageModifiers: filteredDamageModifiers,
      selecteDices: selecteDices.map(dice => ({ ...dice })),
      isSpell,
      extraDiceLevelThreshold: Number(extraDiceLevelThreshold) || 0,
      spellSlotLevel: Number(extraDiceLevelThreshold) || 0
    };

    setcombatAction(prev => [...prev, newCombatAction]);

    setanAnagrafic({
      nome: "",
      gittata: "",
      descrizione: "",
    });
    setSelectedHitModifiers([{ key: "", value: 0 }]);  // almeno un elemento vuoto
    setSelectedDamageModifiers([{ key: "", value: 0 }]);
    setSelecteDices([{ type: "", howMany: 0 }]);
    setIsSpell(false);
    setExtraDiceLevelThreshold("0");

  };



  const handleDeleteRowCombatAction = (indexToDelete) => {
    setcombatAction((prev) => prev.filter((_, i) => i !== indexToDelete));
  }


  const [editIndex, setEditIndex] = useState(null);

  // const [buttonAction, setButtonAction] = useState(null);

  const editCombatAction = (index) => {
    const actionToModify = combatAction[index];

    setanAnagrafic({ ...actionToModify.anagrafic });

    // Filtra gli slot quando carichi i modificatori per la modifica
    setSelectedDamageModifiers(
      actionToModify.selectedDamageModifiers
        .filter(mod => !modifiers[mod.key]?.isASlot)
        .map(mod => ({ ...mod }))
    );

    setSelecteDices(actionToModify.selecteDices.map(dice => ({ ...dice })));

    setSelectedHitModifiers(
      actionToModify.selectedHitModifiers
        .filter(mod => !modifiers[mod.key]?.isASlot)
        .map(mod => ({ ...mod }))
    );

    setIsSpell(actionToModify.isSpell || false);
    setExtraDiceLevelThreshold(actionToModify.extraDiceLevelThreshold || 0);
    setEditIndex(index);
  };




  const modifyCombatAction = (index) => {
    // Filtra gli slot dai modificatori di colpo e danno
    const filteredHitModifiers = selectedHitModifiers
      .filter(mod => !modifiers[mod.key]?.isASlot)
      .map(mod => ({ ...mod }));

    const filteredDamageModifiers = selectedDamageModifiers
      .filter(mod => !modifiers[mod.key]?.isASlot)
      .map(mod => ({ ...mod }));

    const modifiedCombatAction = {
      anagrafic: { ...anagrafic },
      selectedHitModifiers: filteredHitModifiers,
      selectedDamageModifiers: filteredDamageModifiers,
      selecteDices: selecteDices.map(dice => ({ ...dice })),
      isSpell: isSpell,
      extraDiceLevelThreshold: extraDiceLevelThreshold,
    };

    setcombatAction(prev =>
      prev.map((item, i) => (i === index ? modifiedCombatAction : item))
    );


    setanAnagrafic({
      nome: "",
      gittata: "",
      descrizione: "",
    });
    setSelectedHitModifiers([{ key: "", value: 0 }]);  // almeno un elemento vuoto
    setSelectedDamageModifiers([{ key: "", value: 0 }]);
    setSelecteDices([{ type: "", howMany: 0 }]);
    setIsSpell(false);
    setExtraDiceLevelThreshold("0");

    setEditIndex(null);
  };



  const roll1d20 = () => {
    const roll = Math.floor(Math.random() * 20) + 1;
    return roll;
  };


  const rollToHit = (action, index) => {
    // Se è un incantesimo, riduci gli slot del livello appropriato
    if (action.isSpell && action.spellSlotLevel) {
      const slotKey = `slot_lv_${action.spellSlotLevel}`;

      // Verifica se esiste lo slot nel modificatore e se è contrassegnato come slot
      if (modifiers[slotKey] !== undefined && modifiers[slotKey].isASlot) {
        const currentSlots = parseInt(modifiers[slotKey].value, 10);

        // Se ci sono slot disponibili, riduci di 1
        if (currentSlots > 0) {
          const newSlots = currentSlots - 1;
          handleModifierTableChange(slotKey, newSlots.toString());
        } else {
          alert(`Non hai più slot di livello ${action.spellSlotLevel} disponibili!`);
          return; // Interrompe l'esecuzione se non ci sono slot
        }
      } else {
        alert(`Slot di livello ${action.spellSlotLevel} non trovati nei modificatori!`);
        return; // Interrompe l'esecuzione se lo slot non esiste
      }
    }

    // Prosegui con il tiro normale, escludendo gli slot incantesimo dai modificatori
    const rollResult = roll1d20();
    const modifierSum = action.selectedHitModifiers.reduce((acc, mod) => {
      // Escludi i modificatori che sono slot incantesimo
      if (modifiers[mod.key]?.isASlot) return acc;

      const value = parseInt(mod.value, 10);
      return acc + (isNaN(value) ? 0 : value);
    }, 0);

    const result = rollResult + modifierSum;

    document.querySelector('.roll-result' + index).innerHTML = `
    <p>
      risultato tiro : ${rollResult}
    </p>
    <br />
    <p>
      totale : ${result}
      <br />
      (${rollResult} + ${modifierSum})
    </p>
  `;
  };



  const rollToDamage = (action, index) => {
    const modifierSum = action.selectedDamageModifiers.reduce((acc, mod) => {
      // Escludi i modificatori che sono slot incantesimo
      if (modifiers[mod.key]?.isASlot) return acc;

      const value = parseInt(mod.value, 10);
      return acc + (isNaN(value) ? 0 : value);
    }, 0);

    let totalDiceRoll = 0;
    let rollResults = [];

    // 1. Roll dei dadi normali
    action.selecteDices.forEach((dice) => {
      const sides = parseInt(dice.type.replace("d", ""), 10);
      const howMany = dice.howMany || 0;
      for (let i = 0; i < howMany; i++) {
        const roll = Math.floor(Math.random() * sides) + 1;
        rollResults.push(roll);
        totalDiceRoll += roll;
      }
    });

    // 2. Se è un incantesimo e lo slot è maggiore della soglia, aggiungo 1 dado extra per ogni livello sopra la soglia
    if (action.isSpell && action.spellSlotLevel > action.extraDiceLevelThreshold && action.selecteDices.length > 0) {
      const extraDiceCount = action.spellSlotLevel - action.extraDiceLevelThreshold;
      const extraDiceType = action.selecteDices[0].type;
      const extraSides = parseInt(extraDiceType.replace("d", ""), 10);

      for (let i = 0; i < extraDiceCount; i++) {
        const extraRoll = Math.floor(Math.random() * extraSides) + 1;
        rollResults.push(extraRoll);
        totalDiceRoll += extraRoll;
      }
    }

    // 3. Somma finale
    const total = totalDiceRoll + modifierSum;

    document.querySelector('.roll-result' + index).innerHTML = `
    <p>
      risultato tiri : ${rollResults.join(", ")}
    </p>
    <br />
    <p>
      totale : ${total}
      <br />
      (${totalDiceRoll} + ${modifierSum})
    </p>
  `;
  };


  const objToJsonDownload = (obj) => {
    const jsonString = JSON.stringify(obj, null, 2); // pretty print con indentazione

    // Crea un blob di testo con tipo MIME
    const blob = new Blob([jsonString], { type: "application/json" });

    // Crea un link temporaneo per il download
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dati.json"; // nome del file
    document.body.appendChild(a);
    a.click();

    // Pulizia
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }


  let jsonDataUpload = null

  const uploadJson = () => {
    const fileInput = document.getElementById('file-input-json');
    fileInput.click();
  }

  const acceptJson = () => {
    const fileInput = document.getElementById('file-input-json');
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        jsonDataUpload = JSON.parse(e.target.result);
        setcombatAction(jsonDataUpload[0])
        setModifiers(jsonDataUpload[1])
      } catch (err) {
        console.error("Errore nel parsing del JSON:", err);
      }
    };
    reader.readAsText(file);
  }

  const [isSpell, setIsSpell] = useState(false);
  const [extraDiceLevelThreshold, setExtraDiceLevelThreshold] = useState(0);

  return (
    <>
      <div className='page' style={pageStyle}>

        <div className='page-item' style={pageItemStyle}>
          <h1>Operazioni: </h1>
          <div>
            <table border="1" cellPadding="8">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Descrizione</th>
                  <th>Gittata</th>
                  <th>Mod. Colpire</th>
                  <th>Mod. Danno</th>
                  <th>Dadi Danni</th>
                  <th>Incantesimo?</th>
                  <th>Slot +Danni da livello</th>
                  <th>Tira per Colpire</th>
                  <th>Tira i Danni</th>
                  <th>Risultato tiro</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {combatAction.map((action, index) => (
                  <tr key={index}>
                    <td>{action.anagrafic?.nome || ""}</td>
                    <td>{action.anagrafic?.descrizione || ""}</td>
                    <td>{action.anagrafic?.gittata || ""}</td>
                    <td>
                      {action.selectedHitModifiers.map((mod, i) => (
                        <div key={i}>
                          {mod.key}: {mod.value}
                        </div>
                      ))}
                    </td>
                    <td>
                      {action.selectedDamageModifiers.map((mod, i) => (
                        <div key={i}>
                          {mod.key}: {mod.value}
                        </div>
                      ))}
                    </td>
                    <td>
                      {action.selecteDices.map((dice, i) => (
                        <div key={i}>
                          {dice.howMany} : {dice.type}
                        </div>
                      ))}
                    </td>

                    <td>
                      {action.isSpell ? (
                        <>
                          <input
                            type="checkbox"
                            checked={true}
                            readOnly
                            style={{ marginRight: "8px" }}
                          />
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <label style={{ fontSize: "0.8rem", marginBottom: "4px" }}>
                              Slot con cui voglio castare:
                            </label>
                            <select
                              value={action.spellSlotLevel || 1}
                              onChange={(e) => {
                                const newLevel = parseInt(e.target.value);
                                setcombatAction((prev) =>
                                  prev.map((item, i) =>
                                    i === index ? { ...item, spellSlotLevel: newLevel } : item
                                  )
                                );
                              }}
                            >
                              {[...Array(9)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                  {i + 1}
                                </option>
                              ))}
                            </select>
                          </div>
                        </>
                      ) : (
                        <span style={{ color: "red", fontWeight: "bold" }}>❌</span>
                      )}
                    </td>


                    <td>{action.isSpell ? action.extraDiceLevelThreshold : "-"}</td>
                    <td>
                      <button onClick={() => rollToHit(action, index)}>
                        Tira per Colpire
                      </button>
                    </td>
                    <td>
                      <button onClick={() => rollToDamage(action, index)}>
                        Tira i Danni
                      </button>
                    </td>
                    <td className={"roll-result" + index}></td>
                    <td>
                      <button onClick={() => handleDeleteRowCombatAction(index)}>🗑️</button>
                      <button onClick={() => editCombatAction(index)}>✏️</button>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>

            <button onClick={() => objToJsonDownload([combatAction, modifiers])}>
              Scarica json combat action e modificatori
            </button>
            <button id="uploadBtn" onClick={() => uploadJson()}>
              Carica JSON
            </button>
            <input
              type="file"
              id="file-input-json"
              accept=".json"
              onChange={() => acceptJson()}
            />

          </div>

        </div>


        <div className='page-item' style={pageItemStyle}>
          <h1>Azioni da combattimento: </h1>

          <h2>Tabella Anagrafica</h2>
          <table border="1" cellPadding="8">
            <thead>
              <tr>
                <th>Chiave</th>
                <th>Valore</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>nome</td>
                <td>
                  <input
                    id='input_name'
                    type="text"
                    value={anagrafic.nome}
                    onChange={(e) => handleanagraficChange('nome', e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <td>gittata</td>
                <td>
                  <input
                    id='input_gittata'
                    type="text"
                    value={anagrafic.gittata}
                    onChange={(e) => handleanagraficChange('gittata', e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <td>descrizione</td>
                <td>
                  <input
                    id='input_descrizione'
                    type="text"
                    value={anagrafic.descrizione}
                    onChange={(e) => handleanagraficChange('descrizione', e.target.value)}
                  />
                </td>
              </tr>
            </tbody>
          </table>

          <h2>Tabella modificatori per colpire</h2>
          <div>
            <table border="1" cellPadding="8">
              <thead>
                <tr>
                  <th>Chiave</th>
                  <th>Valore</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {selectedHitModifiers.map((mod, index) => (
                  <tr key={index}>
                    <td>
                      <select
                        value={mod.key}
                        onChange={(e) => handleSelectChangeHit(index, e.target.value)}
                      >
                        <option value="">-- Seleziona un modificatore --</option>
                        {Object.entries(modifiers)
                          .filter(([key, modifier]) => !modifier.isASlot) // Escludi gli slot
                          .map(([key]) => (
                            <option key={key} value={key}>{key}</option>
                          ))}
                      </select>
                    </td>
                    <td>{mod.value}</td>
                    <td>
                      <button onClick={() => handleDeleteRowHit(index)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button onClick={addRowHit} style={{ marginTop: "10px" }}>
              Aggiungi modificatore a colpire
            </button>
          </div>

          <h2>Tabella modificatori per danni</h2>
          <div>
            <table border="1" cellPadding="8">
              <thead>
                <tr>
                  <th>Chiave</th>
                  <th>Valore</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {selectedDamageModifiers.map((mod, index) => (
                  <tr key={index}>
                    <td>
                      <select
                        value={mod.key}
                        onChange={(e) => handleSelectChangeDamage(index, e.target.value)}
                      >
                        <option value="">-- Seleziona un modificatore --</option>
                        {Object.entries(modifiers)
                          .filter(([key, modifier]) => !modifier.isASlot) // Escludi gli slot
                          .map(([key]) => (
                            <option key={key} value={key}>{key}</option>
                          ))}
                      </select>
                    </td>
                    <td>{mod.value}</td>
                    <td>
                      <button onClick={() => handleDeleteRowDamage(index)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button onClick={addRowDamage} style={{ marginTop: "10px" }}>
              Aggiungi modificatore ai danni
            </button>
          </div>

          <h2>Tabella dadi</h2>
          <div>
            <table border="1" cellPadding="8">
              <thead>
                <tr>
                  <th>tipo di dado</th>
                  <th>numero di dadi</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {selecteDices.map((dice, index) => (
                  <tr key={index}>
                    <td>
                      <select
                        value={dice.type}
                        onChange={(e) => handleSelectChangeDices(index, e.target.value)}
                      >
                        <option value="">-- Seleziona un modificatore --</option>
                        {['d4', 'd6', 'd8', 'd10', 'd12'].map((key) => (
                          <option key={key} value={key}>{key}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        value={dice.howMany}
                        onChange={(e) => handleSelectNumberDices(index, parseInt(e.target.value))}
                      />
                    </td>
                    <td>
                      <button onClick={() => handleDeleteRowDices(index)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button onClick={addRowDices} style={{ marginTop: "10px" }}>
              Aggiungi dadi
            </button>
          </div>

          {/* Nuovi controlli aggiunti */}
          <div style={{ marginTop: "20px" }}>
            <label>
              <input
                type="checkbox"
                checked={isSpell}
                onChange={(e) => setIsSpell(e.target.checked)}
              />
              È un incantesimo?
            </label>
          </div>

          {isSpell && (
            <div style={{ marginTop: "10px" }}>
              <label>
                Livello slot dopo il quale aggiungere dadi al danno:{" "}
                <input
                  type="number"
                  value={extraDiceLevelThreshold}
                  onChange={(e) => setExtraDiceLevelThreshold(e.target.value)} // mantieni stringa
                />

              </label>
            </div>
          )}

          <button onClick={handleAddData} style={{ marginTop: "20px" }}>
            Aggiungi azione di combattimento
          </button>

          <div id="modify_button_frame">
            {editIndex !== null && (
              <button onClick={() => modifyCombatAction(editIndex)}>Modifica</button>
            )}
          </div>
        </div>


        <div className='page-item' style={pageItemStyle}>
          <h1>Modificatori: </h1>
          <div>
            <h2>Tabella Chiave-Valore</h2>
            <table border="1" cellPadding="8">
              <thead>
                <tr>
                  <th>Chiave</th>
                  <th>Valore</th>
                  <th>È uno slot incantesimo?</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(modifiers).map(([key, modifier]) => (
                  <tr key={key}>
                    <td>{key}</td>
                    <td>
                      <input
                        type="text"
                        value={modifier.value}
                        onChange={(e) => handleModifierTableChange(key, e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={modifier.isASlot || false}
                        onChange={() => handleSlotToggle(key)}
                      />
                    </td>
                    <td>
                      <button onClick={() => handleDelete(key)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button onClick={handleAdd} style={{ marginTop: '10px' }}>
              Aggiungi nuova chiave
            </button>

          </div>




        </div>


      </div>
    </>
  )
}

export default App


