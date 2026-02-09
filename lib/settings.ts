// ============================================
// MEMENTOTASK — Settings Types, Presets & Defaults
// ============================================

export type FontSlot = 'body' | 'headings' | 'interface';

export interface FontOption {
  label: string;
  family: string;
  /** Google Fonts family name for runtime loading (null = bundled via next/font) */
  googleFamily: string | null;
  weights: string;
  fallback: string;
  category: string;
}

export interface FontSettings {
  body: string;       // font family name
  headings: string;
  interface: string;
}

export interface ThemeColors {
  // Surfaces
  '--background': string;
  '--foreground': string;
  '--surface-0': string;
  '--surface-1': string;
  '--surface-2': string;
  '--surface-3': string;
  '--surface-hover': string;
  '--border': string;
  '--border-light': string;
  // Text
  '--text-primary': string;
  '--text-secondary': string;
  '--text-muted': string;
  // Accents
  '--accent-projeto': string;
  '--accent-tarefa': string;
  '--accent-subtarefa': string;
  // Priority
  '--priority-alta': string;
  '--priority-media': string;
  '--priority-baixa': string;
  // Status
  '--status-a-fazer': string;
  '--status-em-andamento': string;
  '--status-pausado': string;
  '--status-concluido': string;
  '--status-cancelado': string;
  // Kanban columns
  '--col-a-fazer': string;
  '--col-em-andamento': string;
  '--col-pausado': string;
  '--col-concluido': string;
}

export interface Preset {
  id: string;
  name: string;
  motto: string;
  dark: ThemeColors;
  light: ThemeColors;
  /** 5 representative colors for the preview strip (dark) */
  stripDark: string[];
  /** 5 representative colors for the preview strip (light) */
  stripLight: string[];
}

export interface SettingsData {
  activePreset: string;
  colorOverrides: Partial<ThemeColors>;
  fonts: FontSettings;
}

// ============================================
// Font Options — mais variedade
// ============================================

