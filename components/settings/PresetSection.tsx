'use client';

import { PRESETS } from '@/lib/settings';
import { useSettings } from '@/lib/settings-context';
import { PresetCard } from './PresetCard';

export function PresetSection() {
  const { settings, setPreset } = useSettings();

  return (
    <section>
      <div className="mb-4">
        <h3 className="text-base font-semibold text-text-primary mb-1">Aparencia</h3>
        <p className="text-xs text-text-muted italic font-heading">
          &ldquo;Forma dat esse rei&rdquo;
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PRESETS.map((preset) => (
          <PresetCard
            key={preset.id}
            preset={preset}
            isActive={settings.activePreset === preset.id}
            onSelect={setPreset}
          />
        ))}
      </div>
    </section>
  );
}
