"use client";
// ══════════════════════════════════════════════════════════════════════════════
// pf-bp-year.tsx — Year Overview Strip
// 12-month health scores, patterns, festival flags, and annual insights
// ══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TrendingUp, TrendingDown, Minus, Award, AlertTriangle, Calendar } from 'lucide-react';
import {
  computeMonthHealth, getAllMonthPlans, getFestivalHintsForMonth,
  getConsecutiveOverspend, getGoals,
  type MonthHealthReport,
} from './budget-planner-store';
import { fmtINR } from './finance-store';

const fmt = fmtINR;

// ── Month names ───────────────────────────────────────────────────────────────

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ── Health score to color ─────────────────────────────────────────────────────

function scoreColor(score: number): { bg: string; text: string; ring: string; label: string } {
  if (score >= 70) return { bg: 'bg-positive', text: 'text-positive', ring: 'ring-positive/40', label: 'Excellent' };
  if (score >= 40) return { bg: 'bg-warning',  text: 'text-warning',  ring: 'ring-warning/40',  label: 'Fair'      };
  if (score > 0)   return { bg: 'bg-negative', text: 'text-negative', ring: 'ring-negative/40', label: 'Poor'      };
  return { bg: 'bg-slate-200 dark:bg-slate-700', text: 'text-slate-500', ring: 'ring-slate-300', label: 'No data' };
}

// ── Month Tile ────────────────────────────────────────────────────────────────

function MonthTile({
  monthKey, report, isActive, isToday, onClick,
}: {
  monthKey: string;
  report: MonthHealthReport | null;
  isActive: boolean;
  isToday: boolean;
  onClick: () => void;
}) {
  const monNum = parseInt(monthKey.split('-')[1]);
  const festivals = getFestivalHintsForMonth(monthKey);
  const hasPlan = report !== null && report.totalCategories > 0;
  const col = hasPlan ? scoreColor(report.healthScore) : scoreColor(0);

  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center gap-1.5 p-2.5 rounded-lg transition-all border ${
        isActive
          ? `${col.ring} ring-2 ring-offset-1 border-transparent`
          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500'
      } ${
        isToday ? 'bg-slate-50 dark:bg-slate-800' : 'bg-white dark:bg-slate-900'
      }`}
    >
      {/* Festival indicator */}
      {festivals.length > 0 && (
        <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-warning" title={festivals[0].name} />
      )}

      {/* Month name */}
      <span className={`text-[10px] font-bold uppercase tracking-wide ${
        isToday ? 'text-fin-accent' : 'text-slate-500 dark:text-slate-400'
      }`}>
        {MONTH_NAMES[monNum - 1]}
        {isToday && <span className="text-fin-accent ml-0.5">•</span>}
      </span>

      {/* Score circle */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white ${
        hasPlan ? col.bg : 'bg-slate-100 dark:bg-slate-800'
      }`}>
        {hasPlan ? report.healthScore : <span className="text-slate-500 text-xs">—</span>}
      </div>

      {/* Label */}
      <span className={`text-[9px] font-semibold ${col.text}`}>{col.label}</span>

      {/* Savings rate if available */}
      {hasPlan && report.savingsRate > 0 && (
        <span className="text-[9px] text-slate-400">{report.savingsRate.toFixed(0)}% saved</span>
      )}
    </button>
  );
}

// ── Month Detail Panel ────────────────────────────────────────────────────────

