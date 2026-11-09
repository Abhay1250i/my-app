'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Flame,
  Plus,
  CheckSquare,
  BookOpen,
  Timer,
  Repeat,
  Check,
  ChevronRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { useHabitStore } from '@/stores/useHabitStore';
import { useTaskStore } from '@/stores/useTaskStore';
import { getLocalDateString, formatDisplayDate, getWeekDays } from '@/lib/dateUtils';
import { calculateDayPerformance, calculateStreak } from '@/lib/statsUtils';
import { AddHabitModal } from '@/components/common/AddHabitModal';
import { AddTaskModal } from '@/components/common/AddTaskModal';
import confetti from 'canvas-confetti';
import { useMounted } from '@/hooks/useMounted';

export function DashboardView() {
  const mounted = useMounted();
  const { habits, habitLogs, cycleHabitStatus } = useHabitStore();
  const { tasks, toggleTask } = useTaskStore();

  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  if (!mounted) {
    return null;
  }

  const todayStr = getLocalDateString(new Date());
  const todayPerf = calculateDayPerformance(todayStr, habits, habitLogs, tasks);
  const { currentStreak, longestStreak } = calculateStreak(habits, habitLogs);

  // Weekly Overview Data (Monday - Sunday)
  const weekDays = getWeekDays(new Date());
  const weekPerformances = weekDays.map((w) => ({
    ...w,
    perf: calculateDayPerformance(w.date, habits, habitLogs, tasks),
  }));

  const weekAvg =
    weekPerformances.length > 0
      ? Math.round(
          weekPerformances.reduce((acc, curr) => acc + curr.perf.completionRate, 0) /
            weekPerformances.length
        )
      : 0;

  // Habits scheduled for today
  const dayOfWeek = new Date().getDay();
  const todayHabits = habits
    .filter((h) => !h.isArchived && h.targetDays.includes(dayOfWeek))
    .slice(0, 5); // top 5 for focus

  // Tasks due today or pending
  const todayTasks = tasks
    .filter((t) => !t.completed && (t.dueDate === todayStr || !t.dueDate))
    .slice(0, 4);

  const completedTodayTasks = tasks
    .filter((t) => t.completed && t.dueDate === todayStr)
    .slice(0, 2);

  const handleHabitToggle = async (habitId: string) => {
    const nextStatus = await cycleHabitStatus(habitId, todayStr);
    if (nextStatus === 'completed' && todayPerf.completionRate >= 90) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#B6FF3B', '#68DBA9', '#FC7C78', '#FFFFFF'],
      });
    }
  };

  const handleTaskToggle = async (taskId: string) => {
    await toggleTask(taskId);
  };

  const getProgressLabel = (rate: number) => {
    if (rate === 100) return 'Perfect 100% Day!';
    if (rate >= 80) return 'Almost there';
    if (rate >= 50) return 'Strong progress';
    if (rate > 0) return 'Started strong';
    return 'Ready to start';
  };

  return (
    <div className="space-y-6 pb-6">
      {/* 1. Time-sensitive greeting & streak banner */}
      <div className="flex flex-col gap-1.5 pt-2">
        <div className="flex items-center justify-between">
          <span className="font-headline text-xs font-bold text-[var(--primary)] uppercase tracking-wider">
            {formatDisplayDate(todayStr)}
          </span>
          <div className="flex items-center gap-1.5 bg-[var(--surface-container)] border border-[var(--outline-variant)]/30 px-3 py-1 rounded-full shadow-sm">
            <Flame className="w-4 h-4 text-[var(--tertiary-container)] fill-[var(--tertiary-container)]" />
            <span className="font-headline text-xs font-semibold text-[var(--on-surface)]">
              {currentStreak} days streak
            </span>
          </div>
        </div>

        <h1 className="font-headline text-2xl sm:text-3xl font-bold text-[var(--on-surface)] tracking-tight mt-1">
          Small steps. Big changes.
        </h1>
        <p className="text-sm text-[var(--on-surface-variant)]">
          You&apos;re on track to surpass your monthly personal growth targets.
        </p>
      </div>

      {/* 2. Today's Progress Card (Matching Stitch reference) */}
      <div className="bg-[var(--surface-container)] border border-[var(--outline-variant)]/30 rounded-2xl p-6 relative overflow-hidden shadow-sm">
        <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-[var(--primary)]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="font-headline text-[11px] font-bold text-[var(--on-surface-variant)] uppercase tracking-wider">
              Today&apos;s Progress
            </span>
            <div className="flex items-baseline gap-2.5">
              <span className="font-headline text-4xl sm:text-5xl font-bold text-[var(--on-surface)]">
                {todayPerf.completionRate}%
              </span>
              <span className="text-sm text-[var(--primary)] font-semibold font-headline">
                {getProgressLabel(todayPerf.completionRate)}
              </span>
            </div>
          </div>

          {/* Circular Radial Progress SVG */}
          <div className="relative w-18 h-18 sm:w-20 sm:h-20 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-[var(--surface-variant)]"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
              />
              <path
                className="text-[var(--primary)] transition-all duration-700 ease-out"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeDasharray={`${todayPerf.completionRate}, 100`}
                strokeLinecap="round"
                strokeWidth="3.5"
              />
            </svg>
            <span className="absolute font-headline text-xs sm:text-sm font-bold text-[var(--on-surface)]">
              {todayPerf.completionRate}%
            </span>
          </div>
        </div>

        {/* Divider & Metric Counters */}
        <div className="grid grid-cols-2 gap-4 pt-4 mt-4 border-t border-[var(--outline-variant)]/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--surface-container-high)] flex items-center justify-center text-[var(--primary)]">
              <Repeat className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider font-headline">
                Habits
              </span>
              <span className="text-sm font-bold text-[var(--on-surface)]">
                {todayPerf.completedCount} / {todayPerf.applicableCount} completed
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--surface-container-high)] flex items-center justify-center text-[var(--primary)]">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider font-headline">
                Tasks
              </span>
              <span className="text-sm font-bold text-[var(--on-surface)]">
                {todayPerf.tasksCompleted} / {todayPerf.tasksCompleted + todayPerf.tasksPending} completed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Quick Actions Grid (4 Items matching Stitch reference) */}
      <div className="grid grid-cols-4 gap-2.5 sm:gap-4">
        <button
          onClick={() => setIsAddHabitOpen(true)}
          className="flex flex-col items-center justify-center p-3 sm:p-4 bg-[var(--surface-container)] border border-[var(--outline-variant)]/20 rounded-2xl hover:bg-[var(--surface-container-high)] transition-all group shadow-sm"
        >
          <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-xs font-semibold text-[var(--on-surface-variant)] group-hover:text-[var(--on-surface)] font-headline">
            Add Habit
          </span>
        </button>

        <button
          onClick={() => setIsAddTaskOpen(true)}
          className="flex flex-col items-center justify-center p-3 sm:p-4 bg-[var(--surface-container)] border border-[var(--outline-variant)]/20 rounded-2xl hover:bg-[var(--surface-container-high)] transition-all group shadow-sm"
        >
          <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
            <CheckSquare className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-xs font-semibold text-[var(--on-surface-variant)] group-hover:text-[var(--on-surface)] font-headline">
            Add Task
          </span>
        </button>

        <Link
          href="/journal"
          className="flex flex-col items-center justify-center p-3 sm:p-4 bg-[var(--surface-container)] border border-[var(--outline-variant)]/20 rounded-2xl hover:bg-[var(--surface-container-high)] transition-all group shadow-sm text-center"
        >
          <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
            <BookOpen className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-xs font-semibold text-[var(--on-surface-variant)] group-hover:text-[var(--on-surface)] font-headline">
            Journal
          </span>
        </Link>

        <Link
          href="/focus"
          className="flex flex-col items-center justify-center p-3 sm:p-4 bg-[var(--surface-container)] border border-[var(--outline-variant)]/20 rounded-2xl hover:bg-[var(--surface-container-high)] transition-all group shadow-sm text-center"
        >
          <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
            <Timer className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-xs font-semibold text-[var(--on-surface-variant)] group-hover:text-[var(--on-surface)] font-headline">
            Timer
          </span>
        </Link>
      </div>

      {/* 4. Today's Focus Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-headline font-bold text-lg text-[var(--on-surface)]">Today&apos;s Focus</h2>
          <Link
            href="/tracker"
            className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-0.5 font-headline"
          >
            <span>View all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-2.5">
          {/* Active Tasks Due Today */}
          {todayTasks.map((task) => (
            <div
              key={task.id}
              className="bg-[var(--surface-container)] border border-[var(--outline-variant)]/20 rounded-2xl p-3.5 flex items-center justify-between shadow-sm hover:border-[var(--outline-variant)]/50 transition-all"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <button
                  onClick={() => handleTaskToggle(task.id)}
                  className="w-6 h-6 rounded-md bg-[var(--surface-variant)] border border-[var(--outline)]/30 hover:border-[var(--primary)] flex items-center justify-center transition-colors shrink-0"
                >
                  {task.completed && <Check className="w-4 h-4 text-[var(--primary)] stroke-[3]" />}
                </button>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-[var(--on-surface)] truncate">
                    {task.title}
                  </span>
                  <span className="text-xs text-[var(--on-surface-variant)]">
                    {task.category} • {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                  </span>
                </div>
              </div>

              {task.dueTime && (
                <span className="text-[11px] font-semibold px-2.5 py-1 bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] rounded-full shrink-0 font-headline">
                  {task.dueTime}
                </span>
              )}
            </div>
          ))}

          {/* Today's Habits */}
          {todayHabits.map((habit) => {
            const logId = `${todayStr}_${habit.id}`;
            const log = habitLogs.find((l) => l.id === logId);
            const isDone = log?.status === 'completed';
            const isPartial = log?.status === 'partial';
            const isSkipped = log?.status === 'skipped';

            return (
              <div
                key={habit.id}
                className="bg-[var(--surface-container)] border border-[var(--outline-variant)]/20 rounded-2xl p-3.5 flex items-center justify-between shadow-sm hover:border-[var(--outline-variant)]/50 transition-all"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <button
                    onClick={() => handleHabitToggle(habit.id)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all shrink-0 ${
                      isDone
                        ? 'bg-[var(--primary)] text-[var(--on-primary)] shadow-sm'
                        : isPartial
                        ? 'bg-[var(--secondary)] text-[var(--on-primary)]'
                        : isSkipped
                        ? 'bg-[var(--surface-variant)] text-[var(--on-surface-variant)]'
                        : 'bg-[var(--surface-variant)] border border-[var(--outline)]/30 text-[var(--on-surface-variant)]'
                    }`}
                  >
                    {isDone ? (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    ) : isPartial ? (
                      <div className="w-2.5 h-2.5 rounded-full bg-[var(--on-primary)]" />
                    ) : isSkipped ? (
                      <span className="text-[10px] font-bold">—</span>
                    ) : null}
                  </button>

                  <div className="flex flex-col min-w-0">
                    <span
                      className={`text-sm font-medium truncate ${
                        isDone
                          ? 'line-through opacity-70 text-[var(--on-surface-variant)]'
                          : 'text-[var(--on-surface)]'
                      }`}
                    >
                      {habit.name}
                    </span>
                    <span className="text-xs text-[var(--on-surface-variant)]">
                      {isDone ? (
                        <span className="text-[var(--primary)] font-semibold">Habit • Completed</span>
                      ) : (
                        `${habit.category} • ${habit.targetTimeOfDay || 'Anytime'}`
                      )}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleHabitToggle(habit.id)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 font-headline transition-colors ${
                    isDone
                      ? 'bg-[var(--primary)]/15 text-[var(--primary)]'
                      : isPartial
                      ? 'bg-[var(--secondary)]/15 text-[var(--secondary)]'
                      : 'bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'
                  }`}
                >
                  {isDone ? 'Done' : isPartial ? 'Partial' : isSkipped ? 'Skipped' : habit.targetTimeOfDay || 'Today'}
                </button>
              </div>
            );
          })}

          {todayTasks.length === 0 && todayHabits.length === 0 && (
            <div className="p-8 text-center bg-[var(--surface-container)] rounded-2xl border border-[var(--outline-variant)]/20">
              <Sparkles className="w-8 h-8 text-[var(--primary)] mx-auto mb-2 opacity-70" />
              <p className="text-sm font-semibold text-[var(--on-surface)]">You&apos;re completely caught up!</p>
              <p className="text-xs text-[var(--on-surface-variant)] mt-1">
                Take a moment to relax or add another 1% habit.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 5. Weekly Overview Section (Bar Chart Columns matching Stitch screen) */}
      <div className="bg-[var(--surface-container)] border border-[var(--outline-variant)]/20 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-headline font-bold text-base sm:text-lg text-[var(--on-surface)]">
            Weekly Overview
          </h2>
          <span className="text-xs text-[var(--on-surface-variant)] font-headline">Mon - Sun</span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5 pt-2">
          {weekPerformances.map((day) => {
            const heightPercent = Math.max(8, day.perf.completionRate);
            return (
              <div key={day.date} className="flex flex-col items-center gap-2">
                <div className="w-full h-24 sm:h-28 bg-[var(--surface-container-high)] rounded-xl flex flex-col justify-end p-1 relative overflow-hidden">
                  {day.isToday && (
                    <div className="absolute top-1.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-[var(--primary)] rounded-full animate-pulse" />
                  )}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-lg transition-all duration-500 ${
                      day.perf.completionRate >= 80
                        ? 'bg-[var(--primary)]'
                        : day.perf.completionRate >= 50
                        ? 'bg-[var(--primary)]/70'
                        : day.perf.completionRate > 0
                        ? 'bg-[var(--secondary)]'
                        : 'bg-[var(--surface-variant)]'
                    }`}
                  />
                </div>
                <span
                  className={`text-[11px] font-headline ${
                    day.isToday
                      ? 'text-[var(--primary)] font-bold'
                      : 'text-[var(--on-surface-variant)]'
                  }`}
                >
                  {day.dayName}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Statistics Summary Row (3 Cards matching Stitch screen) */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        <div className="bg-[var(--surface-container)] border border-[var(--outline-variant)]/20 rounded-2xl p-3.5 sm:p-4 flex flex-col items-center text-center shadow-sm">
          <span className="text-[11px] font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider font-headline mb-1">
            Streak
          </span>
          <span className="font-headline text-lg sm:text-2xl font-bold text-[var(--on-surface)]">
            {currentStreak} <span className="text-[var(--primary)] text-xs sm:text-sm">days</span>
          </span>
          <span className="text-[10px] sm:text-xs text-[var(--primary)] font-semibold mt-1 font-headline truncate">
            Best: {longestStreak}d
          </span>
        </div>

        <div className="bg-[var(--surface-container)] border border-[var(--outline-variant)]/20 rounded-2xl p-3.5 sm:p-4 flex flex-col items-center text-center shadow-sm">
          <span className="text-[11px] font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider font-headline mb-1">
            Weekly
          </span>
          <span className="font-headline text-lg sm:text-2xl font-bold text-[var(--on-surface)]">
            {weekAvg}%
          </span>
          <span className="text-[10px] sm:text-xs text-[var(--primary)] font-semibold mt-1 font-headline flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />
            <span>Consistency</span>
          </span>
        </div>

        <div className="bg-[var(--surface-container)] border border-[var(--outline-variant)]/20 rounded-2xl p-3.5 sm:p-4 flex flex-col items-center text-center shadow-sm">
          <span className="text-[11px] font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider font-headline mb-1">
            Monthly
          </span>
          <span className="font-headline text-lg sm:text-2xl font-bold text-[var(--on-surface)]">
            {Math.max(weekAvg, todayPerf.completionRate)}%
          </span>
          <span className="text-[10px] sm:text-xs text-[var(--primary)] font-semibold mt-1 font-headline">
            Top tier
          </span>
        </div>
      </div>

      {/* Modals */}
      <AddHabitModal isOpen={isAddHabitOpen} onClose={() => setIsAddHabitOpen(false)} />
      <AddTaskModal isOpen={isAddTaskOpen} onClose={() => setIsAddTaskOpen(false)} />
    </div>
  );
}
