'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, RotateCcw } from 'lucide-react';

const OVERRIDES_KEY = 'mementotask_theme_overrides';

interface ThemeVar {
  label: string;
  cssVar: string;
}

const THEME_SECTIONS: { title: string; vars: ThemeVar[] }[] = [
  {
    title: 'Superficies',
    vars: [
      { label: 'Fundo', cssVar: '--background' },
      { label: 'Superficie 1', cssVar: '--surface-1' },
      { label: 'Superficie 2', cssVar: '--surface-2' },
      { label: 'Superficie 3', cssVar: '--surface-3' },
      { label: 'Hover', cssVar: '--surface-hover' },
      { label: 'Borda', cssVar: '--border' },
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

function getCurrentColor(cssVar: string): string {
  const val = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
  return val || '#000000';
}

function loadOverrides(): Record<string, string> {
  try {
    const raw = localStorage.getItem(OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveOverrides(overrides: Record<string, string>) {
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
}

function applyOverrides(overrides: Record<string, string>) {
  const el = document.documentElement;
  for (const [cssVar, value] of Object.entries(overrides)) {
    el.style.setProperty(cssVar, value);
  }
}

function clearOverrides() {
  const el = document.documentElement;
  const overrides = loadOverrides();
  for (const cssVar of Object.keys(overrides)) {
    el.style.removeProperty(cssVar);
  }
  localStorage.removeItem(OVERRIDES_KEY);
}

// Apply saved overrides on page load
if (typeof window !== 'undefined') {
  const saved = loadOverrides();
  if (Object.keys(saved).length > 0) {
    // Defer to ensure theme.css is loaded first
    requestAnimationFrame(() => applyOverrides(saved));
  }
}

export function ThemeCustomizer({ onClose }: { onClose: () => void }) {
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [resolvedColors, setResolvedColors] = useState<Record<string, string>>({});

  // Load initial state
  useEffect(() => {
    setOverrides(loadOverrides());
    const colors: Record<string, string> = {};
    for (const section of THEME_SECTIONS) {
      for (const v of section.vars) {
        colors[v.cssVar] = getCurrentColor(v.cssVar);
      }
    }
    setResolvedColors(colors);
  }, []);

  const handleChange = useCallback((cssVar: string, value: string) => {
    document.documentElement.style.setProperty(cssVar, value);
    setOverrides((prev) => {
      const next = { ...prev, [cssVar]: value };
      saveOverrides(next);
      return next;
    });
    setResolvedColors((prev) => ({ ...prev, [cssVar]: value }));
  }, []);

  const handleReset = useCallback(() => {
    clearOverrides();
    setOverrides({});
    // Re-read computed values after clearing
    requestAnimationFrame(() => {
      const colors: Record<string, string> = {};
      for (const section of THEME_SECTIONS) {
        for (const v of section.vars) {
          colors[v.cssVar] = getCurrentColor(v.cssVar);
        }
      }
      setResolvedColors(colors);
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-80 max-w-full bg-surface-1 border-l border-border overflow-y-auto shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface-1 px-4 py-3">
          <h2 className="text-sm font-semibold text-text-primary">Customizar Tema</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={handleReset}
              className="rounded p-1.5 text-text-muted hover:bg-surface-2 hover:text-text-primary transition-colors"
              title="Resetar para padrao"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="rounded p-1.5 text-text-muted hover:bg-surface-2 hover:text-text-primary transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-5">
          {THEME_SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                {section.title}
              </h3>
              <div className="space-y-2">
                {section.vars.map((v) => (
                  <label key={v.cssVar} className="flex items-center justify-between gap-2">
                    <span className="text-sm text-text-secondary">{v.label}</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={resolvedColors[v.cssVar] || '#000000'}
                        onChange={(e) => handleChange(v.cssVar, e.target.value)}
                        className="h-7 w-7 cursor-pointer rounded-lg border border-border bg-transparent p-0.5"
                      />
                      {overrides[v.cssVar] && (
                        <button
                          onClick={() => {
                            document.documentElement.style.removeProperty(v.cssVar);
                            setOverrides((prev) => {
                              const next = { ...prev };
                              delete next[v.cssVar];
                              saveOverrides(next);
                              return next;
                            });
                            requestAnimationFrame(() => {
                              setResolvedColors((prev) => ({
                                ...prev,
                                [v.cssVar]: getCurrentColor(v.cssVar),
                              }));
                            });
                          }}
                          className="text-xs text-text-muted hover:text-text-primary"
                          title="Resetar"
                        >
                          <RotateCcw className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
