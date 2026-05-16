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
    label: "ui-card-header", 
    value: "ui-value",
    body: "font-size: 1em;"
  };
  
  const className = classMap[type] || "";
  const styleAttr = color !== "inherit" ? `style="color: ${color};"` : "";
  return `<div class="${className} atom-text-${type}" ${styleAttr}>${content}</div>`;
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
export const progressBar = ({ value, max = 100, colorClass = "" }) => {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  return `
    <div class="ui-progress">
      <div class="ui-progress-bar ${colorClass}" style="width: ${percent}%;"></div>
    </div>
  `;
};

/**
 * 🟩 Data Block
 */
export const dataBlock = ({ type = "train" }) => {
  const colorClass = type === "train" ? "is-info" : (type === "test" ? "is-success" : "");
  return `<div class="ui-badge ${colorClass} is-block"></div>`;
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
export const logLine = ({ message, prefix = "(>", type = "info" }) => {
  const colorClass = `is-${type}`;
  return `
    <div class="ui-terminal-line ${colorClass}">
      <span class="prefix">${prefix}</span> 
      <span class="message">${message}</span>
    </div>
  `;
};

/**
 * ⏹️ Bouton
 */
export const button = ({ label }) => `
  <button class="ui-button">${label}</button>
`;