export const FONT_OPTIONS: Record<FontSlot, FontOption[]> = {
  body: [
    { label: 'Fira Code', family: 'Fira Code', googleFamily: null, weights: '400;500;600', fallback: 'monospace', category: 'Monospace' },
    { label: 'JetBrains Mono', family: 'JetBrains Mono', googleFamily: 'JetBrains+Mono', weights: '400;500;600', fallback: 'monospace', category: 'Monospace' },
    { label: 'IBM Plex Mono', family: 'IBM Plex Mono', googleFamily: 'IBM+Plex+Mono', weights: '400;500;600', fallback: 'monospace', category: 'Monospace' },
    { label: 'Source Code Pro', family: 'Source Code Pro', googleFamily: 'Source+Code+Pro', weights: '400;500;600', fallback: 'monospace', category: 'Monospace' },
    { label: 'Inconsolata', family: 'Inconsolata', googleFamily: 'Inconsolata', weights: '400;500;600', fallback: 'monospace', category: 'Monospace' },
    { label: 'Space Mono', family: 'Space Mono', googleFamily: 'Space+Mono', weights: '400;700', fallback: 'monospace', category: 'Monospace' },
    { label: 'Victor Mono', family: 'Victor Mono', googleFamily: 'Victor+Mono', weights: '400;500;600', fallback: 'monospace', category: 'Monospace' },
    { label: 'Inter', family: 'Inter', googleFamily: 'Inter', weights: '400;500;600', fallback: 'Arial, sans-serif', category: 'Sans-serif' },
    { label: 'IBM Plex Sans', family: 'IBM Plex Sans', googleFamily: 'IBM+Plex+Sans', weights: '400;500;600', fallback: 'Arial, sans-serif', category: 'Sans-serif' },
  ],
  headings: [
    { label: 'Gentium Plus', family: 'Gentium Plus', googleFamily: null, weights: '400;700', fallback: 'Georgia, serif', category: 'Serif' },
    { label: 'Crimson Text', family: 'Crimson Text', googleFamily: 'Crimson+Text', weights: '400;600;700', fallback: 'Georgia, serif', category: 'Serif' },
    { label: 'Playfair Display', family: 'Playfair Display', googleFamily: 'Playfair+Display', weights: '400;600;700', fallback: 'Georgia, serif', category: 'Serif' },
    { label: 'Cormorant Garamond', family: 'Cormorant Garamond', googleFamily: 'Cormorant+Garamond', weights: '400;600;700', fallback: 'Georgia, serif', category: 'Serif' },
    { label: 'Libre Baskerville', family: 'Libre Baskerville', googleFamily: 'Libre+Baskerville', weights: '400;700', fallback: 'Georgia, serif', category: 'Serif' },
    { label: 'EB Garamond', family: 'EB Garamond', googleFamily: 'EB+Garamond', weights: '400;600;700', fallback: 'Georgia, serif', category: 'Serif' },
    { label: 'Space Grotesk', family: 'Space Grotesk', googleFamily: 'Space+Grotesk', weights: '400;500;700', fallback: 'Arial, sans-serif', category: 'Sans-serif' },
    { label: 'Sora', family: 'Sora', googleFamily: 'Sora', weights: '400;600;700', fallback: 'Arial, sans-serif', category: 'Sans-serif' },
  ],
  interface: [
    { label: 'Geist', family: 'Geist', googleFamily: null, weights: '400;500;600', fallback: 'Arial, sans-serif', category: 'Sans-serif' },
    { label: 'Inter', family: 'Inter', googleFamily: 'Inter', weights: '400;500;600', fallback: 'Arial, sans-serif', category: 'Sans-serif' },
    { label: 'DM Sans', family: 'DM Sans', googleFamily: 'DM+Sans', weights: '400;500;600', fallback: 'Arial, sans-serif', category: 'Sans-serif' },
    { label: 'Plus Jakarta Sans', family: 'Plus Jakarta Sans', googleFamily: 'Plus+Jakarta+Sans', weights: '400;500;600', fallback: 'Arial, sans-serif', category: 'Sans-serif' },
    { label: 'Manrope', family: 'Manrope', googleFamily: 'Manrope', weights: '400;500;600', fallback: 'Arial, sans-serif', category: 'Sans-serif' },
    { label: 'Outfit', family: 'Outfit', googleFamily: 'Outfit', weights: '400;500;600', fallback: 'Arial, sans-serif', category: 'Sans-serif' },
  ],
};

// ============================================
// Color Presets — cada um com dark + light
// ============================================

