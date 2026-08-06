"use client";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { TrendingUp, Download, Info, Sparkles } from 'lucide-react';
import { getPFFinanceSummary } from './pf-data-bridge';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, BarChart, Bar,
} from 'recharts';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const fmtCr = (n: number) => {
  if (Math.abs(n) >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (Math.abs(n) >= 1e5) return `₹${(n / 1e5).toFixed(1)} L`;
  return fmt(n);
};

type Mode = 'sip' | 'combo' | 'goal';
type View = 'chart' | 'table' | 'breakdown';

const MODES: { id: Mode; label: string }[] = [
  { id: 'sip',   label: 'SIP Planner' },
  { id: 'combo', label: 'SIP + Lumpsum' },
  { id: 'goal',  label: 'Goal Planner' },
];

const BENCHMARKS = [
  { label: 'Conservative', r: 8,  note: 'Debt funds' },
  { label: 'Moderate',     r: 12, note: 'Hybrid funds' },
  { label: 'Aggressive',   r: 15, note: 'Equity funds' },
];

const labelCls = 'text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide';
const inputCls =
  'text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 ' +
  'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 outline-none focus:border-emerald-400 ' +
  'transition-colors w-full';

export const SipCalculator = () => {
  const [mode, setMode]   = useState<Mode>('sip');
  const [view, setView]   = useState<View>('chart');

  const [monthly,    setMonthly]    = useState(0);
  const [stepUp,     setStepUp]     = useState(10);
  const [years,      setYears]      = useState(15);
  const [rate,       setRate]       = useState(12);
  const [lumpsum,    setLumpsum]    = useState(0);
  const [goalCorpus, setGoalCorpus] = useState(10000000);
  const [applyLtcg,  setApplyLtcg]  = useState(false);

  // PF smart detection
  const [pfSIP,      setPfSIP]      = useState(0);
  const [pfMonths,   setPfMonths]   = useState(0);

  const hasAutoApplied = useRef(false);

  const loadPF = () => {
    const s = getPFFinanceSummary(3);
    if (s.hasData) { setPfSIP(s.detectedSIPMonthly); setPfMonths(s.monthCount); }
  };
  useEffect(() => {
    const s = getPFFinanceSummary(3);
    if (s.hasData) {
      setPfSIP(s.detectedSIPMonthly);
      setPfMonths(s.monthCount);
      // Auto-apply detected SIP once on first mount
      if (!hasAutoApplied.current && s.detectedSIPMonthly > 0) {
        hasAutoApplied.current = true;
        setMonthly(Math.round(s.detectedSIPMonthly));
      }
    }
    window.addEventListener('pf-store-updated', loadPF);
    return () => window.removeEventListener('pf-store-updated', loadPF);
  }, []);

  // ── Calculations ──────────────────────────────────────────────────────────
  const { projData, kpis } = useMemo(() => {
    const monthlyRate = rate / 1200;
    const months = years * 12;
    let corpus = 0;
    let totalInvested = 0;
    let currentMonthly = monthly;
    const projData: { year: string; invested: number; value: number }[] = [];

    const lumpsumFV = lumpsum * Math.pow(1 + rate / 100, years);

    for (let y = 1; y <= years; y++) {
      if (y > 1 && stepUp > 0) currentMonthly = Math.round(currentMonthly * (1 + stepUp / 100));
      for (let m = 0; m < 12; m++) {
        corpus = (corpus + currentMonthly) * (1 + monthlyRate);
        totalInvested += currentMonthly;
      }
      projData.push({
        year: `Yr ${y}`,
        invested: totalInvested + lumpsum,
        value: Math.round(corpus + lumpsum * Math.pow(1 + rate / 100, y)),
      });
    }

    const finalValue = Math.round(corpus + lumpsumFV);
    const totalInv = totalInvested + lumpsum;
    const gains = finalValue - totalInv;
    const ltcgTax = applyLtcg ? Math.round(Math.max(0, gains - 100000) * 0.10) : 0;
    const postTaxValue = finalValue - ltcgTax;
    const reqSip = goalCorpus / (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
    const cagr = Math.round(((Math.pow(finalValue / Math.max(1, totalInv), 1 / years) - 1) * 100) * 10) / 10;

    return {
      projData,
      kpis: { invested: totalInv, finalValue, gains, ltcgTax, postTaxValue, reqSip: Math.round(reqSip), cagr },
    };
  }, [monthly, stepUp, years, rate, lumpsum, applyLtcg, goalCorpus]);

  const exportCsv = () => {
    const rows = [['Year', 'Invested', 'Corpus Value', 'Gains']];
    projData.forEach(r => rows.push([r.year, String(r.invested), String(r.value), String(r.value - r.invested)]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a'); a.href = url; a.download = 'sip-projection.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 dark:bg-[#0B1120] overflow-hidden">

      {/* ── CONTROLS BAR ──────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-3 flex-shrink-0 space-y-3">

        {/* Row 1: title + mode + benchmarks + LTCG */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <TrendingUp size={16} className="text-emerald-600" />
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-white">SIP Calculator</span>
          </div>

          {/* Mode tabs */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
            {MODES.map(m => (
              <button key={m.id} onClick={() => setMode(m.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  mode === m.id
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}>
                {m.label}
              </button>
            ))}
          </div>

          {/* Quick benchmarks */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={labelCls}>Benchmark:</span>
            {BENCHMARKS.map(b => (
              <button key={b.label} onClick={() => setRate(b.r)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                  rate === b.r
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}>
                {b.label} {b.r}%
              </button>
            ))}
          </div>

          {/* PF detection chip */}
          {pfSIP > 0 && (
            <button onClick={() => setMonthly(Math.round(pfSIP))}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors border border-emerald-200 dark:border-emerald-800">
              <Sparkles size={11} />
              Statements: {fmtCr(pfSIP)}/mo ({pfMonths}mo avg) → Apply
            </button>
          )}

          <div className="flex-1" />

          {/* LTCG toggle */}
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer select-none">
            <input type="checkbox" checked={applyLtcg} onChange={e => setApplyLtcg(e.target.checked)}
              className="accent-emerald-600 w-3.5 h-3.5" />
            LTCG Tax (10%)
          </label>
        </div>

        {/* Row 2: input fields grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {mode === 'goal' ? (
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Target Corpus (₹)</label>
              <input type="number" value={goalCorpus} onChange={e => setGoalCorpus(Number(e.target.value))} className={inputCls} />
              <span className="text-[10px] text-slate-400">{fmtCr(goalCorpus)}</span>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Monthly SIP (₹)</label>
                <input type="number" value={monthly} min={500} onChange={e => setMonthly(Number(e.target.value))} className={inputCls} />
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Annual Step-Up %</label>
                <input type="number" value={stepUp} min={0} max={30} onChange={e => setStepUp(Number(e.target.value))} className={inputCls} />
                {stepUp > 0 && (
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Info size={9} /> +{stepUp}% yearly
                  </span>
                )}
              </div>
            </>
          )}

          {mode === 'combo' && (
            <div className="flex flex-col gap-1">
              <label className={labelCls}>One-Time Lumpsum (₹)</label>
              <input type="number" value={lumpsum} min={0} onChange={e => setLumpsum(Number(e.target.value))} className={inputCls} />
              <span className="text-[10px] text-slate-400">{fmtCr(lumpsum)}</span>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className={labelCls}>Expected Return %</label>
            <input type="number" value={rate} min={1} max={30} step={0.5} onChange={e => setRate(Number(e.target.value))} className={inputCls} />
          </div>

          <div className="flex flex-col gap-1">
            <label className={labelCls}>Time Horizon (yrs)</label>
            <input type="number" value={years} min={1} max={40} onChange={e => setYears(Number(e.target.value))} className={inputCls} />
          </div>
        </div>
      </div>

      {/* ── SMART TABLE BAR ───────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-2.5 flex items-center gap-3 flex-shrink-0 flex-wrap">
        <span className="text-sm font-bold text-slate-800 dark:text-white mr-1">SIP Projection</span>

        {/* KPI badges */}
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400">
          Invested <span className="text-slate-700 dark:text-slate-200 ml-1">{fmtCr(kpis.invested)}</span>
        </span>
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          Corpus <span className="ml-1">{fmtCr(kpis.finalValue)}</span>
        </span>
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
          Gains <span className="ml-1">{fmtCr(kpis.gains)}</span>
        </span>
        <span className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-xs font-semibold text-blue-600 dark:text-blue-400">
          CAGR ~{kpis.cagr}%
        </span>
        {mode === 'goal' && (
          <span className="px-2.5 py-1 rounded-full bg-violet-50 dark:bg-violet-900/20 text-xs font-semibold text-violet-700 dark:text-violet-400">
            Req. SIP {fmt(kpis.reqSip)}/mo
          </span>
        )}
        {applyLtcg && (
          <span className="px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-900/20 text-xs font-semibold text-rose-600 dark:text-rose-400">
            LTCG {fmtCr(kpis.ltcgTax)} · Post-tax {fmtCr(kpis.postTaxValue)}
          </span>
        )}

        <div className="flex-1" />

        {/* View tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
          {(['chart', 'table', 'breakdown'] as View[]).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1 text-xs font-semibold capitalize rounded-md transition-all ${
                view === v
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}>
              {v}
            </button>
          ))}
        </div>

        <button onClick={exportCsv}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold transition-colors">
          <Download size={12} /> Export CSV
        </button>
      </div>

      {/* ── CONTENT AREA ──────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6">

        {view === 'chart' && (
          <div className="h-full min-h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="sipVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="sipInv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" strokeOpacity={0.3} />
                <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => fmtCr(v)} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={72} />
                <Tooltip
                  formatter={(v, name) => [fmtCr(Number(v)), name === 'value' ? 'Corpus' : 'Invested']}
                  contentStyle={{ borderRadius: '10px', background: '#1e293b', border: 'none', fontSize: 12 }}
                  labelStyle={{ color: '#94a3b8' }} />
                <Legend formatter={v => v === 'value' ? 'Corpus Value' : 'Amount Invested'} />
                <Area type="monotone" dataKey="invested" stroke="#6366f1" strokeWidth={2} fill="url(#sipInv)" strokeDasharray="5 5" />
                <Area type="monotone" dataKey="value"    stroke="#10b981" strokeWidth={2.5} fill="url(#sipVal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {view === 'breakdown' && (
          <div className="h-full min-h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={projData.filter((_, i) => i % Math.ceil(years / 10) === 0 || i === projData.length - 1)}
                margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" strokeOpacity={0.3} />
                <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => fmtCr(v)} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={72} />
                <Tooltip
                  formatter={(v, name) => [fmtCr(Number(v)), name === 'invested' ? 'Invested' : 'Corpus Value']}
                  contentStyle={{ borderRadius: '10px', background: '#1e293b', border: 'none', fontSize: 12 }} />
                <Legend />
                <Bar dataKey="invested" fill="#6366f1" radius={[4, 4, 0, 0]} name="Invested" />
                <Bar dataKey="value"    fill="#10b981" radius={[4, 4, 0, 0]} name="Corpus Value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {view === 'table' && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  {['Year', 'Total Invested', 'Corpus Value', 'Gains', 'Gain %'].map(h => (
                    <th key={h} className="text-left py-2.5 px-4 text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projData.map((r, i) => {
                  const gains = r.value - r.invested;
                  const gainPct = r.invested > 0 ? ((gains / r.invested) * 100).toFixed(1) : '0';
                  return (
                    <tr key={i} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2 px-4 font-semibold text-slate-700 dark:text-slate-300">{r.year}</td>
                      <td className="py-2 px-4 text-slate-600 dark:text-slate-400 font-mono">{fmtCr(r.invested)}</td>
                      <td className="py-2 px-4 font-bold text-emerald-600 dark:text-emerald-400 font-mono">{fmtCr(r.value)}</td>
                      <td className="py-2 px-4 text-emerald-500 dark:text-emerald-300 font-mono">{fmtCr(gains)}</td>
                      <td className="py-2 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                          {gainPct}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 font-bold">
                  <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300 text-xs">Final ({years} yrs)</td>
                  <td className="py-2.5 px-4 font-mono text-slate-700 dark:text-slate-300">{fmtCr(kpis.invested)}</td>
                  <td className="py-2.5 px-4 font-mono text-emerald-600 dark:text-emerald-400">{fmtCr(kpis.finalValue)}</td>
                  <td className="py-2.5 px-4 font-mono text-emerald-500 dark:text-emerald-300">{fmtCr(kpis.gains)}</td>
                  <td className="py-2.5 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold text-[10px]">
                      CAGR {kpis.cagr}%
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
