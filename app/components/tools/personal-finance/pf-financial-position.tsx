'use client';

import { useState, useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Percent, ChevronUp, Info, X, SlidersHorizontal } from 'lucide-react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';
import {
  getAccounts, getStatements, getPFTransactions, filterByPeriod, computeFinancialMetrics,
  getAvailableMonths, validateForCompute, getStatementCoverageRange, getLastUpdatedTimestamp,
  type PFAccount, type PFStatement, type PFTransaction, type FinancialMetrics,
  fmtINR, fmtPct, PERIOD_OPTIONS, getPeriodRange,
} from './finance-store';

// ═══════════════════════════════════════════════════════════════════════════════
// FINANCIAL POSITION — Primary Dashboard
//
// Default period: All Time (full statement range).
// Empty states are explicit — no silent zeros.
// Formula info icon on each ratio shows exact computation.
// Last updated indicator on every render.
// ═══════════════════════════════════════════════════════════════════════════════

// ── Ratio formula definitions ─────────────────────────────────────────────────
const RATIO_FORMULAS = {
  commitment: {
    formula: '(Housing + Insurance + Loan/EMI) ÷ Total Income × 100',
    note: 'Fixed pre-committed expenses as a percentage of income. Lower is safer. Target: <50%.',
  },
  discretionary: {
    formula: '(Food & Dining + Shopping + Travel) ÷ Total Income × 100',
    note: 'Variable discretionary spending as a percentage of income. Target: <30%.',
  },
  debt: {
    formula: 'Total Loan/EMI ÷ Total Income × 100',
    note: 'EMI and loan repayments as a percentage of income. Target: <40% (RBI guideline).',
  },
  savings: {
    formula: '(Total Income − Total Outflow) ÷ Total Income × 100',
    note: 'Net Surplus = Income − All Outflows. Negative = deficit.',
  },
};

