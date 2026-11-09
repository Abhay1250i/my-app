import type { Habit, HabitLog, Task, DayPerformance, MonthSummary } from '@/types';
import { parseLocalDateString, getLocalDateString } from './dateUtils';
import { getDay } from 'date-fns';

/**
 * Calculates completion performance for a specific date YYYY-MM-DD.
 */
export function calculateDayPerformance(
  dateStr: string,
  habits: Habit[],
  logs: HabitLog[],
  tasks: Task[] = [],
  journalDateSet: Set<string> = new Set()
): DayPerformance {
  const dateObj = parseLocalDateString(dateStr);
  const dayOfWeek = getDay(dateObj); // 0 = Sun, 1 = Mon ...
  const todayStr = getLocalDateString(new Date());
  const isFuture = dateStr > todayStr;

  // Active unarchived habits scheduled for this day of week
  const scheduledHabits = habits.filter(
    (h) => !h.isArchived && h.targetDays.includes(dayOfWeek)
  );

  const logsForDate = logs.filter((l) => l.date === dateStr);
  const logMap = new Map(logsForDate.map((l) => [l.habitId, l]));

  let completedCount = 0;
  let partialCount = 0;
  let skippedCount = 0;
  let missedCount = 0;

  for (const habit of scheduledHabits) {
    const log = logMap.get(habit.id);
    if (!log) {
      // Untracked or missed if past
      if (!isFuture && dateStr < todayStr) {
        missedCount++;
      }
    } else {
      if (log.status === 'completed') completedCount++;
      else if (log.status === 'partial') partialCount++;
      else if (log.status === 'skipped') skippedCount++;
      else if (log.status === 'missed') missedCount++;
    }
  }

  // Formula: Completed scheduled habits / Applicable scheduled habits * 100
  // Applicable scheduled habits = scheduledHabits.length - skippedCount
  const applicableCount = Math.max(0, scheduledHabits.length - skippedCount);

  let completionRate = 0;
  let colorTier: DayPerformance['colorTier'] = 'grey';

  if (isFuture) {
    colorTier = 'grey';
  } else if (applicableCount === 0) {
    // No scheduled habits or all skipped
    colorTier = 'grey';
    completionRate = 0;
  } else if (logsForDate.length === 0 && dateStr < todayStr) {
    // Past date with no logs
    colorTier = 'red';
    completionRate = 0;
  } else {
    // Partial counts as 0.5 completion
    const effectiveCompleted = completedCount + partialCount * 0.5;
    completionRate = Math.min(100, Math.round((effectiveCompleted / applicableCount) * 100));

    if (completionRate === 100) {
      colorTier = 'dark-green';
    } else if (completionRate >= 80) {
      colorTier = 'light-green';
    } else if (completionRate >= 50) {
      colorTier = 'yellow';
    } else {
      colorTier = 'red';
    }
  }

  // Tasks statistics for that day
  const tasksForDay = tasks.filter((t) => t.dueDate === dateStr);
  const tasksCompleted = tasksForDay.filter((t) => t.completed).length;
  const tasksPending = tasksForDay.length - tasksCompleted;

  return {
    date: dateStr,
    completionRate,
    colorTier,
    applicableCount,
    completedCount,
    partialCount,
    missedCount,
    skippedCount,
    tasksCompleted,
    tasksPending,
    hasJournal: journalDateSet.has(dateStr),
  };
}

/**
 * Calculates current unbroken streak and longest historical streak.
 * Consistency over perfection: skipped days do NOT break streak!
 */
export function calculateStreak(
  habits: Habit[],
  logs: HabitLog[],
  referenceDate: Date = new Date()
): { currentStreak: number; longestStreak: number } {
  const todayStr = getLocalDateString(referenceDate);
  const logDates = Array.from(new Set(logs.map((l) => l.date))).sort();

  if (logDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Pre-calculate performances for all logged dates
  const perfMap = new Map<string, DayPerformance>();
  for (const d of logDates) {
    perfMap.set(d, calculateDayPerformance(d, habits, logs));
  }

  // Current streak counting backwards from today or yesterday
  let currentStreak = 0;
  let checkDate = new Date(referenceDate.getTime());

  // Check today first
  const todayPerf = calculateDayPerformance(todayStr, habits, logs);
  const todayCounted = todayPerf.completionRate >= 50 || todayPerf.completedCount > 0;

  if (!todayCounted) {
    // If today hasn't been completed yet, check starting from yesterday
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const dStr = getLocalDateString(checkDate);
    const perf = perfMap.get(dStr) || calculateDayPerformance(dStr, habits, logs);

    // If day was skipped or had no habits, keep walking backwards
    if (perf.applicableCount === 0 || (perf.applicableCount > 0 && perf.skippedCount === perf.applicableCount)) {
      checkDate.setDate(checkDate.getDate() - 1);
      continue;
    }

    // A successful consistency day is >= 50% or at least 1 completed habit
    if (perf.completionRate >= 50 || perf.completedCount > 0) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Longest streak
  let longestStreak = currentStreak;
  let tempStreak = 0;

  for (let i = 0; i < logDates.length; i++) {
    const dStr = logDates[i];
    const perf = perfMap.get(dStr) || calculateDayPerformance(dStr, habits, logs);

    if (perf.applicableCount === 0 || perf.skippedCount === perf.applicableCount) {
      continue;
    }

    if (perf.completionRate >= 50 || perf.completedCount > 0) {
      tempStreak++;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
    }
  }

  return { currentStreak, longestStreak };
}

/**
 * Calculates monthly calendar breakdown.
 */
export function calculateMonthSummary(
  year: number,
  monthIndex: number,
  habits: Habit[],
  logs: HabitLog[]
): MonthSummary {
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  const todayStr = getLocalDateString(new Date());

  let successfulDays = 0;
  let partiallySuccessfulDays = 0;
  let unsuccessfulDays = 0;
  let untrackedDays = 0;
  let totalRate = 0;
  let trackedCount = 0;

  for (let day = 1; day <= lastDay; day++) {
    const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const perf = calculateDayPerformance(dateStr, habits, logs);

    if (dateStr > todayStr || perf.colorTier === 'grey') {
      untrackedDays++;
    } else if (perf.colorTier === 'dark-green') {
      successfulDays++;
      totalRate += perf.completionRate;
      trackedCount++;
    } else if (perf.colorTier === 'light-green' || perf.colorTier === 'yellow') {
      partiallySuccessfulDays++;
      totalRate += perf.completionRate;
      trackedCount++;
    } else {
      unsuccessfulDays++;
      totalRate += perf.completionRate;
      trackedCount++;
    }
  }

  const averageConsistency = trackedCount > 0 ? Math.round(totalRate / trackedCount) : 0;

  return {
    year,
    month: monthIndex + 1,
    successfulDays,
    partiallySuccessfulDays,
    unsuccessfulDays,
    untrackedDays,
    averageConsistency,
  };
}
