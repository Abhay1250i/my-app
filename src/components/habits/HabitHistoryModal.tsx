'use client';

import React from 'react';
import { X, Calendar, Check, Minus, AlertCircle } from 'lucide-react';
import type { Habit, HabitLog } from '@/types';
import { formatDisplayDate, getLocalDateString } from '@/lib/dateUtils';
import { subDays } from 'date-fns';

interface HabitHistoryModalProps {
  habit: Habit | null;
  logs: HabitLog[];
  onClose: () => void;
  onSetStatus: (habitId: string, status: any, date: string) => Promise<void>;
}

export function HabitHistoryModal({ habit, logs, onClose, onSetStatus }: HabitHistoryModalProps) {
  if (!habit) return null;

  // Past 14 days
  const today = new Date();
  const pastDays = Array.from({ length: 14 }, (_, i) => {
    const d = subDays(today, i);
    const dateStr = getLocalDateString(d);
    const log = logs.find((l) => l.habitId === habit.id && l.date === dateStr);
    return {
      dateStr,
      displayDate: formatDisplayDate(dateStr),
      log,
    };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm">
      <div
        className="w-full max-w-md bg-[var(--surface-container)] border border-[var(--outline-variant)]/40 rounded-2xl p-6 shadow-2xl relative max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[var(--outline-variant)]/20">
          <div>
            <h3 className="font-headline font-bold text-base text-[var(--on-surface)]">{habit.name}</h3>
            <p className="text-xs text-[var(--on-surface-variant)]">14-Day History & Corrections</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-2 overflow-y-auto flex-1">
          {pastDays.map(({ dateStr, displayDate, log }) => {
            const status = log?.status || 'untracked';

            return (
              <div
                key={dateStr}
                className="flex items-center justify-between p-3 bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/20 rounded-xl"
              >
                <div>
                  <div className="text-sm font-medium text-[var(--on-surface)]">{displayDate}</div>
                  <div className="text-xs text-[var(--on-surface-variant)] capitalize">{status}</div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onSetStatus(habit.id, 'completed', dateStr)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                      status === 'completed'
                        ? 'bg-[var(--primary)] text-[var(--on-primary)] shadow-sm'
                        : 'bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'
                    }`}
                    title="Mark Completed"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </button>

                  <button
                    onClick={() => onSetStatus(habit.id, 'partial', dateStr)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                      status === 'partial'
                        ? 'bg-[var(--secondary)] text-[var(--on-primary)] shadow-sm'
                        : 'bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'
                    }`}
                    title="Mark Partial"
                  >
                    ½
                  </button>

                  <button
                    onClick={() => onSetStatus(habit.id, 'skipped', dateStr)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                      status === 'skipped'
                        ? 'bg-[var(--surface-variant)] text-[var(--primary)] border border-[var(--primary)]/50'
                        : 'bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'
                    }`}
                    title="Mark Skipped"
                  >
                    <Minus className="w-3.5 h-3.5 stroke-[3]" />
                  </button>

                  <button
                    onClick={() => onSetStatus(habit.id, 'missed', dateStr)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                      status === 'missed'
                        ? 'bg-[var(--error)]/20 text-[var(--error)] border border-[var(--error)]/50'
                        : 'bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'
                    }`}
                    title="Mark Missed"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
