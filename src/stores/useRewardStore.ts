import { create } from 'zustand';
import { db } from '@/db/database';
import type { Reward, RewardHistory } from '@/types';
import { getLocalDateString } from '@/lib/dateUtils';

interface RewardState {
  rewards: Reward[];
  history: RewardHistory[];
  isLoading: boolean;
  loadRewards: () => Promise<void>;
  addReward: (reward: Omit<Reward, 'id' | 'createdAt' | 'isCustom'>) => Promise<string>;
  logEnjoyedReward: (rewardId: string, notes?: string) => Promise<void>;
  deleteReward: (id: string) => Promise<void>;
}

export const useRewardStore = create<RewardState>((set, get) => ({
  rewards: [],
  history: [],
  isLoading: false,

  loadRewards: async () => {
    set({ isLoading: true });
    try {
      const allRewards = await db.rewards.toArray();
      const allHistory = await db.rewardHistory.orderBy('enjoyedAt').reverse().toArray();
      set({ rewards: allRewards, history: allHistory, isLoading: false });
    } catch (err) {
      console.error('Failed to load rewards:', err);
      set({ isLoading: false });
    }
  },

  addReward: async (rewardData) => {
    const now = new Date().toISOString();
    const newId = `reward_${Date.now()}`;

    const newReward: Reward = {
      ...rewardData,
      id: newId,
      isCustom: true,
      createdAt: now,
    };

    await db.rewards.add(newReward);
    set((state) => ({ rewards: [...state.rewards, newReward] }));
    return newId;
  },

  logEnjoyedReward: async (rewardId: string, notes?: string) => {
    const reward = get().rewards.find((r) => r.id === rewardId);
    if (!reward) return;

    const todayStr = getLocalDateString(new Date());
    const now = new Date().toISOString();
    const newHistory: RewardHistory = {
      id: `rh_${Date.now()}`,
      rewardId,
      rewardName: reward.name,
      date: todayStr,
      enjoyedAt: now,
      notes,
    };

    await db.rewardHistory.add(newHistory);
    set((state) => ({ history: [newHistory, ...state.history] }));
  },

  deleteReward: async (id: string) => {
    await db.rewards.delete(id);
    set((state) => ({
      rewards: state.rewards.filter((r) => r.id !== id),
    }));
  },
}));
