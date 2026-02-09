'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  type SettingsData,
  type ThemeColors,
  type FontSlot,
  DEFAULT_SETTINGS,
  STORAGE_KEY_SETTINGS,
  LEGACY_OVERRIDES_KEY,
  PRESETS,
  getPresetColors,
  getFontOption,
  FONT_OPTIONS,
} from './settings';
import { loadFont, applyFontVars } from './font-loader';
import { useTheme } from './theme';

interface SettingsContextValue {
  settings: SettingsData;
  resolvedMode: 'dark' | 'light';
  setPreset: (presetId: string) => void;
  setColorOverride: (cssVar: keyof ThemeColors, value: string) => void;
  removeColorOverride: (cssVar: keyof ThemeColors) => void;
  clearAllColorOverrides: () => void;
  setFont: (slot: FontSlot, family: string) => void;
  resetAll: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

function loadSettings(): SettingsData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        activePreset: parsed.activePreset || DEFAULT_SETTINGS.activePreset,
        colorOverrides: parsed.colorOverrides || {},
        fonts: { ...DEFAULT_SETTINGS.fonts, ...parsed.fonts },
      };
    }
  } catch { /* ignore */ }
  return { ...DEFAULT_SETTINGS, colorOverrides: {}, fonts: { ...DEFAULT_SETTINGS.fonts } };
}

function saveSettings(data: SettingsData) {
  localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(data));
}

function migrateLegacyOverrides(): Partial<ThemeColors> | null {
  try {
    const raw = localStorage.getItem(LEGACY_OVERRIDES_KEY);
    if (raw) {
      const overrides = JSON.parse(raw);
      localStorage.removeItem(LEGACY_OVERRIDES_KEY);
      return overrides;
    }
  } catch { /* ignore */ }
  return null;
}

function applyColors(presetId: string, mode: 'dark' | 'light', overrides: Partial<ThemeColors>) {
  const base = getPresetColors(presetId, mode);
  const effective = { ...base, ...overrides };

  const el = document.documentElement;
  for (const [cssVar, value] of Object.entries(effective)) {
    el.style.setProperty(cssVar, value);
  }
}

function clearInlineColors() {
  const el = document.documentElement;
  const preset = PRESETS[0];
  for (const cssVar of Object.keys(preset.dark)) {
    el.style.removeProperty(cssVar);
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SettingsData>(DEFAULT_SETTINGS);
  const [initialized, setInitialized] = useState(false);
  const { resolved } = useTheme();

  // Initialize from localStorage + migrate legacy
  useEffect(() => {
    let data = loadSettings();

    // Migrate legacy overrides
    const legacy = migrateLegacyOverrides();
    if (legacy && Object.keys(legacy).length > 0) {
      data = { ...data, colorOverrides: { ...data.colorOverrides, ...legacy } };
      saveSettings(data);
    }

    setSettings(data);
    setInitialized(true);
  }, []);

  // Apply colors whenever settings or theme mode changes
  useEffect(() => {
    if (!initialized) return;
    applyColors(settings.activePreset, resolved, settings.colorOverrides);
  }, [settings.activePreset, settings.colorOverrides, resolved, initialized]);

  // Apply fonts whenever settings change
  useEffect(() => {
    if (!initialized) return;

    const { fonts } = settings;
    const fallbacks = { body: '', headings: '', interface: '' };

    for (const slot of ['body', 'headings', 'interface'] as FontSlot[]) {
      const opt = getFontOption(slot, fonts[slot]);
      if (opt) {
        fallbacks[slot] = opt.fallback;
        if (opt.googleFamily) {
          loadFont(opt.googleFamily, opt.weights);
        }
      } else {
        fallbacks[slot] = FONT_OPTIONS[slot][0].fallback;
      }
    }

    applyFontVars(fonts, fallbacks);
  }, [settings.fonts, initialized]);

  const updateSettings = useCallback((updater: (prev: SettingsData) => SettingsData) => {
    setSettings((prev) => {
      const next = updater(prev);
      saveSettings(next);
      return next;
    });
  }, []);

  const setPreset = useCallback((presetId: string) => {
    updateSettings((prev) => ({
      ...prev,
      activePreset: presetId,
      colorOverrides: {},
    }));
  }, [updateSettings]);

  const setColorOverride = useCallback((cssVar: keyof ThemeColors, value: string) => {
    updateSettings((prev) => ({
      ...prev,
      colorOverrides: { ...prev.colorOverrides, [cssVar]: value },
    }));
  }, [updateSettings]);

  const removeColorOverride = useCallback((cssVar: keyof ThemeColors) => {
    updateSettings((prev) => {
      const next = { ...prev.colorOverrides };
      delete next[cssVar];
      return { ...prev, colorOverrides: next };
    });
  }, [updateSettings]);

  const clearAllColorOverrides = useCallback(() => {
    updateSettings((prev) => ({ ...prev, colorOverrides: {} }));
  }, [updateSettings]);

  const setFont = useCallback((slot: FontSlot, family: string) => {
    updateSettings((prev) => ({
      ...prev,
      fonts: { ...prev.fonts, [slot]: family },
    }));
  }, [updateSettings]);

  const resetAll = useCallback(() => {
    clearInlineColors();
    updateSettings(() => ({
      ...DEFAULT_SETTINGS,
      colorOverrides: {},
      fonts: { ...DEFAULT_SETTINGS.fonts },
    }));
  }, [updateSettings]);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      resolvedMode: resolved,
      setPreset,
      setColorOverride,
      removeColorOverride,
      clearAllColorOverrides,
      setFont,
      resetAll,
    }),
    [settings, resolved, setPreset, setColorOverride, removeColorOverride, clearAllColorOverrides, setFont, resetAll],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
