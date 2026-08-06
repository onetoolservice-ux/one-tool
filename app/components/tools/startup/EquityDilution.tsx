'use client';

import { useState, useMemo } from 'react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Users, Plus, Trash2, AlertTriangle, TrendingDown, DollarSign, Percent } from 'lucide-react';

// ─── Styles ──────────────────────────────────────────────────────────────────
const inputCls =
  'text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-400 transition-colors w-full';
const labelCls =
  'text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

// ─── Types ────────────────────────────────────────────────────────────────────
type HolderType = 'Founder' | 'Investor' | 'ESOP' | 'Other';

interface Shareholder {
  id: string;
  name: string;
  shares: number;
  type: HolderType;
}

interface FundingRound {
  id: string;
  name: string;
  investment: number;
  preMoney: number;
  investorName: string;
}

const TYPE_COLORS: Record<HolderType, string> = {
  Founder: '#6366f1',
  Investor: '#8b5cf6',
  ESOP: '#a78bfa',
  Other: '#c4b5fd',
};

const ROUND_COLORS = ['#4f46e5', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95'];

const DEFAULT_SHAREHOLDERS: Shareholder[] = [
  { id: '1', name: 'Founder A', shares: 4000000, type: 'Founder' },
  { id: '2', name: 'Founder B', shares: 4000000, type: 'Founder' },
  { id: '3', name: 'ESOP Pool', shares: 2000000, type: 'ESOP' },
];

function CustomPieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="font-bold text-slate-700 dark:text-slate-200">{d.name}</p>
      <p style={{ color: d.payload.fill }} className="font-semibold">
        {d.value.toLocaleString('en-IN')} shares ({((d.value / d.payload.total) * 100).toFixed(2)}%)
      </p>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export function EquityDilution() {
  const [shareholders, setShareholders] = useState<Shareholder[]>(DEFAULT_SHAREHOLDERS);
  const [rounds, setRounds] = useState<FundingRound[]>([]);
  const [showRoundForm, setShowRoundForm] = useState(false);

  // New round form state
  const [newRound, setNewRound] = useState<Omit<FundingRound, 'id'>>({
    name: 'Seed',
    investment: 20000000,
    preMoney: 80000000,
    investorName: 'Angel Investor',
  });

  // ─── Derived ────────────────────────────────────────────────────────────────
  const calc = useMemo(() => {
    const totalShares = shareholders.reduce((s, h) => s + h.shares, 0);
    const founderShares = shareholders
      .filter((h) => h.type === 'Founder')
      .reduce((s, h) => s + h.shares, 0);
    const founderPct = totalShares > 0 ? (founderShares / totalShares) * 100 : 0;

    // Latest round valuation
    const investorHolders = shareholders.filter((h) => h.type === 'Investor');
    let latestRoundLabel = '—';
    let companyValuation = 0;

    if (rounds.length > 0) {
      const last = rounds[rounds.length - 1];
      latestRoundLabel = last.name;
      const pricePerShare = last.preMoney / (totalShares - (shareholders.find((h) => h.name === last.investorName)?.shares ?? 0));
      companyValuation = last.preMoney + last.investment;
    }

    const pieData = shareholders.map((h) => ({
      name: h.name,
      value: h.shares,
      fill: TYPE_COLORS[h.type],
      total: totalShares,
    }));

    return { totalShares, founderPct, pieData, latestRoundLabel, companyValuation };
  }, [shareholders, rounds]);

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const addShareholder = () =>
    setShareholders((prev) => [
      ...prev,
      { id: Date.now().toString(), name: 'New Holder', shares: 100000, type: 'Other' },
    ]);

  const removeShareholder = (id: string) =>
    setShareholders((prev) => prev.filter((h) => h.id !== id));

  const updateShareholder = (
    id: string,
    field: keyof Omit<Shareholder, 'id'>,
    value: string | number
  ) =>
    setShareholders((prev) =>
      prev.map((h) => (h.id === id ? { ...h, [field]: value } : h))
    );

  const applyRound = () => {
    const totalBefore = shareholders.reduce((s, h) => s + h.shares, 0);
    const pricePerShare = newRound.preMoney / totalBefore;
    const newShares = Math.round(newRound.investment / pricePerShare);
    const roundId = Date.now().toString();

    setRounds((prev) => [...prev, { ...newRound, id: roundId }]);
    setShareholders((prev) => [
      ...prev,
      {
        id: roundId,
        name: newRound.investorName,
        shares: newShares,
        type: 'Investor',
      },
    ]);
    setShowRoundForm(false);
    setNewRound({ name: 'Series A', investment: 50000000, preMoney: 200000000, investorName: 'VC Fund' });
  };

  // Dilution impact per round
  const dilutionHistory = useMemo(() => {
    const history: { round: string; founderBefore: number; founderAfter: number }[] = [];
    let runningHolders = DEFAULT_SHAREHOLDERS.map((h) => ({ ...h }));

    for (const round of rounds) {
      const totalBefore = runningHolders.reduce((s, h) => s + h.shares, 0);
      const founderBefore =
        (runningHolders.filter((h) => h.type === 'Founder').reduce((s, h) => s + h.shares, 0) /
          totalBefore) *
        100;

      const pricePerShare = round.preMoney / totalBefore;
      const newShares = Math.round(round.investment / pricePerShare);

      runningHolders = [
        ...runningHolders,
        { id: round.id, name: round.investorName, shares: newShares, type: 'Investor' },
      ];

      const totalAfter = runningHolders.reduce((s, h) => s + h.shares, 0);
      const founderAfter =
        (runningHolders.filter((h) => h.type === 'Founder').reduce((s, h) => s + h.shares, 0) /
          totalAfter) *
        100;

      history.push({ round: round.name, founderBefore, founderAfter });
    }
    return history;
  }, [rounds]);

  const typeOptions: HolderType[] = ['Founder', 'Investor', 'ESOP', 'Other'];

  return (
    <div>
      <SAPHeader
        fullWidth
        title="Equity Dilution Simulator"
        subtitle="Model your cap table across funding rounds"
        kpis={[
          {
            label: 'Total Shares',
            value: calc.totalShares.toLocaleString('en-IN'),
            icon: Users,
            color: 'primary',
          },
          {
            label: 'Company Valuation',
            value: calc.companyValuation > 0 ? fmt(calc.companyValuation) : '—',
            icon: DollarSign,
            color: 'success',
          },
          {
            label: 'Founder Total %',
            value: `${calc.founderPct.toFixed(1)}%`,
            icon: Percent,
            color: calc.founderPct > 50 ? 'success' : calc.founderPct > 30 ? 'warning' : 'error',
          },
          {
            label: 'Latest Round',
            value: calc.latestRoundLabel,
            icon: TrendingDown,
            color: 'neutral',
          },
        ]}
      />

      <div className="p-4 space-y-4">
        {/* Cap Table */}
        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Cap Table</p>
            <button
              onClick={addShareholder}
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
            >
              <Plus size={13} /> Add Shareholder
            </button>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-12 gap-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wide px-1">
            <div className="col-span-4">Shareholder</div>
            <div className="col-span-3 text-right">Shares</div>
            <div className="col-span-2 text-right">Ownership</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-1" />
          </div>

          <div className="space-y-1.5">
            {shareholders.map((holder) => {
              const pct =
                calc.totalShares > 0 ? (holder.shares / calc.totalShares) * 100 : 0;
              return (
                <div
                  key={holder.id}
                  className="grid grid-cols-12 gap-2 items-center bg-slate-50 dark:bg-slate-900/40 rounded-lg px-2 py-1.5"
                >
                  <div className="col-span-4 flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: TYPE_COLORS[holder.type] }}
                    />
                    <input
                      type="text"
                      className="text-sm bg-transparent border-none outline-none text-slate-700 dark:text-slate-200 w-full font-medium"
                      value={holder.name}
                      onChange={(e) => updateShareholder(holder.id, 'name', e.target.value)}
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      className="text-sm bg-transparent border-none outline-none text-slate-700 dark:text-slate-200 w-full text-right font-mono"
                      value={holder.shares}
                      onChange={(e) => updateShareholder(holder.id, 'shares', Number(e.target.value))}
                    />
                  </div>
                  <div className="col-span-2 text-right">
                    <span
                      className="text-xs font-bold px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: TYPE_COLORS[holder.type] + '22',
                        color: TYPE_COLORS[holder.type],
                      }}
                    >
                      {pct.toFixed(2)}%
                    </span>
                  </div>
                  <div className="col-span-2">
                    <select
                      className="text-xs bg-transparent border-none outline-none text-slate-500 dark:text-slate-400 w-full cursor-pointer"
                      value={holder.type}
                      onChange={(e) =>
                        updateShareholder(holder.id, 'type', e.target.value as HolderType)
                      }
                    >
                      {typeOptions.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button
                      onClick={() => removeShareholder(holder.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Funding Rounds + Pie */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Funding Rounds */}
          <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Funding Rounds</p>
              {!showRoundForm && (
                <button
                  onClick={() => setShowRoundForm(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
                >
                  <Plus size={13} /> Add Round
                </button>
              )}
            </div>

            {rounds.length === 0 && !showRoundForm && (
              <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-4">
                No rounds added yet. Click "Add Round" to simulate dilution.
              </p>
            )}

            {/* Existing rounds */}
            {dilutionHistory.map((h, i) => (
              <div
                key={i}
                className="rounded-lg p-3 border"
                style={{
                  borderColor: ROUND_COLORS[i % ROUND_COLORS.length] + '55',
                  backgroundColor: ROUND_COLORS[i % ROUND_COLORS.length] + '11',
                }}
              >
                <p className="text-xs font-bold mb-1" style={{ color: ROUND_COLORS[i % ROUND_COLORS.length] }}>
                  {h.round}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Founders: {h.founderBefore.toFixed(1)}% → {h.founderAfter.toFixed(1)}%
                  <span className="ml-1 text-red-500 font-semibold">
                    (-{(h.founderBefore - h.founderAfter).toFixed(1)}%)
                  </span>
                </p>
              </div>
            ))}

            {/* Add round form */}
            {showRoundForm && (
              <div className="border border-indigo-200 dark:border-indigo-700 rounded-xl p-3 space-y-2 bg-indigo-50 dark:bg-indigo-900/20">
                <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300">New Funding Round</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={labelCls}>Round Name</label>
                    <input
                      type="text"
                      className={inputCls}
                      value={newRound.name}
                      onChange={(e) => setNewRound((r) => ({ ...r, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Investor Name</label>
                    <input
                      type="text"
                      className={inputCls}
                      value={newRound.investorName}
                      onChange={(e) => setNewRound((r) => ({ ...r, investorName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Investment (INR)</label>
                    <input
                      type="number"
                      className={inputCls}
                      value={newRound.investment}
                      onChange={(e) => setNewRound((r) => ({ ...r, investment: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Pre-Money Valuation (INR)</label>
                    <input
                      type="number"
                      className={inputCls}
                      value={newRound.preMoney}
                      onChange={(e) => setNewRound((r) => ({ ...r, preMoney: Number(e.target.value) }))}
                    />
                  </div>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-lg p-2">
                  <span className="font-semibold">Post-money:</span> {fmt(newRound.preMoney + newRound.investment)}
                  {' | '}
                  <span className="font-semibold">Investor %:</span>{' '}
                  {((newRound.investment / (newRound.preMoney + newRound.investment)) * 100).toFixed(2)}%
                  {' | '}
                  <span className="font-semibold">Price/share:</span>{' '}
                  {fmt(newRound.preMoney / calc.totalShares)}
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={applyRound}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg py-2 transition-colors"
                  >
                    Apply Round
                  </button>
                  <button
                    onClick={() => setShowRoundForm(false)}
                    className="px-3 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Ownership Pie */}
          <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">Ownership Distribution</p>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={calc.pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {calc.pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend
                  formatter={(value) => (
                    <span className="text-xs text-slate-600 dark:text-slate-300">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex gap-3 items-start">
          <AlertTriangle size={15} className="text-slate-400 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            This simulator provides illustrative estimates only. Actual cap tables involve vesting schedules,
            liquidation preferences, anti-dilution clauses, and legal agreements. Consult a startup lawyer and
            CA before issuing equity. ESOP calculations may vary by jurisdiction and scheme design.
          </p>
        </div>
      </div>
    </div>
  );
}
