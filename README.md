# onePercent — Become 1% Better Every Day

> **A high-contrast, local-first personal consistency companion engineered from Google Stitch.**

**onePercent** is built on the philosophy:
* Small improvements every day.
* Consistency over perfection.
* Progress over comparison.
* Rest is equally important.
* Missed days are opportunities to restart.

---

## 🚀 Key Features

1. **Production Dashboard (Google Stitch UI)**
   - Personalized time-sensitive greeting and date header.
   - Live unbroken streak banner (`🔥 14 days streak`).
   - SVG circular radial progress ring with live percentage calculation.
   - Today's completed vs. applicable habits and tasks counters.
   - Quick action shortcuts (Add Habit, Add Task, Journal, Focus Timer).
   - "Today's Focus" list allowing instant habit and task completion.
   - 7-day weekly overview bar chart (Monday to Sunday) with active today indicator.
   - Statistics summary row: Current streak, weekly consistency %, monthly tier.

2. **Daily Habit Tracker (`/tracker`)**
   - 12 default habits seeded out-of-the-box (Wake up on time, Morning sunlight, Drink water, Workout, Walking, Read 5 pages, Solve 1 DSA problem, Focused study, Eat proper meals, Limit scrolling, Journal 5m, Sleep on time).
   - 4-state cycle: Completed, Partially completed (0.5 credit), Skipped (does NOT break streaks or count as failure), and Missed.
   - Category filtering (Routine, Health, Fitness, Mind, Academics, Productivity).
   - Reordering with priority persistence.
   - Full historical correction modal allowing retrospective edits for any past day.
   - Archive and restore capabilities.

3. **To-Do / Task Manager (`/todos`)**
   - Prioritized task management (High, Medium, Low).
   - Filter views: Today, Upcoming, Overdue, Completed, All Tasks.
   - Quick Add bar for rapid capture with enter key.
   - Automatic recurrence advancement (daily, weekly, weekdays, monthly).
   - Full-text search and category filtering.

4. **Monthly Heatmap Calendar (`/calendar`)**
   - 5-Tier color classification formula:
     - **Dark Green**: 100% completion
     - **Light Green**: 80% – 99%
     - **Yellow**: 50% – 79%
     - **Red**: Below 50%
     - **Grey**: Future / Untracked days
   - Monthly summary chips: Successful days, partially successful days, unsuccessful days, untracked days.
   - Interactive Date Inspection Modal displaying habits done/missed/skipped, tasks due/done, daily percentage, and attached journal notes.
   - Month-by-month navigation (Previous, Next, Today).

5. **Real Analytics Module (`/analytics`)**
   - 7-Day weekly completion rate (Recharts bar chart).
   - 30-Day consistency longitudinal curve (Recharts area chart).
   - Habit-by-habit breakdown table with quantitative percentage.
   - Best-performing habit & most frequently missed habit insight cards.
   - Task completion rate vs total tasks.

6. **Guilt-Free Rewards (`/rewards`)**
   - Dedicated guilt-free decompression hub.
   - Seeded activities: The Mentalist episode, football match, outdoor recreation, movies, relaxing without doing anything.
   - Philosophy: Rest, sleep, meals, and social connections never require earning.
   - Custom rewards and full log history.

7. **Date-Based Journal (`/journal`)**
   - 5 Guided evening reflection prompts:
     1. *What went well today?*
     2. *What could I improve?*
     3. *What did I learn?*
     4. *What is bothering me?*
     5. *What should I focus on tomorrow?*
   - Daily mindset & energy selector (Great, Good, Neutral, Tough, Rest).
   - Automatic local persistence with last-saved timestamp.

8. **Personal Goals & Milestones (`/goals`)**
   - Macro goal tracking with target dates and categories.
   - Interactive milestone checklist. Completing milestones automatically advances goal progress %.
   - Inline milestone addition and progress visualization.

9. **Persistent Focus Timer (`/focus`)**
   - Pomodoro timer: 25m Focus, 5m Short Break, 15m Long Break, or custom length (5m - 90m).
   - Timestamp persistence: Survives browser refreshes, tab closures, and page navigation without losing progress.
   - Task linking: Associate deep work blocks with specific To-Do items.
   - Complete focus session history logged in IndexedDB.

10. **Data Safety, Backup & Restore (`/settings`)**
    - JSON Export: Download complete database payload with schema versioning.
    - JSON Merge & Restore: Import existing backups with Zod schema validation.
    - CSV Exports: One-click export for tasks and habit logs to open in Excel or Google Sheets.
    - IndexedDB storage health inspector displaying live record counts.

