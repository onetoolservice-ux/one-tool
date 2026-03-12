"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, Plus, Trash2, AlertTriangle, Info, RefreshCw } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';

const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
const fmtL = (n: number) => {
  if (Math.abs(n) >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (Math.abs(n) >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
  return fmt(n);
};

const labelCls = 'text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide';
const inputCls = 'text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-400 transition-colors w-full';

type AssetClass = 'Equity' | 'Debt' | 'Gold' | 'Real Estate' | 'Cash' | 'Crypto' | 'Other';

interface Investment {
  id: string;
  name: string;
  type: AssetClass;
  investedAmount: number;
  currentValue: number;
  investedDate: string;
}

const ASSET_COLORS: Record<AssetClass, string> = {
  Equity: '#3b82f6',
  Debt: '#10b981',
  Gold: '#f59e0b',
  'Real Estate': '#8b5cf6',
  Cash: '#94a3b8',
  Crypto: '#f97316',
  Other: '#64748b',
};

const ASSET_CLASSES: AssetClass[] = ['Equity', 'Debt', 'Gold', 'Real Estate', 'Cash', 'Crypto', 'Other'];

const SAMPLE_INVESTMENTS: Investment[] = [
  { id: '1', name: 'Nifty 50 Index Fund', type: 'Equity', investedAmount: 200000, currentValue: 265000, investedDate: '2022-01-01' },
  { id: '2', name: 'PPF', type: 'Debt', investedAmount: 150000, currentValue: 162000, investedDate: '2022-04-01' },
  { id: '3', name: 'Gold ETF', type: 'Gold', investedAmount: 50000, currentValue: 68000, investedDate: '2021-10-01' },
  { id: '4', name: 'Emergency Fund FD', type: 'Cash', investedAmount: 100000, currentValue: 107500, investedDate: '2023-01-01' },
];

function calcXIRR(invested: number, current: number, daysHeld: number): number {
  if (invested <= 0 || daysHeld <= 0) return 0;
  const years = daysHeld / 365;
  return (Math.pow(current / invested, 1 / years) - 1) * 100;
}

const STORAGE_KEY = 'otsd-investment-tracker';

function load(): Investment[] {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : SAMPLE_INVESTMENTS;
  } catch { return SAMPLE_INVESTMENTS; }
}
function save(data: Investment[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export const PFInvestmentTracker = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<Omit<Investment, 'id'>>({
    name: '', type: 'Equity', investedAmount: 0, currentValue: 0, investedDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => { setInvestments(load()); }, []);
  useEffect(() => { if (investments.length) save(investments); }, [investments]);

  const addInvestment = () => {
    if (!form.name || form.investedAmount <= 0) return;
    const newInv: Investment = { ...form, id: Date.now().toString() };
    setInvestments(prev => [...prev, newInv]);
    setForm({ name: '', type: 'Equity', investedAmount: 0, currentValue: 0, investedDate: new Date().toISOString().split('T')[0] });
    setShowAdd(false);
  };

  const removeInvestment = (id: string) => {
    setInvestments(prev => prev.filter(i => i.id !== id));
  };

  const stats = useMemo(() => {
    const totalInvested = investments.reduce((s, i) => s + i.investedAmount, 0);
    const totalCurrent = investments.reduce((s, i) => s + i.currentValue, 0);
    const totalGain = totalCurrent - totalInvested;
    const gainPct = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

    // Asset allocation
    const byAsset: Record<string, { invested: number; current: number }> = {};
    for (const inv of investments) {
      if (!byAsset[inv.type]) byAsset[inv.type] = { invested: 0, current: 0 };
      byAsset[inv.type].invested += inv.investedAmount;
      byAsset[inv.type].current += inv.currentValue;
    }

    const pieData = Object.entries(byAsset).map(([type, v]) => ({
      name: type,
      value: v.current,
      color: ASSET_COLORS[type as AssetClass] ?? '#94a3b8',
    }));

    return { totalInvested, totalCurrent, totalGain, gainPct, byAsset, pieData };
  }, [investments]);

  // XIRR per investment
  const withXIRR = useMemo(() => investments.map(inv => {
    const days = Math.max(1, Math.round((Date.now() - new Date(inv.investedDate).getTime()) / 86400000));
    const xirr = calcXIRR(inv.investedAmount, inv.currentValue, days);
    const gain = inv.currentValue - inv.investedAmount;
    const gainPct = inv.investedAmount > 0 ? (gain / inv.investedAmount) * 100 : 0;
    return { ...inv, xirr, gain, gainPct, days };
  }), [investments]);

  return (
    <div>
      <SAPHeader
        fullWidth
        title="Investment Tracker"
        subtitle="Portfolio overview · Asset allocation · XIRR"
        kpis={[
          { label: 'Total Invested', value: fmtL(stats.totalInvested), color: 'neutral', subtitle: `${investments.length} holdings` },
          { label: 'Current Value', value: fmtL(stats.totalCurrent), color: 'primary', subtitle: 'Mark-to-market' },
          { label: 'Total Gain/Loss', value: fmtL(stats.totalGain), color: stats.totalGain >= 0 ? 'success' : 'error', subtitle: `${stats.gainPct >= 0 ? '+' : ''}${stats.gainPct.toFixed(1)}%` },
          { label: 'Portfolio XIRR', value: `${investments.length > 0 ? withXIRR.reduce((s, i) => s + i.xirr * i.investedAmount, 0) / (stats.totalInvested || 1) : 0 | 0}%`, color: 'warning', subtitle: 'Annualised return' },
        ]}
      />

      <div className="p-4 space-y-4">
        {/* Add Button */}
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Holdings</h2>
          <button onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 transition-colors">
            <Plus className="w-4 h-4" /> Add Investment
          </button>
        </div>

        {/* Add Form */}
        {showAdd && (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-emerald-200 dark:border-emerald-800 space-y-3">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">New Investment</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <label className={labelCls}>Investment Name</label>
                <input type="text" placeholder="e.g. Axis Bluechip Fund, SBI FD" className={inputCls}
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <label className={labelCls}>Asset Class</label>
                <select className={inputCls} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as AssetClass }))}>
                  {ASSET_CLASSES.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className={labelCls}>Investment Date</label>
                <input type="date" className={inputCls} value={form.investedDate}
                  onChange={e => setForm(f => ({ ...f, investedDate: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <label className={labelCls}>Amount Invested (₹)</label>
                <input type="number" className={inputCls} value={form.investedAmount || ''}
                  onChange={e => setForm(f => ({ ...f, investedAmount: +e.target.value }))} />
              </div>
              <div className="space-y-1">
                <label className={labelCls}>Current Value (₹)</label>
                <input type="number" className={inputCls} value={form.currentValue || ''}
                  onChange={e => setForm(f => ({ ...f, currentValue: +e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={addInvestment}
                className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 transition-colors">
                Add to Portfolio
              </button>
              <button onClick={() => setShowAdd(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Holdings Table */}
          <div className="lg:col-span-2 space-y-3">
            {withXIRR.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-700 text-center">
                <TrendingUp className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No investments added yet. Click "Add Investment" to get started.</p>
              </div>
            ) : withXIRR.map(inv => (
              <div key={inv.id} className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{inv.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold text-white shrink-0"
                        style={{ backgroundColor: ASSET_COLORS[inv.type] }}>{inv.type}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      <div>
                        <div className="text-[10px] text-slate-400">Invested</div>
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{fmtL(inv.investedAmount)}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">Current</div>
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{fmtL(inv.currentValue)}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">Gain / Loss</div>
                        <div className={`text-sm font-semibold ${inv.gain >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                          {inv.gain >= 0 ? '+' : ''}{fmtL(inv.gain)} ({inv.gainPct >= 0 ? '+' : ''}{inv.gainPct.toFixed(1)}%)
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">XIRR</div>
                        <div className={`text-sm font-semibold ${inv.xirr >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-500'}`}>
                          {inv.xirr >= 0 ? '+' : ''}{inv.xirr.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => removeInvestment(inv.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 transition-colors ml-2 shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Charts */}
          <div className="space-y-4">
            {/* Pie Chart */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Asset Allocation</h3>
              {stats.pieData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={stats.pieData} dataKey="value" cx="50%" cy="50%" outerRadius={65} innerRadius={35}>
                        {stats.pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => [fmtL(v)]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5 mt-2">
                    {stats.pieData.map(entry => (
                      <div key={entry.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                          <span className="text-slate-600 dark:text-slate-400">{entry.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium text-slate-700 dark:text-slate-300">{stats.totalCurrent > 0 ? ((entry.value / stats.totalCurrent) * 100).toFixed(0) : 0}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-40 flex items-center justify-center text-slate-400 text-sm">Add investments to see allocation</div>
              )}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-200 dark:border-blue-800 flex gap-2">
              <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-600 dark:text-blue-400">
                XIRR is the annualised return rate based on investment date. Update current values periodically for accurate tracking.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
