/* const modificatori = [
    { nome: "forza", valore: 5 },
    { nome: "destrezza", valore: 3 },
    { nome: "liv_slot", valore: 4 }
];

//const espressione = "2d8 + 1d8 * Math.max(0, liv_slot - 1) + forza";
const espressione = "12 + forza + destrezza + 1d20 + 2d8 + 1d6 * Math.max(0, liv_slot-2)";
 */

function lancioDadi(x, y) {
    const risultati = [];
    for (let i = 0; i < x; i++) {
        risultati.push(Math.floor(Math.random() * y) + 1);
    }
    return risultati;
}

export function valutaConEspressione(modificatori, espressione) {
    // Mappa nome -> valore
    const valori = {};
    modificatori.forEach(({ nome, valore }) => {
        valori[nome] = valore;
    });

    // Sostituisci variabili nella espressione con valori numerici
    let exprConValori = espressione;
    for (const [nome, valore] of Object.entries(valori)) {
        const regex = new RegExp(`\\b${nome}\\b`, "g");
        exprConValori = exprConValori.replace(regex, valore);
    }
    let exprIntermedia = '';
    if (exprConValori != espressione) {
        exprIntermedia = '->' + exprConValori;
    }

    // Regex per i casi "XdY * expr" e "expr * XdY"
    const dadoPerExprRegex = /(\d+)d(\d+)\s*\*\s*([^+\-*/()]+(?:\([^()]*\))?)/g;
    const exprPerDadoRegex = /([^+\-*/()]+(?:\([^()]*\))?)\s*\*\s*(\d+)d(\d+)/g;

    // Funzione di supporto per valutare espressioni sicure senza variabili (esempio Math.max(0, 3))
    function evalExprSafe(expr) {
        try {
            return Math.max(0, Math.floor(Function("Math", `return (${expr})`)(Math)));
        } catch {
            return 0;
        }
    }

    // Sostituisci "XdY * expr" con "NdY" dove N = x * valore esp. (ma non lanciamo ancora i dadi)
    exprConValori = exprConValori.replace(dadoPerExprRegex, (match, x, y, moltiplicatore) => {
        const moltiplicatoreVal = evalExprSafe(moltiplicatore);
        const totaleDadi = parseInt(x) * moltiplicatoreVal;
        return totaleDadi > 0 ? `${totaleDadi}d${y}` : "0";
    });

    // Sostituisci "expr * XdY" con "NdY"
    exprConValori = exprConValori.replace(exprPerDadoRegex, (match, moltiplicatore, x, y) => {
        const moltiplicatoreVal = evalExprSafe(moltiplicatore);
        const totaleDadi = moltiplicatoreVal * parseInt(x);
        return totaleDadi > 0 ? `${totaleDadi}d${y}` : "0";
    });

    if (exprConValori != espressione && exprIntermedia != ('->' + exprConValori)) {
        exprIntermedia = exprIntermedia + '\n->' + exprConValori;
    }

    // Ora lancia i dadi per tutte le espressioni semplici "XdY"
    // Cambiato da oggetto a array per mantenere gruppi separati
    const gruppiDadi = [];

    const dadoSoloRegex = /(\d+)d(\d+)/g;
    exprConValori = exprConValori.replace(dadoSoloRegex, (match, x, y) => {
        const nDadi = parseInt(x);
        const tipoDado = parseInt(y);
        const risultati = lancioDadi(nDadi, tipoDado);
        gruppiDadi.push({ tipoDado, count: nDadi, risultati });
        return risultati.reduce((a, b) => a + b, 0);
    });

    // Calcola il totale
    let totale;
    try {
        totale = Function(`"use strict"; return (${exprConValori})`)();
    } catch (e) {
        return { errore: `Errore di valutazione: ${e.message}` };
    }


    const dadiFinali = gruppiDadi.map(({ count, tipoDado }) => `${count}d${tipoDado}`);

    // Filtra modificatori usati nell’espressione originale
    const modificatoriUsati = Object.keys(valori).filter(nome =>
        new RegExp(`\\b${nome}\\b`).test(espressione)
    );

    // Costruzione stringa di risultato dettagliata
    let stringaRisultato = `\n->${espressione}`;
    stringaRisultato += `\n${exprIntermedia}\n`;

    if (gruppiDadi.length) {
        stringaRisultato += `\nTiri dadi:\n`;
        gruppiDadi.forEach(({ tipoDado, count, risultati }, index) => {
            const somma = risultati.reduce((a, b) => a + b, 0);
            if (risultati.length > 1) {
                stringaRisultato += ` - ${count}d${tipoDado}: [${risultati.join(", ")}] (somma ${somma})\n`;
            }
            else {
                stringaRisultato += ` - ${count}d${tipoDado}: [${risultati.join(", ")}]\n`;
            }
        });
    }


    stringaRisultato += `\nTotale: ${totale}`;

    return {
        totale,
        gruppiDadi,
        valoriModificatori: valori,
        stringaRisultato,
    };
}

/* // Esempio d'uso
const risultato = valutaConEspressione(modificatori, espressione);
console.log(risultato.stringaRisultato);
 */