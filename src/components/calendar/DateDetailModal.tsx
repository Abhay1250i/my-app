'use client';

import React from 'react';
import { X, Check, Minus, AlertCircle, CheckSquare, BookOpen, Repeat } from 'lucide-react';
import type { Habit, HabitLog, Task, DayPerformance, JournalEntry } from '@/types';
import { formatDisplayDate } from '@/lib/dateUtils';
import Link from 'next/link';

interface DateDetailModalProps {
  dateStr: string;
  perf: DayPerformance;
  habits: Habit[];
  logs: HabitLog[];
  tasks: Task[];
  journal?: JournalEntry | null;
  onClose: () => void;
  onCycleHabit: (habitId: string, date: string) => Promise<any>;
}

export function DateDetailModal({
  dateStr,
  perf,
  habits,
  logs,
  tasks,
  journal,
  onClose,
  onCycleHabit,
}: DateDetailModalProps) {
  const dayOfWeek = new Date(dateStr).getDay();
  const scheduledHabits = habits.filter((h) => !h.isArchived && h.targetDays.includes(dayOfWeek));
  const logMap = new Map(logs.filter((l) => l.date === dateStr).map((l) => [l.habitId, l]));

  const completedHabits: Habit[] = [];
  const partialHabits: Habit[] = [];
  const skippedHabits: Habit[] = [];
  const missedHabits: Habit[] = [];

  for (const h of scheduledHabits) {
    const l = logMap.get(h.id);
    if (!l) {
      missedHabits.push(h);
    } else if (l.status === 'completed') {
      completedHabits.push(h);
    } else if (l.status === 'partial') {
      partialHabits.push(h);
    } else if (l.status === 'skipped') {
      skippedHabits.push(h);
    } else if (l.status === 'missed') {
      missedHabits.push(h);
    }
  }

  const tasksForDay = tasks.filter((t) => t.dueDate === dateStr);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm">
      <div
        className="w-full max-w-lg bg-[var(--surface-container)] border border-[var(--outline-variant)]/40 rounded-2xl p-6 shadow-2xl relative max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--outline-variant)]/20">
          <div>
            <h3 className="font-headline font-bold text-lg text-[var(--on-surface)]">
              {formatDisplayDate(dateStr)}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold text-[var(--primary)] font-headline">
                {perf.completionRate}% Completion
              </span>
              <span className="text-xs text-[var(--on-surface-variant)]">•</span>
              <span className="text-xs text-[var(--on-surface-variant)] capitalize">
                {perf.colorTier.replace('-', ' ')} status
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="py-4 space-y-4 overflow-y-auto flex-1">
          {/* Summary counters */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20">
              <div className="text-lg font-bold text-[var(--primary)] font-headline">{completedHabits.length}</div>
              <div className="text-[10px] text-[var(--on-surface-variant)] uppercase font-semibold">Done</div>
            </div>
            <div className="p-2 rounded-xl bg-[var(--secondary)]/10 border border-[var(--secondary)]/20">
              <div className="text-lg font-bold text-[var(--secondary)] font-headline">{partialHabits.length}</div>
              <div className="text-[10px] text-[var(--on-surface-variant)] uppercase font-semibold">Partial</div>
            </div>
            <div className="p-2 rounded-xl bg-[var(--surface-variant)] border border-[var(--outline)]/20">
              <div className="text-lg font-bold text-[var(--on-surface-variant)] font-headline">{skippedHabits.length}</div>
              <div className="text-[10px] text-[var(--on-surface-variant)] uppercase font-semibold">Skipped</div>
            </div>
            <div className="p-2 rounded-xl bg-[var(--error)]/10 border border-[var(--error)]/20">
              <div className="text-lg font-bold text-[var(--error)] font-headline">{missedHabits.length}</div>
              <div className="text-[10px] text-[var(--on-surface-variant)] uppercase font-semibold">Missed</div>
            </div>
          </div>

          {/* Habits detail */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider font-headline flex items-center gap-1.5">
              <Repeat className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>Habits Breakdown</span>
            </h4>
            <div className="space-y-1.5">
              {scheduledHabits.map((habit) => {
                const log = logMap.get(habit.id);
                const status = log?.status || 'missed';
                return (
                  <div
                    key={habit.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/20"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-sm text-[var(--on-surface)] truncate font-medium">{habit.name}</span>
                      <span className="text-xs text-[var(--on-surface-variant)]">({habit.category})</span>
                    </div>

                    <button
                      onClick={() => onCycleHabit(habit.id, dateStr)}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full capitalize font-headline ${
                        status === 'completed'
                          ? 'bg-[var(--primary)] text-[var(--on-primary)]'
                          : status === 'partial'
                          ? 'bg-[var(--secondary)] text-[var(--on-primary)]'
                          : status === 'skipped'
                          ? 'bg-[var(--surface-variant)] text-[var(--on-surface-variant)]'
                          : 'bg-[var(--error)]/15 text-[var(--error)]'
                      }`}
                      title="Click to change status"
                    >
                      {status}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tasks for day */}
          {tasksForDay.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-[var(--outline-variant)]/20">
              <h4 className="text-xs font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider font-headline flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-[var(--primary)]" />
                <span>Tasks Due on this Day</span>
              </h4>
              <div className="space-y-1.5">
                {tasksForDay.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/20"
                  >
                    <span className={`text-sm ${task.completed ? 'line-through text-[var(--on-surface-variant)]' : 'text-[var(--on-surface)]'}`}>
                      {task.title}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        task.completed ? 'bg-[var(--primary)]/15 text-[var(--primary)]' : 'bg-yellow-500/15 text-yellow-500'
                      }`}
                    >
                      {task.completed ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Journal Note Preview */}
          <div className="space-y-2 pt-2 border-t border-[var(--outline-variant)]/20">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider font-headline flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[var(--primary)]" />
                <span>Journal for this Date</span>
              </h4>
              <Link
                href={`/journal?date=${dateStr}`}
                className="text-xs text-[var(--primary)] hover:underline font-semibold font-headline"
              >
                Open in Journal
              </Link>
            </div>
            {journal?.whatWentWell || journal?.generalNotes ? (
              <div className="p-3 bg-[var(--surface-container-low)] rounded-xl border border-[var(--outline-variant)]/20 text-xs text-[var(--on-surface-variant)] space-y-1">
                {journal.whatWentWell && (
                  <p>
                    <strong className="text-[var(--on-surface)]">Went well:</strong> {journal.whatWentWell}
                  </p>
                )}
                {journal.generalNotes && (
                  <p>
                    <strong className="text-[var(--on-surface)]">Note:</strong> {journal.generalNotes}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-[var(--on-surface-variant)]/70 italic">No journal reflection recorded for this day.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
