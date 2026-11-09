'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Repeat, CheckSquare, Calendar, Menu } from 'lucide-react';

interface BottomNavProps {
  onOpenMenu: () => void;
}

export function BottomNav({ onOpenMenu }: BottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Habits', href: '/tracker', icon: Repeat },
    { label: 'Tasks', href: '/todos', icon: CheckSquare },
    { label: 'Calendar', href: '/calendar', icon: Calendar },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 pb-safe bg-[var(--surface)]/90 backdrop-blur-xl border-t border-[var(--outline-variant)]/30 shadow-[0_-2px_12px_rgba(0,0,0,0.15)]">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 w-16 h-13 rounded-xl transition-all ${
                isActive
                  ? 'text-[var(--primary)] bg-[var(--surface-container-high)] font-semibold'
                  : 'text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[11px] font-headline tracking-tight">{item.label}</span>
            </Link>
          );
        })}

        {/* Menu item opens full drawer */}
        <button
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center gap-1 w-16 h-13 rounded-xl transition-all text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[11px] font-headline tracking-tight">Menu</span>
        </button>
      </div>
    </nav>
  );
}
