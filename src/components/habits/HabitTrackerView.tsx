'use client';

import React, { useState } from 'react';
import {
  Plus,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Check,
  Archive,
  Trash2,
  Edit,
  History,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Flame,
} from 'lucide-react';
import { useHabitStore } from '@/stores/useHabitStore';
import { getLocalDateString, formatDisplayDate } from '@/lib/dateUtils';
import { calculateDayPerformance, calculateStreak } from '@/lib/statsUtils';
import { AddHabitModal } from '@/components/common/AddHabitModal';
import { HabitHistoryModal } from './HabitHistoryModal';
import type { Habit } from '@/types';
import { addDays, subDays } from 'date-fns';

const CATEGORIES = ['All', 'Routine', 'Health', 'Fitness', 'Mind', 'Academics', 'Productivity'];

export function HabitTrackerView() {
  const {
    habits,
    habitLogs,
    selectedDate,
    setSelectedDate,
    cycleHabitStatus,
    setHabitStatus,
    deleteHabit,
    archiveHabit,
    reorderHabits,
  } = useHabitStore();

  const [activeCategory, setActiveCategory] = useState('All');
  const [showArchived, setShowArchived] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);
  const [historyHabit, setHistoryHabit] = useState<Habit | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const todayStr = getLocalDateString(new Date());
  const isViewingToday = selectedDate === todayStr;

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    setSelectedDate(getLocalDateString(subDays(d, 1)));
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    setSelectedDate(getLocalDateString(addDays(d, 1)));
  };

  const handleToday = () => {
    setSelectedDate(todayStr);
  };

  const dayPerf = calculateDayPerformance(selectedDate, habits, habitLogs);
  const { currentStreak } = calculateStreak(habits, habitLogs);

  // Day of week index for schedule matching
  const dayOfWeek = new Date(selectedDate).getDay();

  // Filter habits
  const filteredHabits = habits
    .filter((h) => (showArchived ? h.isArchived : !h.isArchived))
    .filter((h) => (activeCategory === 'All' ? true : h.category === activeCategory))
    .sort((a, b) => a.order - b.order);

  const moveOrder = async (habitId: string, direction: 'up' | 'down') => {
    const ids = filteredHabits.map((h) => h.id);
    const index = ids.indexOf(habitId);
    if (index === -1) return;
    if (direction === 'up' && index > 0) {
      [ids[index - 1], ids[index]] = [ids[index], ids[index - 1]];
    } else if (direction === 'down' && index < ids.length - 1) {
      [ids[index + 1], ids[index]] = [ids[index], ids[index + 1]];
    }
    await reorderHabits(ids);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Top Header & Date Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl sm:text-3xl font-bold text-[var(--on-surface)]">
            Daily Habits
          </h1>
          <p className="text-xs sm:text-sm text-[var(--on-surface-variant)] mt-0.5">
            Small daily habits, zero anxiety. 1% better every day.
          </p>
        </div>

        <button
          onClick={() => {
            setHabitToEdit(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] font-bold text-sm font-headline shadow-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Habit</span>
        </button>
      </div>

      {/* Date Navigation Bar */}
      <div className="bg-[var(--surface-container)] border border-[var(--outline-variant)]/30 rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevDay}
            className="p-2 rounded-xl bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleToday}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-headline transition-colors ${
              isViewingToday
                ? 'bg-[var(--primary)] text-[var(--on-primary)]'
                : 'bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'
            }`}
          >
            Today
          </button>
          <button
            onClick={handleNextDay}
            className="p-2 rounded-xl bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-bold font-headline text-[var(--on-surface)]">
              {formatDisplayDate(selectedDate)}
            </div>
            <div className="text-xs text-[var(--primary)] font-medium">
              {dayPerf.completedCount} of {dayPerf.applicableCount} completed ({dayPerf.completionRate}%)
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills & Archive Toggle */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <div className="flex gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold font-headline transition-all whitespace-nowrap ${
                activeCategory === cat && !showArchived
                  ? 'bg-[var(--primary)] text-[var(--on-primary)] shadow-sm'
                  : 'bg-[var(--surface-container)] border border-[var(--outline-variant)]/20 text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowArchived(!showArchived)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold font-headline transition-colors shrink-0 ${
            showArchived
              ? 'bg-[var(--primary)] text-[var(--on-primary)]'
              : 'bg-[var(--surface-container)] border border-[var(--outline-variant)]/20 text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'
          }`}
        >
          <Archive className="w-3.5 h-3.5" />
          <span>{showArchived ? 'Active Habits' : 'Archived'}</span>
        </button>
      </div>

      {/* Habits List */}
      <div className="space-y-3">
        {filteredHabits.map((habit, index) => {
          const logId = `${selectedDate}_${habit.id}`;
          const log = habitLogs.find((l) => l.id === logId);
          const status = log?.status || 'untracked';
          const isDone = status === 'completed';
          const isPartial = status === 'partial';
          const isSkipped = status === 'skipped';
          const isMissed = status === 'missed';
          const isScheduledToday = habit.targetDays.includes(dayOfWeek);

          return (
            <div
              key={habit.id}
              className={`bg-[var(--surface-container)] border rounded-2xl p-4 transition-all shadow-sm ${
                isDone
                  ? 'border-[var(--primary)]/30'
                  : isPartial
                  ? 'border-[var(--secondary)]/30'
                  : isMissed
                  ? 'border-[var(--error)]/30'
                  : 'border-[var(--outline-variant)]/20'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Status Toggle Cycle Button */}
                  <button
                    onClick={() => cycleHabitStatus(habit.id, selectedDate)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0 ${
                      isDone
                        ? 'bg-[var(--primary)] text-[var(--on-primary)] shadow-sm'
                        : isPartial
                        ? 'bg-[var(--secondary)] text-[var(--on-primary)]'
                        : isSkipped
                        ? 'bg-[var(--surface-variant)] text-[var(--primary)] border border-[var(--primary)]/50'
                        : isMissed
                        ? 'bg-[var(--error)]/20 text-[var(--error)] border border-[var(--error)]/50'
                        : 'bg-[var(--surface-variant)] border border-[var(--outline)]/40 hover:border-[var(--primary)] text-[var(--on-surface-variant)]'
                    }`}
                    title="Click to cycle: Completed -> Partial -> Skipped -> Missed -> Untracked"
                  >
                    {isDone ? (
                      <Check className="w-4 h-4 stroke-[3]" />
                    ) : isPartial ? (
                      <span className="text-xs font-bold">½</span>
                    ) : isSkipped ? (
                      <span className="text-xs font-bold">—</span>
                    ) : isMissed ? (
                      <span className="text-xs font-bold">✕</span>
                    ) : null}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm sm:text-base font-semibold truncate ${
                          isDone
                            ? 'line-through opacity-70 text-[var(--on-surface-variant)]'
                            : 'text-[var(--on-surface)]'
                        }`}
                      >
                        {habit.name}
                      </span>
                      {!isScheduledToday && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--surface-container-high)] text-[var(--on-surface-variant)]">
                          Rest day
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[var(--on-surface-variant)] mt-0.5">
                      <span className="text-[var(--primary)] font-medium">{habit.category}</span>
                      <span>•</span>
                      <span>{habit.targetTimeOfDay || 'Anytime'}</span>
                      {habit.targetValue && habit.targetValue > 1 && (
                        <>
                          <span>•</span>
                          <span>
                            Target: {habit.targetValue} {habit.unit}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Actions & Menu */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Status Label Chip */}
                  <button
                    onClick={() => cycleHabitStatus(habit.id, selectedDate)}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full font-headline transition-colors ${
                      isDone
                        ? 'bg-[var(--primary)]/15 text-[var(--primary)]'
                        : isPartial
                        ? 'bg-[var(--secondary)]/15 text-[var(--secondary)]'
                        : isSkipped
                        ? 'bg-[var(--surface-variant)] text-[var(--on-surface-variant)]'
                        : isMissed
                        ? 'bg-[var(--error)]/15 text-[var(--error)]'
                        : 'bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'
                    }`}
                  >
                    {isDone ? 'Done' : isPartial ? 'Partial' : isSkipped ? 'Skipped' : isMissed ? 'Missed' : 'Pending'}
                  </button>

                  {/* Reorder Buttons */}
                  <div className="hidden sm:flex flex-col gap-0.5">
                    <button
                      onClick={() => moveOrder(habit.id, 'up')}
                      disabled={index === 0}
                      className="p-1 rounded hover:bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] disabled:opacity-20"
                      title="Move up"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => moveOrder(habit.id, 'down')}
                      disabled={index === filteredHabits.length - 1}
                      className="p-1 rounded hover:bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] disabled:opacity-20"
                      title="Move down"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Three-dot dropdown menu */}
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === habit.id ? null : habit.id)}
                      className="p-1.5 rounded-lg bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {openMenuId === habit.id && (
                      <div
                        className="absolute right-0 top-full mt-1 w-44 bg-[var(--surface-container-highest)] border border-[var(--outline-variant)]/40 rounded-xl shadow-xl z-20 py-1.5 text-xs font-semibold"
                        onClick={() => setOpenMenuId(null)}
                      >
                        <button
                          onClick={() => setHistoryHabit(habit)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[var(--surface-container-high)] text-[var(--on-surface)] text-left"
                        >
                          <History className="w-3.5 h-3.5 text-[var(--primary)]" />
                          <span>History & Edit Past</span>
                        </button>
                        <button
                          onClick={() => {
                            setHabitToEdit(habit);
                            setIsAddModalOpen(true);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[var(--surface-container-high)] text-[var(--on-surface)] text-left"
                        >
                          <Edit className="w-3.5 h-3.5 text-[var(--primary)]" />
                          <span>Edit Habit</span>
                        </button>
                        <button
                          onClick={() => archiveHabit(habit.id)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[var(--surface-container-high)] text-[var(--on-surface)] text-left"
                        >
                          <Archive className="w-3.5 h-3.5 text-yellow-400" />
                          <span>{habit.isArchived ? 'Unarchive' : 'Archive'}</span>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete habit "${habit.name}"? Historical logs will be removed.`)) {
                              deleteHabit(habit.id);
                            }
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[var(--surface-container-high)] text-[var(--error)] text-left"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Habit</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredHabits.length === 0 && (
          <div className="p-10 text-center bg-[var(--surface-container)] rounded-2xl border border-[var(--outline-variant)]/20">
            <Sparkles className="w-8 h-8 text-[var(--primary)] mx-auto mb-2 opacity-70" />
            <p className="text-sm font-semibold text-[var(--on-surface)]">No habits found in this category.</p>
            <p className="text-xs text-[var(--on-surface-variant)] mt-1">
              Add your first custom habit or switch categories.
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddHabitModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setHabitToEdit(null);
        }}
        habitToEdit={habitToEdit}
      />

      <HabitHistoryModal
        habit={historyHabit}
        logs={habitLogs}
        onClose={() => setHistoryHabit(null)}
        onSetStatus={setHabitStatus}
      />
    </div>
  );
}
