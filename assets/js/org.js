// ==========================================
// org.js - Les Organismes (Simulateurs Pédagogiques) (DRY/KISS)
// ==========================================
import { theme, utils } from "./core.js";
import * as atom from "./atom.js";
import * as mol from "./mol.js";

/**
 * 🕵️‍♂️ Inspecteur de DataFrame
 */
export const dataframeInspector = ({ data = [], title = "Aperçu du Dataset", maxRows = 5 }) => {
  if (!data || data.length === 0) {
    return atom.terminalWindow({ header: title, content: atom.logLine({ message: "Dataset vide." }) });
  }

  const features = Object.keys(data[0]);
  const schemaHtml = features.map(feat => {
    return atom.badge({ text: feat });
  }).join(' ');

  const rowsHtml = data.slice(0, maxRows).map((row, idx) => mol.dataRow({ index: idx, dataObject: row })).join('');

  return `
    <div class="ui-card is-debug">
      <div class="ui-card-header">${title}</div>
      <div class="ui-card-body">
        <div style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px dashed rgba(var(--sol-base1-rgb), 0.1);">
          <div style="font-size: 0.75em; color: var(--sol-base01); text-transform: uppercase; margin-bottom: 8px;">Schéma détecté :</div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">${schemaHtml}</div>
        </div>
        <div style="font-size: 0.75em; color: var(--sol-base01); text-transform: uppercase; margin-bottom: 10px;">Aperçu des lignes :</div>
        <div style="max-height: 400px; overflow-y: auto;">${rowsHtml}</div>
      </div>
    </div>
  `;
};

/**
 * ✂️ Simulateur de Data Splitting
 */
export const splitSimulator = ({ totalBlocks = 100, trainRatio = 0.8, shuffle = false }) => {
  const trainCount = Math.floor(totalBlocks * trainRatio);
  const testCount = totalBlocks - trainCount;
  
  let dataset = [...Array(trainCount).fill("train"), ...Array(testCount).fill("test")];
  if (shuffle) dataset = dataset.sort(() => Math.random() - 0.5);

  const blocksHtml = dataset.map(type => atom.dataBlock({ type })).join('');

  return `
    <div class="ui-card is-info">
      <div class="ui-card-header">Split Simulator</div>
      <div class="ui-card-body">
        <div style="display: flex; gap: 15px; margin-bottom: 15px;">
          ${mol.metricCard({ title: "Train", value: `${Math.round(trainRatio * 100)}%`, trend: "positive" })}
          ${mol.metricCard({ title: "Test", value: `${Math.round((1 - trainRatio) * 100)}%`, trend: "neutral" })}
        </div>
        <div style="font-size: 0.75em; color: var(--sol-base01); text-transform: uppercase; margin-bottom: 10px;">Distribution :</div>
        <div style="display: flex; flex-wrap: wrap; gap: 2px; padding: 10px; background: var(--sol-base03); border-radius: 8px;">
          ${blocksHtml}
        </div>
      </div>
    </div>
  `;
};

/**
 * 🔔 Matrice de Confusion
 */
export const confusionMatrix = ({ tp, fp, fn, tn }) => {
  const total = tp + fp + fn + tn;
  const accuracy = total > 0 ? ((tp + tn) / total * 100).toFixed(1) : 0;

  const cell = (label, value, colorClass) => `
    <div class="ui-badge ${colorClass}" style="padding: 15px; text-align: center; display: flex; flex-direction: column; gap: 4px;">
      <span style="font-size: 1.4em; font-weight: bold;">${value}</span>
      <span style="font-size: 0.7em; opacity: 0.8; text-transform: uppercase;">${label}</span>
    </div>
  `;

  return `
    <div class="ui-card is-warning">
      <div class="ui-card-header">Matrice de Confusion</div>
      <div class="ui-card-body" style="display: flex; gap: 20px; flex-wrap: wrap;">
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; flex: 1; min-width: 250px;">
          ${cell("TP", tp, "is-success")}
          ${cell("FN", fn, "is-danger")}
          ${cell("FP", fp, "is-danger")}
          ${cell("TN", tn, "is-success")}
        </div>
        <div style="flex: 1; min-width: 200px;">
          ${mol.metricCard({ title: "Accuracy", value: `${accuracy}%`, trend: accuracy > 80 ? "positive" : "warning" })}
        </div>
      </div>
    </div>
  `;
};

/**
 * 🌲 Simulateur Ensemble Learning
 */
export const ensembleSimulator = ({ mode = "bagging", numTrees = 3 }) => {
  const isBagging = mode === "bagging";
  const trees = Array.from({ length: numTrees }, (_, i) => i + 1);
  const colorClass = isBagging ? "is-info" : "is-warning";

  const treeNodesHtml = trees.map(t => `
    <div class="ui-card ${colorClass}" style="margin: 0; min-width: 80px; text-align: center; padding: 10px;">
      <div style="font-size: 1.5em;">🌲</div>
      <div style="font-weight: bold; font-size: 0.8em;">N°${t}</div>
    </div>
  `);

  const visualLayout = `
    <div style="display: flex; flex-direction: ${isBagging ? 'column' : 'row'}; align-items: center; gap: 15px; justify-content: center; flex-wrap: wrap;">
      <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;">
        ${treeNodesHtml.join(isBagging ? '' : '➡️')}
      </div>
      <div style="color: var(--sol-base01); font-size: 1.5em;">⬇️</div>
      ${atom.badge({ text: isBagging ? "Random Forest" : "XGBoost", colorClass })}
    </div>
  `;

  return `
    <div class="ui-card ${colorClass}">
      <div class="ui-card-header">Ensemble: ${mode}</div>
      <div class="ui-card-body">
        <div style="margin-bottom: 20px;">${visualLayout}</div>
        ${mol.terminalConsole({ header: "Training Logs", logs: trees.map(t => `Arbre ${t} entrainé...`) })}
      </div>
    </div>
  `;
};