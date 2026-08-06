'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { TrendingDown, Info, SlidersHorizontal } from 'lucide-react';
import {
  getAccounts, getStatements, getPFTransactions, filterByPeriod, computeFinancialMetrics,
  getAvailableMonths, getStatementCoverageRange, getLastUpdatedTimestamp,
  type PFAccount, type PFStatement, type PFTransaction,
  fmtINR, fmtPct, PERIOD_OPTIONS, DEBT_CATEGORIES,
} from './finance-store';

// ═══════════════════════════════════════════════════════════════════════════════
// LIABILITY LEDGER
// Identifiable liabilities derived from transaction patterns.
// Loan/EMI groupings, credit card servicing, EMI burden ratio.
// Purely numeric — no qualitative assessment or advice.
// ═══════════════════════════════════════════════════════════════════════════════

interface LiabilityGroup {
  merchant: string;
  transactions: PFTransaction[];
  totalPaid: number;
  avgPayment: number;
  count: number;
  firstDate: string;
  lastDate: string;
  isRecurring: boolean;
  monthlyEquiv: number;
}

function groupLiabilities(txns: PFTransaction[]): LiabilityGroup[] {
  const emiTxns = txns.filter(t =>
    t.type === 'debit' && DEBT_CATEGORIES.includes(t.category)
  );

  // Group by normalized merchant (first 3 words)
  const map: Record<string, PFTransaction[]> = {};
  for (const t of emiTxns) {
    const key = t.description.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(' ').slice(0, 3).join(' ');
    if (!map[key]) map[key] = [];
    map[key].push(t);
  }

  return Object.entries(map)
    .map(([, txnList]) => {
      const sorted = [...txnList].sort((a, b) => a.date.localeCompare(b.date));
      const total  = sorted.reduce((a, t) => a + t.amount, 0);
      const avg    = total / sorted.length;

      // Rough monthly equivalent
      let monthlyEquiv = avg;
      if (sorted.length >= 2) {
        const d1 = new Date(sorted[0].date + 'T12:00:00');
        const d2 = new Date(sorted[sorted.length - 1].date + 'T12:00:00');
        const spanMonths = (d2.getTime() - d1.getTime()) / (30 * 86400000);
        if (spanMonths > 0) monthlyEquiv = total / spanMonths;
      }

      return {
        merchant: sorted[0].description,
        transactions: sorted,
        totalPaid: total,
        avgPayment: avg,
        count: sorted.length,
        firstDate: sorted[0].date,
        lastDate: sorted[sorted.length - 1].date,
        isRecurring: sorted.some(t => t.recurringFlag),
        monthlyEquiv,
      };
    })
    .sort((a, b) => b.totalPaid - a.totalPaid);
}

