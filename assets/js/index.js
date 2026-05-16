// ==========================================
// index.js - Le Point d'Entrée Global
// ==========================================
import { theme } from "./core.js";
import * as atom from "./atom.js";
import * as mol from "./mol.js";
import * as org from "./org.js";

export { theme };

export const ui = {
  // 1. Accès hiérarchique préservé (pour la clarté architecturale si besoin)
  atom,
  mol,
  org,
  
  // 2. Création des alias directs à la racine
  ...atom,
  ...mol,
  ...org,
  
  // 3. Utilitaire vital pour qu'Observable (OJS) affiche du HTML brut
  render: (htmlString) => {
    const container = document.createElement('div');
    container.innerHTML = htmlString;
    return container;
  }
};

// Global fallback for OJS
if (typeof window !== "undefined") {
  window.ui = ui;
  window.theme = theme;
}