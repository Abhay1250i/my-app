'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  X,
  Flame,
  Award,
  BookOpen,
  Target,
  Timer,
  BarChart2,
  Settings,
  Database,
  CheckCircle,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MenuDrawer({ isOpen, onClose }: MenuDrawerProps) {
  const pathname = usePathname();

  if (!isOpen) return null;

  const menuSections = [
    {
      title: 'Core Features',
      items: [
        { label: 'Dashboard', href: '/dashboard', icon: Layers, desc: 'Overview, today focus, weekly progress' },
        { label: 'Daily Habits', href: '/tracker', icon: Flame, desc: '12 daily habits, streaks, schedules' },
        { label: 'Tasks & Todos', href: '/todos', icon: CheckCircle, desc: 'Prioritized task management' },
        { label: 'Monthly Calendar', href: '/calendar', icon: Calendar, desc: 'Visual consistency heatmap' },
        { label: 'Real Analytics', href: '/analytics', icon: BarChart2, desc: 'Trends, completion rates, streaks' },
      ],
    },
    {
      title: 'Mind & Well-being',
      items: [
        { label: 'Guilt-Free Rewards', href: '/rewards', icon: Award, desc: 'Unconditional relaxation & movies' },
        { label: 'Personal Journal', href: '/journal', icon: BookOpen, desc: '5-minute evening reflection' },
        { label: 'Personal Goals', href: '/goals', icon: Target, desc: 'Milestones & long-term targets' },
        { label: 'Focus Timer', href: '/focus', icon: Timer, desc: 'Pomodoro timer with persistence' },
      ],
    },
    {
      title: 'Preferences & Data',
      items: [
        { label: 'Settings & Theme', href: '/settings', icon: Settings, desc: 'Theme, preferences, data safety' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div
        className="relative w-full max-w-sm h-full bg-[var(--surface-container)] border-l border-[var(--outline-variant)]/40 p-6 flex flex-col justify-between overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-[var(--outline-variant)]/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] flex items-center justify-center font-bold font-headline">
                1%
              </div>
              <div>
                <h3 className="font-headline font-semibold text-lg leading-tight">onePercent</h3>
                <p className="text-xs text-[var(--on-surface-variant)]">Become 1% better every day</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Links list */}
          <div className="py-4 space-y-6">
            {menuSections.map((section) => (
              <div key={section.title} className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--on-surface-variant)]/80 px-2 font-headline">
                  {section.title}
                </span>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={`flex items-start gap-3.5 p-3 rounded-xl transition-all ${
                          isActive
                            ? 'bg-[var(--surface-container-high)] text-[var(--primary)] font-medium shadow-sm'
                            : 'text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-[var(--surface-container-high)]/60'
                        }`}
                      >
                        <div
                          className={`p-2 rounded-lg mt-0.5 ${
                            isActive
                              ? 'bg-[var(--primary)]/15 text-[var(--primary)]'
                              : 'bg-[var(--surface-container-high)] text-[var(--on-surface-variant)]'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className={`text-sm ${isActive ? 'text-[var(--primary)] font-semibold' : 'text-[var(--on-surface)]'}`}>
                            {item.label}
                          </div>
                          <div className="text-xs text-[var(--on-surface-variant)] truncate">{item.desc}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-[var(--outline-variant)]/30 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--on-surface-variant)]">
            <Sparkles className="w-3.5 h-3.5 text-[var(--primary)]" />
            <span>Local-First & Offline Capable</span>
          </div>
          <p className="text-[11px] text-[var(--on-surface-variant)]/60 mt-1">
            Zero cloud tracking. Your data stays in your browser.
          </p>
        </div>
      </div>
    </div>
  );
}
