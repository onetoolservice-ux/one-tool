"use client";
import React, { useState, useMemo } from 'react';
import { Landmark, Plus, Trash2, Download, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const fmtCr = (n: number) => {
  if (Math.abs(n) >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (Math.abs(n) >= 1e5) return `₹${(n / 1e5).toFixed(1)} L`;
  return fmt(n);
};

type AssetCat = 'liquid' | 'equity' | 'fixed' | 'realestate' | 'other';
type LiabCat = 'homeloan' | 'carloan' | 'personalloan' | 'creditcard' | 'other';
type View = 'overview' | 'breakdown' | 'ratios';

const ASSET_CATS: Record<AssetCat, { label: string; color: string }> = {
  liquid:     { label: 'Liquid (Cash/FD/Savings)', color: '#06b6d4' },
  equity:     { label: 'Equity (Stocks/MF)',        color: '#10b981' },
  fixed:      { label: 'Fixed Income (Bonds/PPF)',   color: '#6366f1' },
  realestate: { label: 'Real Estate',                color: '#f59e0b' },
  other:      { label: 'Other Assets',               color: '#94a3b8' },
};
const LIAB_CATS: Record<LiabCat, { label: string; color: string }> = {
  homeloan:     { label: 'Home Loan',     color: '#f43f5e' },
  carloan:      { label: 'Car Loan',      color: '#fb923c' },
  personalloan: { label: 'Personal Loan', color: '#e879f9' },
  creditcard:   { label: 'Credit Card',   color: '#f97316' },
  other:        { label: 'Other Debt',    color: '#94a3b8' },
};

interface AssetItem { id: number; name: string; value: number; category: AssetCat }
interface LiabItem  { id: number; name: string; value: number; category: LiabCat }

function KPI({ label, value, sub, color = '' }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-4 flex-1 min-w-0">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-xl font-black truncate ${color || 'text-slate-900 dark:text-white'}`}>{value}</p>
      {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function RatioRow({ label, value, status, hint }: { label: string; value: string; status: 'good' | 'warn' | 'bad'; hint: string }) {
  const icon = status === 'good' ? <CheckCircle size={14} className="text-emerald-500"/> : status === 'warn' ? <AlertTriangle size={14} className="text-amber-500"/> : <AlertTriangle size={14} className="text-rose-500"/>;
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
      {icon}
      <div className="flex-1">
        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{label}</p>
        <p className="text-[10px] text-slate-400">{hint}</p>
      </div>
      <span className={`text-sm font-black ${status === 'good' ? 'text-emerald-600' : status === 'warn' ? 'text-amber-500' : 'text-rose-500'}`}>{value}</span>
    </div>
  );
}

export const NetWorthTracker = () => {
  const [view, setView] = useState<View>('overview');
  const [assets, setAssets] = useState<AssetItem[]>([
    { id: 1, name: 'Savings Account',    value: 350000,  category: 'liquid' },
    { id: 2, name: 'Fixed Deposits',     value: 500000,  category: 'liquid' },
    { id: 3, name: 'Mutual Funds',       value: 800000,  category: 'equity' },
    { id: 4, name: 'Stocks Portfolio',   value: 400000,  category: 'equity' },
    { id: 5, name: 'PPF / EPF',          value: 300000,  category: 'fixed' },
    { id: 6, name: 'Residential Property', value: 8500000, category: 'realestate' },
  ]);
  const [liabilities, setLiabilities] = useState<LiabItem[]>([
    { id: 1, name: 'Home Loan',  value: 4500000, category: 'homeloan' },
    { id: 2, name: 'Car Loan',   value: 600000,  category: 'carloan' },
  ]);

  const addAsset = () => setAssets(p => [...p, { id: Date.now(), name: 'New Asset', value: 0, category: 'liquid' }]);
  const addLiab  = () => setLiabilities(p => [...p, { id: Date.now(), name: 'New Liability', value: 0, category: 'other' }]);
  const updateAsset = (id: number, field: keyof AssetItem, val: string | number) =>
    setAssets(p => p.map(a => a.id === id ? { ...a, [field]: val } : a));
  const updateLiab = (id: number, field: keyof LiabItem, val: string | number) =>
    setLiabilities(p => p.map(l => l.id === id ? { ...l, [field]: val } : l));

  const { totalAssets, totalLiab, netWorth, byCat, liabByCat, ratios } = useMemo(() => {
    const totalAssets = assets.reduce((s, a) => s + a.value, 0);
    const totalLiab   = liabilities.reduce((s, l) => s + l.value, 0);
    const netWorth    = totalAssets - totalLiab;
    const liquidAssets = assets.filter(a => a.category === 'liquid').reduce((s, a) => s + a.value, 0);

    // Group assets by category for pie chart
    const byCat = Object.entries(ASSET_CATS).map(([cat, meta]) => ({
      name: meta.label,
      value: assets.filter(a => a.category === cat as AssetCat).reduce((s, a) => s + a.value, 0),
      color: meta.color,
    })).filter(x => x.value > 0);

    const liabByCat = Object.entries(LIAB_CATS).map(([cat, meta]) => ({
      name: meta.label,
      value: liabilities.filter(l => l.category === cat as LiabCat).reduce((s, l) => s + l.value, 0),
      color: meta.color,
    })).filter(x => x.value > 0);

    // Financial ratios
    const debtToAsset = totalAssets > 0 ? totalLiab / totalAssets : 0;
    const liquidRatio = totalLiab > 0 ? liquidAssets / totalLiab : Infinity;
    const equityPct   = totalAssets > 0 ? assets.filter(a => a.category === 'equity').reduce((s, a) => s + a.value, 0) / totalAssets : 0;
    const reRatio     = totalAssets > 0 ? assets.filter(a => a.category === 'realestate').reduce((s, a) => s + a.value, 0) / totalAssets : 0;

    return { totalAssets, totalLiab, netWorth, byCat, liabByCat, ratios: { debtToAsset, liquidRatio, equityPct, reRatio } };
  }, [assets, liabilities]);

  const exportCsv = () => {
    const rows = [['Type', 'Category', 'Name', 'Value']];
    assets.forEach(a => rows.push(['Asset', ASSET_CATS[a.category].label, a.name, String(a.value)]));
    liabilities.forEach(l => rows.push(['Liability', LIAB_CATS[l.category].label, l.name, String(l.value)]));
    rows.push(['', '', 'Total Assets', String(totalAssets)]);
    rows.push(['', '', 'Total Liabilities', String(totalLiab)]);
    rows.push(['', '', 'Net Worth', String(netWorth)]);
    const csv = rows.map(r => r.join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a'); a.href = url; a.download = 'net-worth.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const VIEWS: { id: View; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'breakdown', label: 'Asset Breakdown' },
    { id: 'ratios', label: 'Financial Ratios' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 dark:bg-[#0B1120] overflow-hidden">
      {/* ── TOOLBAR ──────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex flex-wrap items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-sky-50 dark:bg-sky-900/20 rounded-lg"><Landmark size={18} className="text-sky-600"/></div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Net Worth Tracker</h2>
            <p className="text-[11px] text-slate-400">Assets · Liabilities · Allocation · Ratios</p>
          </div>
        </div>
        <div className="flex-1"/>
        <button onClick={exportCsv} className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold transition-colors">
          <Download size={12}/> Export CSV
        </button>
      </div>

      {/* ── KPI ROW ──────────────────────────────────────────────────────────── */}
      <div className="flex gap-3 px-6 py-3 flex-shrink-0 flex-wrap">
        <KPI label="Total Assets" value={fmtCr(totalAssets)} color="text-emerald-600"/>
        <KPI label="Total Liabilities" value={fmtCr(totalLiab)} color="text-rose-500"/>
        <KPI label="Net Worth" value={fmtCr(netWorth)} color={netWorth >= 0 ? 'text-sky-600' : 'text-rose-600'}
          sub={`Debt ratio: ${(ratios.debtToAsset * 100).toFixed(1)}%`}/>
        <KPI label="Debt-to-Asset" value={`${(ratios.debtToAsset * 100).toFixed(1)}%`}
          color={ratios.debtToAsset < 0.4 ? 'text-emerald-600' : ratios.debtToAsset < 0.6 ? 'text-amber-500' : 'text-rose-500'}
          sub="< 40% is healthy"/>
        <KPI label="Liquid Ratio" value={isFinite(ratios.liquidRatio) ? `${ratios.liquidRatio.toFixed(2)}x` : '∞'}
          color={ratios.liquidRatio >= 1 ? 'text-emerald-600' : 'text-rose-500'}
          sub="Liquid assets / total debt"/>
      </div>

      {/* ── BODY ─────────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: Data entry */}
        <div className="w-80 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto">
          {/* Assets section */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <TrendingUp size={13} className="text-emerald-500"/>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">Assets</span>
                <span className="text-xs font-bold text-emerald-600 ml-1">{fmtCr(totalAssets)}</span>
              </div>
              <button onClick={addAsset} className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:bg-emerald-100 transition-colors">
                <Plus size={10}/> Add
              </button>
            </div>
            <div className="space-y-1.5">
              {assets.map(asset => (
                <div key={asset.id} className="flex items-center gap-1.5 group">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: ASSET_CATS[asset.category].color }}/>
                  <input value={asset.name} onChange={e => updateAsset(asset.id, 'name', e.target.value)}
                    className="flex-1 text-xs px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-transparent focus:border-emerald-300 outline-none text-slate-700 dark:text-slate-200 min-w-0"/>
                  <select value={asset.category} onChange={e => updateAsset(asset.id, 'category', e.target.value)}
                    className="text-[10px] px-1.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-transparent outline-none text-slate-500 dark:text-slate-400 w-24">
                    {Object.entries(ASSET_CATS).map(([k, v]) => <option key={k} value={k}>{v.label.split(' ')[0]}</option>)}
                  </select>
                  <input type="number" value={asset.value} onChange={e => updateAsset(asset.id, 'value', Number(e.target.value))}
                    className="text-xs text-right px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-transparent focus:border-emerald-300 outline-none text-slate-700 dark:text-slate-200 w-24" min={0}/>
                  <button onClick={() => setAssets(p => p.filter(a => a.id !== asset.id))}
                    className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded flex items-center justify-center hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-300 hover:text-rose-500 transition-all">
                    <Trash2 size={11}/>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Liabilities section */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <TrendingDown size={13} className="text-rose-500"/>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">Liabilities</span>
                <span className="text-xs font-bold text-rose-500 ml-1">{fmtCr(totalLiab)}</span>
              </div>
              <button onClick={addLiab} className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-500 hover:bg-rose-100 transition-colors">
                <Plus size={10}/> Add
              </button>
            </div>
            <div className="space-y-1.5">
              {liabilities.map(liab => (
                <div key={liab.id} className="flex items-center gap-1.5 group">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: LIAB_CATS[liab.category].color }}/>
                  <input value={liab.name} onChange={e => updateLiab(liab.id, 'name', e.target.value)}
                    className="flex-1 text-xs px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-transparent focus:border-rose-300 outline-none text-slate-700 dark:text-slate-200 min-w-0"/>
                  <select value={liab.category} onChange={e => updateLiab(liab.id, 'category', e.target.value)}
                    className="text-[10px] px-1.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-transparent outline-none text-slate-500 dark:text-slate-400 w-24">
                    {Object.entries(LIAB_CATS).map(([k, v]) => <option key={k} value={k}>{v.label.split(' ')[0]}</option>)}
                  </select>
                  <input type="number" value={liab.value} onChange={e => updateLiab(liab.id, 'value', Number(e.target.value))}
                    className="text-xs text-right px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-transparent focus:border-rose-300 outline-none text-slate-700 dark:text-slate-200 w-24" min={0}/>
                  <button onClick={() => setLiabilities(p => p.filter(l => l.id !== liab.id))}
                    className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded flex items-center justify-center hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-300 hover:text-rose-500 transition-all">
                    <Trash2 size={11}/>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Charts */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* View tabs */}
          <div className="px-5 pt-4 pb-0 flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0">
            {VIEWS.map(v => (
              <button key={v.id} onClick={() => setView(v.id)}
                className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all -mb-px ${view === v.id ? 'border-sky-500 text-sky-600 dark:text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                {v.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {view === 'overview' && (
              <div className="grid grid-cols-2 gap-5 h-full min-h-[300px]">
                {/* Assets donut */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Asset Allocation</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={byCat} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                        {byCat.map((entry, i) => <Cell key={i} fill={entry.color}/>)}
                      </Pie>
                      <Tooltip formatter={(v) => fmtCr(Number(v))} contentStyle={{ borderRadius: '10px', background: '#1e293b', border: 'none', fontSize: 11 }}/>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-2 space-y-1">
                    {byCat.map(c => (
                      <div key={c.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }}/>
                          <span className="text-slate-500 truncate max-w-[140px]">{c.name}</span>
                        </div>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{totalAssets > 0 ? ((c.value / totalAssets) * 100).toFixed(1) : 0}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Net worth summary */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Financial Summary</p>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-sm text-slate-500">Total Assets</span>
                      <span className="text-lg font-black text-emerald-600">{fmtCr(totalAssets)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-sm text-slate-500">Total Liabilities</span>
                      <span className="text-lg font-black text-rose-500">−{fmtCr(totalLiab)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-base font-bold text-slate-700 dark:text-slate-200">Net Worth</span>
                      <span className={`text-2xl font-black ${netWorth >= 0 ? 'text-sky-600' : 'text-rose-600'}`}>{fmtCr(netWorth)}</span>
                    </div>

                    {/* Progress bar */}
                    {totalAssets > 0 && (
                      <div className="mt-3">
                        <p className="text-[10px] text-slate-400 mb-1.5">Assets vs Debt Coverage</p>
                        <div className="h-3 bg-rose-100 dark:bg-rose-900/20 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${Math.min(100, (netWorth / totalAssets) * 100)}%` }}/>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">{totalAssets > 0 ? ((netWorth / totalAssets) * 100).toFixed(1) : 0}% equity in assets</p>
                      </div>
                    )}

                    {/* Debt by category */}
                    {liabByCat.length > 0 && (
                      <div className="mt-3">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Debt Breakdown</p>
                        {liabByCat.map(l => (
                          <div key={l.name} className="flex items-center justify-between text-xs mb-1">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }}/>
                              <span className="text-slate-500">{l.name}</span>
                            </div>
                            <span className="font-bold text-slate-700 dark:text-slate-300">{fmtCr(l.value)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {view === 'breakdown' && (
              <div className="h-full min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byCat.map(c => ({ name: c.name.split('(')[0].trim(), value: c.value, color: c.color }))}
                    margin={{ top: 10, right: 20, left: 10, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" strokeOpacity={0.3}/>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                      interval={0} angle={-30} textAnchor="end"/>
                    <YAxis tickFormatter={v => fmtCr(v)} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={75}/>
                    <Tooltip formatter={v => fmtCr(Number(v))} contentStyle={{ borderRadius: '10px', background: '#1e293b', border: 'none', fontSize: 11 }}/>
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Value">
                      {byCat.map((entry, i) => <Cell key={i} fill={entry.color}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {view === 'ratios' && (
              <div className="space-y-3 max-w-2xl">
                <p className="text-xs text-slate-500 mb-4">Financial health ratios based on your current asset and liability data.</p>
                <RatioRow
                  label="Debt-to-Asset Ratio"
                  value={`${(ratios.debtToAsset * 100).toFixed(1)}%`}
                  status={ratios.debtToAsset < 0.4 ? 'good' : ratios.debtToAsset < 0.6 ? 'warn' : 'bad'}
                  hint={`< 40% = healthy | Your ratio: ${(ratios.debtToAsset * 100).toFixed(1)}%`}
                />
                <RatioRow
                  label="Liquidity Ratio"
                  value={isFinite(ratios.liquidRatio) ? `${ratios.liquidRatio.toFixed(2)}x` : '∞'}
                  status={ratios.liquidRatio >= 1 ? 'good' : ratios.liquidRatio >= 0.5 ? 'warn' : 'bad'}
                  hint="Liquid assets ÷ total debt. > 1x = can pay all debt with liquid assets"
                />
                <RatioRow
                  label="Equity Allocation"
                  value={`${(ratios.equityPct * 100).toFixed(1)}%`}
                  status={ratios.equityPct >= 0.3 && ratios.equityPct <= 0.7 ? 'good' : ratios.equityPct < 0.1 ? 'warn' : 'warn'}
                  hint="30–70% in equities is ideal for long-term wealth growth"
                />
                <RatioRow
                  label="Real Estate Concentration"
                  value={`${(ratios.reRatio * 100).toFixed(1)}%`}
                  status={ratios.reRatio <= 0.5 ? 'good' : ratios.reRatio <= 0.7 ? 'warn' : 'bad'}
                  hint="< 50% in real estate = better diversification"
                />
                <RatioRow
                  label="Net Worth Positive"
                  value={netWorth >= 0 ? 'Yes' : 'No'}
                  status={netWorth >= 0 ? 'good' : 'bad'}
                  hint="Assets exceed liabilities — you are net positive"
                />

                {/* Recommendation */}
                <div className="mt-4 p-4 bg-sky-50 dark:bg-sky-900/10 border border-sky-200 dark:border-sky-800 rounded-xl">
                  <p className="text-xs font-bold text-sky-700 dark:text-sky-300 mb-1">Summary</p>
                  <p className="text-xs text-sky-600 dark:text-sky-400">
                    {ratios.debtToAsset > 0.6 ? 'High debt-to-asset ratio. Focus on debt repayment. ' : ''}
                    {ratios.liquidRatio < 0.5 ? 'Low liquidity. Build emergency fund. ' : ''}
                    {ratios.equityPct < 0.2 ? 'Consider increasing equity allocation for better long-term returns. ' : ''}
                    {ratios.debtToAsset <= 0.4 && ratios.liquidRatio >= 1 ? 'Your financial health looks solid! Keep growing your assets.' : ''}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