export function FinancialPosition() {
  const [mounted, setMounted]     = useState(false);
  const [accounts, setAccounts]   = useState<PFAccount[]>([]);
  const [statements, setStatements] = useState<PFStatement[]>([]);
  const [allTxns, setAllTxns]     = useState<PFTransaction[]>([]);
  const [period, setPeriod]       = useState('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo]   = useState('');
  const [accountId, setAccountId] = useState('all');
  const [statementId, setStatementId] = useState('all');
  const [drillDown, setDrillDown] = useState<string | null>(null);
  const [formulaPopover, setFormulaPopover] = useState<string | null>(null);
  const [showFilterBar, setShowFilterBar] = useState(true);

  const reload = () => {
    setAccounts(getAccounts());
    setStatements(getStatements());
    setAllTxns(getPFTransactions());
  };

  useEffect(() => {
    setMounted(true);
    reload();
    const h = () => reload();
    window.addEventListener('pf-store-updated', h);
    return () => window.removeEventListener('pf-store-updated', h);
  }, []);

  const filtered = useMemo(() => {
    let txns = accountId !== 'all'
      ? allTxns.filter(t => t.accountId === accountId)
      : allTxns;
    if (statementId !== 'all') txns = txns.filter(t => t.statementId === statementId);
    return filterByPeriod(txns, period, customFrom, customTo);
  }, [allTxns, accountId, statementId, period, customFrom, customTo]);

  const metrics = useMemo(() => computeFinancialMetrics(filtered), [filtered]);
  const validation = useMemo(() => validateForCompute(filtered), [filtered]);
  const availableMonths = useMemo(() => getAvailableMonths(), [allTxns]);

  // Drill-down transactions — must be before early return (Rules of Hooks)
  const drillTxns = useMemo(() => {
    if (!drillDown) return [];
    if (drillDown === 'income')        return filtered.filter(t => t.type === 'credit');
    if (drillDown === 'outflow')       return filtered.filter(t => t.type === 'debit');
    if (drillDown === 'surplus')       return filtered;
    if (drillDown === 'commitment')    return filtered.filter(t => t.type === 'debit' && ['Housing', 'Insurance', 'Loan/EMI'].includes(t.category));
    if (drillDown === 'discretionary') return filtered.filter(t => t.type === 'debit' && ['Food & Dining', 'Shopping', 'Travel'].includes(t.category));
    if (drillDown === 'debt')          return filtered.filter(t => t.type === 'debit' && t.category === 'Loan/EMI');
    return [];
  }, [drillDown, filtered]);

  if (!mounted) return null;

  const hasData = allTxns.length > 0;
  const hasIncome = metrics.totalIncome > 0;
  const coverage  = getStatementCoverageRange();
  const lastUpdated = getLastUpdatedTimestamp();

  const periodRange = period === 'custom'
    ? (customFrom && customTo ? `${customFrom} → ${customTo}` : 'Set custom range')
    : period === 'all'
      ? (coverage ? `${coverage.from} → ${coverage.to}` : 'All time')
      : (getPeriodRange(period)
          ? `${getPeriodRange(period)!.from} → ${getPeriodRange(period)!.to}`
          : 'All time');

  // ── Metric Card ─────────────────────────────────────────────────────────────
  const MetricCard = ({
    id, label, value, subtitle, colorClass, icon: Icon,
  }: {
    id: string; label: string; value: string; subtitle?: string;
    colorClass: string; icon: React.ElementType;
  }) => (
    <button
      onClick={() => setDrillDown(drillDown === id ? null : id)}
      className={`text-left w-full bg-white dark:bg-slate-900 border rounded-xl p-4 transition-all hover:shadow-sm group ${
        drillDown === id
          ? 'border-blue-400 ring-2 ring-blue-200 dark:ring-blue-800'
          : 'border-slate-200 dark:border-slate-700'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <Icon size={14} className={`${colorClass} opacity-60`} />
      </div>
      <p className={`text-2xl font-black ${colorClass} mb-0.5`}>{value}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-1.5 group-hover:text-slate-400 transition-colors">
        Click for breakdown
      </p>
    </button>
  );

  // ── Ratio Card with inline formula icon ──────────────────────────────────────
  const RatioCard = ({
    id, label, value, good, bad,
  }: {
    id: string; label: string; value: number;
    good: number; bad: number;
  }) => {
    const colorClass = value <= good ? 'text-emerald-600' : value <= bad ? 'text-amber-600' : 'text-red-600';
    const barColor   = value <= good ? 'bg-emerald-500'  : value <= bad ? 'bg-amber-500'  : 'bg-red-500';
    const f = RATIO_FORMULAS[id as keyof typeof RATIO_FORMULAS];
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setDrillDown(drillDown === id ? null : id)}
            className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-600 dark:hover:text-slate-200 transition-colors text-left"
          >
            {label}
          </button>
          <button
            onClick={e => { e.stopPropagation(); setFormulaPopover(formulaPopover === id ? null : id); }}
            className="p-1 text-slate-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors rounded"
            title="Show formula"
          >
            <Info size={13} />
          </button>
        </div>
        <button
          onClick={() => setDrillDown(drillDown === id ? null : id)}
          className="w-full text-left"
        >
          <p className={`text-3xl font-black ${colorClass} mb-1.5`}>{fmtPct(value)}</p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mb-1">
            <div
              className={`h-1.5 rounded-full ${barColor} transition-all`}
              style={{ width: `${Math.min(value, 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400">
            Good: &lt;{good}% · Caution: {good}–{bad}% · High: &gt;{bad}%
          </p>
        </button>

        {/* Inline formula popover */}
        {formulaPopover === id && f && (
          <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-600">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Formula</p>
                <p className="text-xs font-mono text-blue-600 dark:text-blue-400 break-words">{f.formula}</p>
                <p className="text-[11px] text-slate-400 mt-1.5">{f.note}</p>
              </div>
              <button onClick={() => setFormulaPopover(null)} className="text-slate-300 hover:text-slate-500 shrink-0">
                <X size={12} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <SAPHeader
        fullWidth
        title="Financial Position"
        subtitle={`Period: ${periodRange}`}
        kpis={hasData && hasIncome ? [
          { label: 'Total Income',  value: fmtINR(metrics.totalIncome),  color: 'success' },
          { label: 'Total Outflow', value: fmtINR(metrics.totalOutflow), color: metrics.totalOutflow > metrics.totalIncome ? 'error' : 'warning' },
          { label: 'Net Surplus',   value: fmtINR(metrics.netSurplus),   color: metrics.netSurplus >= 0 ? 'success' : 'error' },
          { label: 'Savings Rate',  value: fmtPct(metrics.savingsRate),  color: metrics.savingsRate >= 20 ? 'success' : metrics.savingsRate >= 10 ? 'warning' : 'error' },
        ] : undefined}
      />
    <div className="space-y-4 px-4 pb-4">

      {/* Validation banners */}
      {hasData && !validation.valid && validation.errors.map((err, i) => (
        <div key={i} className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl px-4 py-3 text-xs text-red-700 dark:text-red-300">
          <Info size={13} className="mt-0.5 shrink-0" />
          {err}
        </div>
      ))}
      {hasData && validation.warnings.map((w, i) => (
        <div key={i} className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl px-4 py-3 text-xs text-amber-700 dark:text-amber-300">
          <Info size={13} className="mt-0.5 shrink-0" />
          {w}
        </div>
      ))}

      {/* SAP Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={13} className="text-slate-400" />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Filters</p>
          </div>
          <button onClick={() => setShowFilterBar(v => !v)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold">
            {showFilterBar ? 'Hide Filter Bar' : 'Show Filter Bar'}
          </button>
        </div>
        {showFilterBar && (
          <div className="px-4 py-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Period</label>
              <select value={period} onChange={e => setPeriod(e.target.value)}
                className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200">
                {PERIOD_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
                {availableMonths.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Account</label>
              <select value={accountId} onChange={e => { setAccountId(e.target.value); setStatementId('all'); }}
                className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200">
                <option value="all">All Accounts</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            {statements.length > 1 && (
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Statement</label>
                <select value={statementId} onChange={e => setStatementId(e.target.value)}
                  className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200">
                  <option value="all">All Statements</option>
                  {statements
                    .filter(s => accountId === 'all' || s.accountId === accountId)
                    .map(s => <option key={s.id} value={s.id}>{s.fileName}</option>)}
                </select>
              </div>
            )}
            {period === 'custom' && (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">From</label>
                  <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
                    className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">To</label>
                  <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
                    className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Empty / no-data states */}
      {!hasData ? (
        <div className="text-center py-20 text-slate-400">
          <TrendingUp size={40} className="mx-auto mb-3 opacity-25" />
          <p className="text-sm font-medium text-slate-500">No transactions found.</p>
          <p className="text-xs mt-1">Upload a bank statement in Statement Manager to begin.</p>
        </div>
      ) : !hasIncome ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center">
          <TrendingUp size={32} className="mx-auto mb-3 opacity-25" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            No income transactions detected in the selected period.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Ratio calculations require at least one credit transaction. Try selecting "All Time" or upload income statements.
          </p>
        </div>
      ) : (
        <>
          {/* Main Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MetricCard
              id="income"
              label="Total Income"
              value={fmtINR(metrics.totalIncome)}
              colorClass="text-emerald-600 dark:text-emerald-400"
              icon={TrendingUp}
              subtitle={`Salary: ${fmtINR(metrics.salary)}`}
            />
            <MetricCard
              id="outflow"
              label="Total Outflow"
              value={fmtINR(metrics.totalOutflow)}
              colorClass="text-slate-700 dark:text-slate-200"
              icon={TrendingDown}
            />
            <MetricCard
              id="surplus"
              label="Net Surplus"
              value={fmtINR(Math.abs(metrics.netSurplus))}
              colorClass={metrics.netSurplus >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}
              icon={DollarSign}
              subtitle={metrics.netSurplus < 0 ? 'Deficit' : 'Surplus'}
            />
            <MetricCard
              id="savings"
              label="Savings Rate"
              value={fmtPct(metrics.savingsRate)}
              colorClass={metrics.savingsRate >= 20 ? 'text-emerald-600 dark:text-emerald-400' : metrics.savingsRate >= 10 ? 'text-amber-600' : 'text-red-600'}
              icon={Percent}
              subtitle="(Surplus ÷ Income) × 100"
            />
          </div>

          {/* Ratio Cards with ℹ formula icons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <RatioCard id="commitment"    label="Commitment Ratio"    value={metrics.commitmentRatio}    good={40} bad={60} />
            <RatioCard id="discretionary" label="Discretionary Ratio" value={metrics.discretionaryRatio} good={20} bad={35} />
            <RatioCard id="debt"          label="Debt Servicing Ratio" value={metrics.debtServicingRatio} good={20} bad={40} />
          </div>

          {/* Drill-down panel */}
          {drillDown && drillTxns.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-blue-50 dark:bg-blue-900/20">
                <p className="text-sm font-bold text-blue-700 dark:text-blue-300">
                  {drillTxns.length} transactions · {fmtINR(drillTxns.reduce((a, t) => a + t.amount, 0))}
                </p>
                <button onClick={() => setDrillDown(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <ChevronUp size={16} />
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800">
                    <tr className="text-slate-400 uppercase text-[10px] tracking-wide">
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">Description</th>
                      <th className="px-4 py-2 text-left">Category</th>
                      <th className="px-4 py-2 text-right">Amount</th>
                      <th className="px-4 py-2 text-left">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drillTxns.slice(0, 100).map(t => (
                      <tr key={t.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <td className="px-4 py-2 text-slate-500">{t.date}</td>
                        <td className="px-4 py-2 text-slate-700 dark:text-slate-200 max-w-[200px] truncate">{t.description}</td>
                        <td className="px-4 py-2 text-slate-500">{t.category}</td>
                        <td className="px-4 py-2 text-right font-mono font-semibold">{fmtINR(t.amount)}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.type === 'credit' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800'}`}>
                            {t.type}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {drillTxns.length > 100 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-2 text-center text-xs text-slate-400">
                          Showing 100 of {drillTxns.length}. Use Transaction Explorer for full view.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {drillDown && drillTxns.length === 0 && (
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-300 dark:border-slate-600 rounded-xl p-6 text-center">
              <p className="text-sm text-slate-400">
                No transactions match this category in the selected period.
              </p>
            </div>
          )}

          {/* Savings Rate formula (always visible) */}
          <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-300 dark:border-slate-600 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Info size={13} className="text-slate-400" />
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Savings Rate Formula</p>
            </div>
            <p className="text-xs font-mono text-blue-600 dark:text-blue-400">
              Savings Rate = (Net Surplus ÷ Total Income) × 100
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Net Surplus = Total Income − Total Outflow · Click ℹ on any ratio for its formula
            </p>
          </div>
        </>
      )}

      {/* Last updated footer */}
      {hasData && (
        <div className="text-xs text-slate-400 dark:text-slate-600 border-t border-slate-100 dark:border-slate-800 pt-3 space-y-0.5">
          {coverage && (
            <p>Computed from statements covering: <span className="font-medium">{coverage.from} → {coverage.to}</span></p>
          )}
          <p>Last updated: {new Date(lastUpdated).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
        </div>
      )}
    </div>
    </div>
  );
}
