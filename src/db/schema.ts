import { Dexie, type Table } from 'dexie';
import type {
  Habit,
  HabitLog,
  Task,
  JournalEntry,
  Goal,
  Milestone,
  Reward,
  RewardHistory,
  FocusSession,
  AppPreference,
} from '@/types';

export class OnePercentDatabase extends Dexie {
  habits!: Table<Habit, string>;
  habitLogs!: Table<HabitLog, string>;
  tasks!: Table<Task, string>;
  journalEntries!: Table<JournalEntry, string>;
  goals!: Table<Goal, string>;
  milestones!: Table<Milestone, string>;
  rewards!: Table<Reward, string>;
  rewardHistory!: Table<RewardHistory, string>;
  focusSessions!: Table<FocusSession, string>;
  preferences!: Table<AppPreference, string>;

  constructor() {
    super('OnePercentDB');

    this.version(1).stores({
      habits: 'id, name, category, order, isArchived, createdAt',
      habitLogs: 'id, date, habitId, status, loggedAt, [date+habitId]',
      tasks: 'id, dueDate, priority, category, completed, recurrence, order, createdAt',
      journalEntries: 'id, date, createdAt',
      goals: 'id, category, status, targetDate, createdAt',
      milestones: 'id, goalId, completed, dueDate',
      rewards: 'id, isCustom, createdAt',
      rewardHistory: 'id, rewardId, date, enjoyedAt',
      focusSessions: 'id, taskId, completed, startTime, mode',
      preferences: 'key',
    });
  }
}
