import { create } from 'zustand';
import { db } from '@/db/database';

export type AppTheme = 'dark' | 'light' | 'system';

interface ThemeState {
  theme: AppTheme;
  resolvedTheme: 'dark' | 'light';
  initTheme: () => Promise<void>;
  setTheme: (theme: AppTheme) => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'dark',
  resolvedTheme: 'dark',

  initTheme: async () => {
    let savedTheme: AppTheme = 'dark';

    if (typeof window !== 'undefined') {
      const local = localStorage.getItem('onepercent_theme') as AppTheme;
      if (local && ['dark', 'light', 'system'].includes(local)) {
        savedTheme = local;
      } else {
        try {
          const pref = await db.preferences.get('theme');
          if (pref?.value) savedTheme = pref.value as AppTheme;
        } catch {
          // Fallback
        }
      }
    }

    const systemDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const resolved: 'dark' | 'light' = savedTheme === 'system' ? (systemDark ? 'dark' : 'light') : savedTheme;

    if (typeof document !== 'undefined') {
      if (resolved === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    set({ theme: savedTheme, resolvedTheme: resolved });

    // Listen to system changes if theme is system
    if (typeof window !== 'undefined') {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (get().theme === 'system') {
          const newResolved = e.matches ? 'dark' : 'light';
          if (newResolved === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          set({ resolvedTheme: newResolved });
        }
      });
    }
  },

  setTheme: async (theme: AppTheme) => {
    const systemDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const resolved: 'dark' | 'light' = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;

    if (typeof document !== 'undefined') {
      if (resolved === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('onepercent_theme', theme);
    }

    try {
      await db.preferences.put({ key: 'theme', value: theme });
    } catch {
      // Ignore
    }

    set({ theme, resolvedTheme: resolved });
  },
}));
