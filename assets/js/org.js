// ==========================================
// org.js - Les Organismes (Simulateurs Pédagogiques)
// ==========================================
import { theme, utils } from "./core.js";
import * as atom from "./atom.js";
import * as mol from "./mol.js";

/**
 * 🕵️‍♂️ Inspecteur de DataFrame Pédagogique
 * Prend un tableau d'objets (données) et génère un tableau de bord complet
 * affichant les lignes, mais aussi un résumé des colonnes et des types.
 */
export const dataframeInspector = ({ data = [], title = "Aperçu du Dataset", maxRows = 5 }) => {
  if (!data || data.length === 0) {
    return atom.terminalWindow({ header: title, content: atom.logLine({ message: "Dataset vide." }) });
  }

  // 1. Extraire les en-têtes (Features) et les types à partir de la première ligne
  const features = Object.keys(data[0]);
  const schemaHtml = features.map(feat => {
    const typeObj = typeof data[0][feat];
    return atom.badge({ text: `${feat}: ${typeObj}`, color: theme.colors.surface });
  }).join(' ');

  // 2. Générer les lignes (Molécules dataRow)
  const rowsToDisplay = data.slice(0, maxRows);
  const rowsHtml = rowsToDisplay.map((row, idx) => mol.dataRow({ index: idx, dataObject: row })).join('');

  // 3. Assembler le tout dans une interface claire
  return `
    <div style="background: ${theme.colors.background}; border: 1px solid var(--sol-base02); border-radius: ${theme.radius}; padding: 15px;">
      ${atom.text({ content: title, type: "title" })}
      <div style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px dashed rgba(var(--sol-base1-rgb), 0.1);">
        ${atom.text({ content: "Schéma détecté :", type: "label" })}
        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 5px;">
          ${schemaHtml}
        </div>
      </div>
      <div>
        ${atom.text({ content: `Aperçu (${rowsToDisplay.length} / ${data.length} lignes) :`, type: "label" })}
        <div style="margin-top: 10px; max-height: 400px; overflow-y: auto;">
          ${rowsHtml}
        </div>
      </div>
    </div>
  `;
};

/**
 * ✂️ Simulateur de Data Splitting (Train / Test)
 * Génère une représentation visuelle sous forme de mosaïque de blocs
 * pour expliquer le concept de fuite de données (Data Leakage) et de ratio.
 */
export const splitSimulator = ({ totalBlocks = 100, trainRatio = 0.8, shuffle = false }) => {
  const trainCount = Math.floor(totalBlocks * trainRatio);
  const testCount = totalBlocks - trainCount;
  
  // Création du tableau représentant le dataset complet
  let dataset = [
    ...Array(trainCount).fill("train"),
    ...Array(testCount).fill("test")
  ];

  // Mélange visuel si l'option shuffle est activée
  if (shuffle) {
    dataset = dataset.sort(() => Math.random() - 0.5);
  }

  // Rendu visuel
  const blocksHtml = dataset.map(type => atom.dataBlock({ type, size: "15px" })).join('');

  return `
    <div style="background: ${theme.colors.surface}; padding: 15px; border-radius: ${theme.radius}; border-left: 4px solid ${theme.colors.primary};">
      <div style="display: flex; gap: 15px; margin-bottom: 15px;">
        ${mol.metricCard({ title: "Train Set", value: `${Math.round(trainRatio * 100)}%`, trend: "positive" })}
        ${mol.metricCard({ title: "Test Set", value: `${Math.round((1 - trainRatio) * 100)}%`, trend: "neutral" })}
      </div>
      ${atom.text({ content: "Distribution Physique des données :", type: "label" })}
      <div style="display: flex; flex-wrap: wrap; gap: 2px; margin-top: 10px; padding: 10px; background: var(--sol-base03); border-radius: ${theme.radiusSmall};">
        ${blocksHtml}
      </div>
    </div>
  `;
};

