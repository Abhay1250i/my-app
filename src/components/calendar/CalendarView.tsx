'use client';

import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { useHabitStore } from '@/stores/useHabitStore';
import { useTaskStore } from '@/stores/useTaskStore';
import { useJournalStore } from '@/stores/useJournalStore';
import {
  getMonthGrid,
  formatMonthYear,
  getLocalDateString,
} from '@/lib/dateUtils';
import {
  calculateDayPerformance,
  calculateMonthSummary,
} from '@/lib/statsUtils';
import { DateDetailModal } from './DateDetailModal';
import { addMonths, subMonths } from 'date-fns';
import { useMounted } from '@/hooks/useMounted';

const WEEKDAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function CalendarView() {
  const mounted = useMounted();
  const { habits, habitLogs, cycleHabitStatus } = useHabitStore();
  const { tasks } = useTaskStore();
  const { entries: journalEntries } = useJournalStore();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  if (!mounted) {
    return null;
  }

  const year = currentDate.getFullYear();
  const monthIndex = currentDate.getMonth();

  const handlePrevMonth = () => setCurrentDate((d) => subMonths(d, 1));
  const handleNextMonth = () => setCurrentDate((d) => addMonths(d, 1));
  const handleCurrentMonth = () => setCurrentDate(new Date());

  const monthCells = getMonthGrid(year, monthIndex);
  const summary = calculateMonthSummary(year, monthIndex, habits, habitLogs);

  // Journal dates set
  const journalDateSet = new Set(journalEntries.map((e) => e.date));

  // Modal inspection data
  const inspectedPerf = selectedDateStr
    ? calculateDayPerformance(selectedDateStr, habits, habitLogs, tasks, journalDateSet)
    : null;
  const inspectedJournal = selectedDateStr
    ? journalEntries.find((e) => e.date === selectedDateStr)
    : null;

  const getColorTierStyle = (tier: string) => {
    switch (tier) {
      case 'dark-green':
        return 'bg-emerald-600 text-white border-emerald-500';
      case 'light-green':
        return 'bg-[var(--primary)] text-[var(--on-primary)] border-[var(--primary)]';
      case 'yellow':
        return 'bg-yellow-500 text-black border-yellow-400';
      case 'red':
        return 'bg-[var(--tertiary-container)] text-white border-[var(--tertiary-container)]';
      default:
        return 'bg-[var(--surface-container-high)] text-[var(--on-surface-variant)]/60 border-transparent';
    }
  };

  const getIndicatorDot = (tier: string) => {
    switch (tier) {
      case 'dark-green':
        return 'bg-emerald-500';
      case 'light-green':
        return 'bg-[var(--primary)]';
      case 'yellow':
        return 'bg-yellow-400';
      case 'red':
        return 'bg-[var(--tertiary-container)]';
      default:
        return 'bg-[var(--surface-variant)]';
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl sm:text-3xl font-bold text-[var(--on-surface)]">
            Monthly Calendar
          </h1>
          <p className="text-xs sm:text-sm text-[var(--on-surface-variant)] mt-0.5">
            Visualize your consistency heatmap. 1% improvements compounding daily.
          </p>
        </div>

        {/* Month Navigation Controls */}
        <div className="flex items-center gap-2 bg-[var(--surface-container)] border border-[var(--outline-variant)]/30 rounded-2xl p-1.5 shadow-sm">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl hover:bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition-colors"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleCurrentMonth}
            className="px-3 py-1.5 rounded-xl text-xs font-bold font-headline hover:bg-[var(--surface-container-high)] text-[var(--on-surface)] transition-colors"
          >
            {formatMonthYear(currentDate)}
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl hover:bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition-colors"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Monthly Statistics Bar (Matching Section 8 of prompt) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="bg-[var(--surface-container)] border border-emerald-500/30 rounded-2xl p-3 sm:p-4 flex items-center gap-3 shadow-sm">
          <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shrink-0" />
          <div>
            <div className="font-headline text-lg sm:text-xl font-bold text-[var(--on-surface)]">
              {summary.successfulDays}
            </div>
            <div className="text-[11px] font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider">
              Successful days (100%)
            </div>
          </div>
        </div>

        <div className="bg-[var(--surface-container)] border border-[var(--primary)]/30 rounded-2xl p-3 sm:p-4 flex items-center gap-3 shadow-sm">
          <div className="w-3.5 h-3.5 rounded-full bg-[var(--primary)] shrink-0" />
          <div>
            <div className="font-headline text-lg sm:text-xl font-bold text-[var(--on-surface)]">
              {summary.partiallySuccessfulDays}
            </div>
            <div className="text-[11px] font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider">
              Partially successful (50–99%)
            </div>
          </div>
        </div>

        <div className="bg-[var(--surface-container)] border border-[var(--tertiary-container)]/30 rounded-2xl p-3 sm:p-4 flex items-center gap-3 shadow-sm">
          <div className="w-3.5 h-3.5 rounded-full bg-[var(--tertiary-container)] shrink-0" />
          <div>
            <div className="font-headline text-lg sm:text-xl font-bold text-[var(--on-surface)]">
              {summary.unsuccessfulDays}
            </div>
            <div className="text-[11px] font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider">
              Unsuccessful (&lt;50%)
            </div>
          </div>
        </div>

        <div className="bg-[var(--surface-container)] border border-[var(--outline-variant)]/20 rounded-2xl p-3 sm:p-4 flex items-center gap-3 shadow-sm">
          <div className="w-3.5 h-3.5 rounded-full bg-[var(--surface-variant)] shrink-0" />
          <div>
            <div className="font-headline text-lg sm:text-xl font-bold text-[var(--on-surface)]">
              {summary.untrackedDays}
            </div>
            <div className="text-[11px] font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider">
              Untracked / Future
            </div>
          </div>
        </div>
      </div>

      {/* Main Calendar Grid */}
      <div className="bg-[var(--surface-container)] border border-[var(--outline-variant)]/25 rounded-2xl p-4 sm:p-6 shadow-sm">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center pb-3 border-b border-[var(--outline-variant)]/20 mb-3">
          {WEEKDAY_NAMES.map((name) => (
            <span
              key={name}
              className="font-headline text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-wider"
            >
              {name}
            </span>
          ))}
        </div>

        {/* Month Day Cells */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
          {monthCells.map((cell) => {
            const perf = calculateDayPerformance(cell.date, habits, habitLogs, tasks, journalDateSet);

            return (
              <button
                key={cell.date}
                onClick={() => setSelectedDateStr(cell.date)}
                className={`relative flex flex-col items-center justify-between p-2 sm:p-2.5 min-h-[64px] sm:min-h-[84px] rounded-xl border transition-all text-left group hover:scale-[1.02] ${
                  cell.isToday
                    ? 'ring-2 ring-[var(--primary)] shadow-sm'
                    : ''
                } ${
                  cell.isCurrentMonth
                    ? 'bg-[var(--surface-container-low)] border-[var(--outline-variant)]/30 hover:border-[var(--primary)]'
                    : 'bg-[var(--surface-container-lowest)]/50 border-transparent opacity-40 hover:opacity-80'
                }`}
              >
                {/* Day Number and Today Indicator */}
                <div className="w-full flex items-center justify-between">
                  <span
                    className={`font-headline text-xs sm:text-sm font-bold ${
                      cell.isToday
                        ? 'text-[var(--primary)]'
                        : cell.isCurrentMonth
                        ? 'text-[var(--on-surface)]'
                        : 'text-[var(--on-surface-variant)]'
                    }`}
                  >
                    {cell.dayNumber}
                  </span>

                  {/* Indicator Dot */}
                  <span className={`w-2 h-2 rounded-full ${getIndicatorDot(perf.colorTier)}`} />
                </div>

                {/* Percentage Chip / Status */}
                <div className="w-full mt-2">
                  {perf.colorTier !== 'grey' ? (
                    <div
                      className={`w-full text-center py-0.5 rounded-md text-[10px] sm:text-xs font-bold font-headline ${getColorTierStyle(
                        perf.colorTier
                      )}`}
                    >
                      {perf.completionRate}%
                    </div>
                  ) : (
                    <div className="text-[10px] text-[var(--on-surface-variant)]/40 text-center font-headline">
                      {cell.isFuture ? '—' : 'Off'}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Color Legend Card */}
      <div className="p-4 bg-[var(--surface-container)] rounded-2xl border border-[var(--outline-variant)]/20 flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--on-surface-variant)]">
        <span className="font-semibold font-headline text-[var(--on-surface)]">Color Key:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>100% Full Completion</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--primary)]" />
          <span>80–99% High Progress</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <span>50–79% Moderate</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--tertiary-container)]" />
          <span>Below 50%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--surface-variant)]" />
          <span>Future / Untracked</span>
        </div>
      </div>

      {/* Day Inspection Detail Modal */}
      {selectedDateStr && inspectedPerf && (
        <DateDetailModal
          dateStr={selectedDateStr}
          perf={inspectedPerf}
          habits={habits}
          logs={habitLogs}
          tasks={tasks}
          journal={inspectedJournal}
          onClose={() => setSelectedDateStr(null)}
          onCycleHabit={cycleHabitStatus}
        />
      )}
    </div>
  );
}
