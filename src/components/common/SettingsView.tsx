'use client';

import React, { useEffect, useState } from 'react';
import {
  Sun,
  Moon,
  Laptop,
  Download,
  Upload,
  FileSpreadsheet,
  Database,
  Check,
  AlertTriangle,
  RefreshCw,
  Bell,
  ShieldCheck,
  HardDrive,
} from 'lucide-react';
import { useThemeStore, type AppTheme } from '@/stores/useThemeStore';
import {
  exportAllDataAsJSON,
  importBackupJSON,
  exportTasksToCSV,
  exportHabitHistoryToCSV,
  triggerDownload,
} from '@/db/backup';
import { db } from '@/db/database';
import { getLocalDateString } from '@/lib/dateUtils';

export function SettingsView() {
  const { theme, setTheme } = useThemeStore();

  const [dbStats, setDbStats] = useState({
    habits: 0,
    habitLogs: 0,
    tasks: 0,
    journal: 0,
    goals: 0,
    rewards: 0,
    focusSessions: 0,
  });

  const [importStatus, setImportStatus] = useState<{ message: string; isError?: boolean } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [backupReminder, setBackupReminder] = useState(true);

  const loadStats = async () => {
    try {
      const habits = await db.habits.count();
      const habitLogs = await db.habitLogs.count();
      const tasks = await db.tasks.count();
      const journal = await db.journalEntries.count();
      const goals = await db.goals.count();
      const rewards = await db.rewards.count();
      const focusSessions = await db.focusSessions.count();

      setDbStats({
        habits,
        habitLogs,
        tasks,
        journal,
        goals,
        rewards,
        focusSessions,
      });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleExportJSON = async () => {
    const jsonStr = await exportAllDataAsJSON();
    const fileName = `onepercent_backup_${getLocalDateString(new Date())}.json`;
    triggerDownload(jsonStr, fileName, 'application/json');
  };

  const handleExportTasksCSV = async () => {
    const csv = await exportTasksToCSV();
    const fileName = `onepercent_tasks_${getLocalDateString(new Date())}.csv`;
    triggerDownload(csv, fileName, 'text/csv');
  };

  const handleExportHabitsCSV = async () => {
    const csv = await exportHabitHistoryToCSV();
    const fileName = `onepercent_habits_${getLocalDateString(new Date())}.csv`;
    triggerDownload(csv, fileName, 'text/csv');
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>, mode: 'merge' | 'replace') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (mode === 'replace') {
      const ok = confirm(
        'WARNING: "Replace Database" will permanently erase current records and replace them with this backup. Continue?'
      );
      if (!ok) {
        e.target.value = '';
        return;
      }
    }

    setIsImporting(true);
    setImportStatus(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const res = await importBackupJSON(text, mode);
        if (res.success) {
          setImportStatus({ message: res.message });
          await loadStats();
        } else {
          setImportStatus({ message: res.message, isError: true });
        }
      } catch (err: any) {
        setImportStatus({ message: err.message || 'Import failed', isError: true });
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="font-headline text-2xl sm:text-3xl font-bold text-[var(--on-surface)]">
          Settings & Local Data
        </h1>
        <p className="text-xs sm:text-sm text-[var(--on-surface-variant)] mt-0.5">
          Local-first architecture, complete theme controls, and zero cloud lock-in.
        </p>
      </div>

      {/* Theme Settings */}
      <div className="bg-[var(--surface-container)] border border-[var(--outline-variant)]/25 rounded-2xl p-5 sm:p-6 shadow-sm">
        <h2 className="font-headline font-bold text-base sm:text-lg text-[var(--on-surface)] mb-1">
          Theme & Appearance
        </h2>
        <p className="text-xs text-[var(--on-surface-variant)] mb-4">
          Choose between Google Stitch high-contrast Circuit Navy, clean light mode, or system sync.
        </p>

        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setTheme('dark')}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
              theme === 'dark'
                ? 'bg-[var(--surface-container-high)] border-[var(--primary)] text-[var(--primary)] shadow-sm'
                : 'bg-[var(--surface-container-low)] border-transparent text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'
            }`}
          >
            <Moon className="w-5 h-5 mb-2" />
            <span className="text-xs font-bold font-headline">Dark Theme</span>
            <span className="text-[10px] opacity-70 mt-0.5">Circuit Navy</span>
          </button>

          <button
            onClick={() => setTheme('light')}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
              theme === 'light'
                ? 'bg-[var(--surface-container-high)] border-[var(--primary)] text-[var(--primary)] shadow-sm'
                : 'bg-[var(--surface-container-low)] border-transparent text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'
            }`}
          >
            <Sun className="w-5 h-5 mb-2" />
            <span className="text-xs font-bold font-headline">Light Theme</span>
            <span className="text-[10px] opacity-70 mt-0.5">Crisp White</span>
          </button>

          <button
            onClick={() => setTheme('system')}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
              theme === 'system'
                ? 'bg-[var(--surface-container-high)] border-[var(--primary)] text-[var(--primary)] shadow-sm'
                : 'bg-[var(--surface-container-low)] border-transparent text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'
            }`}
          >
            <Laptop className="w-5 h-5 mb-2" />
            <span className="text-xs font-bold font-headline">System Match</span>
            <span className="text-[10px] opacity-70 mt-0.5">Auto Detect</span>
          </button>
        </div>
      </div>

      {/* Local Storage Inspector */}
      <div className="bg-[var(--surface-container)] border border-[var(--outline-variant)]/25 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-[var(--primary)]" />
            <h2 className="font-headline font-bold text-base sm:text-lg text-[var(--on-surface)]">
              IndexedDB Storage Health
            </h2>
          </div>
          <button
            onClick={loadStats}
            className="p-1.5 rounded-lg bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
            title="Refresh record counts"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-xs text-[var(--on-surface-variant)] mb-4">
          All data is persistently saved inside your browser&apos;s IndexedDB engine (Dexie.js).
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/20">
            <div className="font-headline text-lg font-bold text-[var(--on-surface)]">{dbStats.habits}</div>
            <div className="text-[10px] uppercase font-semibold text-[var(--on-surface-variant)]">Habits</div>
          </div>
          <div className="p-3 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/20">
            <div className="font-headline text-lg font-bold text-[var(--primary)]">{dbStats.habitLogs}</div>
            <div className="text-[10px] uppercase font-semibold text-[var(--on-surface-variant)]">Habit Logs</div>
          </div>
          <div className="p-3 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/20">
            <div className="font-headline text-lg font-bold text-[var(--on-surface)]">{dbStats.tasks}</div>
            <div className="text-[10px] uppercase font-semibold text-[var(--on-surface-variant)]">Tasks</div>
          </div>
          <div className="p-3 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/20">
            <div className="font-headline text-lg font-bold text-[var(--on-surface)]">{dbStats.journal}</div>
            <div className="text-[10px] uppercase font-semibold text-[var(--on-surface-variant)]">Journals</div>
          </div>
        </div>
      </div>

      {/* Backup and Restore Controls */}
      <div className="bg-[var(--surface-container)] border border-[var(--outline-variant)]/25 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
        <div>
          <h2 className="font-headline font-bold text-base sm:text-lg text-[var(--on-surface)] mb-1 flex items-center gap-2">
            <Database className="w-4 h-4 text-[var(--primary)]" />
            <span>Full Data Backup & Restore</span>
          </h2>
          <p className="text-xs text-[var(--on-surface-variant)]">
            Export complete JSON archives or merge backups from previous sessions.
          </p>
        </div>

        {importStatus && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              importStatus.isError
                ? 'bg-[var(--error)]/15 text-[var(--error)] border border-[var(--error)]/30'
                : 'bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/30'
            }`}
          >
            {importStatus.isError ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
            <span>{importStatus.message}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleExportJSON}
            className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] font-bold text-xs font-headline shadow-sm hover:opacity-90 transition-opacity"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Export Full Backup (JSON)</span>
          </button>

          <label className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-[var(--surface-container-high)] text-[var(--on-surface)] font-bold text-xs font-headline border border-[var(--outline-variant)]/30 hover:bg-[var(--surface-container-highest)] transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-[var(--primary)] stroke-[2.5]" />
            <span>{isImporting ? 'Importing...' : 'Merge Backup (JSON)'}</span>
            <input
              type="file"
              accept=".json"
              disabled={isImporting}
              className="hidden"
              onChange={(e) => handleFileImport(e, 'merge')}
            />
          </label>
        </div>

        {/* CSV Export Options */}
        <div className="pt-4 border-t border-[var(--outline-variant)]/20">
          <span className="block text-xs font-semibold text-[var(--on-surface-variant)] font-headline mb-3 uppercase tracking-wider">
            Export to Spreadsheet (CSV)
          </span>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExportTasksCSV}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/30 hover:border-[var(--primary)] text-xs font-semibold text-[var(--on-surface)] transition-all font-headline"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>Export Tasks as CSV</span>
            </button>

            <button
              onClick={handleExportHabitsCSV}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/30 hover:border-[var(--primary)] text-xs font-semibold text-[var(--on-surface)] transition-all font-headline"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>Export Habit Logs as CSV</span>
            </button>
          </div>
        </div>

        {/* Replace Data Caution */}
        <div className="pt-4 border-t border-[var(--outline-variant)]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[var(--on-surface-variant)]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[var(--primary)] shrink-0" />
            <span>Need a clean slate? Replace database completely:</span>
          </div>

          <label className="text-xs font-bold text-[var(--error)] hover:underline cursor-pointer font-headline shrink-0">
            <span>Replace Entire Database</span>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => handleFileImport(e, 'replace')}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