/**
 * 🔲 Matrice de Confusion Pédagogique (2x2)
 * Affiche les VP, FP, VN, FN avec des couleurs d'intensité dynamique.
 * Contrairement à un graphique Plotly, ici on veut expliciter la formule textuellement.
 */
export const confusionMatrix = ({ tp, fp, fn, tn }) => {
  const total = tp + fp + fn + tn;
  const accuracy = total > 0 ? ((tp + tn) / total * 100).toFixed(1) : 0;
  const precision = (tp + fp) > 0 ? (tp / (tp + fp) * 100).toFixed(1) : 0;

  // Fonction interne pour générer une cellule (Atom)
  const cell = (label, value, type) => {
    const bgColors = {
      good: `rgba(var(--sol-green-rgb), ${Math.max(0.2, value/total)})`, // Success (Vert)
      bad: `rgba(var(--sol-red-rgb), ${Math.max(0.2, value/total)})`   // Danger (Rouge)
    };
    return `
      <div style="background: ${bgColors[type]}; padding: 15px; border-radius: 4px; text-align: center; border: 1px solid rgba(var(--sol-base1-rgb), 0.1);">
        ${atom.text({ content: value, type: "value", color: "var(--sol-base3)" })}
        ${atom.text({ content: label, type: "label", color: "rgba(var(--sol-base1-rgb), 0.7)" })}
      </div>
    `;
  };

  return `
    <div style="display: flex; gap: 20px; flex-wrap: wrap; align-items: center;">
      <div style="display: grid; grid-template-columns: auto 1fr 1fr; gap: 8px; flex: 1; min-width: 250px;">
        <div></div> <div style="text-align: center; font-size: 0.8em; color: var(--sol-base1);">Prédit Positif</div>
        <div style="text-align: center; font-size: 0.8em; color: var(--sol-base1);">Prédit Négatif</div>
        
        <div style="display: flex; align-items: center; font-size: 0.8em; color: var(--sol-base1); writing-mode: vertical-rl; transform: rotate(180deg);">Réel Positif</div>
        ${cell("Vrai Positif (TP)", tp, "good")}
        ${cell("Faux Négatif (FN)", fn, "bad")}
        
        <div style="display: flex; align-items: center; font-size: 0.8em; color: var(--sol-base1); writing-mode: vertical-rl; transform: rotate(180deg);">Réel Négatif</div>
        ${cell("Faux Positif (FP)", fp, "bad")}
        ${cell("Vrai Négatif (TN)", tn, "good")}
      </div>
      
      <div style="flex: 1; display: flex; flex-direction: column; gap: 10px; min-width: 200px;">
        ${mol.metricCard({ title: "Accuracy (Exactitude)", value: `${accuracy}%`, trend: accuracy > 80 ? "positive" : "warning" })}
        ${mol.metricCard({ title: "Precision", value: `${precision}%`, trend: precision > 80 ? "positive" : "warning" })}
      </div>
    </div>
  `;
};

/**
 * 🌲 Simulateur Bagging vs Boosting
 * Illustre la différence d'architecture (Parallèle vs Séquentielle) 
 * et trace les logs d'entraînement des arbres de décision.
 */
