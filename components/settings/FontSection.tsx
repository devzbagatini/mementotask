'use client';

import { FONT_OPTIONS } from '@/lib/settings';
import { useSettings } from '@/lib/settings-context';
import { FontPicker } from './FontPicker';

const SLOT_LABELS: Record<string, string> = {
  body: 'Corpo / Dados',
  headings: 'Titulos',
  interface: 'Interface',
};

export function FontSection() {
  const { settings, setFont } = useSettings();

  return (
    <section>
      <div className="mb-4">
        <h3 className="text-base font-semibold text-text-primary mb-1">Tipografia</h3>
        <p className="text-xs text-text-muted italic font-heading">
          &ldquo;Littera scripta manet&rdquo;
        </p>
      </div>

      <div className="space-y-5">
        {(['body', 'headings', 'interface'] as const).map((slot) => (
          <FontPicker
            key={slot}
            slot={slot}
            slotLabel={SLOT_LABELS[slot]}
            options={FONT_OPTIONS[slot]}
            currentFamily={settings.fonts[slot]}
            onSelect={setFont}
          />
        ))}
      </div>
    </section>
  );
}