export function LiabilityLedger() {
  const [mounted, setMounted]   = useState(false);
  const [accounts, setAccounts] = useState<PFAccount[]>([]);
  const [statements, setStatements] = useState<PFStatement[]>([]);
  const [allTxns, setAllTxns]   = useState<PFTransaction[]>([]);
  const [period, setPeriod]     = useState('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo]   = useState('');
  const [accountId, setAccountId] = useState('all');
  const [statementId, setStatementId] = useState('all');
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
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
    let txns = accountId !== 'all' ? allTxns.filter(t => t.accountId === accountId) : allTxns;
    if (statementId !== 'all') txns = txns.filter(t => t.statementId === statementId);
    return filterByPeriod(txns, period, customFrom, customTo);
  }, [allTxns, accountId, statementId, period, customFrom, customTo]);

  const metrics  = useMemo(() => computeFinancialMetrics(filtered), [filtered]);
  const groups   = useMemo(() => groupLiabilities(filtered), [filtered]);
  const availableMonths = useMemo(() => getAvailableMonths(), [allTxns]);

  // Credit card servicing estimate — credit card debits
  const ccAccounts = accounts.filter(a => a.type === 'credit_card');
  const ccTxns     = filtered.filter(t =>
    t.type === 'debit' && ccAccounts.some(a => a.id === t.accountId)
  );
  const ccTotal    = ccTxns.reduce((a, t) => a + t.amount, 0);

  const totalMonthlyEMI   = groups.reduce((a, g) => a + g.monthlyEquiv, 0);
  const totalEMIPaid      = groups.reduce((a, g) => a + g.totalPaid, 0);
  const emiBurdenRatio    = metrics.totalIncome > 0
    ? (metrics.debtServicing / metrics.totalIncome) * 100
    : 0;

  if (!mounted) return null;
  const hasData = allTxns.length > 0;
  const coverage    = getStatementCoverageRange();
  const lastUpdated = getLastUpdatedTimestamp();

  return (
    <div className="space-y-0">
      {/* ── SAP Filter Bar ─────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={13} className="text-slate-400" />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Filters</p>
          </div>
          <button
            onClick={() => setShowFilterBar(v => !v)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
          >
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

      {/* ── Smart Table Card ────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 overflow-hidden">
        {/* Smart Table Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Liability Ledger</h2>
            {hasData && (
              <>
                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold px-2 py-0.5 rounded-full">
                  {groups.length} EMI Groups
                </span>
                <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 font-semibold px-2 py-0.5 rounded-full">
                  Est. {fmtINR(totalMonthlyEMI)}/mo
                </span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  emiBurdenRatio <= 20
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : emiBurdenRatio <= 40
                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                }`}>
                  Burden {fmtPct(emiBurdenRatio)}
                </span>
              </>
            )}
          </div>
        </div>

        {!hasData ? (
          <div className="text-center py-20 text-slate-400">
            <TrendingDown size={40} className="mx-auto mb-3 opacity-25" />
            <p className="text-sm font-medium text-slate-500">No transactions found.</p>
            <p className="text-xs mt-1">Upload a bank statement and categorize transactions as "Loan/EMI" to see the liability ledger.</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 border-b border-slate-100 dark:border-slate-800">
              {[
                { label: 'EMI Burden Ratio', value: fmtPct(emiBurdenRatio), sub: 'EMI / Income × 100', color: emiBurdenRatio <= 20 ? 'text-[#107E3E]' : emiBurdenRatio <= 40 ? 'text-[#E76500]' : 'text-[#BB0000]' },
                { label: 'Monthly EMI Est.',  value: fmtINR(totalMonthlyEMI), sub: 'Across all groups', color: 'text-[#E76500]' },
                { label: 'Total EMI Paid',    value: fmtINR(totalEMIPaid),   sub: 'In selected period', color: 'text-slate-800 dark:text-slate-100' },
                { label: 'CC Spend',          value: fmtINR(ccTotal),        sub: 'Credit card accounts', color: 'text-[#6A1B9A]' },
              ].map(s => (
                <div key={s.label} className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl p-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{s.label}</p>
                  <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>

            {/* EMI Groups Table */}
            {groups.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-slate-400">
                  No "Loan/EMI" transactions found in the selected period.
                  Use Transaction Explorer to reclassify transactions into the Loan/EMI category.
                </p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 text-[10px] uppercase tracking-wide">
                    <th className="px-4 py-3 text-left font-semibold">Lender / Merchant</th>
                    <th className="px-4 py-3 text-right font-semibold">Payments</th>
                    <th className="px-4 py-3 text-right font-semibold">Avg Payment</th>
                    <th className="px-4 py-3 text-right font-semibold">Est. Monthly</th>
                    <th className="px-4 py-3 text-right font-semibold">Total Paid</th>
                    <th className="px-4 py-3 text-left font-semibold">Period</th>
                    <th className="px-4 py-3 text-left font-semibold">Pattern</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((g, i) => (
                    <React.Fragment key={g.merchant + i}>
                      <tr
                        className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                        onClick={() => setExpandedKey(expandedKey === g.merchant + i ? null : g.merchant + i)}
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-800 dark:text-slate-100 max-w-[180px] truncate" title={g.merchant}>
                            {g.merchant}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">{g.count}</td>
                        <td className="px-4 py-3 text-right font-mono text-slate-700 dark:text-slate-200">{fmtINR(g.avgPayment)}</td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-[#E76500]">{fmtINR(g.monthlyEquiv)}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-800 dark:text-slate-100">{fmtINR(g.totalPaid)}</td>
                        <td className="px-4 py-3 text-xs text-slate-400">{g.firstDate} → {g.lastDate}</td>
                        <td className="px-4 py-3">
                          {g.isRecurring ? (
                            <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded font-semibold">Recurring</span>
                          ) : (
                            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded font-semibold">Irregular</span>
                          )}
                        </td>
                      </tr>
                      {expandedKey === g.merchant + i && (
                        <tr key={`${g.merchant}${i}-expand`} className="bg-slate-50 dark:bg-slate-800/30">
                          <td colSpan={7} className="px-4 py-2">
                            <div className="max-h-40 overflow-y-auto">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="text-slate-400 uppercase text-[9px]">
                                    <th className="text-left py-1">Date</th>
                                    <th className="text-left py-1">Description</th>
                                    <th className="text-right py-1">Amount</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {g.transactions.map(t => (
                                    <tr key={t.id} className="border-t border-slate-200 dark:border-slate-700">
                                      <td className="py-1 text-slate-500">{t.date}</td>
                                      <td className="py-1 text-slate-600 dark:text-slate-300 max-w-[240px] truncate">{t.description}</td>
                                      <td className="py-1 text-right font-mono font-semibold text-slate-700 dark:text-slate-200">{fmtINR(t.amount)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 dark:bg-slate-800 border-t-2 border-slate-200 dark:border-slate-700">
                    <td colSpan={3} className="px-4 py-3 text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-wide">Total</td>
                    <td className="px-4 py-3 text-right font-mono font-black text-[#E76500]">{fmtINR(totalMonthlyEMI)}</td>
                    <td className="px-4 py-3 text-right font-mono font-black text-slate-800 dark:text-slate-100">{fmtINR(totalEMIPaid)}</td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            )}
          </>
        )}

        {/* Footer */}
        {hasData && (
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Info size={12} className="mt-0.5 shrink-0" />
              <span>Liability groupings based on "Loan/EMI" category. Monthly equivalent estimated from payment frequency. To reclassify, use Transaction Explorer.</span>
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-600 space-y-0.5">
              {coverage && (
                <p>Statements covering: <span className="font-medium">{coverage.from} → {coverage.to}</span></p>
              )}
              <p>Last updated: {new Date(lastUpdated).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
