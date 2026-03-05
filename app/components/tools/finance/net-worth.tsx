"use client";
import React, { useState, useMemo, useEffect } from 'react';
import {
  Landmark, Plus, Trash2, Download, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Sparkles, Check,
} from 'lucide-react';
import { getPFFinanceSummary } from './pf-data-bridge';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const fmtCr = (n: number) => {
  if (Math.abs(n) >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (Math.abs(n) >= 1e5) return `₹${(n / 1e5).toFixed(1)} L`;
  return fmt(n);
};

type AssetCat = 'liquid' | 'equity' | 'fixed' | 'realestate' | 'other';
type LiabCat  = 'homeloan' | 'carloan' | 'personalloan' | 'creditcard' | 'other';
type View     = 'overview' | 'breakdown' | 'ratios';

const ASSET_CATS: Record<AssetCat, { label: string; color: string }> = {
  liquid:     { label: 'Liquid (Cash/FD)',    color: '#06b6d4' },
  equity:     { label: 'Equity (Stocks/MF)', color: '#10b981' },
  fixed:      { label: 'Fixed (Bonds/PPF)',  color: '#6366f1' },
  realestate: { label: 'Real Estate',        color: '#f59e0b' },
  other:      { label: 'Other Assets',       color: '#94a3b8' },
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

function RatioRow({ label, value, status, hint }: { label: string; value: string; status: 'good' | 'warn' | 'bad'; hint: string }) {
  const icon = status === 'good'
    ? <CheckCircle  size={14} className="text-emerald-500 flex-shrink-0" />
    : <AlertTriangle size={14} className={status === 'warn' ? 'text-amber-500 flex-shrink-0' : 'text-rose-500 flex-shrink-0'} />;
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
      {icon}
      <div className="flex-1">
        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{label}</p>
        <p className="text-[10px] text-slate-400">{hint}</p>
      </div>
      <span className={`text-sm font-black ${status === 'good' ? 'text-emerald-600' : status === 'warn' ? 'text-amber-500' : 'text-rose-500'}`}>{value}</span>
    </div>
  );
}

const rowInputCls =
  'text-xs px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-transparent ' +
  'focus:border-sky-300 outline-none text-slate-700 dark:text-slate-200 transition-colors';

export const NetWorthTracker = () => {
  const [view, setView] = useState<View>('overview');
  const [entryOpen, setEntryOpen] = useState(true);

  // ── PF smart detection ────────────────────────────────────────────────────
  const [pfEMI,    setPfEMI]    = useState(0);
  const [pfMonths, setPfMonths] = useState(0);

  const loadPF = () => {
    const s = getPFFinanceSummary(3);
    if (s.hasData) {
      setPfEMI(s.detectedLoanEMIMonthly);
      setPfMonths(s.monthCount);
    }
  };
  useEffect(() => {
    loadPF();
    window.addEventListener('pf-store-updated', loadPF);
    return () => window.removeEventListener('pf-store-updated', loadPF);
  }, []);

  const [assets,      setAssets]      = useState<AssetItem[]>([]);
  const [liabilities, setLiabilities] = useState<LiabItem[]>([]);
  const [checkedAssets, setCheckedAssets] = useState<Set<number>>(new Set());
  const [checkedLiabs,  setCheckedLiabs]  = useState<Set<number>>(new Set());

  const toggleAsset = (id: number) =>
    setCheckedAssets(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const toggleLiab = (id: number) =>
    setCheckedLiabs(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const deleteSelected = () => {
    setAssets(p => p.filter(a => !checkedAssets.has(a.id)));
    setLiabilities(p => p.filter(l => !checkedLiabs.has(l.id)));
    setCheckedAssets(new Set());
    setCheckedLiabs(new Set());
  };

  const totalChecked = checkedAssets.size + checkedLiabs.size;

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

    const byCat = Object.entries(ASSET_CATS).map(([cat, meta]) => ({
      name: meta.label, color: meta.color,
      value: assets.filter(a => a.category === (cat as AssetCat)).reduce((s, a) => s + a.value, 0),
    })).filter(x => x.value > 0);

    const liabByCat = Object.entries(LIAB_CATS).map(([cat, meta]) => ({
      name: meta.label, color: meta.color,
      value: liabilities.filter(l => l.category === (cat as LiabCat)).reduce((s, l) => s + l.value, 0),
    })).filter(x => x.value > 0);

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

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 dark:bg-[#0B1120] overflow-hidden">

      {/* ── CONTROLS BAR ──────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-3 flex flex-wrap items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-sky-50 dark:bg-sky-900/20 rounded-lg">
            <Landmark size={16} className="text-sky-600" />
          </div>
          <span className="text-sm font-bold text-slate-900 dark:text-white">Net Worth Tracker</span>
          <span className="text-[11px] text-slate-400 ml-1 hidden sm:block">Assets · Liabilities · Allocation · Ratios</span>
        </div>

        {/* View tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
          {(['overview', 'breakdown', 'ratios'] as View[]).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1 text-xs font-semibold capitalize rounded-md transition-all ${
                view === v
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}>
              {v === 'breakdown' ? 'Asset Breakdown' : v === 'ratios' ? 'Financial Ratios' : 'Overview'}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* PF: detected loan suggestion chip */}
        {pfEMI > 0 && (
          <button
            onClick={() => {
              setEntryOpen(true);
              addLiab();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors border border-rose-200 dark:border-rose-800"
          >
            <Sparkles size={11} />
            Detected EMI: {fmtCr(pfEMI)}/mo ({pfMonths}mo avg) → Add Liability
          </button>
        )}

        <button onClick={() => setEntryOpen(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold transition-colors">
          {entryOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {entryOpen ? 'Hide' : 'Edit'}
        </button>

        {/* Selection badge */}
        {totalChecked > 0 && (
          <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">
            {totalChecked} selected
          </span>
        )}

        {/* Delete — greyed when nothing selected */}
        <button
          disabled={totalChecked === 0}
          onClick={deleteSelected}
          title="Delete selected items"
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-semibold transition-colors ${
            totalChecked > 0
              ? 'bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-500 dark:text-rose-400'
              : 'bg-slate-50 dark:bg-slate-800/40 text-slate-300 dark:text-slate-600 cursor-not-allowed'
          }`}>
          <Trash2 size={12} /> Delete
        </button>

        <button onClick={exportCsv}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold transition-colors">
          <Download size={12} /> Export CSV
        </button>
      </div>

      {/* ── SMART TABLE BAR (KPIs) ─────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-2.5 flex items-center gap-2.5 flex-shrink-0 flex-wrap">
        <span className="text-sm font-bold text-slate-800 dark:text-white mr-1">Net Worth</span>

        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          Assets <span className="ml-1">{fmtCr(totalAssets)}</span>
        </span>
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-900/20 text-xs font-semibold text-rose-500 dark:text-rose-400">
          Liabilities <span className="ml-1">{fmtCr(totalLiab)}</span>
        </span>
        <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
          netWorth >= 0
            ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400'
            : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400'
        }`}>
          Net Worth <span className="ml-1 font-bold">{fmtCr(netWorth)}</span>
        </span>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
          ratios.debtToAsset < 0.4
            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
            : ratios.debtToAsset < 0.6
              ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
              : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400'
        }`}>
          Debt/Asset {(ratios.debtToAsset * 100).toFixed(1)}%
        </span>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
          ratios.liquidRatio >= 1
            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
            : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400'
        }`}>
          Liquid {isFinite(ratios.liquidRatio) ? `${ratios.liquidRatio.toFixed(2)}x` : '∞'}
        </span>
      </div>

      {/* ── ENTRY PANELS (collapsible) ─────────────────────────────────────────── */}
      {entryOpen && (
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex-shrink-0 max-h-64 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-700">

            {/* Assets panel */}
            <div className="px-6 py-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                  <TrendingUp size={10} className="text-emerald-500" /> Assets
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold normal-case">{fmtCr(totalAssets)}</span>
                </p>
                <button onClick={addAsset}
                  className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors">
                  <Plus size={10} /> Add
                </button>
              </div>
              <div className="space-y-1.5">
                {assets.map(asset => (
                  <div key={asset.id} className={`flex items-center gap-1.5 rounded-lg px-1 transition-colors ${checkedAssets.has(asset.id) ? 'bg-blue-50/60 dark:bg-blue-900/10' : ''}`}>
                    <button
                      onClick={() => toggleAsset(asset.id)}
                      className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                        checkedAssets.has(asset.id)
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-slate-400 dark:border-slate-500 hover:border-blue-500'
                      }`}>
                      {checkedAssets.has(asset.id) && <Check size={9} strokeWidth={3} />}
                    </button>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: ASSET_CATS[asset.category].color }} />
                    <input value={asset.name} onChange={e => updateAsset(asset.id, 'name', e.target.value)}
                      className={`${rowInputCls} flex-1 min-w-0`} />
                    <select value={asset.category} onChange={e => updateAsset(asset.id, 'category', e.target.value)}
                      className={`${rowInputCls} w-24 text-[10px]`}>
                      {Object.entries(ASSET_CATS).map(([k, v]) => <option key={k} value={k}>{v.label.split(' ')[0]}</option>)}
                    </select>
                    <input type="number" value={asset.value} min={0}
                      onChange={e => updateAsset(asset.id, 'value', Number(e.target.value))}
                      className={`${rowInputCls} w-28 text-right`} />
                  </div>
                ))}
                {assets.length === 0 && (
                  <p className="text-xs text-slate-400 italic py-1">No assets added yet. Click Add to enter your savings, investments, and property.</p>
                )}
              </div>
            </div>

            {/* Liabilities panel */}
            <div className="px-6 py-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                  <TrendingDown size={10} className="text-rose-500" /> Liabilities
                  <span className="text-rose-500 dark:text-rose-400 font-bold normal-case">{fmtCr(totalLiab)}</span>
                </p>
                <button onClick={addLiab}
                  className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors">
                  <Plus size={10} /> Add
                </button>
              </div>
              <div className="space-y-1.5">
                {liabilities.map(liab => (
                  <div key={liab.id} className={`flex items-center gap-1.5 rounded-lg px-1 transition-colors ${checkedLiabs.has(liab.id) ? 'bg-blue-50/60 dark:bg-blue-900/10' : ''}`}>
                    <button
                      onClick={() => toggleLiab(liab.id)}
                      className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                        checkedLiabs.has(liab.id)
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-slate-400 dark:border-slate-500 hover:border-blue-500'
                      }`}>
                      {checkedLiabs.has(liab.id) && <Check size={9} strokeWidth={3} />}
                    </button>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: LIAB_CATS[liab.category].color }} />
                    <input value={liab.name} onChange={e => updateLiab(liab.id, 'name', e.target.value)}
                      className={`${rowInputCls} flex-1 min-w-0`} />
                    <select value={liab.category} onChange={e => updateLiab(liab.id, 'category', e.target.value)}
                      className={`${rowInputCls} w-24 text-[10px]`}>
                      {Object.entries(LIAB_CATS).map(([k, v]) => <option key={k} value={k}>{v.label.split(' ')[0]}</option>)}
                    </select>
                    <input type="number" value={liab.value} min={0}
                      onChange={e => updateLiab(liab.id, 'value', Number(e.target.value))}
                      className={`${rowInputCls} w-28 text-right`} />
                  </div>
                ))}
                {liabilities.length === 0 && (
                  <p className="text-xs text-slate-400 italic py-1">
                    {pfEMI > 0
                      ? `Detected loan EMI of ${fmtCr(pfEMI)}/mo from statements. Click the chip above to add.`
                      : 'No liabilities yet. Click Add to enter loans, credit card balances, etc.'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CONTENT AREA ──────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6">

        {view === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Asset allocation donut */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">Asset Allocation</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={byCat} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {byCat.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => fmtCr(Number(v))}
                    contentStyle={{ borderRadius: '10px', background: '#1e293b', border: 'none', fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-1.5">
                {byCat.map(c => (
                  <div key={c.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                      <span className="text-slate-500 dark:text-slate-400 truncate max-w-[160px]">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 dark:text-slate-400">{totalAssets > 0 ? ((c.value / totalAssets) * 100).toFixed(1) : 0}%</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300 w-24 text-right">{fmtCr(c.value)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial summary */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">Financial Summary</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Total Assets</span>
                  <span className="text-lg font-black text-emerald-600">{fmtCr(totalAssets)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Total Liabilities</span>
                  <span className="text-lg font-black text-rose-500">−{fmtCr(totalLiab)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-base font-bold text-slate-700 dark:text-slate-200">Net Worth</span>
                  <span className={`text-2xl font-black ${netWorth >= 0 ? 'text-sky-600' : 'text-rose-600'}`}>{fmtCr(netWorth)}</span>
                </div>
                {totalAssets > 0 && (
                  <div className="mt-2">
                    <p className="text-[10px] text-slate-400 mb-1.5">Equity in Assets</p>
                    <div className="h-2.5 bg-rose-100 dark:bg-rose-900/20 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${Math.min(100, Math.max(0, (netWorth / totalAssets) * 100))}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {totalAssets > 0 ? ((netWorth / totalAssets) * 100).toFixed(1) : 0}% equity in assets
                    </p>
                  </div>
                )}
                {liabByCat.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Debt Breakdown</p>
                    {liabByCat.map(l => (
                      <div key={l.name} className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
                          <span className="text-slate-500 dark:text-slate-400">{l.name}</span>
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
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">Asset Breakdown by Category</p>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={byCat.map(c => ({ name: c.name.split('(')[0].trim(), value: c.value, color: c.color }))}
                  margin={{ top: 10, right: 20, left: 10, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" strokeOpacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                    interval={0} angle={-30} textAnchor="end" />
                  <YAxis tickFormatter={v => fmtCr(v)} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip formatter={v => fmtCr(Number(v))}
                    contentStyle={{ borderRadius: '10px', background: '#1e293b', border: 'none', fontSize: 11 }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Value">
                    {byCat.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {view === 'ratios' && (
          <div className="max-w-2xl space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Financial health ratios based on your current asset and liability data.
            </p>
            <RatioRow
              label="Debt-to-Asset Ratio"
              value={`${(ratios.debtToAsset * 100).toFixed(1)}%`}
              status={ratios.debtToAsset < 0.4 ? 'good' : ratios.debtToAsset < 0.6 ? 'warn' : 'bad'}
              hint={`< 40% = healthy · Your ratio: ${(ratios.debtToAsset * 100).toFixed(1)}%`}
            />
            <RatioRow
              label="Liquidity Ratio"
              value={isFinite(ratios.liquidRatio) ? `${ratios.liquidRatio.toFixed(2)}x` : '∞'}
              status={ratios.liquidRatio >= 1 ? 'good' : ratios.liquidRatio >= 0.5 ? 'warn' : 'bad'}
              hint="Liquid assets ÷ total debt · > 1x = can pay all debt with liquid assets"
            />
            <RatioRow
              label="Equity Allocation"
              value={`${(ratios.equityPct * 100).toFixed(1)}%`}
              status={ratios.equityPct >= 0.3 && ratios.equityPct <= 0.7 ? 'good' : 'warn'}
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
  );
};
