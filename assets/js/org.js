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

/**
 * ⚡ Exercice de Câblage Interactif (Patch Panel Matching)
 * Permet d'associer visuellement des éléments de gauche à des éléments de droite.
 */
export const cablingExercise = ({
  title = "Console de Câblage",
  instructions = "Reliez chaque fiche de gauche à son connecteur de droite.",
  leftItems = [],
  rightItems = [],
  feedbacks = {},
  successMessage = "Excellent ! Tous les signaux sont parfaitement synchronisés. Votre diagnostic est validé !",
  errorMessage = "Alerte : Le câblage est incorrect. Des signaux sont mal dirigés ou erronés."
}) => {
  // 1. Création de l'élément racine
  const container = document.createElement("div");
  container.className = "ui-cabling-card";

  // 2. Mélanger les éléments pour le défi
  const shuffledLeft = [...leftItems].sort(() => Math.random() - 0.5);
  const shuffledRight = [...rightItems].sort(() => Math.random() - 0.5);

  // 3. Injection du style CSS localisé pour isolation parfaite
  const styleEl = document.createElement("style");
  styleEl.textContent = `
    .ui-cabling-card {
      background: var(--sol-base03);
      color: var(--sol-base0);
      border: 1px solid var(--sol-base02);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 25px;
      font-family: var(--font-sans);
      position: relative;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
      overflow: visible;
    }
    .ui-cabling-header {
      margin-bottom: 24px;
      border-bottom: 1px solid rgba(var(--sol-base1-rgb), 0.15);
      padding-bottom: 14px;
    }
    .ui-cabling-title {
      font-family: var(--font-code);
      font-size: 1.15em;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: var(--sol-blue);
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .ui-cabling-title::before {
      content: "⚡";
      font-size: 1.25em;
    }
    .ui-cabling-desc {
      font-size: 0.9em;
      color: var(--sol-base1);
      line-height: 1.5;
    }
    .ui-cabling-workspace {
      display: flex;
      justify-content: space-between;
      position: relative;
      gap: 120px;
      margin-bottom: 24px;
      min-height: 280px;
    }
    .ui-cabling-svg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 10;
    }
    .ui-cabling-col {
      display: flex;
      flex-direction: column;
      gap: 20px;
      flex: 1;
      z-index: 5;
    }
    .ui-cabling-item {
      background: var(--sol-base02);
      border: 1px solid rgba(var(--sol-base1-rgb), 0.12);
      border-radius: 10px;
      padding: 14px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 15px;
      position: relative;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      user-select: none;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
    }
    .ui-cabling-col.is-left .ui-cabling-item {
      flex-direction: row;
      border-left: 4px solid var(--sol-base01);
    }
    .ui-cabling-col.is-right .ui-cabling-item {
      flex-direction: row-reverse;
      border-right: 4px solid var(--sol-base01);
    }
    .ui-cabling-item:hover {
      border-color: rgba(var(--sol-blue-rgb), 0.5);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
      transform: translateY(-2px);
    }
    .ui-cabling-label {
      font-size: 0.9em;
      font-weight: 600;
      line-height: 1.4;
      color: var(--sol-base0);
    }
    .ui-cabling-col.is-right .ui-cabling-label {
      font-family: var(--font-code);
      font-size: 0.85em;
      font-weight: bold;
      color: var(--sol-base1);
    }
    .ui-cabling-item.is-connected {
      border-color: rgba(var(--sol-base1-rgb), 0.25);
    }

    /* Sockets */
    .ui-cabling-socket {
      width: 22px;
      height: 22px;
      background: #02161b;
      border: 3.5px solid var(--sol-base01);
      border-radius: 50%;
      cursor: pointer;
      position: relative;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: inset 0 3px 6px rgba(0,0,0,0.6), 0 0 0 rgba(0,0,0,0);
      flex-shrink: 0;
    }
    .ui-cabling-socket::after {
      content: "";
      position: absolute;
      top: 5px;
      left: 5px;
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: var(--sol-base01);
      transition: all 0.2s ease;
    }
    .ui-cabling-socket:hover {
      transform: scale(1.25);
      border-color: var(--sol-cyan);
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.6), 0 0 12px rgba(var(--sol-cyan-rgb), 0.6);
    }
    .ui-cabling-socket.is-active {
      border-color: var(--sol-yellow) !important;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.6), 0 0 15px var(--sol-yellow) !important;
      animation: pulse-yellow 1s infinite alternate;
    }
    .ui-cabling-socket.is-active::after {
      background: var(--sol-yellow);
    }

    @keyframes pulse-yellow {
      0% { transform: scale(1.1); }
      100% { transform: scale(1.3); }
    }

    /* Wire drawing overlay */
    .ui-cabling-wire {
      stroke-width: 5px;
      stroke-linecap: round;
      fill: none;
      filter: drop-shadow(0 3px 5px rgba(0,0,0,0.4));
      transition: stroke 0.35s ease, stroke-dasharray 0.35s ease, filter 0.35s ease;
    }
    .ui-cabling-wire.is-draft {
      stroke: var(--sol-yellow);
      stroke-width: 4px;
      stroke-dasharray: 6, 6;
      filter: drop-shadow(0 0 5px var(--sol-yellow));
    }

    /* Electricity flow animation for correct links */
    @keyframes cable-flow {
      to {
        stroke-dashoffset: -32;
      }
    }
    .ui-cabling-wire.is-correct {
      stroke: var(--sol-green) !important;
      stroke-dasharray: 10, 6;
      animation: cable-flow 0.8s linear infinite;
      filter: drop-shadow(0 0 8px rgba(var(--sol-green-rgb), 0.8));
    }
    
    /* Vibrate and flashing for errors */
    @keyframes wire-shake {
      0% { transform: translate(1.5px, 0.5px) rotate(0.2deg); }
      50% { transform: translate(-1.5px, -0.5px) rotate(-0.2deg); }
      100% { transform: translate(1px, -1px) rotate(0.1deg); }
    }
    .ui-cabling-wire.is-incorrect {
      stroke: var(--sol-red) !important;
      animation: wire-shake 0.15s ease-in-out infinite;
      filter: drop-shadow(0 0 8px rgba(var(--sol-red-rgb), 0.7));
    }

    /* LED Glowing auras for validated connections */
    .ui-cabling-socket.is-correct-aura {
      animation: aura-pulse-green 1.2s infinite alternate cubic-bezier(0.4, 0, 0.2, 1);
    }
    @keyframes aura-pulse-green {
      0% {
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.6), 0 0 8px var(--sol-green);
        border-color: var(--sol-green);
      }
      100% {
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.6), 0 0 22px var(--sol-green), 0 0 35px rgba(var(--sol-green-rgb), 0.5);
        border-color: #a5bd0c;
      }
    }

    .ui-cabling-socket.is-incorrect-aura {
      animation: aura-pulse-red 1.2s infinite alternate cubic-bezier(0.4, 0, 0.2, 1);
    }
    @keyframes aura-pulse-red {
      0% {
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.6), 0 0 8px var(--sol-red);
        border-color: var(--sol-red);
      }
      100% {
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.6), 0 0 26px var(--sol-red), 0 0 45px rgba(var(--sol-red-rgb), 0.6);
        border-color: #ff5e5b;
      }
    }

    /* Sparks Fontaine system */
    @keyframes spark-fly {
      0% {
        transform: translate3d(0, 0, 0) scale(1.2);
        opacity: 1;
      }
      80% {
        opacity: 0.9;
      }
      100% {
        transform: translate3d(var(--tx), var(--ty), 0) scale(0);
        opacity: 0;
      }
    }
    .ui-cabling-spark {
      position: absolute;
      top: 50%;
      left: 50%;
      border-radius: 50%;
      background: #fff;
      box-shadow: 0 0 5px #fff, 0 0 10px var(--sol-orange), 0 0 16px var(--sol-red);
      pointer-events: none;
      z-index: 100;
      animation: spark-fly 1s cubic-bezier(0.1, 0.8, 0.3, 1) infinite;
    }

    /* Controls block */
    .ui-cabling-actions {
      display: flex;
      gap: 15px;
      margin-top: 24px;
      border-top: 1px solid rgba(var(--sol-base1-rgb), 0.15);
      padding-top: 20px;
    }
    .ui-cabling-btn {
      font-family: var(--font-code);
      font-size: 0.85em;
      font-weight: 800;
      padding: 10px 22px;
      border: none;
      border-radius: 30px;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }
    .ui-cabling-btn.is-verify {
      background: var(--sol-blue);
      color: var(--sol-base3);
      box-shadow: 0 4px 10px rgba(var(--sol-blue-rgb), 0.25);
    }
    .ui-cabling-btn.is-verify:hover {
      background: #1e85ca;
      box-shadow: 0 6px 18px rgba(var(--sol-blue-rgb), 0.45);
      transform: translateY(-2px);
    }
    .ui-cabling-btn.is-reset {
      background: transparent;
      border: 1.5px solid var(--sol-base01);
      color: var(--sol-base1);
    }
    .ui-cabling-btn.is-reset:hover {
      background: rgba(var(--sol-base1-rgb), 0.08);
      color: var(--sol-base00);
      border-color: var(--sol-base1);
    }

    /* Feedback block */
    .ui-cabling-feedback-panel {
      margin-top: 24px;
      border-radius: 10px;
      padding: 20px;
      font-size: 0.95em;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: reveal-panel 0.35s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }
    @keyframes reveal-panel {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .ui-cabling-feedback-panel.is-success {
      background: rgba(var(--sol-green-rgb), 0.08);
      border-left: 5px solid var(--sol-green);
      color: var(--sol-green);
    }
    .ui-cabling-feedback-panel.is-error {
      background: rgba(var(--sol-red-rgb), 0.08);
      border-left: 5px solid var(--sol-red);
      color: var(--sol-red);
    }
    .ui-cabling-feedback-header {
      font-family: var(--font-code);
      font-weight: 800;
      font-size: 1.15em;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .ui-cabling-feedback-detail {
      color: var(--sol-base0);
      margin-top: 8px;
      font-size: 0.9em;
      list-style-type: none;
      padding-left: 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .ui-cabling-feedback-detail li {
      position: relative;
      padding-left: 24px;
      line-height: 1.5;
    }
    .ui-cabling-feedback-detail li::before {
      content: "🔍";
      position: absolute;
      left: 0;
      font-size: 1em;
    }
  `;
  container.appendChild(styleEl);

  // 4. Construction de la structure DOM
  const header = document.createElement("div");
  header.className = "ui-cabling-header";
  header.innerHTML = `
    <div class="ui-cabling-title">${title}</div>
    <div class="ui-cabling-desc">${instructions}</div>
  `;
  container.appendChild(header);

  const workspace = document.createElement("div");
  workspace.className = "ui-cabling-workspace";

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "ui-cabling-svg");
  workspace.appendChild(svg);

  const colLeft = document.createElement("div");
  colLeft.className = "ui-cabling-col is-left";

  shuffledLeft.forEach(item => {
    const itemEl = document.createElement("div");
    itemEl.className = "ui-cabling-item";
    itemEl.id = `item-left-${item.id}`;
    itemEl.innerHTML = `
      <div class="ui-cabling-label">${item.label}</div>
      <div class="ui-cabling-socket" data-id="${item.id}" data-side="left" id="socket-left-${item.id}"></div>
    `;
    colLeft.appendChild(itemEl);
  });

  const colRight = document.createElement("div");
  colRight.className = "ui-cabling-col is-right";

  shuffledRight.forEach(item => {
    const itemEl = document.createElement("div");
    itemEl.className = "ui-cabling-item";
    itemEl.id = `item-right-${item.id}`;
    itemEl.innerHTML = `
      <div class="ui-cabling-label">${item.label}</div>
      <div class="ui-cabling-socket" data-id="${item.id}" data-side="right" id="socket-right-${item.id}"></div>
    `;
    colRight.appendChild(itemEl);
  });

  workspace.appendChild(colLeft);
  workspace.appendChild(colRight);
  container.appendChild(workspace);

  const actions = document.createElement("div");
  actions.className = "ui-cabling-actions";

  const verifyBtn = document.createElement("button");
  verifyBtn.className = "ui-cabling-btn is-verify";
  verifyBtn.textContent = "🔌 Synchroniser & Valider";

  const resetBtn = document.createElement("button");
  resetBtn.className = "ui-cabling-btn is-reset";
  resetBtn.textContent = "🧹 Débrancher Tout";

  actions.appendChild(verifyBtn);
  actions.appendChild(resetBtn);
  container.appendChild(actions);

  const feedbackPanel = document.createElement("div");
  feedbackPanel.className = "ui-cabling-feedback-panel";
  feedbackPanel.style.display = "none";
  container.appendChild(feedbackPanel);

  // 5. Gestion des états de connexion
  let userConnections = {}; // { leftId: rightId }
  let activeLeftSocket = null;
  let validated = false;
  let mouseX = 0;
  let mouseY = 0;

  // Couleurs néon Solarized pour les câbles
  const wireColors = [
    "var(--sol-cyan)",
    "var(--sol-magenta)",
    "var(--sol-orange)",
    "var(--sol-violet)",
    "var(--sol-blue)"
  ];

  // Calcul du centre d'un socket par rapport à l'espace de travail SVG
  const getSocketCenter = (socketEl) => {
    const rectWorkspace = workspace.getBoundingClientRect();
    const rectSocket = socketEl.getBoundingClientRect();
    return {
      x: rectSocket.left - rectWorkspace.left + rectSocket.width / 2,
      y: rectSocket.top - rectWorkspace.top + rectSocket.height / 2
    };
  };

  // Tracé d'un câble SVG
  const drawWirePath = (x1, y1, x2, y2, color, isDraft, isCorrect, isIncorrect) => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const dx = Math.abs(x2 - x1) * 0.55;
    const d = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
    
    path.setAttribute("d", d);
    let classes = "ui-cabling-wire";
    if (isDraft) classes += " is-draft";
    if (isCorrect) classes += " is-correct";
    if (isIncorrect) classes += " is-incorrect";
    
    path.setAttribute("class", classes);
    path.style.stroke = color;
    return path;
  };

  // Génération de fontaines d'étincelles électriques pour les courts-circuits
  const createSparks = (socketEl) => {
    const oldSparks = socketEl.querySelector(".ui-cabling-sparks-container");
    if (oldSparks) oldSparks.remove();

    const sparksContainer = document.createElement("div");
    sparksContainer.className = "ui-cabling-sparks-container";
    sparksContainer.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      pointer-events: none;
      z-index: 100;
    `;

    // Générer 18 étincelles par prise défaillante
    for (let i = 0; i < 18; i++) {
      const spark = document.createElement("div");
      spark.className = "ui-cabling-spark";
      
      // Angle aléatoire avec propulsion (effet fontaine d'arc électrique)
      const angle = Math.random() * Math.PI * 2;
      const distance = 40 + Math.random() * 60;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance - 25; // Trajectoire légèrement ascendante
      
      spark.style.setProperty("--tx", `${tx}px`);
      spark.style.setProperty("--ty", `${ty}px`);
      
      const size = 3 + Math.random() * 3.5;
      spark.style.width = `${size}px`;
      spark.style.height = `${size}px`;
      
      spark.style.animationDelay = `${Math.random() * 0.6}s`;
      spark.style.animationDuration = `${0.6 + Math.random() * 0.7}s`;
      
      sparksContainer.appendChild(spark);
    }
    socketEl.appendChild(sparksContainer);
  };

  // Mise à jour de l'affichage (câbles + sockets + surbrillances)
  const redraw = () => {
    // 1. Vider le SVG
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    // 2. Réinitialiser le style de tous les sockets et items
    container.querySelectorAll(".ui-cabling-socket").forEach(s => {
      s.style.borderColor = "";
      s.style.backgroundColor = "";
      s.style.boxShadow = "";
      s.classList.remove("is-correct-aura", "is-incorrect-aura");
      const sparks = s.querySelector(".ui-cabling-sparks-container");
      if (sparks) sparks.remove();
    });
    container.querySelectorAll(".ui-cabling-item").forEach(item => {
      item.classList.remove("is-connected");
      item.style.borderColor = "";
    });

    // 3. Dessiner chaque connexion permanente existante
    Object.entries(userConnections).forEach(([leftId, rightId]) => {
      const socketL = container.querySelector(`#socket-left-${leftId}`);
      const socketR = container.querySelector(`#socket-right-${rightId}`);
      const itemL = container.querySelector(`#item-left-${leftId}`);
      const itemR = container.querySelector(`#item-right-${rightId}`);

      if (socketL && socketR) {
        const cL = getSocketCenter(socketL);
        const cR = getSocketCenter(socketR);

        const leftIndex = leftItems.findIndex(item => item.id === leftId);
        const baseColor = wireColors[leftIndex % wireColors.length];

        let strokeColor = baseColor;
        let isCorrect = false;
        let isIncorrect = false;

        if (validated) {
          const itemConfig = leftItems.find(item => item.id === leftId);
          const correct = itemConfig && itemConfig.match === rightId;
          if (correct) {
            isCorrect = true;
            strokeColor = "var(--sol-green)";
          } else {
            isIncorrect = true;
            strokeColor = "var(--sol-red)";
          }
        }

        const wire = drawWirePath(cL.x, cL.y, cR.x, cR.y, strokeColor, false, isCorrect, isIncorrect);
        svg.appendChild(wire);

        itemL.classList.add("is-connected");
        itemR.classList.add("is-connected");

        const borderCol = strokeColor;
        socketL.style.borderColor = borderCol;
        socketR.style.borderColor = borderCol;
        socketL.style.boxShadow = `0 0 6px ${borderCol}`;
        socketR.style.boxShadow = `0 0 6px ${borderCol}`;
        
        socketL.style.backgroundColor = isCorrect ? "var(--sol-green)" : (isIncorrect ? "var(--sol-red)" : baseColor);
        socketR.style.backgroundColor = isCorrect ? "var(--sol-green)" : (isIncorrect ? "var(--sol-red)" : baseColor);

        // Appliquer l'effet d'aura et de fontaine d'étincelles
        if (validated) {
          if (isCorrect) {
            socketL.classList.add("is-correct-aura");
            socketR.classList.add("is-correct-aura");
          } else {
            socketL.classList.add("is-incorrect-aura");
            socketR.classList.add("is-incorrect-aura");
            
            // Créer les fontaines d'étincelles sur les deux extrémités s'il n'y en a pas encore
            if (!socketL.querySelector(".ui-cabling-sparks-container")) {
              createSparks(socketL);
            }
            if (!socketR.querySelector(".ui-cabling-sparks-container")) {
              createSparks(socketR);
            }
          }
        }
      }
    });

    // 4. Si un tracé est en cours, dessiner le câble temporaire
    if (activeLeftSocket) {
      const cL = getSocketCenter(activeLeftSocket);
      const draftColor = "var(--sol-yellow)";
      const draftWire = drawWirePath(cL.x, cL.y, mouseX, mouseY, draftColor, true, false, false);
      svg.appendChild(draftWire);
    }
  };

  const cancelDrafting = () => {
    if (activeLeftSocket) {
      activeLeftSocket.classList.remove("is-active");
      activeLeftSocket = null;
    }
    workspace.removeEventListener("mousemove", onMouseMove);
    redraw();
  };

  const onMouseMove = (e) => {
    if (!activeLeftSocket) return;
    const rectWorkspace = workspace.getBoundingClientRect();
    mouseX = e.clientX - rectWorkspace.left;
    mouseY = e.clientY - rectWorkspace.top;
    redraw();
  };

  // 6. Gestionnaires d'événements pour le câblage interactif
  workspace.addEventListener("click", (e) => {
    const socket = e.target.closest(".ui-cabling-socket");
    
    if (!socket) {
      if (activeLeftSocket) {
        cancelDrafting();
      }
      return;
    }

    const id = socket.getAttribute("data-id");
    const side = socket.getAttribute("data-side");

    if (side === "left") {
      if (activeLeftSocket) {
        cancelDrafting();
      }

      if (userConnections[id]) {
        delete userConnections[id];
        if (validated) resetValidationState();
      }

      activeLeftSocket = socket;
      socket.classList.add("is-active");
      
      const rectWorkspace = workspace.getBoundingClientRect();
      mouseX = e.clientX - rectWorkspace.left;
      mouseY = e.clientY - rectWorkspace.top;

      workspace.addEventListener("mousemove", onMouseMove);
      redraw();
    } else if (side === "right") {
      if (activeLeftSocket) {
        const leftId = activeLeftSocket.getAttribute("data-id");
        userConnections[leftId] = id;
        
        if (validated) resetValidationState();
        cancelDrafting();
      }
    }
  });

  const resetValidationState = () => {
    validated = false;
    feedbackPanel.style.display = "none";
    redraw();
  };

  // Validation
  verifyBtn.addEventListener("click", () => {
    const connectionsCount = Object.keys(userConnections).length;
    
    if (connectionsCount < leftItems.length) {
      feedbackPanel.style.display = "block";
      feedbackPanel.className = "ui-cabling-feedback-panel is-error";
      feedbackPanel.innerHTML = `
        <div class="ui-cabling-feedback-header">⚠️ SIGNAL BROUILLÉ - SYSTÈME INCOMPLET</div>
        <div style="color: var(--sol-base00);">L'analyse ne peut pas démarrer. Reliez TOUTES les prises femelles avant d'activer le courant électrique ! (${connectionsCount} / ${leftItems.length} fiches connectées)</div>
      `;
      return;
    }

    validated = true;
    let score = 0;
    
    leftItems.forEach(item => {
      if (userConnections[item.id] === item.match) {
        score++;
      }
    });

    const isAllCorrect = score === leftItems.length;

    feedbackPanel.style.display = "block";
    feedbackPanel.className = `ui-cabling-feedback-panel ${isAllCorrect ? "is-success" : "is-error"}`;
    
    let detailsHtml = "";
    leftItems.forEach(item => {
      const correct = userConnections[item.id] === item.match;
      const connectedRight = rightItems.find(r => r.id === userConnections[item.id]);
      const connectedName = connectedRight ? connectedRight.label : "Inconnue";

      if (correct) {
        detailsHtml += `<li><strong>${item.label}</strong> relié à <em>${connectedName}</em> : <span style="color: var(--sol-green); font-weight: bold;">[Signal OK]</span>. ${feedbacks[item.id] || ""}</li>`;
      } else {
        detailsHtml += `<li><strong>${item.label}</strong> relié à <em>${connectedName}</em> : <span style="color: var(--sol-red); font-weight: bold;">[Bruit / Erreur de phase]</span>. Mauvaise direction. Réfléchissez : est-ce qualitatif ou quantitatif ? Y a-t-il un ordre ?</li>`;
      }
    });

    feedbackPanel.innerHTML = `
      <div class="ui-cabling-feedback-header">
        ${isAllCorrect ? "✅ ANALYSE VALIDÉE - SYNCHRONISATION SIGNAL REPRÉSENTATIVE" : "❌ CONFLIT ÉLECTRIQUE - ERREUR DE BRANCHEMENT"} 
        (Score: ${score} / ${leftItems.length})
      </div>
      <div style="color: var(--sol-base00); margin-bottom: 12px; font-weight: 500;">
        ${isAllCorrect ? successMessage : errorMessage}
      </div>
      <ul class="ui-cabling-feedback-detail">
        ${detailsHtml}
      </ul>
    `;

    container.value = {
      userConnections,
      score,
      isCorrect: isAllCorrect
    };
    container.dispatchEvent(new Event("input", { bubbles: true }));

    redraw();
  });

  resetBtn.addEventListener("click", () => {
    userConnections = {};
    cancelDrafting();
    validated = false;
    feedbackPanel.style.display = "none";
    
    container.value = null;
    container.dispatchEvent(new Event("input", { bubbles: true }));
    
    redraw();
  });

  const resizeObserver = new ResizeObserver(() => {
    redraw();
  });
  resizeObserver.observe(container);

  setTimeout(redraw, 50);

  return container;
};