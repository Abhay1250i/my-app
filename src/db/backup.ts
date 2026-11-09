import { z } from 'zod';
import { db } from './database';
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

export const BackupSchema = z.object({
  version: z.number(),
  appName: z.literal('onePercent'),
  exportedAt: z.string(),
  data: z.object({
    habits: z.array(z.any()).default([]),
    habitLogs: z.array(z.any()).default([]),
    tasks: z.array(z.any()).default([]),
    journalEntries: z.array(z.any()).default([]),
    goals: z.array(z.any()).default([]),
    milestones: z.array(z.any()).default([]),
    rewards: z.array(z.any()).default([]),
    rewardHistory: z.array(z.any()).default([]),
    focusSessions: z.array(z.any()).default([]),
    preferences: z.array(z.any()).default([]),
  }),
});

export type BackupPayload = z.infer<typeof BackupSchema>;

export async function exportAllDataAsJSON(): Promise<string> {
  const habits = await db.habits.toArray();
  const habitLogs = await db.habitLogs.toArray();
  const tasks = await db.tasks.toArray();
  const journalEntries = await db.journalEntries.toArray();
  const goals = await db.goals.toArray();
  const milestones = await db.milestones.toArray();
  const rewards = await db.rewards.toArray();
  const rewardHistory = await db.rewardHistory.toArray();
  const focusSessions = await db.focusSessions.toArray();
  const preferences = await db.preferences.toArray();

  const payload: BackupPayload = {
    version: 1,
    appName: 'onePercent',
    exportedAt: new Date().toISOString(),
    data: {
      habits,
      habitLogs,
      tasks,
      journalEntries,
      goals,
      milestones,
      rewards,
      rewardHistory,
      focusSessions,
      preferences,
    },
  };

  return JSON.stringify(payload, null, 2);
}

export async function importBackupJSON(
  jsonString: string,
  mode: 'merge' | 'replace' = 'merge'
): Promise<{ success: boolean; message: string; recordCount?: number }> {
  try {
    const raw = JSON.parse(jsonString);
    const parsed = BackupSchema.safeParse(raw);

    if (!parsed.success) {
      return {
        success: false,
        message: `Invalid backup file structure: ${parsed.error.issues.map((i) => i.message).join(', ')}`,
      };
    }

    const { data } = parsed.data;

    await db.transaction(
      'rw',
      [
        db.habits,
        db.habitLogs,
        db.tasks,
        db.journalEntries,
        db.goals,
        db.milestones,
        db.rewards,
        db.rewardHistory,
        db.focusSessions,
        db.preferences,
      ],
      async () => {
        if (mode === 'replace') {
          await db.habits.clear();
          await db.habitLogs.clear();
          await db.tasks.clear();
          await db.journalEntries.clear();
          await db.goals.clear();
          await db.milestones.clear();
          await db.rewards.clear();
          await db.rewardHistory.clear();
          await db.focusSessions.clear();
          await db.preferences.clear();
        }

        if (data.habits?.length) await db.habits.bulkPut(data.habits as Habit[]);
        if (data.habitLogs?.length) await db.habitLogs.bulkPut(data.habitLogs as HabitLog[]);
        if (data.tasks?.length) await db.tasks.bulkPut(data.tasks as Task[]);
        if (data.journalEntries?.length) await db.journalEntries.bulkPut(data.journalEntries as JournalEntry[]);
        if (data.goals?.length) await db.goals.bulkPut(data.goals as Goal[]);
        if (data.milestones?.length) await db.milestones.bulkPut(data.milestones as Milestone[]);
        if (data.rewards?.length) await db.rewards.bulkPut(data.rewards as Reward[]);
        if (data.rewardHistory?.length) await db.rewardHistory.bulkPut(data.rewardHistory as RewardHistory[]);
        if (data.focusSessions?.length) await db.focusSessions.bulkPut(data.focusSessions as FocusSession[]);
        if (data.preferences?.length) await db.preferences.bulkPut(data.preferences as AppPreference[]);
      }
    );

    const totalRecords =
      (data.habits?.length || 0) +
      (data.habitLogs?.length || 0) +
      (data.tasks?.length || 0) +
      (data.journalEntries?.length || 0) +
      (data.goals?.length || 0) +
      (data.milestones?.length || 0) +
      (data.rewards?.length || 0) +
      (data.rewardHistory?.length || 0) +
      (data.focusSessions?.length || 0);

    return {
      success: true,
      message: `Successfully ${mode === 'replace' ? 'restored' : 'merged'} ${totalRecords} records!`,
      recordCount: totalRecords,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error during import';
    return { success: false, message: `Failed to import: ${errorMsg}` };
  }
}

export async function exportTasksToCSV(): Promise<string> {
  const tasks = await db.tasks.toArray();
  const headers = ['ID', 'Title', 'Description', 'DueDate', 'DueTime', 'Priority', 'Category', 'Completed', 'Recurrence', 'CreatedAt', 'CompletedAt'];
  const rows = tasks.map((t) => [
    `"${t.id}"`,
    `"${(t.title || '').replace(/"/g, '""')}"`,
    `"${(t.description || '').replace(/"/g, '""')}"`,
    `"${t.dueDate || ''}"`,
    `"${t.dueTime || ''}"`,
    `"${t.priority}"`,
    `"${t.category || ''}"`,
    t.completed ? 'TRUE' : 'FALSE',
    `"${t.recurrence || 'none'}"`,
    `"${t.createdAt}"`,
    `"${t.completedAt || ''}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export async function exportHabitHistoryToCSV(): Promise<string> {
  const habits = await db.habits.toArray();
  const habitMap = new Map(habits.map((h) => [h.id, h.name]));
  const logs = await db.habitLogs.toArray();

  const headers = ['LogID', 'Date', 'HabitID', 'HabitName', 'Status', 'LoggedValue', 'Note', 'Timestamp'];
  const rows = logs.map((l) => [
    `"${l.id}"`,
    `"${l.date}"`,
    `"${l.habitId}"`,
    `"${(habitMap.get(l.habitId) || 'Unknown').replace(/"/g, '""')}"`,
    `"${l.status}"`,
    `"${l.value ?? ''}"`,
    `"${(l.note || '').replace(/"/g, '""')}"`,
    `"${l.loggedAt}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function triggerDownload(content: string, fileName: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
