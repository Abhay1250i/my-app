import { create } from 'zustand';
import { db } from '@/db/database';
import type { JournalEntry } from '@/types';
import { getLocalDateString } from '@/lib/dateUtils';

interface JournalState {
  currentEntry: JournalEntry | null;
  entries: JournalEntry[];
  selectedDate: string;
  isLoading: boolean;
  isSaving: boolean;
  loadEntryForDate: (date: string) => Promise<void>;
  saveEntry: (updates: Partial<JournalEntry>) => Promise<void>;
  loadAllEntries: () => Promise<void>;
  setSelectedDate: (date: string) => void;
}

export const useJournalStore = create<JournalState>((set, get) => ({
  currentEntry: null,
  entries: [],
  selectedDate: getLocalDateString(new Date()),
  isLoading: false,
  isSaving: false,

  setSelectedDate: (date: string) => {
    set({ selectedDate: date });
    get().loadEntryForDate(date);
  },

  loadEntryForDate: async (date: string) => {
    set({ isLoading: true });
    try {
      const entry = await db.journalEntries.where('date').equals(date).first();
      if (entry) {
        set({ currentEntry: entry, isLoading: false });
      } else {
        const now = new Date().toISOString();
        const placeholder: JournalEntry = {
          id: `journal_${date}`,
          date,
          createdAt: now,
          updatedAt: now,
        };
        set({ currentEntry: placeholder, isLoading: false });
      }
    } catch (err) {
      console.error('Failed to load journal entry:', err);
      set({ isLoading: false });
    }
  },

  saveEntry: async (updates: Partial<JournalEntry>) => {
    set({ isSaving: true });
    const date = get().selectedDate;
    const now = new Date().toISOString();
    const existing = get().currentEntry;

    const entryToSave: JournalEntry = {
      ...existing,
      ...updates,
      id: existing?.id || `journal_${date}`,
      date,
      updatedAt: now,
      createdAt: existing?.createdAt || now,
    };

    await db.journalEntries.put(entryToSave);
    set({ currentEntry: entryToSave, isSaving: false });
    get().loadAllEntries();
  },

  loadAllEntries: async () => {
    const all = await db.journalEntries.toArray();
    set({ entries: all });
  },
}));
