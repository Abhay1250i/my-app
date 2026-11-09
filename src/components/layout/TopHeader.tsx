'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sun, Moon, Laptop, User } from 'lucide-react';
import { useThemeStore } from '@/stores/useThemeStore';

interface TopHeaderProps {
  onOpenMenu?: () => void;
}

export function TopHeader({ onOpenMenu }: TopHeaderProps) {
  const pathname = usePathname();
  const { theme, resolvedTheme, setTheme } = useThemeStore();

  const getPageTitle = () => {
    if (pathname.includes('/tracker')) return 'Daily Habits';
    if (pathname.includes('/todos')) return 'Tasks & Todos';
    if (pathname.includes('/calendar')) return 'Monthly Calendar';
    if (pathname.includes('/analytics')) return 'Analytics';
    if (pathname.includes('/rewards')) return 'Guilt-Free Rewards';
    if (pathname.includes('/journal')) return 'Personal Journal';
    if (pathname.includes('/goals')) return 'Goals & Targets';
    if (pathname.includes('/focus')) return 'Focus Timer';
    if (pathname.includes('/settings')) return 'Settings';
    return 'Dashboard';
  };

  const cycleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('system');
    else setTheme('dark');
  };

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-[var(--surface)]/85 backdrop-blur-xl border-b border-[var(--outline-variant)]/20 pt-safe">
      <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Brand & Page Title */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)] text-[var(--on-primary)] flex items-center justify-center font-bold text-sm font-headline tracking-tighter group-hover:scale-105 transition-transform shadow-sm">
              1%
            </div>
            <span className="font-headline font-bold text-base text-[var(--on-surface)] tracking-tight">
              onePercent
            </span>
          </Link>
          <span className="text-[var(--outline)]/50 hidden sm:inline">/</span>
          <span className="font-headline text-sm font-semibold text-[var(--on-surface-variant)] truncate max-w-[150px] sm:max-w-none">
            {getPageTitle()}
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Theme Toggle */}
          <button
            onClick={cycleTheme}
            className="w-8 h-8 rounded-full bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] flex items-center justify-center transition-colors"
            title={`Current theme: ${theme} (Click to switch)`}
            aria-label="Toggle theme"
          >
            {theme === 'system' ? (
              <Laptop className="w-4 h-4 text-[var(--primary)]" />
            ) : resolvedTheme === 'dark' ? (
              <Moon className="w-4 h-4 text-[var(--primary)]" />
            ) : (
              <Sun className="w-4 h-4 text-[var(--primary)]" />
            )}
          </button>

          {/* User Avatar Circle (matching Stitch screen) */}
          <Link
            href="/settings"
            className="w-8 h-8 rounded-full bg-[var(--primary)] text-[var(--on-primary)] flex items-center justify-center font-semibold text-xs transition-transform hover:scale-105 shadow-sm"
            title="User Profile & Settings"
          >
            <User className="w-4 h-4 stroke-[2.5]" />
          </Link>
        </div>
      </div>
    </header>
  );
}
