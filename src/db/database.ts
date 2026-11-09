import { OnePercentDatabase } from './schema';
import type { Habit, Reward } from '@/types';

export const db = new OnePercentDatabase();

export const DEFAULT_HABITS: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Wake up on time',
    description: 'Start the day with intention and zero rush',
    category: 'Routine',
    icon: 'alarm',
    targetDays: [0, 1, 2, 3, 4, 5, 6],
    targetTimeOfDay: 'Morning',
    targetValue: 1,
    unit: 'time',
    order: 1,
    isArchived: false,
  },
  {
    name: 'Morning sunlight',
    description: 'Get 10-15 minutes of natural sunlight to set circadian rhythm',
    category: 'Health',
    icon: 'sun',
    targetDays: [0, 1, 2, 3, 4, 5, 6],
    targetTimeOfDay: 'Morning',
    targetValue: 15,
    unit: 'mins',
    order: 2,
    isArchived: false,
  },
  {
    name: 'Drink sufficient water',
    description: 'Stay hydrated with at least 2.5 - 3 liters daily',
    category: 'Health',
    icon: 'droplet',
    targetDays: [0, 1, 2, 3, 4, 5, 6],
    targetTimeOfDay: 'Anytime',
    targetValue: 8,
    unit: 'glasses',
    order: 3,
    isArchived: false,
  },
  {
    name: 'Workout',
    description: 'Resistance training or bodyweight fitness session',
    category: 'Fitness',
    icon: 'dumbbell',
    targetDays: [1, 2, 3, 4, 5, 6],
    targetTimeOfDay: 'Afternoon',
    targetValue: 45,
    unit: 'mins',
    order: 4,
    isArchived: false,
  },
  {
    name: 'Walking',
    description: 'Get at least 6,000 to 10,000 steps or an evening walk',
    category: 'Fitness',
    icon: 'footprints',
    targetDays: [0, 1, 2, 3, 4, 5, 6],
    targetTimeOfDay: 'Evening',
    targetValue: 30,
    unit: 'mins',
    order: 5,
    isArchived: false,
  },
  {
    name: 'Read 5 pages',
    description: 'Build quiet reading consistency without pressure',
    category: 'Mind',
    icon: 'book-open',
    targetDays: [0, 1, 2, 3, 4, 5, 6],
    targetTimeOfDay: 'Evening',
    targetValue: 5,
    unit: 'pages',
    order: 6,
    isArchived: false,
  },
  {
    name: 'Solve one DSA problem',
    description: 'Solve one algorithmic puzzle to keep technical intuition sharp',
    category: 'Academics',
    icon: 'code',
    targetDays: [1, 2, 3, 4, 5],
    targetTimeOfDay: 'Afternoon',
    targetValue: 1,
    unit: 'problem',
    order: 7,
    isArchived: false,
  },
  {
    name: 'Focused study',
    description: 'Dedicated deep work without phone notifications',
    category: 'Academics',
    icon: 'brain',
    targetDays: [1, 2, 3, 4, 5, 6],
    targetTimeOfDay: 'Morning',
    targetValue: 60,
    unit: 'mins',
    order: 8,
    isArchived: false,
  },
  {
    name: 'Eat proper meals',
    description: 'Nourishing, timely breakfast, lunch, and dinner',
    category: 'Health',
    icon: 'utensils',
    targetDays: [0, 1, 2, 3, 4, 5, 6],
    targetTimeOfDay: 'Anytime',
    targetValue: 3,
    unit: 'meals',
    order: 9,
    isArchived: false,
  },
  {
    name: 'Limit unnecessary scrolling',
    description: 'Avoid mindless social media and doomscrolling',
    category: 'Mind',
    icon: 'smartphone',
    targetDays: [0, 1, 2, 3, 4, 5, 6],
    targetTimeOfDay: 'Anytime',
    targetValue: 1,
    unit: 'check',
    order: 10,
    isArchived: false,
  },
  {
    name: 'Journal for 5 minutes',
    description: 'Brief evening reflection on wins, lessons, and tomorrow',
    category: 'Mind',
    icon: 'pen-tool',
    targetDays: [0, 1, 2, 3, 4, 5, 6],
    targetTimeOfDay: 'Evening',
    targetValue: 5,
    unit: 'mins',
    order: 11,
    isArchived: false,
  },
  {
    name: 'Sleep on time',
    description: 'Wind down and sleep to wake refreshed tomorrow',
    category: 'Routine',
    icon: 'moon',
    targetDays: [0, 1, 2, 3, 4, 5, 6],
    targetTimeOfDay: 'Evening',
    targetValue: 1,
    unit: 'time',
    order: 12,
    isArchived: false,
  },
];

export const DEFAULT_REWARDS: Omit<Reward, 'id' | 'createdAt'>[] = [
  {
    name: 'Watch one episode of The Mentalist',
    duration: '45 mins',
    category: 'Entertainment',
    conditions: 'No conditions required — pure guilt-free decompression',
    isCustom: false,
  },
  {
    name: 'Watch a football match',
    duration: '90 mins',
    category: 'Sports',
    conditions: 'Enjoy the game guilt-free',
    isCustom: false,
  },
  {
    name: 'Play football',
    duration: '60 mins',
    category: 'Recreation',
    conditions: 'Active outdoor fun with friends',
    isCustom: false,
  },
  {
    name: 'Watch a movie',
    duration: '2 hours',
    category: 'Entertainment',
    conditions: 'Weekend or evening relaxation',
    isCustom: false,
  },
  {
    name: 'Spend time with friends',
    duration: 'Flexible',
    category: 'Social',
    conditions: 'Social connection is essential, never earned',
    isCustom: false,
  },
  {
    name: 'Go for a walk',
    duration: '30 mins',
    category: 'Outdoor',
    conditions: 'Fresh air and clear thinking',
    isCustom: false,
  },
  {
    name: 'Relax without doing anything',
    duration: '30 mins',
    category: 'Rest',
    conditions: 'Zero guilt rest and mindfulness',
    isCustom: false,
  },
];

export async function initializeDatabase(): Promise<void> {
  const habitCount = await db.habits.count();
  const now = new Date().toISOString();

  if (habitCount === 0) {
    const habitsToInsert: Habit[] = DEFAULT_HABITS.map((h, index) => ({
      ...h,
      id: `habit_default_${index + 1}`,
      createdAt: now,
      updatedAt: now,
    }));
    await db.habits.bulkAdd(habitsToInsert);
  }

  const rewardCount = await db.rewards.count();
  if (rewardCount === 0) {
    const rewardsToInsert: Reward[] = DEFAULT_REWARDS.map((r, index) => ({
      ...r,
      id: `reward_default_${index + 1}`,
      createdAt: now,
    }));
    await db.rewards.bulkAdd(rewardsToInsert);
  }

  // Ensure default preferences
  const themePref = await db.preferences.get('theme');
  if (!themePref) {
    await db.preferences.put({ key: 'theme', value: 'dark' });
  }

  const userName = await db.preferences.get('user_name');
  if (!userName) {
    await db.preferences.put({ key: 'user_name', value: 'Friend' });
  }
}
