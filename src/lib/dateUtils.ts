import {
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  addDays,
  subDays,
  startOfMonth,
  endOfMonth,
  getDay,
  parse,
} from 'date-fns';

/**
 * Returns YYYY-MM-DD for a given date in local time to prevent timezone shift bugs.
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses a YYYY-MM-DD local string into a Date object at local midnight.
 */
export function parseLocalDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Formats a date string into "Thursday, Oct 24" matching the Google Stitch UI.
 */
export function formatDisplayDate(dateStr: string): string {
  try {
    const d = parseLocalDateString(dateStr);
    return format(d, 'EEEE, MMM d');
  } catch {
    return dateStr;
  }
}

/**
 * Formats date into "October 2026"
 */
export function formatMonthYear(date: Date): string {
  return format(date, 'MMMM yyyy');
}

/**
 * Returns 7 days for the current week starting from Monday (matching Stitch Mon-Sun view).
 */
export function getWeekDays(referenceDate: Date = new Date()): { date: string; dayName: string; isToday: boolean }[] {
  const start = startOfWeek(referenceDate, { weekStartsOn: 1 }); // Monday
  const todayStr = getLocalDateString(new Date());

  return Array.from({ length: 7 }, (_, i) => {
    const current = addDays(start, i);
    const dateStr = getLocalDateString(current);
    return {
      date: dateStr,
      dayName: format(current, 'EEE'),
      isToday: dateStr === todayStr,
    };
  });
}

/**
 * Generates the full 35-42 calendar cell grid for a month.
 */
export function getMonthGrid(year: number, monthIndex: number): {
  date: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isFuture: boolean;
}[] {
  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = endOfMonth(firstDay);
  const todayStr = getLocalDateString(new Date());

  // Monday = 1, Sunday = 0. We want Monday first.
  let startOffset = getDay(firstDay) - 1;
  if (startOffset < 0) startOffset = 6;

  const cells: {
    date: string;
    dayNumber: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    isFuture: boolean;
  }[] = [];

  // Previous month trailing days
  for (let i = startOffset; i > 0; i--) {
    const d = subDays(firstDay, i);
    const dateStr = getLocalDateString(d);
    cells.push({
      date: dateStr,
      dayNumber: d.getDate(),
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      isFuture: dateStr > todayStr,
    });
  }

  // Current month days
  const totalDays = lastDay.getDate();
  for (let day = 1; day <= totalDays; day++) {
    const d = new Date(year, monthIndex, day);
    const dateStr = getLocalDateString(d);
    cells.push({
      date: dateStr,
      dayNumber: day,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      isFuture: dateStr > todayStr,
    });
  }

  // Next month leading days to complete the 7-column grid
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      const d = addDays(lastDay, i);
      const dateStr = getLocalDateString(d);
      cells.push({
        date: dateStr,
        dayNumber: d.getDate(),
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isFuture: dateStr > todayStr,
      });
    }
  }

  return cells;
}
