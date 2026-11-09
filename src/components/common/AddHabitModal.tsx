'use client';

import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useHabitStore } from '@/stores/useHabitStore';
import type { Habit } from '@/types';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  habitToEdit?: Habit | null;
}

const CATEGORIES = ['Routine', 'Health', 'Fitness', 'Mind', 'Academics', 'Productivity'];
const TIMES_OF_DAY = ['Morning', 'Afternoon', 'Evening', 'Anytime'] as const;
const DAY_LABELS = [
  { day: 1, label: 'M' },
  { day: 2, label: 'T' },
  { day: 3, label: 'W' },
  { day: 4, label: 'T' },
  { day: 5, label: 'F' },
  { day: 6, label: 'S' },
  { day: 0, label: 'S' },
];

export function AddHabitModal({ isOpen, onClose, habitToEdit }: AddHabitModalProps) {
  const { addHabit, updateHabit } = useHabitStore();

  const [name, setName] = useState(habitToEdit?.name || '');
  const [description, setDescription] = useState(habitToEdit?.description || '');
  const [category, setCategory] = useState(habitToEdit?.category || 'Routine');
  const [targetDays, setTargetDays] = useState<number[]>(habitToEdit?.targetDays || [0, 1, 2, 3, 4, 5, 6]);
  const [timeOfDay, setTimeOfDay] = useState<'Morning' | 'Afternoon' | 'Evening' | 'Anytime'>(
    habitToEdit?.targetTimeOfDay || 'Morning'
  );
  const [targetValue, setTargetValue] = useState(habitToEdit?.targetValue || 1);
  const [unit, setUnit] = useState(habitToEdit?.unit || 'time');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const toggleDay = (dayIndex: number) => {
    if (targetDays.includes(dayIndex)) {
      if (targetDays.length === 1) return; // keep at least 1 day
      setTargetDays(targetDays.filter((d) => d !== dayIndex));
    } else {
      setTargetDays([...targetDays, dayIndex]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a habit name');
      return;
    }

    if (habitToEdit) {
      await updateHabit(habitToEdit.id, {
        name: name.trim(),
        description: description.trim(),
        category,
        targetDays,
        targetTimeOfDay: timeOfDay,
        targetValue,
        unit,
      });
    } else {
      await addHabit({
        name: name.trim(),
        description: description.trim(),
        category,
        targetDays,
        targetTimeOfDay: timeOfDay,
        targetValue,
        unit,
        isArchived: false,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm">
      <div
        className="w-full max-w-lg bg-[var(--surface-container)] border border-[var(--outline-variant)]/40 rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[var(--outline-variant)]/20 mb-5">
          <h2 className="text-lg font-headline font-semibold text-[var(--on-surface)]">
            {habitToEdit ? 'Edit Habit' : 'Create New Habit'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-xs text-[var(--error)] bg-[var(--error)]/10 p-2.5 rounded-lg">{error}</div>}

          <div>
            <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1 uppercase tracking-wider font-headline">
              Habit Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Read 5 pages, Morning walk, Solve 1 DSA"
              className="w-full bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)]/40 focus:border-[var(--primary)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--on-surface)] outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1 uppercase tracking-wider font-headline">
              Description / Intention (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Keep consistency, no pressure"
              className="w-full bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)]/40 focus:border-[var(--primary)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--on-surface)] outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1 uppercase tracking-wider font-headline">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)]/40 focus:border-[var(--primary)] rounded-xl px-3 py-2.5 text-sm text-[var(--on-surface)] outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1 uppercase tracking-wider font-headline">
                Time of Day
              </label>
              <select
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value as any)}
                className="w-full bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)]/40 focus:border-[var(--primary)] rounded-xl px-3 py-2.5 text-sm text-[var(--on-surface)] outline-none"
              >
                {TIMES_OF_DAY.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1.5 uppercase tracking-wider font-headline">
              Weekly Schedule (Active Days)
            </label>
            <div className="flex gap-2">
              {DAY_LABELS.map(({ day, label }, i) => {
                const isSelected = targetDays.includes(day);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-[var(--primary)] text-[var(--on-primary)] shadow-sm'
                        : 'bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1 uppercase tracking-wider font-headline">
                Target Quantity
              </label>
              <input
                type="number"
                min="1"
                value={targetValue}
                onChange={(e) => setTargetValue(Number(e.target.value))}
                className="w-full bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)]/40 focus:border-[var(--primary)] rounded-xl px-3 py-2 text-sm text-[var(--on-surface)] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1 uppercase tracking-wider font-headline">
                Unit
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. pages, mins, glasses"
                className="w-full bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)]/40 focus:border-[var(--primary)] rounded-xl px-3 py-2 text-sm text-[var(--on-surface)] outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--outline-variant)]/20 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[var(--primary)] text-[var(--on-primary)] hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm font-headline"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{habitToEdit ? 'Save Changes' : 'Create Habit'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
