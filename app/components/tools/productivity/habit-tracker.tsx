"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, Flame, RotateCcw, Info } from 'lucide-react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';

const STORAGE_KEY = 'otsd-habit-tracker';

interface Habit {
  id: string;
  name: string;
  color: string;
  icon: string;
  completions: string[]; // dates completed (YYYY-MM-DD)
  createdAt: string;
}

const HABIT_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#f97316', '#8b5cf6',
  '#06b6d4', '#ec4899', '#84cc16', '#14b8a6', '#ef4444',
];
const HABIT_ICONS = ['🏃', '💧', '📚', '🧘', '💪', '🥗', '😴', '✍️', '🎯', '🧘‍♀️', '🚴', '🧹'];

function load(): Habit[] {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : [];
  } catch { return []; }
}
function save(data: Habit[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getDateStr(offset = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return d.toISOString().split('T')[0];
}

function getStreak(completions: string[], today: string): number {
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = getDateStr(i);
    if (completions.includes(d)) {
      streak++;
    } else if (i === 0) {
      // today not completed — check yesterday for ongoing streak
      continue;
    } else {
      break;
    }
  }
  return streak;
}

function getLast21Days(): string[] {
  return Array.from({ length: 21 }, (_, i) => getDateStr(20 - i));
}

export const HabitTracker = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', color: HABIT_COLORS[0], icon: HABIT_ICONS[0] });
  const today = getDateStr(0);
  const last21 = getLast21Days();

  useEffect(() => { setHabits(load()); }, []);
  useEffect(() => { if (habits.length !== undefined) save(habits); }, [habits]);

  const toggleCompletion = (habitId: string, date: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== habitId) return h;
      const completions = h.completions.includes(date)
        ? h.completions.filter(d => d !== date)
        : [...h.completions, date];
      return { ...h, completions };
    }));
  };

  const addHabit = () => {
    if (!newHabit.name.trim()) return;
    const habit: Habit = {
      id: Date.now().toString(),
      name: newHabit.name.trim(),
      color: newHabit.color,
      icon: newHabit.icon,
      completions: [],
      createdAt: today,
    };
    setHabits(prev => [...prev, habit]);
    setNewHabit({ name: '', color: HABIT_COLORS[habits.length % HABIT_COLORS.length], icon: HABIT_ICONS[0] });
    setShowAdd(false);
  };

  const deleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  const stats = useMemo(() => {
    const completedToday = habits.filter(h => h.completions.includes(today)).length;
    const totalToday = habits.length;
    const bestStreak = Math.max(0, ...habits.map(h => getStreak(h.completions, today)));
    const avgCompletion = habits.length > 0
      ? (habits.reduce((s, h) => {
          const last7 = Array.from({ length: 7 }, (_, i) => getDateStr(i));
          return s + last7.filter(d => h.completions.includes(d)).length / 7;
        }, 0) / habits.length) * 100
      : 0;
    return { completedToday, totalToday, bestStreak, avgCompletion };
  }, [habits, today]);

  return (
    <div>
      <SAPHeader
        fullWidth
        title="Habit Tracker"
        subtitle="Build consistency, one day at a time"
        kpis={[
          { label: "Today's Progress", value: `${stats.completedToday}/${stats.totalToday}`, color: stats.completedToday === stats.totalToday && stats.totalToday > 0 ? 'success' : 'primary', subtitle: 'Habits completed' },
          { label: 'Best Active Streak', value: `${stats.bestStreak} days`, color: stats.bestStreak >= 7 ? 'success' : 'neutral', subtitle: 'Longest current streak' },
          { label: '7-Day Avg Rate', value: `${stats.avgCompletion.toFixed(0)}%`, color: stats.avgCompletion >= 80 ? 'success' : stats.avgCompletion >= 50 ? 'warning' : 'error', subtitle: 'Completion rate' },
          { label: 'Total Habits', value: String(habits.length), color: 'neutral', subtitle: 'Being tracked' },
        ]}
      />

      <div className="p-4 space-y-4">
        {/* Add button */}
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Your Habits</h2>
          <button onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 px-4 py-2 bg-violet-500 text-white rounded-xl text-sm font-semibold hover:bg-violet-600 transition-colors">
            <Plus className="w-4 h-4" /> New Habit
          </button>
        </div>

        {/* Add Form */}
        {showAdd && (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-violet-200 dark:border-violet-800 space-y-3">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Add New Habit</h3>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Habit Name</label>
              <input type="text" placeholder="e.g. Read 30 minutes, Morning run..."
                className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-violet-400 transition-colors w-full"
                value={newHabit.name} onChange={e => setNewHabit(n => ({ ...n, name: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && addHabit()} />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Icon</label>
              <div className="flex flex-wrap gap-2">
                {HABIT_ICONS.map(icon => (
                  <button key={icon} onClick={() => setNewHabit(n => ({ ...n, icon }))}
                    className={`w-9 h-9 rounded-lg text-lg border-2 transition-all ${newHabit.icon === icon ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20' : 'border-slate-200 dark:border-slate-700'}`}>
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Color</label>
              <div className="flex flex-wrap gap-2">
                {HABIT_COLORS.map(color => (
                  <button key={color} onClick={() => setNewHabit(n => ({ ...n, color }))}
                    className={`w-7 h-7 rounded-full transition-all ${newHabit.color === color ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`}
                    style={{ backgroundColor: color }} />
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={addHabit} className="px-4 py-2 bg-violet-500 text-white rounded-xl text-sm font-semibold hover:bg-violet-600 transition-colors">Add Habit</button>
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
            </div>
          </div>
        )}

        {habits.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-10 border border-slate-200 dark:border-slate-700 text-center space-y-3">
            <div className="text-4xl">🎯</div>
            <p className="text-sm text-slate-500">No habits yet. Add your first habit to start building consistency.</p>
          </div>
        ) : (
          <>
            {/* Header row - dates */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              {/* Date header */}
              <div className="flex items-center border-b border-slate-100 dark:border-slate-700 px-4 py-2 bg-slate-50 dark:bg-slate-800/50">
                <div className="w-44 shrink-0 text-xs font-semibold text-slate-500 dark:text-slate-400">Habit</div>
                <div className="flex-1 flex justify-end gap-1 overflow-hidden">
                  {last21.map((date, i) => {
                    const d = new Date(date);
                    const isToday = date === today;
                    return (
                      <div key={date} className={`w-7 text-center shrink-0 ${i < 14 ? 'hidden sm:block' : ''}`}>
                        <div className={`text-[9px] ${isToday ? 'text-violet-500 font-bold' : 'text-slate-400'}`}>
                          {d.toLocaleDateString('en-IN', { weekday: 'narrow' })}
                        </div>
                        <div className={`text-[9px] ${isToday ? 'text-violet-500 font-bold' : 'text-slate-400'}`}>
                          {d.getDate()}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="w-20 shrink-0 text-xs font-semibold text-slate-500 dark:text-slate-400 text-right">Streak</div>
              </div>

              {/* Habit rows */}
              {habits.map(habit => {
                const streak = getStreak(habit.completions, today);
                const last7Rate = Array.from({ length: 7 }, (_, i) => getDateStr(i))
                  .filter(d => habit.completions.includes(d)).length;
                return (
                  <div key={habit.id} className="flex items-center border-b border-slate-50 dark:border-slate-800 last:border-0 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                    <div className="w-44 shrink-0 flex items-center gap-2 min-w-0">
                      <span className="text-lg">{habit.icon}</span>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{habit.name}</span>
                      <button onClick={() => deleteHabit(habit.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex-1 flex justify-end gap-1 overflow-hidden">
                      {last21.map((date, i) => {
                        const done = habit.completions.includes(date);
                        const isToday = date === today;
                        const isFuture = date > today;
                        return (
                          <button key={date} onClick={() => !isFuture && toggleCompletion(habit.id, date)}
                            disabled={isFuture}
                            className={`w-7 h-7 rounded-md transition-all shrink-0 ${i < 14 ? 'hidden sm:flex' : 'flex'} items-center justify-center ${isFuture ? 'opacity-20 cursor-default' : 'cursor-pointer hover:opacity-80'}
                              ${isToday && !done ? 'ring-2 ring-violet-300 dark:ring-violet-600' : ''}`}
                            style={done ? { backgroundColor: habit.color } : {}}
                          >
                            {done
                              ? <CheckCircle2 className="w-4 h-4 text-white" />
                              : <div className={`w-5 h-5 rounded border-2 ${isToday ? 'border-violet-400 dark:border-violet-500' : 'border-slate-200 dark:border-slate-600'}`} />}
                          </button>
                        );
                      })}
                    </div>

                    <div className="w-20 shrink-0 flex items-center justify-end gap-1.5">
                      {streak > 0 && <Flame className="w-3.5 h-3.5 text-orange-500" />}
                      <span className={`text-sm font-semibold ${streak >= 7 ? 'text-orange-500' : streak >= 3 ? 'text-amber-500' : 'text-slate-500'}`}>
                        {streak}d
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs text-slate-400 px-1">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-green-500 flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </div> Completed
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded border-2 border-violet-400" />
                Today
              </div>
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-500" />
                Streak (days)
              </div>
            </div>
          </>
        )}

        <div className="bg-violet-50 dark:bg-violet-900/20 rounded-xl p-4 border border-violet-200 dark:border-violet-800 flex gap-3">
          <Info className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
          <p className="text-xs text-violet-700 dark:text-violet-300">
            Research shows it takes 21–66 days to form a habit. Click any day to mark it complete or undo. All data is stored locally on your device.
          </p>
        </div>
      </div>
    </div>
  );
};
