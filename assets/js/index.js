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
  
  // 3. Source de vérité dynamique pour les couleurs CSS
  get colors() {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return {};
    }
    const getCssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return {
      green: getCssVar('--sol-green'),
      blue: getCssVar('--sol-blue'),
      orange: getCssVar('--sol-orange'),
      red: getCssVar('--sol-red'),
      yellow: getCssVar('--sol-yellow'),
      base03: getCssVar('--sol-base03'),
      base02: getCssVar('--sol-base02'),
      base01: getCssVar('--sol-base01'),
      base00: getCssVar('--sol-base00'),
      base0: getCssVar('--sol-base0'),
      base1: getCssVar('--sol-base1'),
      base2: getCssVar('--sol-base2'),
      base3: getCssVar('--sol-base3'),
      violet: getCssVar('--sol-violet'),
      cyan: getCssVar('--sol-cyan'),
      magenta: getCssVar('--sol-magenta')
    };
  },

  // 4. Configurations graphiques globales (Source de vérité visuelle)
  get chart() {
    return {
      height: "350px",
      lineWidth: 3,
      markerSize: 12,
      markerLineWidth: 2
    };
  },

  // 5. Utilitaire vital pour qu'Observable (OJS) affiche du HTML brut
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