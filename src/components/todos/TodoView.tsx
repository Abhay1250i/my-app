'use client';

import React, { useState } from 'react';
import {
  Plus,
  Search,
  Check,
  Calendar,
  Clock,
  Flag,
  RotateCw,
  Trash2,
  Edit,
  CheckCircle2,
  AlertCircle,
  Inbox,
  Filter,
} from 'lucide-react';
import { useTaskStore, type TaskFilterView } from '@/stores/useTaskStore';
import { AddTaskModal } from '@/components/common/AddTaskModal';
import { getLocalDateString, formatDisplayDate } from '@/lib/dateUtils';
import type { Task, TaskPriority } from '@/types';

const FILTER_TABS: { id: TaskFilterView; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'completed', label: 'Completed' },
  { id: 'all', label: 'All Tasks' },
];

const CATEGORIES = ['All', 'Work', 'Study', 'Personal', 'Health', 'Analytics', 'Errand'];

export function TodoView() {
  const {
    tasks,
    filterView,
    searchQuery,
    selectedCategory,
    setFilterView,
    setSearchQuery,
    setSelectedCategory,
    toggleTask,
    deleteTask,
    addTask,
  } = useTaskStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickPriority, setQuickPriority] = useState<TaskPriority>('medium');

  const todayStr = getLocalDateString(new Date());

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    await addTask({
      title: quickTitle.trim(),
      dueDate: todayStr,
      priority: quickPriority,
      category: selectedCategory && selectedCategory !== 'All' ? selectedCategory : 'Personal',
      recurrence: 'none',
    });

    setQuickTitle('');
  };

  // Filter tasks based on view tab, category, and search query
  const filteredTasks = tasks
    .filter((task) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesDesc = (task.description || '').toLowerCase().includes(q);
        const matchesCat = task.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesCat) return false;
      }

      // Category
      if (selectedCategory && selectedCategory !== 'All') {
        if (task.category !== selectedCategory) return false;
      }

      // Filter View
      if (filterView === 'today') {
        return !task.completed && (task.dueDate === todayStr || !task.dueDate);
      }
      if (filterView === 'upcoming') {
        return !task.completed && task.dueDate && task.dueDate > todayStr;
      }
      if (filterView === 'overdue') {
        return !task.completed && task.dueDate && task.dueDate < todayStr;
      }
      if (filterView === 'completed') {
        return task.completed;
      }
      return true; // all
    })
    .sort((a, b) => {
      // Uncompleted first, then by due date
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return (a.dueDate || '9999') > (b.dueDate || '9999') ? 1 : -1;
    });

  const getPriorityStyle = (priority: TaskPriority) => {
    if (priority === 'high') return 'text-[var(--error)] bg-[var(--error)]/10 border-[var(--error)]/30';
    if (priority === 'medium') return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
    return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl sm:text-3xl font-bold text-[var(--on-surface)]">
            Tasks & Todos
          </h1>
          <p className="text-xs sm:text-sm text-[var(--on-surface-variant)] mt-0.5">
            Organize priorities, manage deadlines, and stay consistent.
          </p>
        </div>

        <button
          onClick={() => {
            setTaskToEdit(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] font-bold text-sm font-headline shadow-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Task</span>
        </button>
      </div>

      {/* Quick Add Bar */}
      <form onSubmit={handleQuickAdd} className="bg-[var(--surface-container)] border border-[var(--outline-variant)]/30 rounded-2xl p-2.5 flex items-center gap-2 shadow-sm">
        <input
          type="text"
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          placeholder="Add a new task for today (press Enter to save)..."
          className="flex-1 bg-transparent px-3 py-1.5 text-sm text-[var(--on-surface)] outline-none placeholder:text-[var(--on-surface-variant)]/60"
        />

        <select
          value={quickPriority}
          onChange={(e) => setQuickPriority(e.target.value as TaskPriority)}
          className="bg-[var(--surface-container-high)] border border-[var(--outline-variant)]/30 text-xs font-semibold rounded-xl px-2.5 py-1.5 text-[var(--on-surface-variant)] outline-none"
        >
          <option value="low">Low Priority</option>
          <option value="medium">Med Priority</option>
          <option value="high">High Priority</option>
        </select>

        <button
          type="submit"
          className="p-2 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] hover:opacity-90 transition-opacity shrink-0"
          title="Add task"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
        </button>
      </form>

      {/* View Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* View Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {FILTER_TABS.map((tab) => {
            const isActive = filterView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterView(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold font-headline transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[var(--primary)] text-[var(--on-primary)] shadow-sm'
                    : 'bg-[var(--surface-container)] border border-[var(--outline-variant)]/20 text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--on-surface-variant)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full bg-[var(--surface-container)] border border-[var(--outline-variant)]/30 rounded-xl pl-9 pr-3 py-1.5 text-xs text-[var(--on-surface)] outline-none placeholder:text-[var(--on-surface-variant)]/60"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => {
          const isSelected = (selectedCategory || 'All') === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === 'All' ? null : cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                isSelected
                  ? 'bg-[var(--surface-container-high)] text-[var(--primary)] font-semibold'
                  : 'text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Tasks List */}
      <div className="space-y-2.5">
        {filteredTasks.map((task) => {
          const isOverdue = !task.completed && task.dueDate && task.dueDate < todayStr;

          return (
            <div
              key={task.id}
              className={`bg-[var(--surface-container)] border border-[var(--outline-variant)]/25 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm hover:border-[var(--outline-variant)]/50 transition-all ${
                task.completed ? 'opacity-70' : ''
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`w-6 h-6 rounded-md flex items-center justify-center transition-all mt-0.5 shrink-0 ${
                    task.completed
                      ? 'bg-[var(--primary)] text-[var(--on-primary)] shadow-sm'
                      : 'bg-[var(--surface-variant)] border border-[var(--outline)]/40 hover:border-[var(--primary)]'
                  }`}
                >
                  {task.completed && <Check className="w-4 h-4 stroke-[3]" />}
                </button>

                <div className="min-w-0 flex-1">
                  <div
                    className={`text-sm sm:text-base font-medium truncate ${
                      task.completed ? 'line-through text-[var(--on-surface-variant)]' : 'text-[var(--on-surface)]'
                    }`}
                  >
                    {task.title}
                  </div>

                  {task.description && (
                    <p className="text-xs text-[var(--on-surface-variant)]/80 mt-0.5 line-clamp-1">
                      {task.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[var(--on-surface-variant)] mt-1.5 font-headline">
                    <span className="font-semibold text-[var(--primary)]">{task.category}</span>

                    {task.dueDate && (
                      <>
                        <span>•</span>
                        <span className={`flex items-center gap-1 ${isOverdue ? 'text-[var(--error)] font-bold' : ''}`}>
                          <Calendar className="w-3 h-3" />
                          <span>{task.dueDate === todayStr ? 'Today' : formatDisplayDate(task.dueDate)}</span>
                        </span>
                      </>
                    )}

                    {task.dueTime && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{task.dueTime}</span>
                        </span>
                      </>
                    )}

                    {task.recurrence && task.recurrence !== 'none' && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-[var(--secondary)]">
                          <RotateCw className="w-3 h-3" />
                          <span className="capitalize">{task.recurrence}</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side Status & Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getPriorityStyle(
                    task.priority
                  )}`}
                >
                  {task.priority}
                </span>

                <button
                  onClick={() => {
                    setTaskToEdit(task);
                    setIsAddModalOpen(true);
                  }}
                  className="p-1.5 rounded-lg bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
                  title="Edit task"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-1.5 rounded-lg bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] hover:text-[var(--error)]"
                  title="Delete task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="p-12 text-center bg-[var(--surface-container)] rounded-2xl border border-[var(--outline-variant)]/20">
            <Inbox className="w-10 h-10 text-[var(--primary)] mx-auto mb-2 opacity-60" />
            <p className="text-sm font-semibold text-[var(--on-surface)]">No tasks found</p>
            <p className="text-xs text-[var(--on-surface-variant)] mt-1">
              {filterView === 'completed'
                ? 'No completed tasks yet.'
                : 'All caught up! Add a new task using the quick input above.'}
            </p>
          </div>
        )}
      </div>

      {/* Add / Edit Task Modal */}
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setTaskToEdit(null);
        }}
        taskToEdit={taskToEdit}
      />
    </div>
  );
}
