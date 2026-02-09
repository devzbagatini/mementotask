'use client';

import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useSettings } from '@/lib/settings-context';

interface SettingsHeaderProps {
  onBack: () => void;
}

export function SettingsHeader({ onBack }: SettingsHeaderProps) {
  const { resetAll } = useSettings();

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="rounded-lg p-2 text-text-muted hover:bg-surface-2 hover:text-text-primary transition-colors"
          title="Voltar"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-text-primary font-heading">Configuracoes</h2>
          <p className="text-xs text-text-muted italic font-heading">
            &ldquo;Nosce te ipsum&rdquo;
          </p>
        </div>
      </div>

      <button
        onClick={resetAll}
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-text-muted hover:bg-surface-2 hover:text-text-primary border border-border transition-colors"
        title="Restaurar padrao"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Restaurar Padrao</span>
      </button>
    </div>
  );
}
