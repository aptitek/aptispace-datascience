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
  const schemaHtml = features.map(feat => atom.badge({ text: feat })).join(' ');
  const rowsHtml = data.slice(0, maxRows).map((row, idx) => mol.dataRow({ index: idx, dataObject: row })).join('');

  return `
    <div class="ui-card is-debug">
      <div class="ui-card-header">${title}</div>
      <div class="ui-card-body">
        <div style="margin-bottom: 15px;">
          <div style="font-size: 0.75em; color: var(--sol-base01); text-transform: uppercase; margin-bottom: 8px;">Schéma :</div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">${schemaHtml}</div>
        </div>
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
        <div style="display: flex; gap: 15px; margin-bottom: 20px;">
          ${mol.metricCard({ title: "Train", value: `${Math.round(trainRatio * 100)}%`, trend: "positive" })}
          ${mol.metricCard({ title: "Test", value: `${Math.round((1 - trainRatio) * 100)}%`, trend: "neutral" })}
        </div>
        <div class="ui-canvas" style="padding: 15px; display: flex; flex-wrap: wrap; gap: 2px; justify-content: center;">
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

  return `
    <div class="ui-card is-warning">
      <div class="ui-card-header">Matrice de Confusion</div>
      <div class="ui-card-body" style="display: flex; gap: 20px; flex-wrap: wrap;">
        <div class="ui-confusion-grid">
          <div class="ui-confusion-cell is-tp"><span class="value">${tp}</span><span class="label">TP</span></div>
          <div class="ui-confusion-cell is-fn"><span class="value">${fn}</span><span class="label">FN</span></div>
          <div class="ui-confusion-cell is-fp"><span class="value">${fp}</span><span class="label">FP</span></div>
          <div class="ui-confusion-cell is-tn"><span class="value">${tn}</span><span class="label">TN</span></div>
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
    <div class="ui-tree-node ${colorClass}">
      <div class="icon">🌲</div>
      <div class="id">N°${t}</div>
    </div>
  `);

  return `
    <div class="ui-card ${colorClass}">
      <div class="ui-card-header">Ensemble: ${mode}</div>
      <div class="ui-card-body">
        <div class="ui-ensemble-layout ${isBagging ? '' : 'is-row'}">
          <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;">
            ${treeNodesHtml.join(isBagging ? '' : '➡️')}
          </div>
          <div style="font-size: 1.5em; opacity: 0.5;">⬇️</div>
          ${atom.badge({ text: isBagging ? "Random Forest" : "XGBoost", colorClass })}
        </div>
        ${mol.terminalConsole({ header: "Logs", logs: trees.map(t => `Arbre ${t} prêt.`) })}
      </div>
    </div>
  `;
};

// Si tu le mets dans org.js, les imports sont déjà là.
// Si tu crées viz.js, ajoute ces imports :
// import { theme } from "./core.js";
// import * as atom from "./atom.js";

/**
 * 📈 Conteneur Dynamique Plotly
 * Génère un noeud DOM (et non un string) pour le montage du graphique.
 */
export const plotlyWrapper = ({ data, layout = {}, config = {}, title = "Visualisation", height = "400px" }) => {
  // 1. Création de l'élément racine (DOM Node)
  const container = document.createElement('div');
  container.className = "ui-card is-debug"; 
  
  // 2. Construction de l'en-tête et du corps
  let headerHtml = title ? `<div class="ui-card-header">${title}</div>` : '';
  container.innerHTML = `
    ${headerHtml}
    <div class="ui-card-body" style="padding: 0; display: flex; justify-content: center;">
      <div class="plot-container" style="width: 100%; height: ${height};"></div>
    </div>
  `;
  
  const plotNode = container.querySelector('.plot-container');

  // 3. Injection du thème Solarized dans le layout Plotly
  // Plotly gère parfois mal les variables CSS brutes var(--...), on utilise les équivalents hex/rgba
  const themeLayout = {
    paper_bgcolor: 'rgba(0,0,0,0)', // Fond transparent pour voir la carte ui-card
    plot_bgcolor: 'rgba(0,0,0,0)',
    colorway: [
      '#268bd2', // Blue
      '#859900', // Green
      '#2aa198', // Cyan
      '#cb4b16', // Orange
      '#dc322f', // Red
      '#d33682', // Magenta
      '#6c71c4', // Violet
      '#b58900'  // Yellow
    ],
    font: { 
      family: theme.fontSans, 
      color: '#839496' // Base0
    },
    xaxis: { 
      gridcolor: 'rgba(88, 110, 117, 0.15)', // Grille discrète
      zerolinecolor: '#586e75' // Base01
    },
    yaxis: { 
      gridcolor: 'rgba(88, 110, 117, 0.15)',
      zerolinecolor: '#586e75'
    },
    margin: { t: 40, r: 20, b: 40, l: 40 },
    ...layout // Permet d'écraser la config par défaut si besoin
  };

  const finalConfig = { responsive: true, displayModeBar: false, ...config };

  // 4. Rendu différé : on s'assure que OJS a le temps d'insérer le noeud dans la page
  setTimeout(() => {
    if (typeof Plotly !== 'undefined') {
      Plotly.newPlot(plotNode, data, themeLayout, finalConfig);
    } else {
      plotNode.innerHTML = `<div style="padding: 20px;">${atom.logLine({ message: "Erreur: Plotly n'est pas chargé sur cette page.", type: "danger" })}</div>`;
    }
  }, 10);

  return container; // Retourne l'objet DOM, pas un string !
};

/**
 * 📉 Simulateur de Régression Linéaire (Organisme)
 */
export const linearRegressionSim = ({ 
  pointsX = [1, 2, 3, 4, 5], 
  pointsY = [2.1, 3.8, 6.5, 9.2, 11.1], 
  slope = 2, 
  intercept = 0 
}) => {
  
  // Trace 1 : Le nuage de points (Scatter)
  const scatterTrace = {
    x: pointsX,
    y: pointsY,
    mode: 'markers',
    type: 'scatter',
    name: 'Données (Train)',
    marker: { color: '#2aa198', size: 10 } // Vert Solarized (Cyan)
  };

  // Trace 2 : La droite de régression dynamique (Line)
  const lineX = [Math.min(...pointsX) - 1, Math.max(...pointsX) + 1];
  const lineY = lineX.map(x => slope * x + intercept);
  
  const lineTrace = {
    x: lineX,
    y: lineY,
    mode: 'lines',
    type: 'scatter',
    name: 'Modèle (f(x) = ax + b)',
    line: { color: '#b58900', width: 3 } // Jaune Solarized
  };

  return plotlyWrapper({
    title: "Ajustement du Modèle : Régression Linéaire",
    data: [scatterTrace, lineTrace],
    layout: {
      xaxis: { title: 'Variable Explicative (X)' },
      yaxis: { title: 'Variable Cible (Y)' },
      showlegend: true,
      legend: { orientation: 'h', y: -0.2 }
    }
  });
};