export const PRESETS: Preset[] = [
  {
    id: 'memento-mori',
    name: 'Memento Mori',
    motto: 'Respice post te, hominem te esse memento',
    stripDark: ['#050505', '#1a1a1a', '#8c1c13', '#b89a6a', '#d4cabb'],
    stripLight: ['#f4f0e8', '#e0d8c8', '#7a1a12', '#5c4a32', '#2a2018'],
    dark: {
      '--background': '#050505',
      '--foreground': '#d4cabb',
      '--surface-0': '#050505',
      '--surface-1': '#0a0a0a',
      '--surface-2': '#111111',
      '--surface-3': '#1e1c1a',
      '--surface-hover': '#2a2826',
      '--border': '#1a1918',
      '--border-light': '#252320',
      '--text-primary': '#d4cabb',
      '--text-secondary': '#8a8070',
      '--text-muted': '#5a5248',
      '--accent-projeto': '#8c1c13',
      '--accent-tarefa': '#6a7a4a',
      '--accent-subtarefa': '#7a6a50',
      '--priority-alta': '#8c1c13',
      '--priority-media': '#b89a6a',
      '--priority-baixa': '#6a7a4a',
      '--status-a-fazer': '#5a5248',
      '--status-em-andamento': '#8c1c13',
      '--status-pausado': '#b89a6a',
      '--status-concluido': '#6a7a4a',
      '--status-cancelado': '#8c1c13',
      '--col-a-fazer': '#0a0a09',
      '--col-em-andamento': '#0e0908',
      '--col-pausado': '#0e0c08',
      '--col-concluido': '#090c08',
    },
    light: {
      '--background': '#e8e0d0',
      '--foreground': '#1a1410',
      '--surface-0': '#f4f0e8',
      '--surface-1': '#faf6f0',
      '--surface-2': '#ece6da',
      '--surface-3': '#ddd4c4',
      '--surface-hover': '#cec4b2',
      '--border': '#cec4b2',
      '--border-light': '#ddd4c4',
      '--text-primary': '#1a1410',
      '--text-secondary': '#4a3e30',
      '--text-muted': '#8a7e6e',
      '--accent-projeto': '#7a1a12',
      '--accent-tarefa': '#4a6a32',
      '--accent-subtarefa': '#5c4a32',
      '--priority-alta': '#7a1a12',
      '--priority-media': '#8a7020',
      '--priority-baixa': '#4a6a32',
      '--status-a-fazer': '#8a7e6e',
      '--status-em-andamento': '#7a1a12',
      '--status-pausado': '#8a7020',
      '--status-concluido': '#4a6a32',
      '--status-cancelado': '#7a1a12',
      '--col-a-fazer': '#f0ebe2',
      '--col-em-andamento': '#f0e8e4',
      '--col-pausado': '#f0ece0',
      '--col-concluido': '#eaf0e4',
    },
  },
  {
    id: 'stoic',
    name: 'Stoic',
    motto: 'Sustine et abstine',
    stripDark: ['#0f1419', '#1e293b', '#64748b', '#5b9a8b', '#7c8db5'],
    stripLight: ['#f1f5f9', '#cbd5e1', '#475569', '#3d8b7a', '#5a6fa0'],
    dark: {
      '--background': '#0f1419',
      '--foreground': '#e2e8f0',
      '--surface-0': '#0f1419',
      '--surface-1': '#151c24',
      '--surface-2': '#1c2530',
      '--surface-3': '#334155',
      '--surface-hover': '#475569',
      '--border': '#1e293b',
      '--border-light': '#334155',
      '--text-primary': '#e2e8f0',
      '--text-secondary': '#94a3b8',
      '--text-muted': '#64748b',
      '--accent-projeto': '#64748b',
      '--accent-tarefa': '#5b9a8b',
      '--accent-subtarefa': '#7c8db5',
      '--priority-alta': '#c45c5c',
      '--priority-media': '#b8a04a',
      '--priority-baixa': '#5b9a8b',
      '--status-a-fazer': '#64748b',
      '--status-em-andamento': '#6482a4',
      '--status-pausado': '#a89050',
      '--status-concluido': '#5b9a8b',
      '--status-cancelado': '#c45c5c',
      '--col-a-fazer': '#131a22',
      '--col-em-andamento': '#131c26',
      '--col-pausado': '#1a1914',
      '--col-concluido': '#121e1c',
    },
    light: {
      '--background': '#dce2ea',
      '--foreground': '#0f172a',
      '--surface-0': '#f1f5f9',
      '--surface-1': '#f8fafc',
      '--surface-2': '#e2e8f0',
      '--surface-3': '#cbd5e1',
      '--surface-hover': '#94a3b8',
      '--border': '#cbd5e1',
      '--border-light': '#e2e8f0',
      '--text-primary': '#0f172a',
      '--text-secondary': '#475569',
      '--text-muted': '#94a3b8',
      '--accent-projeto': '#475569',
      '--accent-tarefa': '#3d8b7a',
      '--accent-subtarefa': '#5a6fa0',
      '--priority-alta': '#b83b3b',
      '--priority-media': '#a08530',
      '--priority-baixa': '#3d8b7a',
      '--status-a-fazer': '#94a3b8',
      '--status-em-andamento': '#4a6a90',
      '--status-pausado': '#a08530',
      '--status-concluido': '#3d8b7a',
      '--status-cancelado': '#b83b3b',
      '--col-a-fazer': '#f1f5f9',
      '--col-em-andamento': '#e8edf5',
      '--col-pausado': '#f5f3e8',
      '--col-concluido': '#e8f5f0',
    },
  },
  {
    id: 'parchment',
    name: 'Parchment',
    motto: 'Lux in tenebris lucet',
    stripDark: ['#1a1610', '#2e2820', '#7c6350', '#5a7a52', '#7a5a8a'],
    stripLight: ['#f5f0e8', '#e0d8c8', '#7c6350', '#5a7a52', '#7a5a8a'],
    dark: {
      '--background': '#12100c',
      '--foreground': '#e8e0d4',
      '--surface-0': '#12100c',
      '--surface-1': '#1a1610',
      '--surface-2': '#221e18',
      '--surface-3': '#3a3428',
      '--surface-hover': '#4a4438',
      '--border': '#2e2820',
      '--border-light': '#3a3428',
      '--text-primary': '#e8e0d4',
      '--text-secondary': '#a89880',
      '--text-muted': '#7a6e5c',
      '--accent-projeto': '#9a7a5a',
      '--accent-tarefa': '#6a9a5a',
      '--accent-subtarefa': '#8a6a9a',
      '--priority-alta': '#c04030',
      '--priority-media': '#b8902a',
      '--priority-baixa': '#6a9a5a',
      '--status-a-fazer': '#7a6e5c',
      '--status-em-andamento': '#6a7a9a',
      '--status-pausado': '#b8902a',
      '--status-concluido': '#6a9a5a',
      '--status-cancelado': '#c04030',
      '--col-a-fazer': '#161410',
      '--col-em-andamento': '#141620',
      '--col-pausado': '#1a1810',
      '--col-concluido': '#101a14',
    },
    light: {
      '--background': '#ece5d8',
      '--foreground': '#2c2416',
      '--surface-0': '#f5f0e8',
      '--surface-1': '#faf7f2',
      '--surface-2': '#efe9de',
      '--surface-3': '#e0d8c8',
      '--surface-hover': '#d4ccba',
      '--border': '#d4ccba',
      '--border-light': '#e0d8c8',
      '--text-primary': '#2c2416',
      '--text-secondary': '#6b5c4a',
      '--text-muted': '#9a8b78',
      '--accent-projeto': '#7c6350',
      '--accent-tarefa': '#5a7a52',
      '--accent-subtarefa': '#7a5a8a',
      '--priority-alta': '#a04030',
      '--priority-media': '#9a7a20',
      '--priority-baixa': '#5a7a52',
      '--status-a-fazer': '#9a8b78',
      '--status-em-andamento': '#5a6a8a',
      '--status-pausado': '#9a7a20',
      '--status-concluido': '#5a7a52',
      '--status-cancelado': '#a04030',
      '--col-a-fazer': '#f0ebe2',
      '--col-em-andamento': '#eae8ef',
      '--col-pausado': '#f0ede2',
      '--col-concluido': '#e8efe6',
    },
  },
  {
    id: 'midnight-scholar',
    name: 'Midnight Scholar',
    motto: 'Per aspera ad astra',
    stripDark: ['#08080c', '#1e1e2e', '#d4a843', '#5a9e6a', '#8a6ab0'],
    stripLight: ['#f5f3ee', '#e0ddd4', '#b8922a', '#4a8a5a', '#7a5aa0'],
    dark: {
      '--background': '#08080c',
      '--foreground': '#e8e4dc',
      '--surface-0': '#08080c',
      '--surface-1': '#0e0e14',
      '--surface-2': '#14141c',
      '--surface-3': '#2a2a3a',
      '--surface-hover': '#3a3a4e',
      '--border': '#1e1e2e',
      '--border-light': '#2a2a3a',
      '--text-primary': '#e8e4dc',
      '--text-secondary': '#a8a498',
      '--text-muted': '#6a6870',
      '--accent-projeto': '#d4a843',
      '--accent-tarefa': '#5a9e6a',
      '--accent-subtarefa': '#8a6ab0',
      '--priority-alta': '#c44a3a',
      '--priority-media': '#c9a227',
      '--priority-baixa': '#5a9e6a',
      '--status-a-fazer': '#6a6870',
      '--status-em-andamento': '#4a7ab0',
      '--status-pausado': '#c9a227',
      '--status-concluido': '#5a9e6a',
      '--status-cancelado': '#c44a3a',
      '--col-a-fazer': '#0c0c12',
      '--col-em-andamento': '#0c1020',
      '--col-pausado': '#161410',
      '--col-concluido': '#0c1610',
    },
    light: {
      '--background': '#e4e0d8',
      '--foreground': '#1a1a24',
      '--surface-0': '#f5f3ee',
      '--surface-1': '#faf8f4',
      '--surface-2': '#eceade',
      '--surface-3': '#e0ddd4',
      '--surface-hover': '#d0ccba',
      '--border': '#d0ccba',
      '--border-light': '#e0ddd4',
      '--text-primary': '#1a1a24',
      '--text-secondary': '#4a4a5a',
      '--text-muted': '#8a8880',
      '--accent-projeto': '#b8922a',
      '--accent-tarefa': '#4a8a5a',
      '--accent-subtarefa': '#7a5aa0',
      '--priority-alta': '#b03828',
      '--priority-media': '#a88a1a',
      '--priority-baixa': '#4a8a5a',
      '--status-a-fazer': '#8a8880',
      '--status-em-andamento': '#3a6a9a',
      '--status-pausado': '#a88a1a',
      '--status-concluido': '#4a8a5a',
      '--status-cancelado': '#b03828',
      '--col-a-fazer': '#f0eee6',
      '--col-em-andamento': '#e8eaf2',
      '--col-pausado': '#f2eee2',
      '--col-concluido': '#e6f0e6',
    },
  },
  {
    id: 'renaissance',
    name: 'Renaissance',
    motto: 'Ars longa, vita brevis',
    stripDark: ['#100c08', '#2a2018', '#a85a20', '#722f37', '#c5942a'],
    stripLight: ['#f8f3ed', '#ddd2c2', '#8b4513', '#722f37', '#c5942a'],
    dark: {
      '--background': '#100c08',
      '--foreground': '#ece4d8',
      '--surface-0': '#100c08',
      '--surface-1': '#181210',
      '--surface-2': '#201a14',
      '--surface-3': '#382e24',
      '--surface-hover': '#4a3e30',
      '--border': '#2a2218',
      '--border-light': '#382e24',
      '--text-primary': '#ece4d8',
      '--text-secondary': '#b0a088',
      '--text-muted': '#7a6a58',
      '--accent-projeto': '#a85a20',
      '--accent-tarefa': '#5a8a40',
      '--accent-subtarefa': '#8a3040',
      '--priority-alta': '#b02020',
      '--priority-media': '#c5942a',
      '--priority-baixa': '#5a8a40',
      '--status-a-fazer': '#7a6a58',
      '--status-em-andamento': '#5a5a8a',
      '--status-pausado': '#c5942a',
      '--status-concluido': '#5a8a40',
      '--status-cancelado': '#b02020',
      '--col-a-fazer': '#14100c',
      '--col-em-andamento': '#12101e',
      '--col-pausado': '#1a1610',
      '--col-concluido': '#101810',
    },
    light: {
      '--background': '#e8ddd0',
      '--foreground': '#2a1f14',
      '--surface-0': '#f8f3ed',
      '--surface-1': '#fdf9f4',
      '--surface-2': '#f0e8dc',
      '--surface-3': '#ddd2c2',
      '--surface-hover': '#d0c2ae',
      '--border': '#d0c2ae',
      '--border-light': '#ddd2c2',
      '--text-primary': '#2a1f14',
      '--text-secondary': '#5c4a38',
      '--text-muted': '#8a7a68',
      '--accent-projeto': '#8b4513',
      '--accent-tarefa': '#4a7a3a',
      '--accent-subtarefa': '#722f37',
      '--priority-alta': '#9a2020',
      '--priority-media': '#c5942a',
      '--priority-baixa': '#4a7a3a',
      '--status-a-fazer': '#8a7a68',
      '--status-em-andamento': '#5a5a9a',
      '--status-pausado': '#c5942a',
      '--status-concluido': '#4a7a3a',
      '--status-cancelado': '#9a2020',
      '--col-a-fazer': '#f2ede6',
      '--col-em-andamento': '#eceaf0',
      '--col-pausado': '#f2ede0',
      '--col-concluido': '#e8f0e4',
    },
  },
];

