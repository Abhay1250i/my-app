'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Repeat,
  CheckSquare,
  Calendar,
  BarChart2,
  Award,
  BookOpen,
  Target,
  Timer,
  Settings,
  Flame,
  Sun,
  Moon,
  Laptop,
  Plus,
} from 'lucide-react';
import { useThemeStore } from '@/stores/useThemeStore';
import { useHabitStore } from '@/stores/useHabitStore';
import { calculateStreak } from '@/lib/statsUtils';
import { useMounted } from '@/hooks/useMounted';

interface DesktopSidebarProps {
  onOpenAddHabit: () => void;
  onOpenAddTask: () => void;
}

export function DesktopSidebar({ onOpenAddHabit, onOpenAddTask }: DesktopSidebarProps) {
  const mounted = useMounted();
  const pathname = usePathname();
  const { theme, resolvedTheme, setTheme } = useThemeStore();
  const { habits, habitLogs } = useHabitStore();
  const { currentStreak } = mounted ? calculateStreak(habits, habitLogs) : { currentStreak: 0 };

  const mainNav = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Daily Habits', href: '/tracker', icon: Repeat },
    { label: 'Tasks & Todos', href: '/todos', icon: CheckSquare },
    { label: 'Monthly Calendar', href: '/calendar', icon: Calendar },
    { label: 'Analytics', href: '/analytics', icon: BarChart2 },
  ];

  const secondaryNav = [
    { label: 'Guilt-Free Rewards', href: '/rewards', icon: Award },
    { label: 'Personal Journal', href: '/journal', icon: BookOpen },
    { label: 'Personal Goals', href: '/goals', icon: Target },
    { label: 'Focus Timer', href: '/focus', icon: Timer },
    { label: 'Settings & Data', href: '/settings', icon: Settings },
  ];

  const cycleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('system');
    else setTheme('dark');
  };

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-[var(--surface-container)] border-r border-[var(--outline-variant)]/30 z-30 select-none">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-[var(--outline-variant)]/20">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-[var(--primary)] text-[var(--on-primary)] flex items-center justify-center font-bold text-sm font-headline tracking-tighter group-hover:scale-105 transition-transform shadow-sm">
            1%
          </div>
          <div>
            <div className="font-headline font-bold text-base leading-none text-[var(--on-surface)] tracking-tight">
              onePercent
            </div>
            <div className="text-[10px] text-[var(--on-surface-variant)] mt-1 tracking-wider uppercase">
              1% Better Every Day
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Action Buttons */}
      <div className="p-4 grid grid-cols-2 gap-2 border-b border-[var(--outline-variant)]/20">
        <button
          onClick={onOpenAddHabit}
          className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] text-xs font-semibold hover:opacity-90 transition-opacity font-headline"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Add Habit</span>
        </button>
        <button
          onClick={onOpenAddTask}
          className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-[var(--surface-container-high)] text-[var(--on-surface)] text-xs font-semibold hover:bg-[var(--surface-container-highest)] transition-colors font-headline"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--on-surface-variant)]/70 px-3 mb-2 font-headline">
            Main Tracking
          </div>
          <div className="space-y-1">
            {mainNav.map((item) => {
              const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/');
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                    isActive
                      ? 'bg-[var(--surface-container-high)] text-[var(--primary)] font-semibold shadow-sm'
                      : 'text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-[var(--surface-container-high)]/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[var(--primary)]' : 'text-[var(--on-surface-variant)]'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--on-surface-variant)]/70 px-3 mb-2 font-headline">
            Mind & Growth
          </div>
          <div className="space-y-1">
            {secondaryNav.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                    isActive
                      ? 'bg-[var(--surface-container-high)] text-[var(--primary)] font-semibold shadow-sm'
                      : 'text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-[var(--surface-container-high)]/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[var(--primary)]' : 'text-[var(--on-surface-variant)]'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Footer Status */}
      <div className="p-4 border-t border-[var(--outline-variant)]/20 bg-[var(--surface-container-low)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-[var(--surface-container)] px-2.5 py-1 rounded-full border border-[var(--outline-variant)]/30">
              <Flame className="w-3.5 h-3.5 text-[var(--tertiary-container)] fill-[var(--tertiary-container)]" />
              <span className="text-xs font-semibold text-[var(--on-surface)]">{currentStreak}d streak</span>
            </div>
          </div>

          <button
            onClick={cycleTheme}
            className="p-1.5 rounded-lg bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition-colors"
            title={`Theme: ${theme}`}
          >
            {theme === 'system' ? (
              <Laptop className="w-4 h-4 text-[var(--primary)]" />
            ) : resolvedTheme === 'dark' ? (
              <Moon className="w-4 h-4 text-[var(--primary)]" />
            ) : (
              <Sun className="w-4 h-4 text-[var(--primary)]" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
