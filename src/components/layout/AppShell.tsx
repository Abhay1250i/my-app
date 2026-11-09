'use client';

import React, { useEffect, useState } from 'react';
import { TopHeader } from './TopHeader';
import { DesktopSidebar } from './DesktopSidebar';
import { BottomNav } from './BottomNav';
import { MenuDrawer } from './MenuDrawer';
import { AddHabitModal } from '@/components/common/AddHabitModal';
import { AddTaskModal } from '@/components/common/AddTaskModal';
import { useThemeStore } from '@/stores/useThemeStore';
import { useHabitStore } from '@/stores/useHabitStore';
import { useTaskStore } from '@/stores/useTaskStore';
import { useGoalStore } from '@/stores/useGoalStore';
import { useRewardStore } from '@/stores/useRewardStore';
import { useTimerStore } from '@/stores/useTimerStore';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { WifiOff } from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { initTheme } = useThemeStore();
  const { loadHabits } = useHabitStore();
  const { loadTasks } = useTaskStore();
  const { loadGoals } = useGoalStore();
  const { loadRewards } = useRewardStore();
  const { initTimer, tick, status: timerStatus } = useTimerStore();
  const { isOffline } = useOfflineStatus();
  const [mounted, setMounted] = useState(false);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    initTheme();
    loadHabits();
    loadTasks();
    loadGoals();
    loadRewards();
    initTimer();
  }, [initTheme, loadHabits, loadTasks, loadGoals, loadRewards, initTimer]);

  // Global Timer Tick interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerStatus === 'running') {
      interval = setInterval(() => {
        tick();
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerStatus, tick]);

  if (!mounted) {
    return (
      <div className="flex min-h-screen bg-canvas text-[var(--on-surface)] items-center justify-center">
        <div className="flex items-center gap-3 font-headline font-bold text-sm text-[var(--primary)]">
          <div className="w-7 h-7 rounded-lg bg-[var(--primary)] text-[var(--on-primary)] flex items-center justify-center font-bold text-xs font-headline">
            1%
          </div>
          <span>onePercent loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-canvas text-[var(--on-surface)] selection:bg-[var(--primary)] selection:text-[var(--on-primary)]">
      {/* Desktop Sidebar */}
      <DesktopSidebar
        onOpenAddHabit={() => setIsAddHabitOpen(true)}
        onOpenAddTask={() => setIsAddTaskOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0 min-h-screen">
        <TopHeader onOpenMenu={() => setIsMenuOpen(true)} />

        {isOffline && (
          <div className="bg-[var(--surface-container-high)] border-b border-[var(--outline-variant)]/40 px-4 py-1.5 flex items-center justify-center gap-2 text-xs font-semibold text-[var(--on-surface-variant)] pt-18 md:pt-4">
            <WifiOff className="w-3.5 h-3.5 text-yellow-400" />
            <span>Working offline — all changes are securely preserved in IndexedDB.</span>
          </div>
        )}

        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pt-20 pb-28 md:pb-12">
          {children}
        </main>

        <BottomNav onOpenMenu={() => setIsMenuOpen(true)} />
      </div>

      {/* Modals & Drawers */}
      <MenuDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <AddHabitModal isOpen={isAddHabitOpen} onClose={() => setIsAddHabitOpen(false)} />
      <AddTaskModal isOpen={isAddTaskOpen} onClose={() => setIsAddTaskOpen(false)} />
    </div>
  );
}
