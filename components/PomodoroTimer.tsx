'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

type PomodoroMode = 'work' | 'break';

const DURATIONS: Record<PomodoroMode, number> = {
  work: 25 * 60,
  break: 5 * 60,
};

const MODE_LABELS: Record<PomodoroMode, string> = {
  work: 'Foco',
  break: 'Pausa',
};

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function PomodoroTimer() {
  const [mode, setMode] = useState<PomodoroMode>('work');
  const [timeLeft, setTimeLeft] = useState(DURATIONS.work);
  const [running, setRunning] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!running) {
      clearTimer();
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Switch mode
          const nextMode = mode === 'work' ? 'break' : 'work';
          setMode(nextMode);
          setRunning(false);
          // Notify
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification(nextMode === 'break' ? 'Hora da pausa!' : 'Hora de focar!');
          }
          return DURATIONS[nextMode];
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [running, mode, clearTimer]);

  // Close on outside click
  useEffect(() => {
    if (!expanded) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [expanded]);

  function reset() {
    setRunning(false);
    clearTimer();
    setTimeLeft(DURATIONS[mode]);
  }

  function switchMode(m: PomodoroMode) {
    setRunning(false);
    clearTimer();
    setMode(m);
    setTimeLeft(DURATIONS[m]);
  }

  const progress = 1 - timeLeft / DURATIONS[mode];

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setExpanded((p) => !p)}
        className={cn(
          'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-data tabular-nums transition-colors',
          running
            ? 'text-accent-projeto bg-accent-projeto/10'
            : 'text-text-muted hover:text-text-primary hover:bg-surface-2',
        )}
        title="Pomodoro"
      >
        {/* Mini circular progress */}
        <svg className="h-5 w-5 -rotate-90" viewBox="0 0 20 20">
          <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.2" />
          <circle
            cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2"
            strokeDasharray={`${progress * 50.26} 50.26`}
            strokeLinecap="round"
          />
        </svg>
        <span>{formatTimer(timeLeft)}</span>
      </button>

      {expanded && (
        <div className="absolute right-0 top-full mt-1 z-50 rounded-xl border border-border bg-surface-1 p-3 shadow-lg min-w-[180px]">
          {/* Mode tabs */}
          <div className="flex rounded-lg bg-surface-2 p-0.5 mb-3">
            {(['work', 'break'] as PomodoroMode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={cn(
                  'flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors',
                  mode === m
                    ? 'bg-surface-1 text-text-primary shadow-sm'
                    : 'text-text-muted hover:text-text-secondary',
                )}
              >
                {MODE_LABELS[m]}
              </button>
            ))}
          </div>

          {/* Timer display */}
          <div className="text-center mb-3">
            <div className="text-2xl font-data font-bold text-text-primary tabular-nums">
              {formatTimer(timeLeft)}
            </div>
            <div className="text-[10px] text-text-muted mt-0.5">
              {MODE_LABELS[mode]} — {DURATIONS[mode] / 60} min
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 rounded-full bg-surface-3 overflow-hidden mb-3">
            <div
              className="h-full rounded-full bg-accent-projeto transition-all"
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={reset}
              className="rounded-lg p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
              title="Reiniciar"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={() => setRunning((p) => !p)}
              className={cn(
                'rounded-lg px-4 py-1.5 text-xs font-medium transition-colors',
                running
                  ? 'bg-surface-2 text-text-primary hover:bg-surface-3'
                  : 'bg-accent-projeto text-white hover:opacity-90',
              )}
            >
              {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
