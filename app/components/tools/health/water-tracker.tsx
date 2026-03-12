"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Minus, RotateCcw, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';

const STORAGE_KEY = 'otsd-water-tracker';
const TODAY = new Date().toISOString().split('T')[0];

interface DayLog {
  date: string;
  glasses: number;
}

function load(): DayLog[] {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : [];
  } catch { return []; }
}
function save(data: DayLog[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const GLASS_SIZES: Record<string, { label: string; ml: number }> = {
  small: { label: 'Small (150 ml)', ml: 150 },
  medium: { label: 'Medium (250 ml)', ml: 250 },
  large: { label: 'Large (350 ml)', ml: 350 },
  bottle: { label: 'Bottle (500 ml)', ml: 500 },
};

export const WaterTracker = () => {
  const [logs, setLogs] = useState<DayLog[]>([]);
  const [dailyGoal, setDailyGoal] = useState(8); // glasses
  const [glassSize, setGlassSize] = useState<keyof typeof GLASS_SIZES>('medium');

  useEffect(() => {
    const data = load();
    // Ensure today exists
    if (!data.find(d => d.date === TODAY)) {
      data.push({ date: TODAY, glasses: 0 });
    }
    setLogs(data);
  }, []);

  const todayLog = useMemo(() => logs.find(d => d.date === TODAY) || { date: TODAY, glasses: 0 }, [logs]);
  const todayGlasses = todayLog.glasses;
  const todayMl = todayGlasses * GLASS_SIZES[glassSize].ml;
  const goalMl = dailyGoal * GLASS_SIZES[glassSize].ml;
  const pct = Math.min(100, dailyGoal > 0 ? (todayGlasses / dailyGoal) * 100 : 0);

  const updateToday = (delta: number) => {
    const newLogs = logs.map(d =>
      d.date === TODAY ? { ...d, glasses: Math.max(0, d.glasses + delta) } : d
    );
    if (!newLogs.find(d => d.date === TODAY)) {
      newLogs.push({ date: TODAY, glasses: Math.max(0, delta) });
    }
    setLogs(newLogs);
    save(newLogs);
  };

  const resetToday = () => {
    const newLogs = logs.map(d => d.date === TODAY ? { ...d, glasses: 0 } : d);
    setLogs(newLogs);
    save(newLogs);
  };

  // Last 7 days chart
  const last7 = useMemo(() => {
    const days: { date: string; glasses: number; label: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const log = logs.find(l => l.date === dateStr);
      days.push({
        date: dateStr,
        glasses: log?.glasses || 0,
        label: i === 0 ? 'Today' : d.toLocaleDateString('en-IN', { weekday: 'short' }),
      });
    }
    return days;
  }, [logs]);

  const streak = useMemo(() => {
    let count = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const log = logs.find(l => l.date === dateStr);
      if (log && log.glasses >= dailyGoal) count++;
      else if (i > 0) break; // streak broken
    }
    return count;
  }, [logs, dailyGoal]);

  const avgLast7 = useMemo(() => {
    const total = last7.reduce((s, d) => s + d.glasses, 0);
    return total / 7;
  }, [last7]);

  // Glass visual
  const filledGlasses = Array.from({ length: Math.max(dailyGoal, 8) }, (_, i) => i < todayGlasses);

  return (
    <div>
      <SAPHeader
        fullWidth
        title="Water Intake Tracker"
        subtitle={`Goal: ${dailyGoal} glasses (${(goalMl / 1000).toFixed(1)} L/day)`}
        kpis={[
          { label: "Today's Intake", value: `${todayGlasses} glasses`, color: pct >= 100 ? 'success' : 'primary', subtitle: `${(todayMl / 1000).toFixed(2)} L` },
          { label: 'Goal Progress', value: `${pct.toFixed(0)}%`, color: pct >= 100 ? 'success' : pct >= 50 ? 'warning' : 'error', subtitle: pct >= 100 ? 'Goal reached!' : `${dailyGoal - todayGlasses} more glasses` },
          { label: 'Streak', value: `${streak} days`, color: streak >= 7 ? 'success' : 'neutral', subtitle: '≥ goal every day' },
          { label: '7-Day Avg', value: `${avgLast7.toFixed(1)} glasses`, color: avgLast7 >= dailyGoal ? 'success' : 'warning', subtitle: 'Daily average' },
        ]}
      />

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: Controls */}
          <div className="lg:col-span-1 space-y-4">
            {/* Settings */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700 space-y-4">
              <h2 className="font-semibold text-slate-800 dark:text-slate-200">Settings</h2>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Daily Goal (glasses)</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setDailyGoal(g => Math.max(1, g - 1))} className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 w-8 text-center">{dailyGoal}</span>
                  <button onClick={() => setDailyGoal(g => g + 1)} className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Glass Size</label>
                <select value={glassSize} onChange={e => setGlassSize(e.target.value as keyof typeof GLASS_SIZES)}
                  className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none w-full">
                  {Object.entries(GLASS_SIZES).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Add/Remove buttons */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-cyan-600 dark:text-cyan-400">{todayGlasses}</div>
                <div className="text-sm text-slate-500">of {dailyGoal} glasses today</div>
                <div className="text-xs text-slate-400 mt-1">{(todayMl / 1000).toFixed(2)} L / {(goalMl / 1000).toFixed(1)} L</div>
              </div>

              {/* Progress ring */}
              <div className="flex justify-center">
                <div className="relative w-28 h-28">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="10" className="dark:stroke-slate-700" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke={pct >= 100 ? '#10b981' : '#06b6d4'} strokeWidth="10"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - pct / 100)}`}
                      strokeLinecap="round" className="transition-all duration-500" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-lg font-bold text-slate-700 dark:text-slate-300">{pct.toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => updateToday(-1)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                  <Minus className="w-4 h-4" /> Remove
                </button>
                <button onClick={() => updateToday(1)}
                  className="flex-1 py-3 rounded-xl bg-cyan-500 text-white font-semibold hover:bg-cyan-600 transition-colors flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> Add Glass
                </button>
              </div>
              <button onClick={resetToday} className="w-full py-2 text-xs text-slate-400 hover:text-red-500 transition-colors flex items-center justify-center gap-1">
                <RotateCcw className="w-3 h-3" /> Reset today
              </button>
            </div>
          </div>

          {/* Right: Visual + History */}
          <div className="lg:col-span-2 space-y-4">
            {/* Glass grid visual */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Today's Progress</h3>
              <div className="flex flex-wrap gap-2">
                {filledGlasses.map((filled, i) => (
                  <button key={i} onClick={() => updateToday(filled ? -1 : 1)}
                    title={`Glass ${i + 1}`}
                    className={`w-10 h-12 rounded-lg border-2 transition-all flex items-end justify-center overflow-hidden ${filled
                      ? 'border-cyan-400 bg-cyan-100 dark:bg-cyan-900/30'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'}`}>
                    <div className={`w-full transition-all duration-300 ${filled ? 'h-4/5 bg-cyan-400 dark:bg-cyan-500' : 'h-0'}`} />
                  </button>
                ))}
              </div>
              {pct >= 100 && (
                <div className="mt-3 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> Daily goal achieved! Great hydration.
                </div>
              )}
            </div>

            {/* 7-day chart */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Last 7 Days</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={last7} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={[0, Math.max(dailyGoal + 2, 10)]} />
                  <Tooltip formatter={(v: number) => [`${v} glasses`]} />
                  <ReferenceLine y={dailyGoal} stroke="#06b6d4" strokeDasharray="4 4" label={{ value: 'Goal', fill: '#06b6d4', fontSize: 11 }} />
                  <Bar dataKey="glasses" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Glasses" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-xl p-4 border border-cyan-200 dark:border-cyan-800 flex gap-3">
              <Info className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
              <p className="text-xs text-cyan-700 dark:text-cyan-300">
                The general recommendation is 8 glasses (2 L) per day, but needs vary by body weight, activity level, and climate. A simple rule: drink 35 ml per kg of body weight daily.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
