"use client";
import React, { useState, useMemo } from 'react';
import { TrendingUp, Target, Download, Info } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, BarChart, Bar
} from 'recharts';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const fmtCr = (n: number) => {
  if (Math.abs(n) >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (Math.abs(n) >= 1e5) return `₹${(n / 1e5).toFixed(1)} L`;
  return fmt(n);
};

type Mode = 'sip' | 'goal' | 'combo';
type View = 'chart' | 'table' | 'breakdown';

function KPI({ label, value, sub, color = 'text-slate-900 dark:text-white' }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-4 flex-1 min-w-0">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-xl font-black truncate ${color}`}>{value}</p>
      {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function Slider({ label, value, min, max, step, onChange, display }: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; display?: string;
}) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{label}</span>
        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{display ?? value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 accent-blue-600 rounded-full"/>
    </div>
  );
}

export const SipCalculator = () => {
  const [mode, setMode] = useState<Mode>('sip');
  const [view, setView] = useState<View>('chart');

  // SIP mode
  const [monthly, setMonthly] = useState(10000);
  const [stepUp, setStepUp] = useState(10); // % annual step-up
  const [years, setYears] = useState(15);
  const [rate, setRate] = useState(12);
  const [lumpsum, setLumpsum] = useState(0);

  // Goal mode
  const [goalCorpus, setGoalCorpus] = useState(10000000);

  // LTCG tax
  const [applyLtcg, setApplyLtcg] = useState(false);

  // ── Calculations ──────────────────────────────────────────────────────────
  const { projData, kpis } = useMemo(() => {
    const monthlyRate = rate / 1200;
    const months = years * 12;
    let corpus = 0;
    let totalInvested = 0;
    let currentMonthly = monthly;
    const projData: { year: string; invested: number; value: number; lumpValue: number }[] = [];

    // Lumpsum FV
    const lumpsumFV = lumpsum * Math.pow(1 + rate / 100, years);

    // Step-up SIP calculation year-by-year
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
        lumpValue: Math.round(lumpsum * Math.pow(1 + rate / 100, y)),
      });
    }

    const finalValue = Math.round(corpus + lumpsumFV);
    const totalInv = totalInvested + lumpsum;
    const gains = finalValue - totalInv;

    // LTCG: 10% on gains > ₹1L (long-term equity)
    const ltcgTax = applyLtcg ? Math.round(Math.max(0, gains - 100000) * 0.10) : 0;
    const postTaxValue = finalValue - ltcgTax;

    // Goal mode: required SIP (no step-up)
    const reqSip = goalCorpus / (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));

    const cagr = Math.round(((Math.pow(finalValue / Math.max(1, totalInv), 1 / years) - 1) * 100) * 10) / 10;

    return {
      projData,
      kpis: {
        invested: totalInv,
        finalValue,
        gains,
        ltcgTax,
        postTaxValue,
        reqSip: Math.round(reqSip),
        cagr,
        xirr: rate, // simplification
      },
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

  const MODES: { id: Mode; label: string }[] = [
    { id: 'sip', label: 'SIP Planner' },
    { id: 'combo', label: 'SIP + Lumpsum' },
    { id: 'goal', label: 'Goal Planner' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 dark:bg-[#0B1120] overflow-hidden">
      {/* ── TOOLBAR ──────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex flex-wrap items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg"><TrendingUp size={18} className="text-emerald-600"/></div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">SIP Calculator Pro</h2>
            <p className="text-[11px] text-slate-400">Step-up SIP · Goal Planner · LTCG Tax</p>
          </div>
        </div>
        {/* Mode toggle */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 ml-2">
          {MODES.map(m => (
            <button key={m.id} onClick={() => setMode(m.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${mode === m.id ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}>
              {m.label}
            </button>
          ))}
        </div>
        <div className="flex-1"/>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer select-none">
          <input type="checkbox" checked={applyLtcg} onChange={e => setApplyLtcg(e.target.checked)} className="accent-emerald-600"/>
          LTCG Tax (10%)
        </label>
        <button onClick={exportCsv} className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold transition-colors">
          <Download size={12}/> Export CSV
        </button>
      </div>

      {/* ── KPI ROW ───────────────────────────────────────────────────────────── */}
      <div className="flex gap-3 px-6 py-3 flex-shrink-0 flex-wrap">
        <KPI label="Total Invested" value={fmtCr(kpis.invested)} sub={`Over ${years} years`}/>
        <KPI label="Projected Corpus" value={fmtCr(kpis.finalValue)} color="text-emerald-600"/>
        <KPI label="Total Gains" value={fmtCr(kpis.gains)} color="text-emerald-600" sub={`CAGR ~${kpis.cagr}%`}/>
        {applyLtcg && <KPI label="LTCG Tax" value={fmtCr(kpis.ltcgTax)} color="text-rose-500" sub="10% on gains > ₹1L"/>}
        {applyLtcg && <KPI label="Post-Tax Value" value={fmtCr(kpis.postTaxValue)} color="text-blue-600"/>}
        {mode === 'goal' && <KPI label="Required Monthly SIP" value={fmt(kpis.reqSip)} color="text-violet-600" sub={`For ₹${(goalCorpus/1e7).toFixed(1)} Cr goal`}/>}
      </div>

      {/* ── BODY ─────────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: Controls */}
        <div className="w-72 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto p-5 space-y-5">

          {mode === 'goal' ? (
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5"><Target size={10}/> Goal Settings</p>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Target Corpus</label>
                <input type="number" value={goalCorpus} onChange={e => setGoalCorpus(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-400"/>
                <p className="text-[10px] text-slate-400 mt-1">{fmtCr(goalCorpus)}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Monthly SIP</p>
              <div>
                <Slider label="Monthly Investment" value={monthly} min={500} max={200000} step={500}
                  onChange={setMonthly} display={fmt(monthly)}/>
              </div>
              <div>
                <Slider label="Annual Step-Up %" value={stepUp} min={0} max={30} step={1}
                  onChange={setStepUp} display={`${stepUp}%`}/>
                {stepUp > 0 && (
                  <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                    <Info size={9}/> Increases by {stepUp}% every year
                  </p>
                )}
              </div>
            </div>
          )}

          {(mode === 'combo') && (
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">One-Time Lumpsum</p>
              <Slider label="Lumpsum Amount" value={lumpsum} min={0} max={5000000} step={10000}
                onChange={setLumpsum} display={fmtCr(lumpsum)}/>
            </div>
          )}

          <div className="space-y-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Parameters</p>
            <Slider label="Expected Return" value={rate} min={1} max={30} step={0.5}
              onChange={setRate} display={`${rate}% p.a.`}/>
            <Slider label="Time Horizon" value={years} min={1} max={40} step={1}
              onChange={setYears} display={`${years} yrs`}/>
          </div>

          {/* Quick presets */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Quick Benchmarks</p>
            <div className="space-y-1">
              {[
                { label: 'Conservative', r: 8, note: 'Debt funds' },
                { label: 'Moderate', r: 12, note: 'Hybrid funds' },
                { label: 'Aggressive', r: 15, note: 'Equity funds' },
              ].map(p => (
                <button key={p.label} onClick={() => setRate(p.r)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex justify-between ${rate === p.r ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 font-semibold' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                  <span>{p.label}</span>
                  <span className="font-mono">{p.r}% — {p.note}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Chart / Table */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* View tabs */}
          <div className="px-5 pt-4 pb-0 flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0">
            {(['chart', 'table', 'breakdown'] as View[]).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-4 py-2 text-xs font-semibold capitalize border-b-2 transition-all -mb-px ${view === v ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                {v}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {view === 'chart' && (
              <div className="h-full min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={projData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="sipVal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="sipInv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" strokeOpacity={0.3}/>
                    <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false}/>
                    <YAxis tickFormatter={v => fmtCr(v)} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={70}/>
                    <Tooltip formatter={(v, name) => [fmtCr(Number(v)), name === 'value' ? 'Corpus' : 'Invested']}
                      contentStyle={{ borderRadius: '10px', background: '#1e293b', border: 'none', fontSize: 12 }}
                      labelStyle={{ color: '#94a3b8' }}/>
                    <Legend formatter={v => v === 'value' ? 'Corpus Value' : 'Amount Invested'}/>
                    <Area type="monotone" dataKey="invested" stroke="#6366f1" strokeWidth={2} fill="url(#sipInv)" strokeDasharray="5 5"/>
                    <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2.5} fill="url(#sipVal)"/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {view === 'breakdown' && (
              <div className="h-full min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projData.filter((_, i) => i % Math.ceil(years / 10) === 0 || i === projData.length - 1)}
                    margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" strokeOpacity={0.3}/>
                    <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false}/>
                    <YAxis tickFormatter={v => fmtCr(v)} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={70}/>
                    <Tooltip formatter={(v, name) => [fmtCr(Number(v)), name === 'invested' ? 'Invested' : 'Gains']}
                      contentStyle={{ borderRadius: '10px', background: '#1e293b', border: 'none', fontSize: 12 }}/>
                    <Legend/>
                    <Bar dataKey="invested" stackId="a" fill="#6366f1" radius={[0,0,4,4]} name="Invested"/>
                    <Bar dataKey="value" stackId="b" fill="#10b981" radius={[4,4,0,0]} name="Corpus Value"/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {view === 'table' && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      {['Year', 'Total Invested', 'Corpus Value', 'Gains', 'Gain %'].map(h => (
                        <th key={h} className="text-left py-2.5 px-3 text-[10px] font-bold text-slate-400 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {projData.map((r, i) => {
                      const gains = r.value - r.invested;
                      const gainPct = r.invested > 0 ? ((gains / r.invested) * 100).toFixed(1) : '0';
                      return (
                        <tr key={i} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="py-2 px-3 font-bold text-slate-700 dark:text-slate-300">{r.year}</td>
                          <td className="py-2 px-3 text-slate-600 dark:text-slate-400 font-mono">{fmtCr(r.invested)}</td>
                          <td className="py-2 px-3 font-bold text-emerald-600 font-mono">{fmtCr(r.value)}</td>
                          <td className="py-2 px-3 text-emerald-500 font-mono">{fmtCr(gains)}</td>
                          <td className="py-2 px-3">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-bold">{gainPct}%</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