11. **Calibrated Light & Dark Modes**
    - Dark mode: Google Stitch **Circuit Navy** (`#0C1A2B`) + **Solar Lime** (`#B6FF3B`).
    - Light mode: Clean, high-contrast crisp theme with 4.5:1+ WCAG contrast.
    - System theme auto-detection with persistent localStorage + IndexedDB preference.

12. **Offline & PWA Ready**
    - Service Worker (`/sw.js`) with stale-while-revalidate caching.
    - Web App Manifest (`/manifest.json`) and mobile maskable app icons.
    - 100% functional without an internet connection.

---

## 🛠 Technology Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **UI Library**: React 19, TypeScript
- **Styling**: Tailwind CSS v4 (Stitch Design Tokens)
- **Database**: IndexedDB via Dexie.js (Local-first)
- **State Management**: Zustand
- **Visualizations**: Recharts
- **Date Handling**: date-fns
- **Icons**: Lucide React
- **Validation**: Zod
- **Effects**: canvas-confetti

---

## 📂 Project Architecture

```
onePercent/
├── public/
│   ├── icons/            # App icons (192x192, 512x512)
│   ├── manifest.json     # PWA Manifest
│   └── sw.js             # Service Worker (offline cache)
├── src/
│   ├── app/
│   │   ├── layout.tsx    # Root layout with fonts & AppShell
│   │   ├── page.tsx      # Dashboard entry
│   │   ├── dashboard/    # Dashboard route
│   │   ├── tracker/      # Habit tracker route
│   │   ├── todos/        # Tasks route
│   │   ├── calendar/     # Heatmap calendar route
│   │   ├── analytics/    # Analytics route
│   │   ├── rewards/      # Guilt-free rewards route
│   │   ├── journal/      # Evening journal route
│   │   ├── goals/        # Personal goals route
│   │   ├── focus/        # Focus timer route
│   │   └── settings/     # Theme, backup & restore route
│   ├── components/
│   │   ├── layout/       # AppShell, DesktopSidebar, TopHeader, BottomNav, MenuDrawer
│   │   ├── dashboard/    # DashboardView
│   │   ├── habits/       # HabitTrackerView, HabitHistoryModal
│   │   ├── todos/        # TodoView
│   │   ├── calendar/     # CalendarView, DateDetailModal
│   │   ├── analytics/    # AnalyticsView
│   │   ├── rewards/      # RewardsView
│   │   ├── journal/      # JournalView
│   │   ├── goals/        # GoalsView
│   │   ├── focus/        # FocusTimerView
│   │   └── common/       # AddHabitModal, AddTaskModal, SettingsView
│   ├── db/
│   │   ├── schema.ts     # Dexie database tables & indexes
│   │   ├── database.ts   # Singleton & seed data initialization
│   │   ├── migrations.ts # Schema migration verification
│   │   └── backup.ts     # JSON & CSV backup / restore / export engine
│   ├── stores/           # Zustand stores (habits, tasks, timer, goals, etc.)
│   ├── lib/              # dateUtils, statsUtils, cn utility
│   ├── types/            # TypeScript interfaces
│   └── hooks/            # useMounted, useOfflineStatus
├── tests/
│   └── unit_tests.mjs    # Unit test suite (day perf, streak, recurrence)
├── package.json
└── README.md
```

---

## 💻 Local Development Setup

### 1. Prerequisites
- Node.js `v20.x` or later (tested on Node v24.21.0)
- npm `v10.x` or later

### 2. Installation
Navigate to the project folder:
```bash
cd onePercent
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Automated Test Suite
```bash
npm test
```

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 🎨 Design Tokens Summary

| Token | Dark Theme | Light Theme | Description |
|---|---|---|---|
| Background / Canvas | `#0C1A2B` | `#F4F7FB` | Circuit Navy foundation |
| Surface Card | `#112135` | `#EDF2F8` | Primary container surface |
| Elevated Surface | `#1A2C42` | `#E1E8F2` | Interactive badge backgrounds |
| Primary Accent | `#B6FF3B` | `#558E00` | Solar Lime completion color |
| Secondary Accent | `#68DBA9` | `#00875A` | Mint health & partial indicator |
| Fire / Streak Accent | `#FC7C78` | `#F87171` | Warm salmon fire icon |
| Outline Ghost | `#324359` | `#CBD5E1` | Razor-thin structural borders |

---

## 🔒 Privacy & Local-First Guarantee
* **No external accounts or logins required.**
* **Zero telemetry or tracking cookies.**
* **All data remains encrypted and stored strictly inside your browser's IndexedDB engine.**
* **Export and backup your complete data anytime in standard JSON and CSV.**
