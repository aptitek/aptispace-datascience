// ==========================================
// mol.js - Les Molécules (Assemblages fonctionnels)
// ==========================================
import { theme, utils } from "./core.js";
import * as atom from "./atom.js";

/**
 * 🎛️ Terminal Console (Le Terminal complet)
 * Assemble la structure du terminal avec une liste itérative de logs
 */
export const terminalConsole = ({ header = "Processus", logs = [] }) => {
  if (!logs || logs.length === 0) {
    return atom.terminalWindow({ header, content: atom.logLine({ message: "Aucune donnée à afficher", type: "muted" }) });
  }

  const logContent = logs.map(log => {
    // Si le log est une simple chaîne
    if (typeof log === 'string') return atom.logLine({ message: log });
    // Si le log est un objet { message, type, prefix }
    return atom.logLine(log);
  }).join('');

  return atom.terminalWindow({ header, content: logContent });
};

/**
 * 📈 Carte de Métrique (KPI / Metric Card)
 * Combine un titre, une valeur massive et potentiellement une jauge/évolution
 */
export const metricCard = ({ title, value, subtitle = "", trend = "neutral" }) => {
  // Définition de la couleur de la carte selon la tendance (trend)
  const borderColors = {
    positive: theme.colors.success,
    negative: theme.colors.danger,
    warning: theme.colors.warning,
    neutral: "var(--sol-base02)"
  };
  const borderColor = borderColors[trend] || borderColors.neutral;

  return `
    <div style="background-color: ${theme.colors.surface}; border-left: 4px solid ${borderColor}; border-radius: ${theme.radius}; padding: 15px; box-shadow: 0 2px 4px rgba(var(--sol-base03-rgb), 0.2); flex: 1; min-width: 150px; display: flex; flex-direction: column; gap: 8px;">
      ${atom.text({ content: title, type: "label" })}
      ${atom.text({ content: utils.formatNumber(value), type: "value", color: theme.colors.text })}
      ${subtitle ? atom.text({ content: subtitle, type: "body", color: theme.colors.textMuted }) : ''}
    </div>
  `;
};

/**
 * 📊 Ligne d'Observation (Data Row)
 * Affiche proprement une ligne d'un jeu de données (DataFrame) avec les types
 */
export const dataRow = ({ index, dataObject }) => {
  const columnsHtml = Object.entries(dataObject).map(([key, value]) => {
    const typeObj = typeof value;
    const badgeColor = typeObj === 'number' ? theme.colors.info : (typeObj === 'string' ? theme.colors.primary : theme.colors.surface);
    
    return `
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(var(--sol-base1-rgb), 0.05); padding: 4px 0;">
        <span style="color: ${theme.colors.textMuted}; font-size: 0.9em;">${key}</span>
        <div style="display: flex; gap: 8px; align-items: center;">
          <span style="font-family: ${theme.fontMono}; font-size: 0.9em; color: ${theme.colors.text};">${utils.truncateText(String(value), 30)}</span>
          ${atom.badge({ text: typeObj, color: badgeColor })}
        </div>
      </div>
    `;
  }).join('');

  return `
    <div style="background-color: ${theme.colors.background}; border: 1px solid var(--sol-base02); border-radius: ${theme.radiusSmall}; padding: 10px; margin-bottom: 8px;">
      <div style="font-size: 0.8em; color: ${theme.colors.textMuted}; margin-bottom: 8px; text-transform: uppercase;">
        Index: ${atom.badge({ text: String(index), color: "var(--sol-base02)" })}
      </div>
      ${columnsHtml}
    </div>
  `;
};

/**
 * 🧩 Texte Tokenisé / Séquence
 * Convertit un tableau de mots/tokens en une suite de badges (Idéal pour le NLP ou les listes)
 */
export const tokenizedText = ({ tokens = [], highlightIndex = -1 }) => {
  const tokensHtml = tokens.map((token, i) => {
    const isHighlighted = i === highlightIndex;
    const color = isHighlighted ? theme.colors.primary : "var(--sol-base02)";
    const textColor = isHighlighted ? "var(--sol-base03)" : "var(--sol-base3)"; // Contraste pour le texte
    
    return atom.badge({ text: token, color: color, textColor: textColor });
  }).join('<span style="margin: 0 2px;"></span>');

  return `
    <div style="display: flex; flex-wrap: wrap; gap: 4px; padding: 10px; background: rgba(var(--sol-base03-rgb), 0.1); border-radius: ${theme.radiusSmall};">
      ${tokensHtml}
    </div>
  `;
};

/**
 * ⚖️ Grille de Comparaison (Avant / Après)
 * Un conteneur générique pour juxtaposer deux états (ex: Data Wrangling)
 */
export const comparisonLayout = ({ leftTitle, leftContent, rightTitle, rightContent }) => `
  <div style="display: flex; gap: 20px; flex-wrap: wrap; margin: 15px 0;">
    <div style="flex: 1; min-width: 250px;">
      ${atom.text({ content: leftTitle, type: "label" })}
      <div style="margin-top: 10px;">${leftContent}</div>
    </div>
    <div style="display: flex; align-items: center; justify-content: center; color: ${theme.colors.textMuted};">
      ➡️
    </div>
    <div style="flex: 1; min-width: 250px;">
      ${atom.text({ content: rightTitle, type: "label" })}
      <div style="margin-top: 10px;">${rightContent}</div>
    </div>
  </div>
`;