'use client';

import { useSettings } from '@/lib/settings-context';
import { getEffectiveColors } from '@/lib/settings';

export function SettingsPreview() {
  const { settings, resolvedMode } = useSettings();
  const colors = getEffectiveColors(settings.activePreset, resolvedMode, settings.colorOverrides);

  return (
    <div
      className="rounded-xl border border-border overflow-hidden"
      style={{ backgroundColor: colors['--surface-0'] }}
    >
      {/* Mini header */}
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b"
        style={{
          backgroundColor: colors['--surface-1'],
          borderColor: colors['--border'],
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="h-4 w-4 rounded"
            style={{ backgroundColor: colors['--accent-projeto'] }}
          />
          <span
            className="text-sm font-bold font-heading"
            style={{ color: colors['--text-primary'] }}
          >
            Mementotask
          </span>
        </div>
        <div
          className="rounded-md px-2.5 py-1 text-xs text-white font-medium"
          style={{ backgroundColor: colors['--accent-projeto'] }}
        >
          Novo Projeto
        </div>
      </div>

      {/* Mini content */}
      <div className="p-4 space-y-3">
        {/* Mode indicator */}
        <div
          className="text-[10px] font-medium px-2 py-1 rounded-md w-fit"
          style={{
            backgroundColor: colors['--surface-2'],
            color: colors['--text-secondary'],
            border: `1px solid ${colors['--border']}`,
          }}
        >
          Modo: {resolvedMode}
        </div>

        {/* Text preview */}
        <div className="space-y-1">
          <p className="text-sm font-medium" style={{ color: colors['--text-primary'] }}>
            Texto primario
          </p>
          <p className="text-xs" style={{ color: colors['--text-secondary'] }}>
            Texto secundario — lorem ipsum dolor sit amet
          </p>
          <p className="text-xs" style={{ color: colors['--text-muted'] }}>
            Texto muted
          </p>
        </div>

        {/* Accent colors */}
        <div className="flex gap-2">
          <div
            className="flex-1 rounded-md px-2 py-1.5 text-center text-[10px] text-white font-medium"
            style={{ backgroundColor: colors['--accent-projeto'] }}
          >
            Projeto
          </div>
          <div
            className="flex-1 rounded-md px-2 py-1.5 text-center text-[10px] text-white font-medium"
            style={{ backgroundColor: colors['--accent-tarefa'] }}
          >
            Tarefa
          </div>
          <div
            className="flex-1 rounded-md px-2 py-1.5 text-center text-[10px] text-white font-medium"
            style={{ backgroundColor: colors['--accent-subtarefa'] }}
          >
            Subtarefa
          </div>
        </div>

        {/* Priority badges */}
        <div className="flex gap-2">
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: `${colors['--priority-alta']}20`, color: colors['--priority-alta'] }}
          >
            Alta
          </span>
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: `${colors['--priority-media']}20`, color: colors['--priority-media'] }}
          >
            Media
          </span>
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: `${colors['--priority-baixa']}20`, color: colors['--priority-baixa'] }}
          >
            Baixa
          </span>
        </div>

        {/* Mini kanban columns */}
        <div className="flex gap-1.5">
          {[
            { label: 'A Fazer', bg: colors['--col-a-fazer'], dot: colors['--status-a-fazer'] },
            { label: 'Em Andamento', bg: colors['--col-em-andamento'], dot: colors['--status-em-andamento'] },
            { label: 'Concluido', bg: colors['--col-concluido'], dot: colors['--status-concluido'] },
          ].map((col) => (
            <div
              key={col.label}
              className="flex-1 rounded-md px-2 py-2"
              style={{ backgroundColor: col.bg }}
            >
              <div className="flex items-center gap-1 mb-1.5">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: col.dot }} />
                <span className="text-[9px] font-medium" style={{ color: colors['--text-secondary'] }}>
                  {col.label}
                </span>
              </div>
              <div
                className="rounded px-1.5 py-1 text-[9px]"
                style={{
                  backgroundColor: colors['--surface-1'],
                  color: colors['--text-muted'],
                  borderLeft: `2px solid ${col.dot}`,
                }}
              >
                Item
              </div>
            </div>
          ))}
        </div>

        {/* Surface layers */}
        <div className="flex gap-1.5">
          {['--surface-0', '--surface-1', '--surface-2', '--surface-3'].map((s) => (
            <div
              key={s}
              className="flex-1 rounded-md h-6 border"
              style={{
                backgroundColor: colors[s as keyof typeof colors],
                borderColor: colors['--border'],
              }}
              title={s}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
