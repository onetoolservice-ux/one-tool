"use client";
import React, { useState, useMemo } from 'react';
import { PieChart as PieChartIcon, Plus, Trash2, ArrowUpRight, ArrowDownLeft, Minus, AlertTriangle } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';

const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
const fmtCr = (n: number) => {
  if (Math.abs(n) >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (Math.abs(n) >= 1e5) return `₹${(n / 1e5).toFixed(1)} L`;
  return fmt(n);
};

const inputCls = 'text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-teal-400 transition-colors w-full';
const labelCls = 'text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide';

interface Holding {
  id: string;
  name: string;
  value: number;
  targetPct: number;
  color: string;
}

const PALETTE = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9', '#f97316', '#14b8a6'];

const DEFAULT_HOLDINGS: Holding[] = [
  { id: '1', name: 'Equity (MF/Stocks)', value: 500000, targetPct: 60, color: PALETTE[0] },
  { id: '2', name: 'Debt (FD/Bonds)', value: 200000, targetPct: 25, color: PALETTE[1] },
  { id: '3', name: 'Gold', value: 80000, targetPct: 10, color: PALETTE[2] },
  { id: '4', name: 'Cash/Liquid', value: 50000, targetPct: 5, color: PALETTE[3] },
];

export const PortfolioRebalance = () => {
  const [holdings, setHoldings] = useState<Holding[]>(DEFAULT_HOLDINGS);
  const [threshold, setThreshold] = useState(5);

  const totalValue = holdings.reduce((s, h) => s + h.value, 0);
  const totalTarget = holdings.reduce((s, h) => s + h.targetPct, 0);

  const result = useMemo(() => {
    return holdings.map(h => {
      const currentPct = totalValue > 0 ? (h.value / totalValue) * 100 : 0;
      const targetValue = (h.targetPct / 100) * totalValue;
      const diff = targetValue - h.value;
      const drift = Math.abs(currentPct - h.targetPct);
      return { ...h, currentPct, targetValue, diff, drift, needsAction: drift >= threshold };
    });
  }, [holdings, totalValue, threshold]);

  const addHolding = () => {
    const idx = holdings.length;
    setHoldings(prev => [...prev, {
      id: Date.now().toString(),
      name: 'New Asset',
      value: 0,
      targetPct: 0,
      color: PALETTE[idx % PALETTE.length],
    }]);
  };

  const removeHolding = (id: string) => setHoldings(prev => prev.filter(h => h.id !== id));
  const updateHolding = (id: string, field: keyof Holding, value: string | number) =>
    setHoldings(prev => prev.map(h => h.id === id ? { ...h, [field]: value } : h));

  const buys = result.filter(r => r.diff > 0);
  const sells = result.filter(r => r.diff < 0);
  const balanced = result.filter(r => Math.abs(r.diff) < 100);

  const currentPieData = result.map(r => ({ name: r.name, value: r.value, color: r.color }));
  const targetPieData = result.map(r => ({ name: r.name, value: r.targetValue, color: r.color }));

  const needsRebalancing = result.some(r => r.needsAction);

  return (
    <div>
      <SAPHeader
        fullWidth
        title="Portfolio Rebalancer"
        subtitle="Track allocation drift and rebalance"
        kpis={[
          {
            label: 'Total Portfolio',
            value: fmtCr(totalValue),
            color: 'neutral',
            subtitle: `${holdings.length} assets`,
          },
          {
            label: 'Assets',
            value: String(holdings.length),
            color: 'neutral',
            subtitle: `Target total: ${totalTarget.toFixed(0)}%`,
          },
          {
            label: 'Rebalancing Needed',
            value: needsRebalancing ? `${result.filter(r => r.needsAction).length} asset${result.filter(r => r.needsAction).length !== 1 ? 's' : ''}` : 'None',
            color: needsRebalancing ? 'warning' : 'success',
            subtitle: needsRebalancing ? `Drift > ${threshold}%` : 'Portfolio balanced',
          },
          {
            label: 'Threshold',
            value: `${threshold}%`,
            color: 'neutral',
            subtitle: 'Drift to trigger action',
          },
        ]}
      />

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Holdings input */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Holdings</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold ${Math.abs(totalTarget - 100) < 0.5 ? 'text-emerald-500' : 'text-red-500'}`}>
                  Target total: {totalTarget.toFixed(0)}%
                </span>
              </div>
            </div>

            {holdings.map((h, i) => (
              <div key={h.id} className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ background: h.color }} />
                  <input className="flex-1 text-sm font-semibold bg-transparent border-none outline-none text-slate-800 dark:text-slate-200"
                    value={h.name} onChange={e => updateHolding(h.id, 'name', e.target.value)} />
                  <button onClick={() => removeHolding(h.id)} className="text-slate-400 hover:text-red-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={labelCls}>Current Value ₹</label>
                    <input type="number" className={inputCls} value={h.value} onChange={e => updateHolding(h.id, 'value', +e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Target %</label>
                    <input type="number" className={inputCls} value={h.targetPct} min={0} max={100} onChange={e => updateHolding(h.id, 'targetPct', +e.target.value)} />
                  </div>
                </div>
              </div>
            ))}

            <button onClick={addHolding}
              className="w-full py-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-500 hover:border-teal-400 hover:text-teal-500 transition-all flex items-center justify-center gap-2 text-sm font-semibold">
              <Plus className="w-4 h-4" /> Add Asset
            </button>

            <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
              <label className={labelCls}>Drift Threshold to act (%)</label>
              <input type="number" className={inputCls + ' mt-1'} value={threshold} min={1} max={20}
                onChange={e => setThreshold(+e.target.value)} />
              <p className="text-xs text-slate-400 mt-1">Only flag when drift exceeds this %</p>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 space-y-4">
            {/* Total */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <div className="text-xs text-slate-500 mb-1">Total Portfolio Value</div>
              <div className="text-3xl font-bold text-teal-600 dark:text-teal-400">{fmtCr(totalValue)}</div>
            </div>

            {/* Drift table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700 overflow-x-auto">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Current vs Target</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800">
                    <th className="text-left pb-2">Asset</th>
                    <th className="text-right pb-2">Current</th>
                    <th className="text-right pb-2">Target</th>
                    <th className="text-right pb-2">Drift</th>
                    <th className="text-right pb-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {result.map(r => (
                    <tr key={r.id}>
                      <td className="py-2 flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: r.color }} />
                        <span className="text-slate-700 dark:text-slate-300">{r.name}</span>
                      </td>
                      <td className="text-right text-slate-600 dark:text-slate-400">{r.currentPct.toFixed(1)}%</td>
                      <td className="text-right text-slate-600 dark:text-slate-400">{r.targetPct}%</td>
                      <td className={`text-right font-semibold ${r.drift >= threshold ? 'text-red-500' : 'text-slate-400'}`}>
                        {r.drift.toFixed(1)}%
                      </td>
                      <td className="text-right">
                        {Math.abs(r.diff) < 100 ? (
                          <span className="text-slate-400 text-xs flex items-center justify-end gap-1"><Minus className="w-3 h-3" /> OK</span>
                        ) : r.diff > 0 ? (
                          <span className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center justify-end gap-1">
                            <ArrowUpRight className="w-3 h-3" /> Buy {fmtCr(r.diff)}
                          </span>
                        ) : (
                          <span className="text-red-500 text-xs font-semibold flex items-center justify-end gap-1">
                            <ArrowDownLeft className="w-3 h-3" /> Sell {fmtCr(Math.abs(r.diff))}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pie charts */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="text-xs font-semibold text-slate-500 mb-2 text-center">Current Allocation</div>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie data={currentPieData} dataKey="value" cx="50%" cy="50%" outerRadius={55} strokeWidth={2}>
                      {currentPieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => fmtCr(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="text-xs font-semibold text-slate-500 mb-2 text-center">Target Allocation</div>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie data={targetPieData} dataKey="value" cx="50%" cy="50%" outerRadius={55} strokeWidth={2}>
                      {targetPieData.map((d, i) => <Cell key={i} fill={d.color} opacity={0.7} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => fmtCr(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Summary */}
            {result.some(r => r.needsAction) ? (
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-700 dark:text-amber-300 font-semibold mb-2">Rebalancing needed (drift &gt; {threshold}%)</p>
                {buys.filter(r => r.needsAction).map(r => (
                  <p key={r.id} className="text-xs text-emerald-600 dark:text-emerald-400">↑ Buy {fmtCr(r.diff)} of {r.name}</p>
                ))}
                {sells.filter(r => r.needsAction).map(r => (
                  <p key={r.id} className="text-xs text-red-500">↓ Sell {fmtCr(Math.abs(r.diff))} of {r.name}</p>
                ))}
              </div>
            ) : (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
                <p className="text-sm text-emerald-700 dark:text-emerald-400 font-semibold">Portfolio is well balanced. No action needed.</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Disclaimer:</span> For informational and planning purposes only. Asset allocation decisions should account for your risk profile, investment horizon, tax implications, and financial goals. Buy/sell suggestions are indicative rebalancing actions, not trade recommendations. Consult a SEBI-registered investment advisor for personalised portfolio management.
          </p>
        </div>
      </div>
    </div>
  );
};
