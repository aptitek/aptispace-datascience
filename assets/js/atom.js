// ==========================================
// atom.js - Les briques indivisibles
// ==========================================
import { theme } from "./core.js";

/**
 * 📝 Texte générique paramétrable
 * Variantes : title, label, value, body
 */
export const text = ({ content, type = "body", color = theme.colors.text }) => {
  const styles = {
    title: `font-size: 1.4em; font-weight: bold; color: ${theme.colors.primary}; margin-bottom: 0.5em;`,
    label: `font-size: 0.85em; text-transform: uppercase; letter-spacing: 0.5px; color: var(--sol-base1); margin-bottom: 0.25em; display: block;`,
    value: `font-size: 1.2em; font-family: ${theme.fontMono}; color: ${color}; font-weight: bold;`,
    body: `font-size: 1em; color: ${color};`
  };
  
  return `<div style="${styles[type] || styles.body}">${content}</div>`;
};

/**
 * 🏷️ Badge / Tag
 * Utilisé pour les types de données (int64, NaN) ou les statuts
 */
export const badge = ({ text, color = theme.colors.surface, textColor = "var(--sol-base3)", tooltip = "" }) => `
  <span title="${tooltip}" style="background: ${color}; color: ${textColor}; padding: 3px 8px; border-radius: 4px; font-size: 0.85em; font-family: ${theme.fontMono}; display: inline-flex; align-items: center; border: 1px solid rgba(var(--sol-base1-rgb), 0.2); white-space: nowrap;">
    ${text}
  </span>
`;

/**
 * 📊 Jauge / ProgressBar (Purement visuel)
 * Utilisé pour afficher le % de valeurs manquantes ou la progression
 */
export const progressBar = ({ value, max = 100, color = theme.colors.primary, height = "6px", bg = theme.colors.surface }) => {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  return `
    <div style="width: 100%; background: ${bg}; border-radius: 3px; overflow: hidden; height: ${height}; display: flex;">
      <div style="width: ${percent}%; background: ${color}; height: 100%; transition: width 0.3s ease;"></div>
    </div>
  `;
};

/**
 * 🟩 Data Block (Carré de donnée)
 * Utilisé pour les simulateurs de Split (Train/Test) ou la représentation de Tenseurs
 */
export const dataBlock = ({ text = "", type = "train", size = "20px" }) => {
  const bgColor = type === "train" ? theme.colors.primary : (type === "test" ? theme.colors.success : theme.colors.surface);
  return `
    <div title="Type: ${type}" style="background: ${bgColor}; color: var(--sol-base3); width: ${size}; height: ${size}; display: inline-flex; align-items: center; justify-content: center; font-size: 0.6em; border-radius: 2px; margin: 1px; font-family: ${theme.fontMono}; opacity: 0.9;">
      ${text}
    </div>
  `;
};

/**
 * 💻 Conteneur Fenêtre Terminal
 * L'enveloppe extérieure de tes terminaux (sans le contenu itératif)
 */
export const terminalWindow = ({ header = "Console", content = "" }) => `
  <div class="terminal-window" style="background-color: ${theme.colors.terminalBg}; border: 1px solid var(--sol-base02); border-radius: ${theme.radius}; padding: 15px; font-family: ${theme.fontMono}; box-shadow: 0 4px 12px rgba(var(--sol-base03-rgb), 0.4); margin-bottom: 1rem;">
    <div style="color: ${theme.colors.terminalMuted}; margin-bottom: 12px; font-size: 12px; border-bottom: 1px solid rgba(var(--sol-base1-rgb), 0.05); padding-bottom: 8px; display: flex; gap: 8px; align-items: center;">
      <span style="letter-spacing: 2px;">🔴🟡🟢</span> 
      <span style="opacity: 0.8;">${header}</span>
    </div>
    <div style="color: ${theme.colors.terminalText}; overflow-x: auto; font-size: 0.9em; line-height: 1.5;">
      ${content}
    </div>
  </div>
`;

/**
 * 💬 Ligne de Log Terminal
 * Pour afficher une trace d'exécution ou une erreur
 */
export const logLine = ({ message, prefix = ">", type = "info" }) => {
  const colors = {
    info: theme.colors.terminalText,
    warning: theme.colors.primary,
    error: theme.colors.danger,
    muted: theme.colors.terminalMuted
  };
  const msgColor = colors[type] || colors.info;

  return `
    <div style="margin-bottom: 4px; display: flex; gap: 8px;">
      <span style="color: ${theme.colors.terminalMuted}; user-select: none;">${prefix}</span> 
      <span style="color: ${msgColor};">${message}</span>
    </div>
  `;
};

/**
 * ⏹️ Bouton (Design UI)
 * Attention : En OJS, Inputs.button() est recommandé pour l'interactivité. 
 * Cet atome sert uniquement si tu construis des interfaces cliquables complexes hors Inputs natifs.
 */
export const button = ({ label, variant = "primary" }) => {
  const bg = variant === "primary" ? theme.colors.primary : theme.colors.surface;
  return `
    <button style="background: ${bg}; color: var(--sol-base3); border: 1px solid rgba(var(--sol-base1-rgb), 0.2); padding: 6px 12px; border-radius: 4px; cursor: pointer; font-family: inherit; font-size: 0.9em; transition: all 0.2s ease;">
      ${label}
    </button>
  `;
};