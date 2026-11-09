'use client';

import React, { useState } from 'react';
import {
  Target,
  Plus,
  Check,
  Calendar,
  CheckCircle2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { useGoalStore } from '@/stores/useGoalStore';
import { getLocalDateString, formatDisplayDate } from '@/lib/dateUtils';
import type { GoalStatus } from '@/types';
import confetti from 'canvas-confetti';

const CATEGORIES = ['All', 'Academics', 'Fitness', 'Career', 'Personal', 'Mind'];

export function GoalsView() {
  const { goals, milestones, addGoal, deleteGoal, addMilestone, toggleMilestone, deleteMilestone } =
    useGoalStore();

  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New Goal Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Career');
  const [targetDate, setTargetDate] = useState('2026-12-31');
  const [milestonesText, setMilestonesText] = useState('');

  // Add individual milestone inline
  const [newMilestoneTitles, setNewMilestoneTitles] = useState<Record<string, string>>({});

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedMilestones = milestonesText
      .split('\n')
      .map((m) => m.trim())
      .filter((m) => m.length > 0);

    await addGoal(
      {
        title: title.trim(),
        description: description.trim(),
        category,
        startDate: getLocalDateString(new Date()),
        targetDate,
        status: 'active',
      },
      parsedMilestones
    );

    setTitle('');
    setDescription('');
    setMilestonesText('');
    setIsAddOpen(false);
  };

  const handleAddInlineMilestone = async (goalId: string) => {
    const text = newMilestoneTitles[goalId]?.trim();
    if (!text) return;
    await addMilestone(goalId, text);
    setNewMilestoneTitles((prev) => ({ ...prev, [goalId]: '' }));
  };

  const handleToggleMilestone = async (milestoneId: string, willComplete: boolean) => {
    await toggleMilestone(milestoneId);
    if (willComplete) {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#B6FF3B', '#68DBA9'],
      });
    }
  };

  const filteredGoals = goals
    .filter((g) => (activeCategory === 'All' ? true : g.category === activeCategory))
    .sort((a, b) => (a.status === 'completed' ? 1 : -1));

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl sm:text-3xl font-bold text-[var(--on-surface)]">
            Personal Goals & Milestones
          </h1>
          <p className="text-xs sm:text-sm text-[var(--on-surface-variant)] mt-0.5">
            Break macro ambitions into achievable, measurable 1% milestones.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] font-bold text-sm font-headline shadow-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold font-headline transition-all whitespace-nowrap ${
              activeCategory === cat
                ? 'bg-[var(--primary)] text-[var(--on-primary)] shadow-sm'
                : 'bg-[var(--surface-container)] border border-[var(--outline-variant)]/20 text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {filteredGoals.map((goal) => {
          const goalMilestones = milestones.filter((m) => m.goalId === goal.id);
          const completedCount = goalMilestones.filter((m) => m.completed).length;
          const isExpanded = expandedGoalId === goal.id;

          return (
            <div
              key={goal.id}
              className={`bg-[var(--surface-container)] border rounded-2xl p-5 shadow-sm transition-all ${
                goal.progress === 100
                  ? 'border-[var(--primary)]/40'
                  : 'border-[var(--outline-variant)]/25'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-headline text-lg font-bold text-[var(--on-surface)] truncate">
                      {goal.title}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--surface-container-high)] text-[var(--primary)] font-headline">
                      {goal.category}
                    </span>
                  </div>

                  {goal.description && (
                    <p className="text-xs text-[var(--on-surface-variant)] mt-1">{goal.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-[var(--on-surface-variant)] mt-2 font-headline">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Target: {formatDisplayDate(goal.targetDate)}</span>
                    </span>
                    <span>•</span>
                    <span>
                      {completedCount} of {goalMilestones.length} milestones
                    </span>
                  </div>
                </div>

                {/* Progress Bar & Controls */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="w-28 text-right">
                    <div className="font-headline text-base font-bold text-[var(--primary)]">
                      {goal.progress}%
                    </div>
                    <div className="w-full h-2 bg-[var(--surface-container-high)] rounded-full overflow-hidden mt-1">
                      <div
                        style={{ width: `${goal.progress}%` }}
                        className="h-full bg-[var(--primary)] rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedGoalId(isExpanded ? null : goal.id)}
                    className="p-2 rounded-xl bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
                    title={isExpanded ? 'Collapse milestones' : 'Expand milestones'}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Delete goal "${goal.title}"?`)) {
                        deleteGoal(goal.id);
                      }
                    }}
                    className="p-2 rounded-xl bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] hover:text-[var(--error)]"
                    title="Delete goal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Milestones Collapsible Sub-list */}
              {isExpanded && (
                <div className="mt-5 pt-4 border-t border-[var(--outline-variant)]/20 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)] font-headline">
                    Milestones Checklist
                  </h4>

                  <div className="space-y-2">
                    {goalMilestones.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/20"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <button
                            onClick={() => handleToggleMilestone(m.id, !m.completed)}
                            className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors shrink-0 ${
                              m.completed
                                ? 'bg-[var(--primary)] text-[var(--on-primary)] shadow-sm'
                                : 'bg-[var(--surface-variant)] border border-[var(--outline)]/40'
                            }`}
                          >
                            {m.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>
                          <span
                            className={`text-xs sm:text-sm truncate ${
                              m.completed ? 'line-through opacity-70 text-[var(--on-surface-variant)]' : 'text-[var(--on-surface)]'
                            }`}
                          >
                            {m.title}
                          </span>
                        </div>

                        <button
                          onClick={() => deleteMilestone(m.id)}
                          className="text-[var(--on-surface-variant)] hover:text-[var(--error)] p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Milestone Inline Input */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={newMilestoneTitles[goal.id] || ''}
                      onChange={(e) =>
                        setNewMilestoneTitles((prev) => ({ ...prev, [goal.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddInlineMilestone(goal.id);
                        }
                      }}
                      placeholder="Add another milestone..."
                      className="flex-1 bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)]/40 focus:border-[var(--primary)] rounded-xl px-3 py-1.5 text-xs text-[var(--on-surface)] outline-none"
                    />
                    <button
                      onClick={() => handleAddInlineMilestone(goal.id)}
                      className="px-3 py-1.5 rounded-xl bg-[var(--surface-container-high)] text-xs font-semibold text-[var(--primary)] hover:bg-[var(--surface-container-highest)] font-headline shrink-0"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredGoals.length === 0 && (
          <div className="p-12 text-center bg-[var(--surface-container)] rounded-2xl border border-[var(--outline-variant)]/20">
            <Target className="w-10 h-10 text-[var(--primary)] mx-auto mb-2 opacity-60" />
            <p className="text-sm font-semibold text-[var(--on-surface)]">No goals in this category</p>
            <p className="text-xs text-[var(--on-surface-variant)] mt-1">
              Set clear long-term direction by creating your next personal goal.
            </p>
          </div>
        )}
      </div>

      {/* Add Goal Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm">
          <div
            className="w-full max-w-lg bg-[var(--surface-container)] border border-[var(--outline-variant)]/40 rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-headline font-bold text-[var(--on-surface)] mb-4">
              Create Long-Term Goal
            </h2>

            <form onSubmit={handleCreateGoal} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1 uppercase tracking-wider font-headline">
                  Goal Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Master DSA Algorithms, Run a Half Marathon"
                  className="w-full bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)]/40 focus:border-[var(--primary)] rounded-xl px-3 py-2 text-sm text-[var(--on-surface)] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1 uppercase tracking-wider font-headline">
                  Description / Motivation
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Why this goal matters and what success looks like"
                  className="w-full bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)]/40 focus:border-[var(--primary)] rounded-xl px-3 py-2 text-sm text-[var(--on-surface)] outline-none resize-none"
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
                    className="w-full bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)]/40 focus:border-[var(--primary)] rounded-xl px-3 py-2 text-sm text-[var(--on-surface)] outline-none"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1 uppercase tracking-wider font-headline">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)]/40 focus:border-[var(--primary)] rounded-xl px-3 py-2 text-sm text-[var(--on-surface)] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1 uppercase tracking-wider font-headline">
                  Initial Milestones (One per line)
                </label>
                <textarea
                  rows={3}
                  value={milestonesText}
                  onChange={(e) => setMilestonesText(e.target.value)}
                  placeholder="Step 1: Complete basics&#10;Step 2: Solve 50 problems&#10;Step 3: Mock interview"
                  className="w-full bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)]/40 focus:border-[var(--primary)] rounded-xl px-3 py-2 text-sm text-[var(--on-surface)] outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[var(--outline-variant)]/20 mt-5">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[var(--primary)] text-[var(--on-primary)] shadow-sm font-headline"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