function MonthDetailPanel({ monthKey, report }: { monthKey: string; report: MonthHealthReport | null }) {
  const [y, m] = monthKey.split('-').map(Number);
  const monthLabel = `${MONTH_NAMES[m - 1]} ${y}`;
  const festivals = getFestivalHintsForMonth(monthKey);
  const hasPlan = report && report.totalCategories > 0;
  const col = hasPlan ? scoreColor(report.healthScore) : scoreColor(0);

  if (!hasPlan) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-5 text-center space-y-2">
        <p className="text-sm font-bold text-slate-600 dark:text-slate-300">{monthLabel}</p>
        <p className="text-xs text-slate-500">No budget plan exists for this month.</p>
        <p className="text-[11px] text-slate-500">Navigate to this month in the Canvas tab to start planning.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{monthLabel} Summary</p>
          {festivals.length > 0 && (
            <p className="text-[11px] text-warning mt-0.5">
              🎆 {festivals.map(f => f.name).join(', ')}
            </p>
          )}
        </div>
        <div className={`w-14 h-14 rounded-full flex flex-col items-center justify-center ${col.bg}`}>
          <span className="text-white text-lg font-black">{report.healthScore}</span>
          <span className="text-white/70 text-[8px] uppercase tracking-wide">score</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Income',      value: fmt(report.totalIncome) },
          { label: 'Spent',       value: fmt(report.totalActual) },
          { label: 'Savings',     value: fmt(Math.max(0, report.totalIncome - report.totalActual)) },
          { label: 'Savings Rate', value: `${report.savingsRate.toFixed(1)}%` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2.5 text-center">
            <p className="text-base font-black tabular-nums text-neutral-value">{value}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${col.bg}`}
            style={{ width: `${report.healthScore}%` }}
          />
        </div>
        <span className={`text-xs font-bold ${col.text}`}>{col.label}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-positive" />
          {report.categoriesOnTrack} / {report.totalCategories} envelopes on track
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          Breathing room: {fmt(report.breathingRoom)}
        </div>
      </div>
    </div>
  );
}

// ── Annual Insights ───────────────────────────────────────────────────────────

function AnnualInsights({ year, reports }: { year: number; reports: (MonthHealthReport | null)[] }) {
  const valid = reports.filter((r): r is MonthHealthReport => r !== null && r.totalCategories > 0);
  if (valid.length === 0) return null;

  const totalSaved = valid.reduce((s, r) => s + Math.max(0, r.totalIncome - r.totalActual), 0);
  const avgSavingsRate = valid.reduce((s, r) => s + r.savingsRate, 0) / valid.length;
  const bestMonth = [...valid].sort((a, b) => b.healthScore - a.healthScore)[0];
  const worstMonth = [...valid].sort((a, b) => a.healthScore - b.healthScore)[0];
  const onBudgetMonths = valid.filter(r => r.healthScore >= 60).length;

  const overSpend = getConsecutiveOverspend();

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-slate-950 rounded-lg p-5 space-y-4 text-white">
      <div className="flex items-center gap-2">
        <Award className="w-5 h-5 text-slate-300" />
        <p className="text-sm font-bold">{year} Annual Insights</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Saved',     value: fmt(totalSaved),                    sub: `${valid.length} months tracked` },
          { label: 'Avg Savings Rate',value: `${avgSavingsRate.toFixed(1)}%`,    sub: avgSavingsRate >= 20 ? 'Healthy' : 'Can improve' },
          { label: 'On-Budget Months',value: `${onBudgetMonths}/${valid.length}`, sub: 'Score ≥ 60' },
          { label: 'Data Months',     value: String(valid.length),               sub: `of 12 planned` },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-lg font-black tabular-nums text-white">{value}</p>
            <p className="text-[10px] text-white/60 uppercase tracking-wide">{label}</p>
            <p className="text-[9px] text-white/40 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {bestMonth && worstMonth && bestMonth.month !== worstMonth.month && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-positive/20 rounded-lg p-3">
            <p className="text-[10px] text-positive font-bold uppercase tracking-wide">Best Month</p>
            <p className="text-sm font-bold text-white mt-1">
              {MONTH_NAMES[parseInt(bestMonth.month.split('-')[1]) - 1]} — Score {bestMonth.healthScore}
            </p>
            <p className="text-[10px] text-white/50">{bestMonth.savingsRate.toFixed(1)}% savings rate</p>
          </div>
          <div className="bg-negative/20 rounded-lg p-3">
            <p className="text-[10px] text-negative font-bold uppercase tracking-wide">Needs Work</p>
            <p className="text-sm font-bold text-white mt-1">
              {MONTH_NAMES[parseInt(worstMonth.month.split('-')[1]) - 1]} — Score {worstMonth.healthScore}
            </p>
            <p className="text-[10px] text-white/50">{worstMonth.savingsRate.toFixed(1)}% savings rate</p>
          </div>
        </div>
      )}

      {overSpend.length > 0 && (
        <div className="bg-warning/15 rounded-lg p-3 space-y-1.5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <p className="text-xs font-bold text-warning">Recurring Overspend Categories</p>
          </div>
          {overSpend.map(o => (
            <div key={o.category} className="flex items-center justify-between text-xs">
              <span className="text-white/70">{o.category}</span>
              <span className="text-warning font-semibold">{o.consecutiveMonths} consecutive months · suggest {fmt(o.suggestion)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Savings Goals Progress Strip ──────────────────────────────────────────────

function GoalsProgress() {
  const goals = useMemo(() => getGoals(), []);
  if (goals.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-5">
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Savings Goals Progress</p>
      <div className="space-y-3">
        {goals.slice(0, 5).map(g => {
          const pct = g.targetAmount > 0 ? Math.min(100, (g.currentSaved / g.targetAmount) * 100) : 0;
          return (
            <div key={g.id}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {g.emoji} {g.name}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                  {fmt(g.currentSaved)} / {fmt(g.targetAmount)}
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${g.color} transition-all`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex justify-between mt-0.5">
                <span className="text-[9px] text-slate-400">{pct.toFixed(0)}% complete</span>
                {g.monthlyContribution > 0 && (
                  <span className="text-[9px] text-slate-400">{fmt(g.monthlyContribution)}/mo</span>
                )}
              </div>
            </div>
          );
        })}
        {goals.length > 5 && (
          <p className="text-[10px] text-slate-400">+ {goals.length - 5} more goals. View all in Goals tab.</p>
        )}
      </div>
    </div>
  );
}

