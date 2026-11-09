'use client';

import React, { useState } from 'react';
import {
  Award,
  Plus,
  Tv,
  Film,
  Users,
  Footprints,
  Coffee,
  Check,
  History,
  Heart,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useRewardStore } from '@/stores/useRewardStore';
import { formatDisplayDate } from '@/lib/dateUtils';
import confetti from 'canvas-confetti';

export function RewardsView() {
  const { rewards, history, addReward, logEnjoyedReward, deleteReward } = useRewardStore();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('45 mins');
  const [category, setCategory] = useState('Entertainment');
  const [conditions, setConditions] = useState('');
  const [activeTab, setActiveTab] = useState<'available' | 'history'>('available');

  const handleEnjoy = async (rewardId: string, rewardName: string) => {
    await logEnjoyedReward(rewardId, 'Enjoyed guilt-free!');
    confetti({
      particleCount: 50,
      spread: 45,
      origin: { y: 0.7 },
      colors: ['#B6FF3B', '#FC7C78', '#68DBA9'],
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await addReward({
      name: name.trim(),
      duration: duration.trim(),
      category: category.trim(),
      conditions: conditions.trim() || undefined,
    });

    setName('');
    setIsAddOpen(false);
  };

  const getRewardIcon = (categoryName?: string) => {
    const cat = (categoryName || '').toLowerCase();
    if (cat.includes('entertainment') || cat.includes('tv')) return Tv;
    if (cat.includes('movie') || cat.includes('film')) return Film;
    if (cat.includes('social') || cat.includes('friend')) return Users;
    if (cat.includes('outdoor') || cat.includes('walk')) return Footprints;
    return Coffee;
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl sm:text-3xl font-bold text-[var(--on-surface)]">
            Guilt-Free Rewards
          </h1>
          <p className="text-xs sm:text-sm text-[var(--on-surface-variant)] mt-0.5">
            Balanced living. Rest, movies, and leisure without productivity guilt.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] font-bold text-sm font-headline shadow-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Reward</span>
        </button>
      </div>

      {/* Core Philosophy Banner */}
      <div className="bg-[var(--surface-container)] border border-[var(--primary)]/30 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-sm">
        <Heart className="w-5 h-5 text-[var(--primary)] shrink-0 mt-0.5 fill-[var(--primary)]/20" />
        <div className="text-xs sm:text-sm text-[var(--on-surface-variant)]">
          <strong className="text-[var(--on-surface)] font-headline block mb-0.5">
            The 1% Golden Rule of Recovery
          </strong>
          Rest, quality meals, sleep, and connecting with loved ones never require earning or justification.
          Enjoy these activities with absolute peace of mind.
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('available')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-headline transition-all ${
            activeTab === 'available'
              ? 'bg-[var(--primary)] text-[var(--on-primary)] shadow-sm'
              : 'bg-[var(--surface-container)] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'
          }`}
        >
          Available Rewards ({rewards.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-headline transition-all ${
            activeTab === 'history'
              ? 'bg-[var(--primary)] text-[var(--on-primary)] shadow-sm'
              : 'bg-[var(--surface-container)] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'
          }`}
        >
          Reward History ({history.length})
        </button>
      </div>

      {/* Available Rewards Grid */}
      {activeTab === 'available' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {rewards.map((reward) => {
            const Icon = getRewardIcon(reward.category);

            return (
              <div
                key={reward.id}
                className="bg-[var(--surface-container)] border border-[var(--outline-variant)]/25 rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:border-[var(--outline-variant)]/50 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] font-headline">
                      {reward.duration}
                    </span>
                  </div>

                  <h3 className="font-headline font-semibold text-base text-[var(--on-surface)] group-hover:text-[var(--primary)] transition-colors">
                    {reward.name}
                  </h3>

                  <p className="text-xs text-[var(--on-surface-variant)] mt-1">
                    {reward.conditions || 'Guilt-free recovery session'}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[var(--outline-variant)]/20 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-[var(--on-surface-variant)]">
                    {reward.category || 'General'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {reward.isCustom && (
                      <button
                        onClick={() => deleteReward(reward.id)}
                        className="p-1.5 rounded-lg bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] hover:text-[var(--error)]"
                        title="Delete custom reward"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => handleEnjoy(reward.id, reward.name)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] font-bold text-xs font-headline shadow-sm hover:opacity-90 transition-opacity"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Enjoy Now</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reward History View */}
      {activeTab === 'history' && (
        <div className="space-y-2.5">
          {history.map((item) => (
            <div
              key={item.id}
              className="bg-[var(--surface-container)] border border-[var(--outline-variant)]/20 rounded-2xl p-4 flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[var(--on-surface)]">{item.rewardName}</div>
                  <div className="text-xs text-[var(--on-surface-variant)]">
                    {formatDisplayDate(item.date)} • {item.notes || 'Decompressed'}
                  </div>
                </div>
              </div>

              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--primary)]/15 text-[var(--primary)] font-headline">
                Enjoyed
              </span>
            </div>
          ))}

          {history.length === 0 && (
            <div className="p-12 text-center bg-[var(--surface-container)] rounded-2xl border border-[var(--outline-variant)]/20">
              <Award className="w-10 h-10 text-[var(--primary)] mx-auto mb-2 opacity-60" />
              <p className="text-sm font-semibold text-[var(--on-surface)]">No rewards logged yet</p>
              <p className="text-xs text-[var(--on-surface-variant)] mt-1">
                Take a break, enjoy an episode or match, and log it guilt-free.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Add Custom Reward Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm">
          <div
            className="w-full max-w-md bg-[var(--surface-container)] border border-[var(--outline-variant)]/40 rounded-2xl p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-headline font-bold text-[var(--on-surface)] mb-4">
              Add Custom Reward
            </h2>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1 uppercase tracking-wider font-headline">
                  Reward Activity *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Play video game, Coffee at café, Listen to album"
                  className="w-full bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)]/40 focus:border-[var(--primary)] rounded-xl px-3 py-2 text-sm text-[var(--on-surface)] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1 uppercase tracking-wider font-headline">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 45 mins, 1 hour"
                    className="w-full bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)]/40 focus:border-[var(--primary)] rounded-xl px-3 py-2 text-sm text-[var(--on-surface)] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1 uppercase tracking-wider font-headline">
                    Category
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Entertainment, Rest"
                    className="w-full bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)]/40 focus:border-[var(--primary)] rounded-xl px-3 py-2 text-sm text-[var(--on-surface)] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1 uppercase tracking-wider font-headline">
                  Optional Condition / Note
                </label>
                <input
                  type="text"
                  value={conditions}
                  onChange={(e) => setConditions(e.target.value)}
                  placeholder="e.g. After morning study or completely unconditional"
                  className="w-full bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)]/40 focus:border-[var(--primary)] rounded-xl px-3 py-2 text-sm text-[var(--on-surface)] outline-none"
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
                  Save Reward
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
