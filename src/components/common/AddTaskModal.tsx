'use client';

import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useTaskStore } from '@/stores/useTaskStore';
import { getLocalDateString } from '@/lib/dateUtils';
import type { Task, TaskPriority, TaskRecurrence } from '@/types';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
}

const CATEGORIES = ['Work', 'Study', 'Personal', 'Health', 'Analytics', 'Errand'];
const PRIORITIES: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'high', label: 'High', color: 'bg-[var(--error)]/20 text-[var(--error)] border-[var(--error)]/50' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50' },
  { value: 'low', label: 'Low', color: 'bg-blue-500/20 text-blue-400 border-blue-500/50' },
];

export function AddTaskModal({ isOpen, onClose, taskToEdit }: AddTaskModalProps) {
  const { addTask, updateTask } = useTaskStore();

  const [title, setTitle] = useState(taskToEdit?.title || '');
  const [description, setDescription] = useState(taskToEdit?.description || '');
  const [dueDate, setDueDate] = useState(taskToEdit?.dueDate || getLocalDateString(new Date()));
  const [dueTime, setDueTime] = useState(taskToEdit?.dueTime || '10:00 AM');
  const [priority, setPriority] = useState<TaskPriority>(taskToEdit?.priority || 'medium');
  const [category, setCategory] = useState(taskToEdit?.category || 'Work');
  const [recurrence, setRecurrence] = useState<TaskRecurrence>(taskToEdit?.recurrence || 'none');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a task title');
      return;
    }

    if (taskToEdit) {
      await updateTask(taskToEdit.id, {
        title: title.trim(),
        description: description.trim(),
        dueDate,
        dueTime,
        priority,
        category,
        recurrence,
      });
    } else {
      await addTask({
        title: title.trim(),
        description: description.trim(),
        dueDate,
        dueTime,
        priority,
        category,
        recurrence,
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
            {taskToEdit ? 'Edit Task' : 'Create New Task'}
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
              Task Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Finish project proposal, Review Q3 metrics"
              className="w-full bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)]/40 focus:border-[var(--primary)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--on-surface)] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1 uppercase tracking-wider font-headline">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add key notes, links, or context"
              className="w-full bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)]/40 focus:border-[var(--primary)] rounded-xl px-3.5 py-2 text-sm text-[var(--on-surface)] outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1 uppercase tracking-wider font-headline">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)]/40 focus:border-[var(--primary)] rounded-xl px-3 py-2 text-sm text-[var(--on-surface)] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1 uppercase tracking-wider font-headline">
                Scheduled Time
              </label>
              <input
                type="text"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                placeholder="e.g. 10:00 AM, 02:00 PM"
                className="w-full bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)]/40 focus:border-[var(--primary)] rounded-xl px-3 py-2 text-sm text-[var(--on-surface)] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1.5 uppercase tracking-wider font-headline">
              Priority
            </label>
            <div className="flex gap-2">
              {PRIORITIES.map((p) => {
                const isSelected = priority === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriority(p.value)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      isSelected
                        ? p.color
                        : 'border-transparent bg-[var(--surface-container-high)] text-[var(--on-surface-variant)]'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
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
                Recurrence
              </label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as TaskRecurrence)}
                className="w-full bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)]/40 focus:border-[var(--primary)] rounded-xl px-3 py-2.5 text-sm text-[var(--on-surface)] outline-none"
              >
                <option value="none">None (One-time)</option>
                <option value="daily">Daily</option>
                <option value="weekdays">Weekdays (Mon-Fri)</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
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
              <span>{taskToEdit ? 'Save Changes' : 'Create Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
