'use client';

import { SettingsHeader } from './SettingsHeader';
import { PresetSection } from './PresetSection';
import { ColorSection } from './ColorSection';
import { FontSection } from './FontSection';
import { SettingsPreview } from './SettingsPreview';

interface SettingsViewProps {
  onBack: () => void;
}

export function SettingsView({ onBack }: SettingsViewProps) {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
      <SettingsHeader onBack={onBack} />

      <div className="flex gap-8">
        {/* Settings panels */}
        <div className="flex-1 min-w-0 space-y-8">
          <PresetSection />
          <ColorSection />
          <FontSection />
        </div>

        {/* Preview sidebar — hidden on mobile */}
        <div className="hidden lg:block w-80 flex-shrink-0">
          <div className="sticky top-6">
            <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
              Preview
            </h3>
            <SettingsPreview />
          </div>
        </div>
      </div>
    </div>
  );
}
