import { create } from 'zustand';
import { db } from '@/db/database';
import type { Goal, Milestone, GoalStatus } from '@/types';
import { getLocalDateString } from '@/lib/dateUtils';

interface GoalState {
  goals: Goal[];
  milestones: Milestone[];
  isLoading: boolean;
  loadGoals: () => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'progress'>, initialMilestones?: string[]) => Promise<string>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addMilestone: (goalId: string, title: string, dueDate?: string) => Promise<string>;
  toggleMilestone: (milestoneId: string) => Promise<void>;
  deleteMilestone: (milestoneId: string) => Promise<void>;
}

export const useGoalStore = create<GoalState>((set, get) => ({
  goals: [],
  milestones: [],
  isLoading: false,

  loadGoals: async () => {
    set({ isLoading: true });
    try {
      const allGoals = await db.goals.toArray();
      const allMilestones = await db.milestones.toArray();

      // Seed starter goals if none exist
      if (allGoals.length === 0) {
        const now = new Date().toISOString();
        const todayStr = getLocalDateString(new Date());

        const sampleGoals: Goal[] = [
          {
            id: 'goal_dsa',
            title: 'Master Core DSA Algorithms',
            description: 'Solve 150 LeetCode problems covering arrays, trees, graphs, and dynamic programming.',
            category: 'Academics',
            startDate: todayStr,
            targetDate: '2026-12-31',
            progress: 33,
            status: 'active',
            createdAt: now,
            updatedAt: now,
          },
          {
            id: 'goal_fitness',
            title: 'Consistent Physical Conditioning',
            description: 'Maintain 5 workouts per week and run 5k under 25 minutes.',
            category: 'Fitness',
            startDate: todayStr,
            targetDate: '2026-12-15',
            progress: 50,
            status: 'active',
            createdAt: now,
            updatedAt: now,
          },
          {
            id: 'goal_projects',
            title: 'Ship High-Impact Software Project',
            description: 'Build and deploy full-stack production-ready applications with modern UI/UX.',
            category: 'Career',
            startDate: todayStr,
            targetDate: '2026-11-30',
            progress: 75,
            status: 'active',
            createdAt: now,
            updatedAt: now,
          },
        ];

        const sampleMilestones: Milestone[] = [
          { id: 'm_1', goalId: 'goal_dsa', title: 'Complete Arrays & Hashing', completed: true },
          { id: 'm_2', goalId: 'goal_dsa', title: 'Complete Two Pointers & Sliding Window', completed: false },
          { id: 'm_3', goalId: 'goal_dsa', title: 'Trees and Graph Traversals', completed: false },
          { id: 'm_4', goalId: 'goal_fitness', title: 'Run 5K without stopping', completed: true },
          { id: 'm_5', goalId: 'goal_fitness', title: 'Bench press bodyweight', completed: false },
          { id: 'm_6', goalId: 'goal_projects', title: 'Complete System Architecture', completed: true },
          { id: 'm_7', goalId: 'goal_projects', title: 'Deliver Functional UI', completed: true },
          { id: 'm_8', goalId: 'goal_projects', title: 'Local-first Database Integration', completed: true },
          { id: 'm_9', goalId: 'goal_projects', title: 'Launch Production Build', completed: false },
        ];

        await db.goals.bulkAdd(sampleGoals);
        await db.milestones.bulkAdd(sampleMilestones);
        set({ goals: sampleGoals, milestones: sampleMilestones, isLoading: false });
        return;
      }

      set({ goals: allGoals, milestones: allMilestones, isLoading: false });
    } catch (err) {
      console.error('Failed to load goals:', err);
      set({ isLoading: false });
    }
  },

  addGoal: async (goalData, initialMilestones = []) => {
    const now = new Date().toISOString();
    const newGoalId = `goal_${Date.now()}`;

    const newGoal: Goal = {
      ...goalData,
      id: newGoalId,
      progress: 0,
      createdAt: now,
      updatedAt: now,
    };

    const newMilestones: Milestone[] = initialMilestones.map((title, i) => ({
      id: `m_${Date.now()}_${i}`,
      goalId: newGoalId,
      title,
      completed: false,
    }));

    await db.goals.add(newGoal);
    if (newMilestones.length > 0) {
      await db.milestones.bulkAdd(newMilestones);
    }

    set((state) => ({
      goals: [...state.goals, newGoal],
      milestones: [...state.milestones, ...newMilestones],
    }));

    return newGoalId;
  },

  updateGoal: async (id: string, updates: Partial<Goal>) => {
    const now = new Date().toISOString();
    await db.goals.update(id, { ...updates, updatedAt: now });
    set((state) => ({
      goals: state.goals.map((g) => (g.id === id ? { ...g, ...updates, updatedAt: now } : g)),
    }));
  },

  deleteGoal: async (id: string) => {
    await db.goals.delete(id);
    await db.milestones.where('goalId').equals(id).delete();
    set((state) => ({
      goals: state.goals.filter((g) => g.id !== id),
      milestones: state.milestones.filter((m) => m.goalId !== id),
    }));
  },

  addMilestone: async (goalId: string, title: string, dueDate?: string) => {
    const newId = `m_${Date.now()}`;
    const newMilestone: Milestone = {
      id: newId,
      goalId,
      title,
      completed: false,
      dueDate,
    };

    await db.milestones.add(newMilestone);
    const updatedMilestones = [...get().milestones, newMilestone];
    set({ milestones: updatedMilestones });

    // Recalculate goal progress
    const goalMilestones = updatedMilestones.filter((m) => m.goalId === goalId);
    const completedCount = goalMilestones.filter((m) => m.completed).length;
    const progress = Math.round((completedCount / goalMilestones.length) * 100);
    await get().updateGoal(goalId, { progress });

    return newId;
  },

  toggleMilestone: async (milestoneId: string) => {
    const milestone = get().milestones.find((m) => m.id === milestoneId);
    if (!milestone) return;

    const nextCompleted = !milestone.completed;
    const completedAt = nextCompleted ? new Date().toISOString() : undefined;

    await db.milestones.update(milestoneId, { completed: nextCompleted, completedAt });
    const updatedMilestones = get().milestones.map((m) =>
      m.id === milestoneId ? { ...m, completed: nextCompleted, completedAt } : m
    );
    set({ milestones: updatedMilestones });

    // Recalculate goal progress
    const goalMilestones = updatedMilestones.filter((m) => m.goalId === milestone.goalId);
    const completedCount = goalMilestones.filter((m) => m.completed).length;
    const progress = Math.round((completedCount / goalMilestones.length) * 100);
    await get().updateGoal(milestone.goalId, { progress, status: progress === 100 ? 'completed' : 'active' });
  },

  deleteMilestone: async (milestoneId: string) => {
    const milestone = get().milestones.find((m) => m.id === milestoneId);
    if (!milestone) return;

    await db.milestones.delete(milestoneId);
    const updatedMilestones = get().milestones.filter((m) => m.id !== milestoneId);
    set({ milestones: updatedMilestones });

    const goalMilestones = updatedMilestones.filter((m) => m.goalId === milestone.goalId);
    const progress = goalMilestones.length > 0
      ? Math.round((goalMilestones.filter((m) => m.completed).length / goalMilestones.length) * 100)
      : 0;
    await get().updateGoal(milestone.goalId, { progress });
  },
}));
