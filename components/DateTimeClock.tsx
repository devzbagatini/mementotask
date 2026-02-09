'use client';

import { useState, useEffect } from 'react';

function formatTime(date: Date): string {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
}

export function DateTimeClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!now) return null;

  return (
    <div className="text-right leading-tight">
      <div className="text-xl font-data font-semibold text-text-primary tabular-nums">
        {formatTime(now)}
      </div>
      <div className="text-xs text-text-muted capitalize">
        {formatDate(now)}
      </div>
    </div>
  );
}
