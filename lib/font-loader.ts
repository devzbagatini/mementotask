// ============================================
// MEMENTOTASK — Dynamic Google Fonts Loader
// ============================================

const LOADED_FONTS = new Set<string>();
const LINK_ID_PREFIX = 'mementotask-font-';

/**
 * Build a Google Fonts CSS2 URL for a given family.
 * Example: https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap
 */
function buildGoogleFontsUrl(googleFamily: string, weights: string): string {
  return `https://fonts.googleapis.com/css2?family=${googleFamily}:wght@${weights}&display=swap`;
}

/**
 * Load a Google Font at runtime by injecting a <link> into <head>.
 * No-ops if font is already loaded or is a bundled font (googleFamily is null).
 */
export function loadFont(googleFamily: string | null, weights: string): void {
  if (!googleFamily) return;
  if (typeof document === 'undefined') return;

  const id = `${LINK_ID_PREFIX}${googleFamily.replace(/\+/g, '-').toLowerCase()}`;

  if (LOADED_FONTS.has(id)) return;
  if (document.getElementById(id)) {
    LOADED_FONTS.add(id);
    return;
  }

  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = buildGoogleFontsUrl(googleFamily, weights);
  document.head.appendChild(link);
  LOADED_FONTS.add(id);
}

/**
 * Apply font CSS variables to :root.
 */
export function applyFontVars(fonts: { body: string; headings: string; interface: string }, fallbacks: { body: string; headings: string; interface: string }) {
  if (typeof document === 'undefined') return;
  const el = document.documentElement;
  el.style.setProperty('--font-body', `'${fonts.body}', ${fallbacks.body}`);
  el.style.setProperty('--font-headings', `'${fonts.headings}', ${fallbacks.headings}`);
  el.style.setProperty('--font-interface', `'${fonts.interface}', ${fallbacks.interface}`);
}

/**
 * Build the head script snippet for preventing FOUC.
 * This reads settings from localStorage and injects font links + CSS vars before first paint.
 */
export function buildFontHeadScript(): string {
  return `(function(){try{var s=JSON.parse(localStorage.getItem('mementotask_settings')||'{}');if(s.fonts){var slots={body:{fallback:'monospace'},headings:{fallback:'Georgia,serif'},interface:{fallback:'Arial,sans-serif'}};var fontMap={'JetBrains Mono':'JetBrains+Mono','IBM Plex Mono':'IBM+Plex+Mono','Source Code Pro':'Source+Code+Pro','Crimson Text':'Crimson+Text','Inter':'Inter'};for(var k in slots){if(s.fonts[k]){var g=fontMap[s.fonts[k]];if(g){var l=document.createElement('link');l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family='+g+':wght@400;500;600&display=swap';document.head.appendChild(l)}document.documentElement.style.setProperty('--font-'+k,"'"+s.fonts[k]+"', "+slots[k].fallback)}}}}catch(e){}})()`;
}
