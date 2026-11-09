import { create } from 'zustand';
import { db } from '@/db/database';
import type { Task, TaskPriority, TaskRecurrence } from '@/types';
import { getLocalDateString } from '@/lib/dateUtils';
import { addDays, addWeeks, addMonths } from 'date-fns';

export type TaskFilterView = 'today' | 'upcoming' | 'overdue' | 'completed' | 'all';

interface TaskState {
  tasks: Task[];
  filterView: TaskFilterView;
  searchQuery: string;
  selectedCategory: string | null;
  isLoading: boolean;
  loadTasks: () => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed' | 'order'>) => Promise<string>;
  toggleTask: (id: string) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  setFilterView: (filter: TaskFilterView) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  filterView: 'today',
  searchQuery: '',
  selectedCategory: null,
  isLoading: false,

  loadTasks: async () => {
    set({ isLoading: true });
    try {
      const allTasks = await db.tasks.orderBy('order').toArray();
      set({ tasks: allTasks, isLoading: false });
    } catch (err) {
      console.error('Failed to load tasks:', err);
      set({ isLoading: false });
    }
  },

  addTask: async (taskData) => {
    const now = new Date().toISOString();
    const tasks = get().tasks;
    const maxOrder = tasks.reduce((max, t) => Math.max(max, t.order || 0), 0);
    const newId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newTask: Task = {
      ...taskData,
      id: newId,
      completed: false,
      order: maxOrder + 1,
      createdAt: now,
    };

    await db.tasks.add(newTask);
    set((state) => ({ tasks: [...state.tasks, newTask] }));
    return newId;
  },

  toggleTask: async (id: string) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;

    const nextCompleted = !task.completed;
    const now = new Date().toISOString();

    await db.tasks.update(id, {
      completed: nextCompleted,
      completedAt: nextCompleted ? now : undefined,
    });

    // Handle recurrence when marked completed
    if (nextCompleted && task.recurrence && task.recurrence !== 'none') {
      const currentDueDate = task.dueDate ? new Date(task.dueDate) : new Date();
      let nextDueDate: Date = addDays(currentDueDate, 1);

      if (task.recurrence === 'daily') {
        nextDueDate = addDays(currentDueDate, 1);
      } else if (task.recurrence === 'weekly') {
        nextDueDate = addWeeks(currentDueDate, 1);
      } else if (task.recurrence === 'weekdays') {
        const day = currentDueDate.getDay();
        nextDueDate = addDays(currentDueDate, day === 5 ? 3 : day === 6 ? 2 : 1);
      } else if (task.recurrence === 'monthly') {
        nextDueDate = addMonths(currentDueDate, 1);
      }

      const recurringTask: Task = {
        id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        title: task.title,
        description: task.description,
        dueDate: getLocalDateString(nextDueDate),
        dueTime: task.dueTime,
        priority: task.priority,
        category: task.category,
        completed: false,
        recurrence: task.recurrence,
        order: task.order + 1,
        createdAt: now,
      };

      await db.tasks.add(recurringTask);
      set((state) => ({
        tasks: [
          ...state.tasks.map((t) =>
            t.id === id ? { ...t, completed: nextCompleted, completedAt: now } : t
          ),
          recurringTask,
        ],
      }));
      return;
    }

    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id
          ? { ...t, completed: nextCompleted, completedAt: nextCompleted ? now : undefined }
          : t
      ),
    }));
  },

  updateTask: async (id: string, updates: Partial<Task>) => {
    await db.tasks.update(id, updates);
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  },

  deleteTask: async (id: string) => {
    await db.tasks.delete(id);
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    }));
  },

  setFilterView: (filterView) => set({ filterView }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
}));
