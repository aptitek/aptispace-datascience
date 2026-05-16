// ==========================================
// atom.js - Les briques indivisibles (DRY/KISS)
// ==========================================
import { theme } from "./core.js";

/**
 * 📝 Texte générique paramétrable
 */
export const text = ({ content, type = "body", color = "inherit" }) => {
  const classMap = {
    title: "font-size: 1.4em; font-weight: bold; margin-bottom: 0.5em;",
    label: "ui-card-header", // Reuse header style for labels
    value: `font-size: 1.2em; font-family: ${theme.fontMono}; font-weight: bold;`,
    body: "font-size: 1em;"
  };
  
  return `<div class="atom-text-${type}" style="${classMap[type] || ""}; color: ${color};">${content}</div>`;
};

/**
 * 🏷️ Badge / Tag
 */
export const badge = ({ text, colorClass = "" }) => `
  <span class="ui-badge ${colorClass}">${text}</span>
`;

/**
 * 📊 Jauge / ProgressBar
 */
export const progressBar = ({ value, max = 100, color = "var(--sol-yellow)" }) => {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  return `
    <div style="width: 100%; background: var(--sol-base2); border-radius: 3px; height: 6px; display: flex; overflow: hidden;">
      <div style="width: ${percent}%; background: ${color}; transition: width 0.3s ease;"></div>
    </div>
  `;
};

/**
 * 🟩 Data Block
 */
export const dataBlock = ({ text = "", type = "train" }) => {
  const colorClass = type === "train" ? "is-info" : (type === "test" ? "is-success" : "");
  return `
    <div class="ui-badge ${colorClass}" style="width: 18px; height: 18px; padding: 0; justify-content: center; display: inline-flex; font-size: 0.7em;">
      ${text}
    </div>
  `;
};

/**
 * 💻 Conteneur Fenêtre Terminal
 */
export const terminalWindow = ({ header = "Console", content = "" }) => `
  <div class="ui-terminal">
    <div class="ui-terminal-header">
      <span class="ui-terminal-title">${header}</span>
    </div>
    <div class="ui-terminal-body">
      ${content}
    </div>
  </div>
`;

/**
 * 💬 Ligne de Log Terminal
 */
export const logLine = ({ message, prefix = ">", type = "info" }) => {
  const colorMap = {
    info: "var(--sol-green)",
    warning: "var(--sol-yellow)",
    error: "var(--sol-red)",
    muted: "var(--sol-base01)"
  };
  return `
    <div style="margin-bottom: 4px; display: flex; gap: 8px;">
      <span style="color: var(--sol-base01); user-select: none;">${prefix}</span> 
      <span style="color: ${colorMap[type] || colorMap.info};">${message}</span>
    </div>
  `;
};

/**
 * ⏹️ Bouton
 */
export const button = ({ label }) => `
  <button class="ui-button">${label}</button>
`;