export const ensembleSimulator = ({ mode = "bagging", numTrees = 3 }) => {
  const isBagging = mode === "bagging";
  
  // Générer la liste des arbres [1, 2, 3...]
  const trees = Array.from({ length: numTrees }, (_, i) => i + 1);

  // Simulation pédagogique de l'erreur
  const initialError = 0.45;
  const currentError = isBagging 
    ? initialError / Math.sqrt(numTrees) // Bagging: Réduction via la variance
    : initialError * Math.pow(0.6, numTrees); // Boosting: Réduction via le biais (plus agressif)

  // Génération dynamique des traces du Terminal
  const logs = trees.map(t => {
    if (isBagging) {
      return atom.logLine({ message: `[Arbre N°${t}] Entraînement sur un échantillon Bootstrap indépendant...`, type: "info" });
    } else {
      return atom.logLine({ message: `[Arbre N°${t}] Entraînement focalisé sur les RÉSIDUS (erreurs) de l'arbre ${t-1 || 'initial'}...`, type: "warning" });
    }
  });
  logs.push(atom.logLine({ message: "Processus d'agglomération terminé.", type: "success" }));

  // Génération visuelle des Nœuds (Les Arbres)
  const treeNodesHtml = trees.map(t => `
    <div style="background: ${theme.colors.surface}; border: 1px solid ${isBagging ? theme.colors.info : theme.colors.warning}; border-radius: ${theme.radiusSmall}; padding: 15px 10px; text-align: center; min-width: 80px; box-shadow: 0 4px 6px rgba(var(--sol-base03-rgb), 0.2);">
      <div style="font-size: 1.5em; margin-bottom: 5px;">🌲</div>
      <div style="font-weight: bold; color: ${theme.colors.text};">N°${t}</div>
      <div style="font-size: 0.7em; color: ${theme.colors.textMuted}; margin-top: 5px; font-family: ${theme.fontMono};">
        ${isBagging ? "Poids: 1/N" : `Poids: α${t}`}
      </div>
    </div>
  `);

  // Agencement visuel : Parallèle (Colonne/Ligne) vs Séquentiel (Ligne + Flèches)
  let visualLayout = "";
  if (isBagging) {
    visualLayout = `
      <div style="display: flex; flex-direction: column; align-items: center; gap: 15px;">
        <div style="display: flex; gap: 15px; flex-wrap: wrap; justify-content: center;">
          ${treeNodesHtml.join('')}
        </div>
        <div style="color: ${theme.colors.info}; font-size: 1.2em;">⬇️ Vote Majoritaire / Moyenne ⬇️</div>
        ${atom.badge({ text: "Modèle Robuste (Forêt Aléatoire)", color: theme.colors.info, textColor: "var(--sol-base3)" })}
      </div>
    `;
  } else {
    // Insertion de flèches d'erreur entre chaque arbre pour le Boosting
    const separator = `<div style="color: ${theme.colors.danger}; text-align: center; font-weight: bold; margin: 0 10px;">➔<br><span style="font-size:0.6em;">Erreurs</span></div>`;
    visualLayout = `
      <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: center;">
        ${treeNodesHtml.join(separator)}
        <div style="color: ${theme.colors.warning}; font-weight: bold; margin: 0 15px; font-size: 1.5em;">➔</div>
        ${atom.badge({ text: "Modèle Fort (XGBoost)", color: theme.colors.warning, textColor: "var(--sol-base3)" })}
      </div>
    `;
  }

  // Assemblage Final de l'Organisme
  return `
    <div style="display: flex; flex-direction: column; gap: 20px; background: rgba(var(--sol-base03-rgb), 0.1); padding: 20px; border-radius: ${theme.radius}; border: 1px solid rgba(var(--sol-base1-rgb), 0.05);">
      
      <div style="display: flex; gap: 15px; flex-wrap: wrap;">
        ${mol.metricCard({ title: "Architecture", value: isBagging ? "Parallèle" : "Séquentielle", trend: "neutral" })}
        ${mol.metricCard({ title: "Erreur Globale", value: (currentError * 100).toFixed(1) + "%", trend: "positive" })}
      </div>

      <div style="background: ${theme.colors.background}; padding: 20px; border-radius: ${theme.radius}; border: 1px dashed rgba(var(--sol-base1-rgb), 0.1);">
        ${atom.text({ content: "Topologie d'entraînement :", type: "label" })}
        <div style="margin-top: 15px;">
          ${visualLayout}
        </div>
      </div>

      <div>
        ${mol.terminalConsole({ header: "Trace d'exécution du Moteur d'Ensemble", logs: logs })}
      </div>

    </div>
  `;
};