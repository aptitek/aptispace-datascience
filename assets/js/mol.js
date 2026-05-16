// ==========================================
// mol.js - Les Molécules (DRY/KISS)
// ==========================================
import { theme, utils } from "./core.js";
import * as atom from "./atom.js";

/**
 * 🎛️ Terminal Console
 */
export const terminalConsole = ({ header = "Processus", logs = [] }) => {
  if (!logs || logs.length === 0) {
    return atom.terminalWindow({ header, content: atom.logLine({ message: "Aucune donnée à afficher", type: "muted" }) });
  }

  const logContent = logs.map(log => {
    if (typeof log === 'string') return atom.logLine({ message: log });
    return atom.logLine(log);
  }).join('');

  return atom.terminalWindow({ header, content: logContent });
};

/**
 * 📈 Carte de Métrique
 */
export const metricCard = ({ title, value, subtitle = "", trend = "neutral" }) => {
  const trendClassMap = {
    positive: "is-success",
    negative: "is-danger",
    warning: "is-warning",
    neutral: "is-debug"
  };
  const colorClass = trendClassMap[trend] || trendClassMap.neutral;

  return `
    <div class="ui-card ${colorClass}" style="flex: 1; min-width: 150px;">
      <div class="ui-card-header">${title}</div>
      <div class="ui-card-body">
        ${atom.text({ content: utils.formatNumber(value), type: "value" })}
        ${subtitle ? `<div style="font-size: 0.85em; color: var(--sol-base01); margin-top: 4px;">${subtitle}</div>` : ''}
      </div>
    </div>
  `;
};

/**
 * 📊 Ligne d'Observation
 */
export const dataRow = ({ index, dataObject }) => {
  const columnsHtml = Object.entries(dataObject).map(([key, value]) => {
    const typeObj = typeof value;
    const badgeClass = typeObj === 'number' ? 'is-info' : (typeObj === 'string' ? 'is-success' : '');
    
    return `
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(var(--sol-base1-rgb), 0.05); padding: 6px 0;">
        <span style="color: var(--sol-base01); font-size: 0.85em;">${key}</span>
        <div style="display: flex; gap: 8px; align-items: center;">
          <span style="font-family: var(--font-code); font-size: 0.9em; color: var(--sol-base00);">${utils.truncateText(String(value), 30)}</span>
          ${atom.badge({ text: typeObj, colorClass: badgeClass })}
        </div>
      </div>
    `;
  }).join('');

  return `
    <div style="background-color: var(--sol-base3); border: 1px solid var(--sol-base2); border-radius: 8px; padding: 12px; margin-bottom: 10px;">
      <div style="font-size: 0.75em; color: var(--sol-base01); margin-bottom: 10px; text-transform: uppercase; font-weight: bold;">
        Index: ${atom.badge({ text: String(index) })}
      </div>
      ${columnsHtml}
    </div>
  `;
};

/**
 * 🧩 Texte Tokenisé
 */
export const tokenizedText = ({ tokens = [], highlightIndex = -1 }) => {
  const tokensHtml = tokens.map((token, i) => {
    const isHighlighted = i === highlightIndex;
    const colorClass = isHighlighted ? "is-info" : "";
    return atom.badge({ text: token, colorClass });
  }).join('<span style="margin: 0 2px;"></span>');

  return `
    <div style="display: flex; flex-wrap: wrap; gap: 6px; padding: 12px; background: rgba(var(--sol-base03-rgb), 0.03); border-radius: 8px;">
      ${tokensHtml}
    </div>
  `;
};

/**
 * ⚖️ Grille de Comparaison
 */
export const comparisonLayout = ({ leftTitle, leftContent, rightTitle, rightContent }) => `
  <div style="display: flex; gap: 20px; flex-wrap: wrap; margin: 20px 0; align-items: flex-start;">
    <div style="flex: 1; min-width: 250px;">
      <div class="ui-card-header" style="padding-left: 0; margin-bottom: 10px;">${leftTitle}</div>
      ${leftContent}
    </div>
    <div style="display: flex; align-items: center; justify-content: center; height: 100px; color: var(--sol-base1); font-size: 1.5em;">
      ➡️
    </div>
    <div style="flex: 1; min-width: 250px;">
      <div class="ui-card-header" style="padding-left: 0; margin-bottom: 10px;">${rightTitle}</div>
      ${rightContent}
    </div>
  </div>
`;