// ============================================
// Defaults
// ============================================

export const DEFAULT_FONTS: FontSettings = {
  body: 'Fira Code',
  headings: 'Gentium Plus',
  interface: 'Geist',
};

export const DEFAULT_SETTINGS: SettingsData = {
  activePreset: 'memento-mori',
  colorOverrides: {},
  fonts: { ...DEFAULT_FONTS },
};

export const STORAGE_KEY_SETTINGS = 'mementotask_settings';
export const STORAGE_KEY_THEME = 'mementotask_theme';
export const LEGACY_OVERRIDES_KEY = 'mementotask_theme_overrides';

// ============================================
// Theme variable sections (for color editor)
// ============================================

export interface ThemeVarDef {
  label: string;
  cssVar: keyof ThemeColors;
}

export interface ThemeSection {
  title: string;
  vars: ThemeVarDef[];
}

export const THEME_SECTIONS: ThemeSection[] = [
  {
    title: 'Superficies',
    vars: [
      { label: 'Fundo', cssVar: '--background' },
      { label: 'Primeiro plano', cssVar: '--foreground' },
      { label: 'Superficie 0', cssVar: '--surface-0' },
      { label: 'Superficie 1', cssVar: '--surface-1' },
      { label: 'Superficie 2', cssVar: '--surface-2' },
      { label: 'Superficie 3', cssVar: '--surface-3' },
      { label: 'Hover', cssVar: '--surface-hover' },
      { label: 'Borda', cssVar: '--border' },
      { label: 'Borda clara', cssVar: '--border-light' },
    ],
  },
  {
    title: 'Texto',
    vars: [
      { label: 'Primario', cssVar: '--text-primary' },
      { label: 'Secundario', cssVar: '--text-secondary' },
      { label: 'Muted', cssVar: '--text-muted' },
    ],
  },
  {
    title: 'Acentos',
    vars: [
      { label: 'Projeto', cssVar: '--accent-projeto' },
      { label: 'Tarefa', cssVar: '--accent-tarefa' },
      { label: 'Subtarefa', cssVar: '--accent-subtarefa' },
    ],
  },
  {
    title: 'Prioridade',
    vars: [
      { label: 'Alta', cssVar: '--priority-alta' },
      { label: 'Media', cssVar: '--priority-media' },
      { label: 'Baixa', cssVar: '--priority-baixa' },
    ],
  },
  {
    title: 'Status',
    vars: [
      { label: 'A Fazer', cssVar: '--status-a-fazer' },
      { label: 'Em Andamento', cssVar: '--status-em-andamento' },
      { label: 'Pausado', cssVar: '--status-pausado' },
      { label: 'Concluido', cssVar: '--status-concluido' },
      { label: 'Cancelado', cssVar: '--status-cancelado' },
    ],
  },
];

/** Look up a preset by id */
export function getPreset(id: string): Preset | undefined {
  return PRESETS.find((p) => p.id === id);
}

/** Get the colors for a preset in the given mode */
export function getPresetColors(presetId: string, mode: 'dark' | 'light'): ThemeColors {
  const preset = getPreset(presetId);
  if (!preset) return PRESETS[0].dark;
  return preset[mode];
}

/** Get effective colors: preset[mode] + overrides */
export function getEffectiveColors(presetId: string, mode: 'dark' | 'light', overrides: Partial<ThemeColors>): ThemeColors {
  return { ...getPresetColors(presetId, mode), ...overrides };
}

/** Get font option details by family name */
export function getFontOption(slot: FontSlot, family: string): FontOption | undefined {
  return FONT_OPTIONS[slot].find((f) => f.family === family);
}