// ── Main Year View ────────────────────────────────────────────────────────────

export function YearView({ onMonthSelect }: { onMonthSelect: (month: string) => void }) {
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [monthReports, setMonthReports] = useState<(MonthHealthReport | null)[]>([]);

  const reload = useCallback(() => {
    const reports = Array.from({ length: 12 }, (_, i) => {
      const m = String(i + 1).padStart(2, '0');
      return computeMonthHealth(`${year}-${m}`);
    });
    setMonthReports(reports);
  }, [year]);

  useEffect(() => {
    const today = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(today);
    reload();
    const handler = () => reload();
    window.addEventListener('bp-store-updated', handler);
    window.addEventListener('pf-store-updated', handler);
    return () => {
      window.removeEventListener('bp-store-updated', handler);
      window.removeEventListener('pf-store-updated', handler);
    };
  }, [reload]);

  const selectedReport = useMemo(() => {
    if (!selectedMonth || selectedMonth.split('-')[0] !== String(year)) return null;
    const m = parseInt(selectedMonth.split('-')[1]) - 1;
    return monthReports[m] ?? null;
  }, [selectedMonth, monthReports, year]);

  const todayKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

  return (
    <div className="p-4 space-y-4">
      {/* Year selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setYear(y => y - 1)}
            className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center font-bold transition-colors"
          >‹</button>
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">{year}</h2>
          <button
            onClick={() => setYear(y => y + 1)}
            className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center font-bold transition-colors"
          >›</button>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-slate-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-positive inline-block" /> Excellent (70+)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-warning inline-block" /> Fair (40+)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-negative inline-block" /> Poor</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-warning inline-block" /> Festival</span>
        </div>
      </div>

      {/* 12-month tile grid */}
      <div className="grid grid-cols-4 md:grid-cols-6 xl:grid-cols-12 gap-2">
        {Array.from({ length: 12 }, (_, i) => {
          const m = String(i + 1).padStart(2, '0');
          const key = `${year}-${m}`;
          const report = monthReports[i] ?? null;
          return (
            <MonthTile
              key={key}
              monthKey={key}
              report={report}
              isActive={selectedMonth === key}
              isToday={key === todayKey}
              onClick={() => setSelectedMonth(key)}
            />
          );
        })}
      </div>

      {/* Selected month detail */}
      {selectedMonth && selectedMonth.split('-')[0] === String(year) && (
        <div className="space-y-3">
          <MonthDetailPanel monthKey={selectedMonth} report={selectedReport} />
          <div className="flex justify-center">
            <button
              onClick={() => onMonthSelect(selectedMonth)}
              className="flex items-center gap-2 px-5 py-2.5 bg-fin-accent text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Open {MONTH_NAMES[parseInt(selectedMonth.split('-')[1]) - 1]} Budget
            </button>
          </div>
        </div>
      )}

      {/* Annual insights */}
      <AnnualInsights year={year} reports={monthReports} />

      {/* Goals progress */}
      <GoalsProgress />
    </div>
  );
}
