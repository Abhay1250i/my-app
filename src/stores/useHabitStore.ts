import { create } from 'zustand';
import { db, initializeDatabase } from '@/db/database';
import type { Habit, HabitLog, HabitStatus } from '@/types';
import { getLocalDateString } from '@/lib/dateUtils';

interface HabitState {
  habits: Habit[];
  habitLogs: HabitLog[];
  selectedDate: string;
  isLoading: boolean;
  loadHabits: () => Promise<void>;
  setSelectedDate: (date: string) => void;
  cycleHabitStatus: (habitId: string, date?: string) => Promise<HabitStatus>;
  setHabitStatus: (habitId: string, status: HabitStatus, date?: string, value?: number) => Promise<void>;
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => Promise<string>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  archiveHabit: (id: string) => Promise<void>;
  reorderHabits: (orderedIds: string[]) => Promise<void>;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  habitLogs: [],
  selectedDate: getLocalDateString(new Date()),
  isLoading: false,

  loadHabits: async () => {
    set({ isLoading: true });
    try {
      await initializeDatabase();
      const allHabits = await db.habits.orderBy('order').toArray();
      const allLogs = await db.habitLogs.toArray();
      set({ habits: allHabits, habitLogs: allLogs, isLoading: false });
    } catch (err) {
      console.error('Failed to load habits:', err);
      set({ isLoading: false });
    }
  },

  setSelectedDate: (date: string) => {
    set({ selectedDate: date });
  },

  cycleHabitStatus: async (habitId: string, date?: string) => {
    const targetDate = date || get().selectedDate;
    const logId = `${targetDate}_${habitId}`;
    const existingLog = get().habitLogs.find((l) => l.id === logId);

    // Progression: None -> completed -> partial -> skipped -> missed -> None
    let nextStatus: HabitStatus = 'completed';
    if (!existingLog) {
      nextStatus = 'completed';
    } else if (existingLog.status === 'completed') {
      nextStatus = 'partial';
    } else if (existingLog.status === 'partial') {
      nextStatus = 'skipped';
    } else if (existingLog.status === 'skipped') {
      nextStatus = 'missed';
    } else {
      // Remove log to revert back to untracked
      await db.habitLogs.delete(logId);
      set((state) => ({
        habitLogs: state.habitLogs.filter((l) => l.id !== logId),
      }));
      return 'missed';
    }

    const newLog: HabitLog = {
      id: logId,
      date: targetDate,
      habitId,
      status: nextStatus,
      loggedAt: new Date().toISOString(),
    };

    await db.habitLogs.put(newLog);
    set((state) => ({
      habitLogs: [...state.habitLogs.filter((l) => l.id !== logId), newLog],
    }));

    return nextStatus;
  },

  setHabitStatus: async (habitId: string, status: HabitStatus, date?: string, value?: number) => {
    const targetDate = date || get().selectedDate;
    const logId = `${targetDate}_${habitId}`;

    const newLog: HabitLog = {
      id: logId,
      date: targetDate,
      habitId,
      status,
      value,
      loggedAt: new Date().toISOString(),
    };

    await db.habitLogs.put(newLog);
    set((state) => ({
      habitLogs: [...state.habitLogs.filter((l) => l.id !== logId), newLog],
    }));
  },

  addHabit: async (habitData) => {
    const now = new Date().toISOString();
    const habits = get().habits;
    const maxOrder = habits.reduce((max, h) => Math.max(max, h.order || 0), 0);
    const newId = `habit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newHabit: Habit = {
      ...habitData,
      id: newId,
      order: maxOrder + 1,
      createdAt: now,
      updatedAt: now,
    };

    await db.habits.add(newHabit);
    set((state) => ({ habits: [...state.habits, newHabit] }));
    return newId;
  },

  updateHabit: async (id: string, updates: Partial<Habit>) => {
    const now = new Date().toISOString();
    await db.habits.update(id, { ...updates, updatedAt: now });
    set((state) => ({
      habits: state.habits.map((h) => (h.id === id ? { ...h, ...updates, updatedAt: now } : h)),
    }));
  },

  deleteHabit: async (id: string) => {
    await db.habits.delete(id);
    await db.habitLogs.where('habitId').equals(id).delete();
    set((state) => ({
      habits: state.habits.filter((h) => h.id !== id),
      habitLogs: state.habitLogs.filter((l) => l.habitId !== id),
    }));
  },

  archiveHabit: async (id: string) => {
    const habit = get().habits.find((h) => h.id === id);
    if (!habit) return;
    const updatedArchived = !habit.isArchived;
    await db.habits.update(id, { isArchived: updatedArchived });
    set((state) => ({
      habits: state.habits.map((h) => (h.id === id ? { ...h, isArchived: updatedArchived } : h)),
    }));
  },

  reorderHabits: async (orderedIds: string[]) => {
    const updated = get().habits.map((h) => {
      const newOrder = orderedIds.indexOf(h.id);
      return newOrder !== -1 ? { ...h, order: newOrder + 1 } : h;
    });

    set({ habits: updated });

    await db.transaction('rw', db.habits, async () => {
      for (const h of updated) {
        await db.habits.update(h.id, { order: h.order });
      }
    });
  },
}));
