export type HabitStatus = 'completed' | 'partial' | 'missed' | 'skipped';

export interface Habit {
  id: string;
  name: string;
  description?: string;
  category: 'Health' | 'Mind' | 'Productivity' | 'Fitness' | 'Academics' | 'Routine' | string;
  icon?: string;
  targetDays: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  targetTimeOfDay?: 'Morning' | 'Afternoon' | 'Evening' | 'Anytime';
  targetValue?: number;
  unit?: string;
  order: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HabitLog {
  id: string; // `${date}_${habitId}`
  date: string; // YYYY-MM-DD local
  habitId: string;
  status: HabitStatus;
  value?: number;
  note?: string;
  loggedAt: string;
}

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskRecurrence = 'none' | 'daily' | 'weekly' | 'weekdays' | 'monthly';

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // e.g. "10:00 AM", "02:00 PM"
  priority: TaskPriority;
  category: string;
  completed: boolean;
  recurrence?: TaskRecurrence;
  order: number;
  createdAt: string;
  completedAt?: string;
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  whatWentWell?: string;
  whatCouldImprove?: string;
  whatDidILearn?: string;
  whatIsBotheringMe?: string;
  focusTomorrow?: string;
  generalNotes?: string;
  mood?: 'great' | 'good' | 'neutral' | 'tough' | 'rest';
  createdAt: string;
  updatedAt: string;
}

export type GoalStatus = 'active' | 'completed' | 'paused' | 'archived';

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: string;
  startDate: string; // YYYY-MM-DD
  targetDate: string; // YYYY-MM-DD
  progress: number; // 0-100
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  goalId: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  completedAt?: string;
}

export interface Reward {
  id: string;
  name: string;
  duration: string; // e.g. "45 mins", "1 match", "Evening"
  category?: string;
  conditions?: string;
  isCustom: boolean;
  createdAt: string;
}

export interface RewardHistory {
  id: string;
  rewardId: string;
  rewardName: string;
  date: string; // YYYY-MM-DD
  enjoyedAt: string; // ISO
  notes?: string;
}

export type FocusMode = 'focus' | 'shortBreak' | 'longBreak';

export interface FocusSession {
  id: string;
  durationMinutes: number;
  mode: FocusMode;
  taskId?: string;
  taskTitle?: string;
  completed: boolean;
  startTime: string; // ISO
  endTime: string; // ISO
}

export interface AppPreference {
  key: string;
  value: unknown;
}

export interface DayPerformance {
  date: string; // YYYY-MM-DD
  completionRate: number; // 0 - 100
  colorTier: 'dark-green' | 'light-green' | 'yellow' | 'red' | 'grey';
  applicableCount: number;
  completedCount: number;
  partialCount: number;
  missedCount: number;
  skippedCount: number;
  tasksCompleted: number;
  tasksPending: number;
  hasJournal: boolean;
}

export interface MonthSummary {
  year: number;
  month: number;
  successfulDays: number; // 100%
  partiallySuccessfulDays: number; // 50-99%
  unsuccessfulDays: number; // < 50%
  untrackedDays: number; // no data or future
  averageConsistency: number;
}
