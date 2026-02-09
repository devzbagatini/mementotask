'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useToast, type Toast as ToastData, type ToastType } from '@/lib/toast';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
};

const COLOR_MAP: Record<ToastType, string> = {
  success: 'text-status-concluido',
  error: 'text-priority-alta',
  info: 'text-accent-projeto',
};

function ToastItem({ toast, onRemove }: { toast: ToastData; onRemove: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger slide-in
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const Icon = ICON_MAP[toast.type];

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border border-border bg-surface-1 px-4 py-3 shadow-lg transition-all duration-300',
        visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
      )}
    >
      <Icon className={cn('h-5 w-5 shrink-0', COLOR_MAP[toast.type])} />
      <span className="text-sm text-text-primary flex-1">{toast.message}</span>
      <button
        onClick={onRemove}
        className="shrink-0 rounded p-0.5 text-text-muted hover:text-text-primary transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
