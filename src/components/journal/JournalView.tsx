'use client';

import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Save,
  Check,
  Smile,
  Meh,
  Frown,
  Sun,
  Coffee,
  Sparkles,
} from 'lucide-react';
import { useJournalStore } from '@/stores/useJournalStore';
import { getLocalDateString, formatDisplayDate } from '@/lib/dateUtils';
import { addDays, subDays } from 'date-fns';

const PROMPTS = [
  { key: 'whatWentWell', label: '1. What went well today?', placeholder: 'Wins, consistency victories, positive moments...' },
  { key: 'whatCouldImprove', label: '2. What could I improve?', placeholder: 'Patience, timing, avoiding distractions...' },
  { key: 'whatDidILearn', label: '3. What did I learn?', placeholder: 'Insights from books, coding, conversations...' },
  { key: 'whatIsBotheringMe', label: '4. What is bothering me?', placeholder: 'Get it out of your head and onto the page...' },
  { key: 'focusTomorrow', label: '5. What should I focus on tomorrow?', placeholder: 'The top 1-2 priorities that matter most...' },
] as const;

const MOODS = [
  { id: 'great', label: 'Great', icon: Smile, color: 'text-[var(--primary)]' },
  { id: 'good', label: 'Good', icon: Sun, color: 'text-yellow-400' },
  { id: 'neutral', label: 'Neutral', icon: Meh, color: 'text-blue-400' },
  { id: 'tough', label: 'Tough', icon: Frown, color: 'text-[var(--tertiary-container)]' },
  { id: 'rest', label: 'Rest Day', icon: Coffee, color: 'text-purple-400' },
] as const;

export function JournalView() {
  const { currentEntry, selectedDate, setSelectedDate, loadEntryForDate, saveEntry, isSaving } =
    useJournalStore();

  const [formData, setFormData] = useState({
    whatWentWell: '',
    whatCouldImprove: '',
    whatDidILearn: '',
    whatIsBotheringMe: '',
    focusTomorrow: '',
    generalNotes: '',
    mood: 'good' as any,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    loadEntryForDate(selectedDate);
  }, [selectedDate, loadEntryForDate]);

  useEffect(() => {
    if (currentEntry) {
      setFormData({
        whatWentWell: currentEntry.whatWentWell || '',
        whatCouldImprove: currentEntry.whatCouldImprove || '',
        whatDidILearn: currentEntry.whatDidILearn || '',
        whatIsBotheringMe: currentEntry.whatIsBotheringMe || '',
        focusTomorrow: currentEntry.focusTomorrow || '',
        generalNotes: currentEntry.generalNotes || '',
        mood: currentEntry.mood || 'good',
      });
    }
  }, [currentEntry]);

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    setSelectedDate(getLocalDateString(subDays(d, 1)));
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    setSelectedDate(getLocalDateString(addDays(d, 1)));
  };

  const handleToday = () => {
    setSelectedDate(getLocalDateString(new Date()));
  };

  const handleFieldChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    await saveEntry(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl sm:text-3xl font-bold text-[var(--on-surface)]">
            Personal Journal
          </h1>
          <p className="text-xs sm:text-sm text-[var(--on-surface-variant)] mt-0.5">
            5-minute evening reflection prompts to clarify thinking and anchor gratitude.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] font-bold text-sm font-headline shadow-sm hover:opacity-90 transition-all shrink-0"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Entry'}</span>
            </>
          )}
        </button>
      </div>

      {/* Date Navigation Strip */}
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
            className="px-3 py-1.5 rounded-xl text-xs font-semibold font-headline bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
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

        <div className="text-right">
          <div className="text-sm font-bold font-headline text-[var(--on-surface)]">
            {formatDisplayDate(selectedDate)}
          </div>
          <div className="text-xs text-[var(--on-surface-variant)]">
            {currentEntry?.updatedAt ? 'Last saved locally' : 'New reflection'}
          </div>
        </div>
      </div>

      {/* Daily Mood Selection */}
      <div className="bg-[var(--surface-container)] border border-[var(--outline-variant)]/25 rounded-2xl p-4 shadow-sm">
        <span className="block text-xs font-semibold uppercase tracking-wider text-[var(--on-surface-variant)] font-headline mb-3">
          Today&apos;s Mindset & Energy
        </span>
        <div className="grid grid-cols-5 gap-2">
          {MOODS.map((m) => {
            const isSelected = formData.mood === m.id;
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, mood: m.id }))}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-[var(--surface-container-high)] border-[var(--primary)] shadow-sm'
                    : 'bg-[var(--surface-container-low)] border-transparent text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'
                }`}
              >
                <Icon className={`w-5 h-5 mb-1 ${m.color}`} />
                <span className="text-[11px] font-semibold font-headline">{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5 Prompts Cards */}
      <div className="space-y-4">
        {PROMPTS.map((prompt) => (
          <div
            key={prompt.key}
            className="bg-[var(--surface-container)] border border-[var(--outline-variant)]/25 rounded-2xl p-4 sm:p-5 shadow-sm"
          >
            <label className="block text-sm font-semibold text-[var(--on-surface)] mb-2 font-headline">
              {prompt.label}
            </label>
            <textarea
              rows={3}
              value={(formData as any)[prompt.key] || ''}
              onChange={(e) => handleFieldChange(prompt.key, e.target.value)}
              placeholder={prompt.placeholder}
              className="w-full bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)]/40 focus:border-[var(--primary)] rounded-xl p-3 text-sm text-[var(--on-surface)] outline-none resize-none transition-colors"
            />
          </div>
        ))}

        {/* Freeform Notes Card */}
        <div className="bg-[var(--surface-container)] border border-[var(--outline-variant)]/25 rounded-2xl p-4 sm:p-5 shadow-sm">
          <label className="block text-sm font-semibold text-[var(--on-surface)] mb-2 font-headline">
            Freeform Evening Notes & Ideas
          </label>
          <textarea
            rows={4}
            value={formData.generalNotes}
            onChange={(e) => handleFieldChange('generalNotes', e.target.value)}
            placeholder="Any additional thoughts, quotes, or stream of consciousness..."
            className="w-full bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)]/40 focus:border-[var(--primary)] rounded-xl p-3 text-sm text-[var(--on-surface)] outline-none resize-none transition-colors"
          />
        </div>
      </div>
    </div>
  );
}
