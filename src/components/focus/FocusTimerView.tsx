'use client';

import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Timer,
  Coffee,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { useTimerStore } from '@/stores/useTimerStore';
import { useTaskStore } from '@/stores/useTaskStore';
import { formatDisplayDate } from '@/lib/dateUtils';
import type { FocusMode } from '@/types';
import confetti from 'canvas-confetti';

const MODES: { id: FocusMode; label: string; defaultMinutes: number }[] = [
  { id: 'focus', label: 'Focus (25m)', defaultMinutes: 25 },
  { id: 'shortBreak', label: 'Short Break (5m)', defaultMinutes: 5 },
  { id: 'longBreak', label: 'Long Break (15m)', defaultMinutes: 15 },
];

export function FocusTimerView() {
  const {
    mode,
    status,
    timeLeft,
    totalDuration,
    customDurationMinutes,
    selectedTaskId,
    selectedTaskTitle,
    sessionHistory,
    start,
    pause,
    resume,
    reset,
    setMode,
    setCustomDuration,
    setSelectedTask,
  } = useTimerStore();

  const { tasks } = useTaskStore();
  const pendingTasks = tasks.filter((t) => !t.completed);

  // Minutes and seconds display
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // SVG Progress Ring calculation
  const progressPercent = totalDuration > 0 ? Math.round(((totalDuration - timeLeft) / totalDuration) * 100) : 0;
  const strokeDashoffset = 100 - progressPercent;

  const handleStartPause = () => {
    if (status === 'running') {
      pause();
    } else if (status === 'paused') {
      resume();
    } else {
      start();
    }
  };

  const handleModeChange = (newMode: FocusMode) => {
    setMode(newMode);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="font-headline text-2xl sm:text-3xl font-bold text-[var(--on-surface)]">
          Focus Timer
        </h1>
        <p className="text-xs sm:text-sm text-[var(--on-surface-variant)] mt-0.5">
          Deep work blocks with timestamp persistence across page refreshes.
        </p>
      </div>

      {/* Main Timer Dial Card */}
      <div className="bg-[var(--surface-container)] border border-[var(--outline-variant)]/25 rounded-3xl p-6 sm:p-10 flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[var(--primary)]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Mode Selector Tabs */}
        <div className="flex gap-2 p-1.5 rounded-2xl bg-[var(--surface-container-high)] border border-[var(--outline-variant)]/20 mb-8">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => handleModeChange(m.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-headline transition-all ${
                mode === m.id
                  ? 'bg-[var(--primary)] text-[var(--on-primary)] shadow-sm'
                  : 'text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Circular SVG Timer Dial */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-[var(--surface-variant)]"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            />
            <path
              className="text-[var(--primary)] transition-all duration-500 ease-linear"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeDasharray="100, 100"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              strokeWidth="2.5"
            />
          </svg>

          {/* Center Digital Display */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <div className="font-headline text-5xl sm:text-6xl font-bold tracking-tighter text-[var(--on-surface)]">
              {formattedTime}
            </div>
            <span className="text-xs uppercase font-bold tracking-widest text-[var(--primary)] font-headline mt-1">
              {status === 'running' ? 'Focusing' : status === 'paused' ? 'Paused' : 'Ready'}
            </span>
          </div>
        </div>

        {/* Task Association Pill */}
        <div className="mt-8 flex items-center gap-2">
          <span className="text-xs text-[var(--on-surface-variant)] font-headline">Task:</span>
          <select
            value={selectedTaskId || ''}
            onChange={(e) => {
              const val = e.target.value;
              const task = tasks.find((t) => t.id === val);
              setSelectedTask(val || null, task?.title);
            }}
            className="bg-[var(--surface-container-high)] border border-[var(--outline-variant)]/30 rounded-xl px-3 py-1.5 text-xs font-semibold text-[var(--on-surface)] outline-none max-w-[220px] truncate"
          >
            <option value="">No task linked</option>
            {pendingTasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>

        {/* Controls: Play/Pause and Reset */}
        <div className="flex items-center gap-4 mt-8">
          <button
            onClick={reset}
            className="w-12 h-12 rounded-2xl bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] flex items-center justify-center transition-colors shadow-sm"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={handleStartPause}
            className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-[var(--primary)] text-[var(--on-primary)] font-headline font-bold text-base shadow-lg hover:opacity-90 transition-all hover:scale-105"
          >
            {status === 'running' ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>{status === 'paused' ? 'Resume' : 'Start Focus'}</span>
              </>
            )}
          </button>
        </div>

        {/* Custom Duration Slider (when idle) */}
        {mode === 'focus' && status === 'idle' && (
          <div className="w-full max-w-xs mt-6 pt-6 border-t border-[var(--outline-variant)]/20 text-center">
            <div className="flex items-center justify-between text-xs text-[var(--on-surface-variant)] mb-2 font-headline">
              <span>Custom Focus Length</span>
              <span className="font-bold text-[var(--primary)]">{customDurationMinutes} minutes</span>
            </div>
            <input
              type="range"
              min="5"
              max="90"
              step="5"
              value={customDurationMinutes}
              onChange={(e) => setCustomDuration(Number(e.target.value))}
              className="w-full accent-[var(--primary)] cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Focus Session History */}
      <div className="bg-[var(--surface-container)] border border-[var(--outline-variant)]/25 rounded-2xl p-5 sm:p-6 shadow-sm">
        <h2 className="font-headline font-bold text-base sm:text-lg text-[var(--on-surface)] mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[var(--primary)]" />
          <span>Completed Focus Sessions</span>
        </h2>

        <div className="space-y-2">
          {sessionHistory.slice(0, 10).map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/20"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-semibold text-[var(--on-surface)]">
                    {session.taskTitle ? `Task: ${session.taskTitle}` : `${session.durationMinutes}m Focus Block`}
                  </div>
                  <div className="text-[11px] text-[var(--on-surface-variant)] font-headline">
                    {formatDisplayDate(session.startTime.substring(0, 10))} • {session.durationMinutes} mins
                  </div>
                </div>
              </div>

              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[var(--primary)]/15 text-[var(--primary)] font-headline">
                Completed
              </span>
            </div>
          ))}

          {sessionHistory.length === 0 && (
            <div className="p-8 text-center text-xs text-[var(--on-surface-variant)]">
              No focus sessions completed yet. Start the timer to log your first deep work block!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
