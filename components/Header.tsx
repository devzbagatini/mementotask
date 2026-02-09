'use client';

import { Plus, Sun, Moon, Monitor, Hourglass, Settings } from 'lucide-react';
import { useMementotask } from '@/lib/context';
import { useTheme, type ThemeMode } from '@/lib/theme';

const THEME_ICONS: Record<ThemeMode, typeof Sun> = {
  system: Monitor,
  light: Sun,
  dark: Moon,
};

const THEME_LABELS: Record<ThemeMode, string> = {
  system: 'Tema: Sistema',
  light: 'Tema: Claro',
  dark: 'Tema: Escuro',
};

interface HeaderProps {
  onOpenSettings: () => void;
}

export function Header({ onOpenSettings }: HeaderProps) {
  const { openCreateModal } = useMementotask();
  const { mode, cycleMode } = useTheme();

  const ThemeIcon = THEME_ICONS[mode];

  return (
    <header className="border-b border-border bg-surface-1 font-ui">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <Hourglass className="h-6 w-6 text-accent-projeto" />
          <h1 className="text-xl font-bold text-text-primary leading-tight hidden sm:block font-heading">
            Mementotask
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSettings}
            className="rounded-xl p-2 text-text-muted hover:bg-surface-2 hover:text-text-primary transition-colors"
            title="Configuracoes"
          >
            <Settings className="h-4 w-4" />
          </button>
          <button
            onClick={cycleMode}
            className="rounded-xl p-2 text-text-muted hover:bg-surface-2 hover:text-text-primary transition-colors"
            title={THEME_LABELS[mode]}
          >
            <ThemeIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => openCreateModal('projeto')}
            className="flex items-center gap-2 rounded-xl bg-accent-projeto px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Novo Projeto</span>
          </button>
        </div>
      </div>
    </header>
  );
}
