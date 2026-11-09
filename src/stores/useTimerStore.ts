import { create } from 'zustand';
import { db } from '@/db/database';
import type { FocusMode, FocusSession } from '@/types';

const TIMER_STORAGE_KEY = 'onepercent_timer_state';

const DEFAULT_DURATIONS: Record<FocusMode, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

interface StoredTimerData {
  mode: FocusMode;
  status: 'idle' | 'running' | 'paused';
  timeLeft: number;
  targetEndTime: number | null;
  selectedTaskId: string | null;
  selectedTaskTitle: string | null;
  customDurationMinutes: number;
}

interface TimerState {
  mode: FocusMode;
  status: 'idle' | 'running' | 'paused';
  timeLeft: number;
  totalDuration: number;
  selectedTaskId: string | null;
  selectedTaskTitle: string | null;
  customDurationMinutes: number;
  sessionHistory: FocusSession[];
  initTimer: () => Promise<void>;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  tick: () => void;
  setMode: (mode: FocusMode) => void;
  setCustomDuration: (minutes: number) => void;
  setSelectedTask: (taskId: string | null, taskTitle?: string | null) => void;
  completeSession: () => Promise<void>;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  mode: 'focus',
  status: 'idle',
  timeLeft: DEFAULT_DURATIONS.focus,
  totalDuration: DEFAULT_DURATIONS.focus,
  selectedTaskId: null,
  selectedTaskTitle: null,
  customDurationMinutes: 25,
  sessionHistory: [],

  initTimer: async () => {
    // Load historical focus sessions from IndexedDB
    try {
      const sessions = await db.focusSessions.orderBy('startTime').reverse().toArray();
      set({ sessionHistory: sessions });
    } catch (err) {
      console.error('Failed to load focus sessions:', err);
    }

    // Restore timer state from localStorage to survive page refreshes
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(TIMER_STORAGE_KEY);
      if (!raw) return;
      const data: StoredTimerData = JSON.parse(raw);

      if (data.status === 'running' && data.targetEndTime) {
        const remaining = Math.max(0, Math.round((data.targetEndTime - Date.now()) / 1000));
        if (remaining <= 0) {
          set({
            mode: data.mode,
            status: 'idle',
            timeLeft: DEFAULT_DURATIONS[data.mode],
            selectedTaskId: data.selectedTaskId,
            selectedTaskTitle: data.selectedTaskTitle,
          });
          get().completeSession();
        } else {
          set({
            mode: data.mode,
            status: 'running',
            timeLeft: remaining,
            selectedTaskId: data.selectedTaskId,
            selectedTaskTitle: data.selectedTaskTitle,
          });
        }
      } else if (data.status === 'paused') {
        set({
          mode: data.mode,
          status: 'paused',
          timeLeft: data.timeLeft,
          selectedTaskId: data.selectedTaskId,
          selectedTaskTitle: data.selectedTaskTitle,
        });
      }
    } catch {
      // Fallback to default
    }
  },

  start: () => {
    const { timeLeft, mode, selectedTaskId, selectedTaskTitle, customDurationMinutes } = get();
    const targetEndTime = Date.now() + timeLeft * 1000;

    const data: StoredTimerData = {
      mode,
      status: 'running',
      timeLeft,
      targetEndTime,
      selectedTaskId,
      selectedTaskTitle,
      customDurationMinutes,
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(data));
    }

    set({ status: 'running' });
  },

  pause: () => {
    const { mode, timeLeft, selectedTaskId, selectedTaskTitle, customDurationMinutes } = get();
    const data: StoredTimerData = {
      mode,
      status: 'paused',
      timeLeft,
      targetEndTime: null,
      selectedTaskId,
      selectedTaskTitle,
      customDurationMinutes,
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(data));
    }

    set({ status: 'paused' });
  },

  resume: () => {
    get().start();
  },

  reset: () => {
    const { mode, customDurationMinutes } = get();
    const duration = mode === 'focus' ? customDurationMinutes * 60 : DEFAULT_DURATIONS[mode];

    if (typeof window !== 'undefined') {
      localStorage.removeItem(TIMER_STORAGE_KEY);
    }

    set({
      status: 'idle',
      timeLeft: duration,
      totalDuration: duration,
    });
  },

  tick: () => {
    const { status, timeLeft } = get();
    if (status !== 'running') return;

    if (timeLeft <= 1) {
      set({ timeLeft: 0, status: 'idle' });
      if (typeof window !== 'undefined') {
        localStorage.removeItem(TIMER_STORAGE_KEY);
      }
      get().completeSession();
    } else {
      set({ timeLeft: timeLeft - 1 });
    }
  },

  setMode: (mode: FocusMode) => {
    const { customDurationMinutes } = get();
    const duration = mode === 'focus' ? customDurationMinutes * 60 : DEFAULT_DURATIONS[mode];

    if (typeof window !== 'undefined') {
      localStorage.removeItem(TIMER_STORAGE_KEY);
    }

    set({
      mode,
      status: 'idle',
      timeLeft: duration,
      totalDuration: duration,
    });
  },

  setCustomDuration: (minutes: number) => {
    const clamped = Math.max(1, Math.min(180, minutes));
    set({ customDurationMinutes: clamped });
    if (get().mode === 'focus' && get().status === 'idle') {
      const dur = clamped * 60;
      set({ timeLeft: dur, totalDuration: dur });
    }
  },

  setSelectedTask: (taskId, taskTitle) => {
    set({ selectedTaskId: taskId, selectedTaskTitle: taskTitle || null });
  },

  completeSession: async () => {
    const { mode, totalDuration, selectedTaskId, selectedTaskTitle } = get();
    const now = new Date();
    const startTime = new Date(now.getTime() - totalDuration * 1000).toISOString();

    const newSession: FocusSession = {
      id: `session_${Date.now()}`,
      durationMinutes: Math.round(totalDuration / 60),
      mode,
      taskId: selectedTaskId || undefined,
      taskTitle: selectedTaskTitle || undefined,
      completed: true,
      startTime,
      endTime: now.toISOString(),
    };

    try {
      await db.focusSessions.add(newSession);
      set((state) => ({ sessionHistory: [newSession, ...state.sessionHistory] }));
    } catch (err) {
      console.error('Failed to save focus session:', err);
    }
  },
}));
