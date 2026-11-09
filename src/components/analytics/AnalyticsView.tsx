'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  Flame,
  Award,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  BarChart2,
  Sparkles,
} from 'lucide-react';
import { useHabitStore } from '@/stores/useHabitStore';
import { useTaskStore } from '@/stores/useTaskStore';
import { getLocalDateString, getWeekDays } from '@/lib/dateUtils';
import { calculateDayPerformance, calculateStreak } from '@/lib/statsUtils';
import { subDays, format } from 'date-fns';
import { useMounted } from '@/hooks/useMounted';

export function AnalyticsView() {
  const mounted = useMounted();
  const { habits, habitLogs } = useHabitStore();
  const { tasks } = useTaskStore();

  if (!mounted) {
    return null;
  }

  const { currentStreak, longestStreak } = calculateStreak(habits, habitLogs);

  // 1. Weekly Data (Last 7 Days)
  const today = new Date();
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(today, 6 - i);
    const dateStr = getLocalDateString(d);
    const perf = calculateDayPerformance(dateStr, habits, habitLogs);
    return {
      date: dateStr,
      day: format(d, 'EEE'),
      completionRate: perf.completionRate,
      completed: perf.completedCount,
      scheduled: perf.applicableCount,
    };
  });

  // 2. 30-Day Trend Data
  const monthDays = Array.from({ length: 30 }, (_, i) => {
    const d = subDays(today, 29 - i);
    const dateStr = getLocalDateString(d);
    const perf = calculateDayPerformance(dateStr, habits, habitLogs);
    return {
      date: dateStr,
      displayDate: format(d, 'MMM d'),
      completionRate: perf.completionRate,
    };
  });

  // 3. Habit-specific Breakdown
  const unarchivedHabits = habits.filter((h) => !h.isArchived);
  const habitStats = unarchivedHabits.map((habit) => {
    const logs = habitLogs.filter((l) => l.habitId === habit.id);
    const completed = logs.filter((l) => l.status === 'completed').length;
    const partial = logs.filter((l) => l.status === 'partial').length;
    const missed = logs.filter((l) => l.status === 'missed').length;
    const totalApplicable = logs.filter((l) => l.status !== 'skipped').length;
    const rate = totalApplicable > 0 ? Math.round(((completed + partial * 0.5) / totalApplicable) * 100) : 0;

    return {
      ...habit,
      completedCount: completed,
      missedCount: missed,
      completionRate: rate,
      totalTracked: logs.length,
    };
  });

  // Best-performing & Most Frequently Missed
  const trackedHabits = habitStats.filter((h) => h.totalTracked > 0);
  const bestHabit = trackedHabits.length > 0
    ? [...trackedHabits].sort((a, b) => b.completionRate - a.completionRate)[0]
    : null;

  const mostMissedHabit = trackedHabits.length > 0
    ? [...trackedHabits].sort((a, b) => b.missedCount - a.missedCount)[0]
    : null;

  // Task Statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[var(--surface-container-highest)] border border-[var(--outline-variant)]/40 p-2.5 rounded-xl shadow-xl text-xs font-headline">
          <p className="font-semibold text-[var(--on-surface)]">{label}</p>
          <p className="text-[var(--primary)] font-bold">{payload[0].value}% consistency</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="font-headline text-2xl sm:text-3xl font-bold text-[var(--on-surface)]">
          Real Analytics
        </h1>
        <p className="text-xs sm:text-sm text-[var(--on-surface-variant)] mt-0.5">
          Objective consistency metrics. No fabricated stats, no vanity pressure.
        </p>
      </div>

      {/* Top 4 Key Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[var(--surface-container)] border border-[var(--outline-variant)]/25 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-[var(--on-surface-variant)] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider font-headline">Current Streak</span>
            <Flame className="w-4 h-4 text-[var(--tertiary-container)] fill-[var(--tertiary-container)]" />
          </div>
          <div className="font-headline text-2xl font-bold text-[var(--on-surface)]">
            {currentStreak} <span className="text-xs text-[var(--primary)]">days</span>
          </div>
          <div className="text-[11px] text-[var(--on-surface-variant)] mt-1 font-headline">
            Longest streak: {longestStreak} days
          </div>
        </div>

        <div className="bg-[var(--surface-container)] border border-[var(--outline-variant)]/25 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-[var(--on-surface-variant)] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider font-headline">Task Rate</span>
            <CheckCircle2 className="w-4 h-4 text-[var(--primary)]" />
          </div>
          <div className="font-headline text-2xl font-bold text-[var(--on-surface)]">
            {taskCompletionRate}%
          </div>
          <div className="text-[11px] text-[var(--on-surface-variant)] mt-1 font-headline">
            {completedTasks} / {totalTasks} tasks done
          </div>
        </div>

        <div className="bg-[var(--surface-container)] border border-[var(--outline-variant)]/25 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-[var(--on-surface-variant)] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider font-headline">Top Performer</span>
            <Award className="w-4 h-4 text-[var(--primary)]" />
          </div>
          <div className="font-headline text-sm font-bold text-[var(--on-surface)] truncate">
            {bestHabit ? bestHabit.name : 'No data yet'}
          </div>
          <div className="text-[11px] text-[var(--primary)] font-semibold mt-1 font-headline">
            {bestHabit ? `${bestHabit.completionRate}% completed` : 'Log habits to see'}
          </div>
        </div>

        <div className="bg-[var(--surface-container)] border border-[var(--outline-variant)]/25 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-[var(--on-surface-variant)] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider font-headline">Focus Needed</span>
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="font-headline text-sm font-bold text-[var(--on-surface)] truncate">
            {mostMissedHabit && mostMissedHabit.missedCount > 0
              ? mostMissedHabit.name
              : 'Zero missed!'}
          </div>
          <div className="text-[11px] text-[var(--on-surface-variant)] mt-1 font-headline">
            {mostMissedHabit && mostMissedHabit.missedCount > 0
              ? `${mostMissedHabit.missedCount} missed occurrences`
              : 'Keep up consistency'}
          </div>
        </div>
      </div>

      {/* Weekly 7-Day Bar Chart */}
      <div className="bg-[var(--surface-container)] border border-[var(--outline-variant)]/25 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-headline font-bold text-base sm:text-lg text-[var(--on-surface)]">
              Weekly Completion Rate
            </h2>
            <p className="text-xs text-[var(--on-surface-variant)]">Daily performance across past 7 days</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--surface-container-high)] text-[var(--primary)] font-headline">
            Past 7 Days
          </span>
        </div>

        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekDays} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--outline-variant)" opacity={0.3} />
              <XAxis dataKey="day" stroke="var(--on-surface-variant)" fontSize={12} tickLine={false} />
              <YAxis stroke="var(--on-surface-variant)" fontSize={12} domain={[0, 100]} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="completionRate" fill="var(--primary)" radius={[8, 8, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 30-Day Monthly Consistency Area Chart */}
      <div className="bg-[var(--surface-container)] border border-[var(--outline-variant)]/25 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-headline font-bold text-base sm:text-lg text-[var(--on-surface)]">
              30-Day Consistency Trend
            </h2>
            <p className="text-xs text-[var(--on-surface-variant)]">Longitudinal progress curve</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] font-headline">
            Last 30 Days
          </span>
        </div>

        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthDays} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--outline-variant)" opacity={0.3} />
              <XAxis dataKey="displayDate" stroke="var(--on-surface-variant)" fontSize={11} interval={4} tickLine={false} />
              <YAxis stroke="var(--on-surface-variant)" fontSize={11} domain={[0, 100]} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="completionRate"
                stroke="var(--primary)"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorRate)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Habit-by-Habit Statistics Table */}
      <div className="bg-[var(--surface-container)] border border-[var(--outline-variant)]/25 rounded-2xl p-5 sm:p-6 shadow-sm">
        <h2 className="font-headline font-bold text-base sm:text-lg text-[var(--on-surface)] mb-4">
          Habit-Specific Performance
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--outline-variant)]/30 text-[var(--on-surface-variant)] uppercase font-headline">
                <th className="pb-3 pl-2">Habit Name</th>
                <th className="pb-3 px-3">Category</th>
                <th className="pb-3 px-3">Completed</th>
                <th className="pb-3 px-3">Missed</th>
                <th className="pb-3 px-3">Consistency</th>
                <th className="pb-3 pr-2 text-right">Visual Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--outline-variant)]/20">
              {habitStats.map((h) => (
                <tr key={h.id} className="hover:bg-[var(--surface-container-high)]/40 transition-colors">
                  <td className="py-3 pl-2 font-medium text-[var(--on-surface)]">{h.name}</td>
                  <td className="py-3 px-3 text-[var(--on-surface-variant)]">{h.category}</td>
                  <td className="py-3 px-3 font-semibold text-[var(--primary)]">{h.completedCount}</td>
                  <td className="py-3 px-3 text-[var(--tertiary-container)]">{h.missedCount}</td>
                  <td className="py-3 px-3 font-bold font-headline text-[var(--on-surface)]">
                    {h.completionRate}%
                  </td>
                  <td className="py-3 pr-2 text-right">
                    <div className="w-24 ml-auto h-2 bg-[var(--surface-container-high)] rounded-full overflow-hidden">
                      <div
                        style={{ width: `${h.completionRate}%` }}
                        className="h-full bg-[var(--primary)] rounded-full"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
