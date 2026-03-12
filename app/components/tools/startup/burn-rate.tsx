'use client';

import { useState, useMemo } from 'react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';
import {
  AreaChart, Area, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts';
import { Flame, Plus, Trash2, AlertTriangle, TrendingDown, Calendar, Target } from 'lucide-react';

// ─── Styles ──────────────────────────────────────────────────────────────────
const inputCls =
  'text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-orange-400 transition-colors w-full';
const labelCls =
  'text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

// ─── Types ────────────────────────────────────────────────────────────────────
interface BurnCategory {
  id: string;
  name: string;
  amount: number;
}

const DEFAULT_CATEGORIES: BurnCategory[] = [
  { id: '1', name: 'Salaries', amount: 1500000 },
  { id: '2', name: 'Rent / Office', amount: 150000 },
  { id: '3', name: 'Cloud / Infrastructure', amount: 200000 },
  { id: '4', name: 'Marketing', amount: 300000 },
  { id: '5', name: 'Other', amount: 100000 },
];

const BURN_COLORS = ['#ef4444', '#f97316', '#eab308', '#f43f5e', '#dc2626'];

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function CashTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="font-bold text-slate-700 dark:text-slate-200 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
          {p.name}: {fmt(p.value)}
        </p>
      ))}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export function BurnRate() {
  const [cash, setCash] = useState(5000000);
  const [categories, setCategories] = useState<BurnCategory[]>(DEFAULT_CATEGORIES);
  const [revenue, setRevenue] = useState(500000);
  const [revenueGrowth, setRevenueGrowth] = useState(10);
  const [fundingTarget, setFundingTarget] = useState(20000000);
  const [fundraisingRunway, setFundraisingRunway] = useState(6);

  // Add / remove category
  const addCategory = () =>
    setCategories((prev) => [
      ...prev,
      { id: Date.now().toString(), name: 'New Category', amount: 0 },
    ]);

  const removeCategory = (id: string) =>
    setCategories((prev) => prev.filter((c) => c.id !== id));

  const updateCategory = (id: string, field: 'name' | 'amount', value: string | number) =>
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );

  // ─── Derived calculations ───────────────────────────────────────────────────
  const calc = useMemo(() => {
    const grossBurn = categories.reduce((s, c) => s + c.amount, 0);
    const netBurn = Math.max(0, grossBurn - revenue);
    const runway = netBurn > 0 ? cash / netBurn : Infinity;

    // Month-by-month projection (24 months)
    const projection: { month: string; cash: number; revenue: number; burn: number }[] = [];
    let currentCash = cash;
    let currentRevenue = revenue;
    const today = new Date(2026, 2, 1); // March 2026
    let breakEvenMonth: string | null = null;

    for (let i = 0; i < 24; i++) {
      const d = new Date(today);
      d.setMonth(d.getMonth() + i);
      const label = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      const monthNetBurn = Math.max(0, grossBurn - currentRevenue);

      if (currentRevenue >= grossBurn && breakEvenMonth === null) {
        breakEvenMonth = label;
      }

      currentCash = Math.max(0, currentCash - monthNetBurn);
      projection.push({
        month: label,
        cash: Math.round(currentCash),
        revenue: Math.round(currentRevenue),
        burn: Math.round(grossBurn),
      });

      currentRevenue = currentRevenue * (1 + revenueGrowth / 100);
      if (currentCash === 0) break;
    }

    // Fundraise-by date = (runway - fundraisingRunway) months from today
    let fundraiseByDate: string | null = null;
    if (isFinite(runway)) {
      const raiseBy = new Date(today);
      raiseBy.setMonth(raiseBy.getMonth() + Math.max(0, Math.floor(runway) - fundraisingRunway));
      fundraiseByDate = raiseBy.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    }

    return { grossBurn, netBurn, runway, projection, breakEvenMonth, fundraiseByDate };
  }, [cash, categories, revenue, revenueGrowth, fundraisingRunway]);

  const runwayDisplay =
    !isFinite(calc.runway) ? 'Profitable' : `${calc.runway.toFixed(1)} mo`;

  const runwayColor =
    !isFinite(calc.runway)
      ? 'success'
      : calc.runway < 6
      ? 'error'
      : calc.runway < 12
      ? 'warning'
      : 'success';

  return (
    <div>
      <SAPHeader
        fullWidth
        title="Burn Rate & Runway"
        subtitle="How long can your startup survive?"
        kpis={[
          {
            label: 'Net Burn / Month',
            value: fmt(calc.netBurn),
            icon: Flame,
            color: calc.netBurn > 0 ? 'error' : 'success',
          },
          {
            label: 'Runway',
            value: runwayDisplay,
            icon: Calendar,
            color: runwayColor,
          },
          {
            label: 'Raise By',
            value: calc.fundraiseByDate ?? 'N/A',
            icon: Target,
            color: 'warning',
          },
          {
            label: 'Break-even',
            value: calc.breakEvenMonth ?? '—',
            icon: TrendingDown,
            color: calc.breakEvenMonth ? 'success' : 'neutral',
          },
        ]}
      />

      <div className="p-4 space-y-4">
        {/* Critical Alerts */}
        {isFinite(calc.runway) && calc.runway < 6 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-xl p-4 flex gap-3 items-start">
            <AlertTriangle size={18} className="text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-red-700 dark:text-red-400 text-sm">Critical: Less than 6 months of runway</p>
              <p className="text-red-600 dark:text-red-300 text-xs mt-0.5">
                Immediate action required. Cut burn or close a bridge round now.
              </p>
            </div>
          </div>
        )}
        {isFinite(calc.runway) && calc.runway >= 6 && calc.runway < 12 && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-300 dark:border-orange-700 rounded-xl p-4 flex gap-3 items-start">
            <AlertTriangle size={18} className="text-orange-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-orange-700 dark:text-orange-400 text-sm">
                You need to close your round by {calc.fundraiseByDate}
              </p>
              <p className="text-orange-600 dark:text-orange-300 text-xs mt-0.5">
                Start fundraising immediately — typical rounds take 4–6 months to close.
              </p>
            </div>
          </div>
        )}

        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: Inputs */}
          <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-4">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Cash & Revenue</p>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>Current Cash in Bank (INR)</label>
                <input
                  type="number"
                  className={inputCls}
                  value={cash}
                  onChange={(e) => setCash(Number(e.target.value))}
                />
              </div>
              <div>
                <label className={labelCls}>Monthly Revenue (INR)</label>
                <input
                  type="number"
                  className={inputCls}
                  value={revenue}
                  onChange={(e) => setRevenue(Number(e.target.value))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Revenue Growth % / Month</label>
                  <input
                    type="number"
                    className={inputCls}
                    value={revenueGrowth}
                    onChange={(e) => setRevenueGrowth(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className={labelCls}>Fundraise Lead-time (mo)</label>
                  <input
                    type="number"
                    className={inputCls}
                    value={fundraisingRunway}
                    onChange={(e) => setFundraisingRunway(Number(e.target.value))}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Next Funding Target (INR)</label>
                <input
                  type="number"
                  className={inputCls}
                  value={fundingTarget}
                  onChange={(e) => setFundingTarget(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Right: Burn Categories */}
          <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Monthly Burn Categories</p>
              <button
                onClick={addCategory}
                className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 transition-colors"
              >
                <Plus size={13} /> Add
              </button>
            </div>
            <div className="space-y-2">
              {categories.map((cat, idx) => (
                <div key={cat.id} className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: BURN_COLORS[idx % BURN_COLORS.length] }}
                  />
                  <input
                    type="text"
                    className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-orange-400 transition-colors flex-1 min-w-0"
                    value={cat.name}
                    onChange={(e) => updateCategory(cat.id, 'name', e.target.value)}
                  />
                  <input
                    type="number"
                    className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-orange-400 transition-colors w-28"
                    value={cat.amount}
                    onChange={(e) => updateCategory(cat.id, 'amount', Number(e.target.value))}
                  />
                  <button
                    onClick={() => removeCategory(cat.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-between text-sm font-bold">
              <span className="text-slate-500 dark:text-slate-400">Gross Burn</span>
              <span className="text-red-600 dark:text-red-400">{fmt(calc.grossBurn)}</span>
            </div>
          </div>
        </div>

        {/* Cash Runway Chart */}
        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">Cash Balance Projection</p>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={calc.projection} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="cashGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis
                tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                tick={{ fontSize: 11 }}
                width={56}
              />
              <Tooltip content={<CashTooltip />} />
              <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1.5} />
              <Area
                type="monotone"
                dataKey="cash"
                name="Cash Balance"
                stroke="#ef4444"
                fill="url(#cashGrad)"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Burn Breakdown Chart */}
        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">Burn by Category</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={categories.map((c) => ({ name: c.name, amount: c.amount }))}
              layout="vertical"
              margin={{ top: 0, right: 20, left: 80, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                tick={{ fontSize: 11 }}
              />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={78} />
              <Tooltip
                formatter={(v: number) => fmt(v)}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                }}
              />
              <Bar dataKey="amount" name="Monthly Spend" radius={[0, 4, 4, 0]}>
                {categories.map((_, idx) => (
                  <Cell key={idx} fill={BURN_COLORS[idx % BURN_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Disclaimer */}
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex gap-3 items-start">
          <AlertTriangle size={15} className="text-slate-400 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            This calculator provides estimates based on your inputs. Actual runway may vary due to changes in burn rate,
            revenue, and market conditions. Projections assume constant gross burn and compounding revenue growth.
            Consult a financial advisor before making fundraising decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
