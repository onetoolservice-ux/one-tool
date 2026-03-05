"use client";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Briefcase, Download, Shield, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';
import { getPFFinanceSummary } from './pf-data-bridge';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, ReferenceLine,
} from 'recharts';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const fmtCr = (n: number) => {
  if (Math.abs(n) >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (Math.abs(n) >= 1e5) return `₹${(n / 1e5).toFixed(1)} L`;
  return fmt(n);
};

type View = 'projection' | 'table' | 'withdrawal';

function ReadinessGauge({ score }: { score: number }) {
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : score >= 40 ? '#f97316' : '#f43f5e';
  const label = score >= 80 ? 'On Track' : score >= 60 ? 'Needs Attention' : score >= 40 ? 'Underfunded' : 'Critical';
  return (
    <div className="flex flex-col items-center">
      <svg width="120" height="70" viewBox="0 0 140 80">
        <path d="M 10 70 A 60 60 0 0 1 130 70" fill="none" stroke="#e2e8f0" strokeWidth="10" strokeLinecap="round" />
        <path d="M 10 70 A 60 60 0 0 1 130 70" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${(score / 100) * 188.5} 188.5`} />
        <g transform={`translate(70,70) rotate(${-90 + (score / 100) * 180})`}>
          <line x1="0" y1="0" x2="0" y2="-50" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
          <circle cx="0" cy="0" r="5" fill="#334155" />
        </g>
        <text x="70" y="75" textAnchor="middle" fontSize="20" fontWeight="900" fill={color}>{score}%</text>
      </svg>
      <span className="text-[10px] font-bold mt-0.5" style={{ color }}>{label}</span>
    </div>
  );
}

const labelCls = 'text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide';
const inputCls =
  'text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 ' +
  'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 outline-none focus:border-blue-400 ' +
  'transition-colors w-full';

export const RetirementPlanner = () => {
  const [view, setView] = useState<View>('projection');

  const [currentAge,      setCurrentAge]      = useState(30);
  const [retireAge,       setRetireAge]       = useState(60);
  const [lifeExpectancy,  setLifeExpectancy]  = useState(85);
  const [currentSavings,  setCurrentSavings]  = useState(0);
  const [monthlySip,      setMonthlySip]      = useState(0);
  const [expectedReturn,  setExpectedReturn]  = useState(12);
  const [inflation,       setInflation]       = useState(6);
  const [monthlyExpense,  setMonthlyExpense]  = useState(0);
  const [withdrawalRate,  setWithdrawalRate]  = useState(4);
  const [npsMonthly,      setNpsMonthly]      = useState(5000);
  const [pensionIncome,   setPensionIncome]   = useState(0);

  // ── PF smart detection ────────────────────────────────────────────────────
  const [pfExpense, setPfExpense] = useState(0);
  const [pfSIP,     setPfSIP]     = useState(0);
  const [pfMonths,  setPfMonths]  = useState(0);

  const hasAutoApplied = useRef(false);

  const loadPF = () => {
    const s = getPFFinanceSummary(3);
    if (s.hasData) {
      setPfExpense(s.avgMonthlyExpense);
      setPfSIP(s.detectedSIPMonthly);
      setPfMonths(s.monthCount);
    }
  };
  useEffect(() => {
    const s = getPFFinanceSummary(3);
    if (s.hasData) {
      setPfExpense(s.avgMonthlyExpense);
      setPfSIP(s.detectedSIPMonthly);
      setPfMonths(s.monthCount);
      // Auto-apply on first mount
      if (!hasAutoApplied.current) {
        hasAutoApplied.current = true;
        if (s.avgMonthlyExpense > 0)  setMonthlyExpense(Math.round(s.avgMonthlyExpense));
        if (s.detectedSIPMonthly > 0) setMonthlySip(Math.round(s.detectedSIPMonthly));
      }
    }
    window.addEventListener('pf-store-updated', loadPF);
    return () => window.removeEventListener('pf-store-updated', loadPF);
  }, []);

  // ── Calculations ──────────────────────────────────────────────────────────
  const { projData, kpis, score } = useMemo(() => {
    const yearsToRetire = Math.max(1, retireAge - currentAge);
    const retirementDuration = lifeExpectancy - retireAge;
    const monthlyRate = expectedReturn / 1200;
    const inflationRate = inflation / 100;
    const npsReturnRate = 0.10;

    let sipCorpus = 0;
    let totalSipInvested = 0;
    for (let m = 0; m < yearsToRetire * 12; m++) {
      sipCorpus = (sipCorpus + monthlySip) * (1 + monthlyRate);
      totalSipInvested += monthlySip;
    }

    let npsCorpus = 0;
    for (let m = 0; m < yearsToRetire * 12; m++) {
      npsCorpus = (npsCorpus + npsMonthly) * (1 + npsReturnRate / 12);
    }
    const npsLumpsum = npsCorpus * 0.6;
    const npsMonthlyPension = (npsCorpus * 0.4 * 0.06) / 12;

    const existingFV = currentSavings * Math.pow(1 + expectedReturn / 100, yearsToRetire);
    const totalCorpus = Math.round(sipCorpus + existingFV + npsLumpsum);

    const futureMonthlyExpense = monthlyExpense * Math.pow(1 + inflationRate, yearsToRetire);
    const futureAnnualExpense = futureMonthlyExpense * 12;
    const monthlyPassiveIncome = pensionIncome + npsMonthlyPension;
    const netAnnualExpense = Math.max(0, futureAnnualExpense - monthlyPassiveIncome * 12);
    const requiredCorpus = Math.round(netAnnualExpense * (100 / withdrawalRate));
    const surplusDeficit = totalCorpus - requiredCorpus;
    const monthlyCorpusIncome = Math.round((totalCorpus * withdrawalRate / 100) / 12);
    const rawScore = totalCorpus > 0 ? Math.min(100, Math.round((totalCorpus / Math.max(1, requiredCorpus)) * 100)) : 0;

    const projData: { age: number; corpus: number; required: number; inflation: number }[] = [];
    for (let y = 0; y <= yearsToRetire; y++) {
      const curAccum = currentSavings * Math.pow(1 + expectedReturn / 100, y);
      let sipAccum = 0;
      for (let m = 0; m < y * 12; m++) sipAccum = (sipAccum + monthlySip) * (1 + monthlyRate);
      let npsA = 0;
      for (let m = 0; m < y * 12; m++) npsA = (npsA + npsMonthly) * (1 + npsReturnRate / 12);
      projData.push({
        age: currentAge + y,
        corpus: Math.round(curAccum + sipAccum + npsA * 0.6),
        required: Math.round(monthlyExpense * Math.pow(1 + inflationRate, y) * 12 * (100 / withdrawalRate)),
        inflation: Math.round(monthlyExpense * Math.pow(1 + inflationRate, y)),
      });
    }

    return {
      projData,
      kpis: {
        yearsToRetire, totalCorpus, requiredCorpus, surplusDeficit,
        existingFV: Math.round(existingFV),
        sipCorpus: Math.round(sipCorpus),
        npsLumpsum: Math.round(npsLumpsum),
        totalSipInvested, monthlyCorpusIncome,
        monthlyPassiveIncome: Math.round(monthlyPassiveIncome),
        futureMonthlyExpense: Math.round(futureMonthlyExpense),
        retirementDuration,
      },
      score: rawScore,
    };
  }, [currentAge, retireAge, lifeExpectancy, currentSavings, monthlySip, expectedReturn, inflation, monthlyExpense, withdrawalRate, npsMonthly, pensionIncome]);

  const exportCsv = () => {
    const rows = [['Age', 'Accumulated Corpus', 'Required Corpus', 'Future Monthly Expense']];
    projData.forEach(r => rows.push([String(r.age), String(r.corpus), String(r.required), String(r.inflation)]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a'); a.href = url; a.download = 'retirement-plan.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const scoreColor = score >= 80 ? 'text-emerald-600 dark:text-emerald-400' : score >= 60 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400';
  const scoreBg = score >= 80 ? 'bg-emerald-50 dark:bg-emerald-900/20' : score >= 60 ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-rose-50 dark:bg-rose-900/20';

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 dark:bg-[#0B1120] overflow-hidden">

      {/* ── CONTROLS BAR ──────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-3 flex-shrink-0 space-y-3">

        {/* Row 1: title + view tabs + export */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Briefcase size={16} className="text-blue-600" />
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-white">Retirement Planner</span>
            <span className="text-[11px] text-slate-400 ml-1 hidden sm:block">NPS · Inflation · 4% Rule · Readiness Score</span>
          </div>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
            {([
              { id: 'projection' as View, label: 'Corpus Growth' },
              { id: 'table'      as View, label: 'Year-by-Year' },
              { id: 'withdrawal' as View, label: 'Withdrawal Plan' },
            ]).map(v => (
              <button key={v.id} onClick={() => setView(v.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  view === v.id
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}>
                {v.label}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          {/* PF smart detection chips */}
          {pfExpense > 0 && (
            <button
              onClick={() => setMonthlyExpense(Math.round(pfExpense))}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors border border-violet-200 dark:border-violet-800"
            >
              <Sparkles size={11} />
              Expense: {fmtCr(pfExpense)}/mo ({pfMonths}mo avg) → Apply
            </button>
          )}
          {pfSIP > 0 && (
            <button
              onClick={() => setMonthlySip(Math.round(pfSIP))}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors border border-emerald-200 dark:border-emerald-800"
            >
              <Sparkles size={11} />
              SIP: {fmtCr(pfSIP)}/mo ({pfMonths}mo avg) → Apply
            </button>
          )}

          <button onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold transition-colors">
            <Download size={12} /> Export CSV
          </button>
        </div>

        {/* Row 2: input grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Current Age</label>
            <input type="number" value={currentAge} min={18} max={64}
              onChange={e => setCurrentAge(Number(e.target.value))} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Retire Age</label>
            <input type="number" value={retireAge} min={currentAge + 1} max={80}
              onChange={e => setRetireAge(Number(e.target.value))} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Life Expectancy</label>
            <input type="number" value={lifeExpectancy} min={retireAge + 1} max={100}
              onChange={e => setLifeExpectancy(Number(e.target.value))} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Current Savings (₹)</label>
            <input type="number" value={currentSavings} min={0}
              onChange={e => setCurrentSavings(Number(e.target.value))} className={inputCls} />
            <span className="text-[10px] text-slate-400">{fmtCr(currentSavings)}</span>
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Monthly SIP (₹)</label>
            <input type="number" value={monthlySip} min={0}
              onChange={e => setMonthlySip(Number(e.target.value))} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Expected Return %</label>
            <input type="number" value={expectedReturn} min={1} max={25} step={0.5}
              onChange={e => setExpectedReturn(Number(e.target.value))} className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Monthly Expense (₹)</label>
            <input type="number" value={monthlyExpense} min={0}
              onChange={e => setMonthlyExpense(Number(e.target.value))} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Inflation %</label>
            <input type="number" value={inflation} min={1} max={15} step={0.5}
              onChange={e => setInflation(Number(e.target.value))} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Withdrawal Rate %</label>
            <input type="number" value={withdrawalRate} min={1} max={10} step={0.5}
              onChange={e => setWithdrawalRate(Number(e.target.value))} className={inputCls} />
            <span className="text-[10px] text-slate-400">{withdrawalRate === 4 ? '4% Rule' : 'Custom'}</span>
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls + ' flex items-center gap-1'}><Shield size={8} /> Monthly NPS (₹)</label>
            <input type="number" value={npsMonthly} min={0}
              onChange={e => setNpsMonthly(Number(e.target.value))} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Other Pension (₹/mo)</label>
            <input type="number" value={pensionIncome} min={0}
              onChange={e => setPensionIncome(Number(e.target.value))} className={inputCls} />
          </div>
        </div>
      </div>

      {/* ── SMART TABLE BAR (KPIs) ─────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-2.5 flex items-center gap-3 flex-shrink-0 flex-wrap">
        {/* Readiness score badge */}
        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${scoreBg} ${scoreColor}`}>
          Readiness {score}%
        </span>

        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          Projected <span className="ml-1 font-bold">{fmtCr(kpis.totalCorpus)}</span>
        </span>
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
          Required <span className="ml-1">{fmtCr(kpis.requiredCorpus)}</span>
        </span>
        <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
          kpis.surplusDeficit >= 0
            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
            : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400'
        }`}>
          {kpis.surplusDeficit >= 0 ? 'Surplus' : 'Gap'} <span className="ml-1 font-bold">{fmtCr(Math.abs(kpis.surplusDeficit))}</span>
        </span>
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-xs font-semibold text-blue-600 dark:text-blue-400">
          Monthly Income <span className="ml-1 font-bold">{fmt(kpis.monthlyCorpusIncome)}</span>
        </span>
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400">
          Future Expense <span className="ml-1">{fmt(kpis.futureMonthlyExpense)}/mo</span>
        </span>
        <span className="text-[10px] text-slate-400 hidden sm:block">
          {kpis.yearsToRetire} yrs to retire · {kpis.retirementDuration} yr retirement
        </span>
      </div>

      {/* ── CONTENT AREA ──────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6">

        {view === 'projection' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
            {/* Gauge + breakdown — narrow column */}
            <div className="flex flex-col gap-4">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col items-center">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Retirement Readiness</p>
                <ReadinessGauge score={score} />
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-3">Corpus Breakdown</p>
                <div className="space-y-2">
                  {[
                    { label: 'Existing Savings FV', value: kpis.existingFV,  color: '#3b82f6' },
                    { label: 'SIP Corpus',           value: kpis.sipCorpus,   color: '#10b981' },
                    { label: 'NPS Lumpsum (60%)',     value: kpis.npsLumpsum,  color: '#8b5cf6' },
                  ].map(row => (
                    <div key={row.label} className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: row.color }} />
                      <span className="text-slate-500 dark:text-slate-400 flex-1">{row.label}</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{fmtCr(row.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chart — takes remaining 3 columns */}
            <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">Corpus Growth vs Required</p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={projData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="retCorpus" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="retReq" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" strokeOpacity={0.3} />
                    <XAxis dataKey="age" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                      label={{ value: 'Age', position: 'insideBottom', offset: -2, fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis tickFormatter={v => fmtCr(v)} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={80} />
                    <Tooltip
                      formatter={(v, name) => [fmtCr(Number(v)), name === 'corpus' ? 'Projected Corpus' : 'Required Corpus']}
                      contentStyle={{ borderRadius: '10px', background: '#1e293b', border: 'none', fontSize: 12 }}
                      labelFormatter={v => `Age ${v}`} />
                    <Legend formatter={v => v === 'corpus' ? 'Projected Corpus' : 'Required Corpus'} />
                    <ReferenceLine x={retireAge} stroke="#6366f1" strokeDasharray="4 2"
                      label={{ value: `Retire ${retireAge}`, position: 'top', fontSize: 10, fill: '#6366f1' }} />
                    <Area type="monotone" dataKey="required" stroke="#f43f5e" strokeWidth={1.5} fill="url(#retReq)" strokeDasharray="5 5" />
                    <Area type="monotone" dataKey="corpus"   stroke="#10b981" strokeWidth={2.5} fill="url(#retCorpus)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {view === 'table' && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  {['Age', 'Accumulated Corpus', 'Required Corpus', 'Gap / Surplus', 'Monthly Expense (Future)'].map(h => (
                    <th key={h} className="text-left py-2.5 px-4 text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projData.map((r, i) => {
                  const gap = r.corpus - r.required;
                  return (
                    <tr key={i} className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                      r.age === retireAge ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                    }`}>
                      <td className="py-2 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        {r.age}
                        {r.age === retireAge && <span className="ml-1.5 text-[10px] text-blue-500 font-bold">RETIRE</span>}
                      </td>
                      <td className="py-2 px-4 font-bold text-emerald-600 dark:text-emerald-400 font-mono">{fmtCr(r.corpus)}</td>
                      <td className="py-2 px-4 text-slate-600 dark:text-slate-400 font-mono">{fmtCr(r.required)}</td>
                      <td className="py-2 px-4">
                        <span className={`font-bold font-mono ${gap >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                          {gap >= 0 ? '+' : ''}{fmtCr(gap)}
                        </span>
                      </td>
                      <td className="py-2 px-4 text-slate-500 dark:text-slate-400 font-mono">{fmt(r.inflation)}/mo</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {view === 'withdrawal' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 max-w-4xl">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">Monthly Income at Retirement</p>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">From Corpus ({withdrawalRate}%)</span>
                  <span className="font-bold text-blue-600">{fmt(kpis.monthlyCorpusIncome)}</span>
                </div>
                {kpis.monthlyPassiveIncome > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">NPS / Pension</span>
                    <span className="font-bold text-violet-600">{fmt(kpis.monthlyPassiveIncome)}</span>
                  </div>
                )}
                <div className="h-px bg-slate-200 dark:bg-slate-700" />
                <div className="flex justify-between">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Total Income</span>
                  <span className={`text-base font-black ${
                    (kpis.monthlyCorpusIncome + kpis.monthlyPassiveIncome) >= kpis.futureMonthlyExpense
                      ? 'text-emerald-600' : 'text-rose-500'
                  }`}>{fmt(kpis.monthlyCorpusIncome + kpis.monthlyPassiveIncome)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Expense Needed</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{fmt(kpis.futureMonthlyExpense)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">Withdrawal Strategy</p>
              <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                <p>Retirement duration: <strong className="text-slate-700 dark:text-slate-200">{kpis.retirementDuration} years</strong></p>
                <p>Annual withdrawal: <strong className="text-slate-700 dark:text-slate-200">{fmtCr(kpis.monthlyCorpusIncome * 12)}</strong></p>
                <p>Corpus check:
                  <strong className={`ml-1 ${kpis.surplusDeficit >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {kpis.surplusDeficit >= 0 ? 'Sustains retirement' : 'May exhaust before life expectancy'}
                  </strong>
                </p>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs">
                <p className="font-bold text-slate-600 dark:text-slate-300 mb-1">4% Rule</p>
                <p className="text-slate-400">Withdraw max 4% of corpus annually, adjusted for inflation. Historically sustains 30+ year retirements.</p>
              </div>
            </div>

            <div className="lg:col-span-2 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-1.5">
                {score >= 80 ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                Retirement Recommendations
              </p>
              <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1 list-disc list-inside">
                {score < 60 && <li>Increase monthly SIP to bridge the corpus gap of {fmtCr(Math.abs(kpis.surplusDeficit))}.</li>}
                {kpis.monthlyPassiveIncome === 0 && <li>Consider opening NPS account for tax benefits (80CCD) and annuity income.</li>}
                {inflation > 6 && <li>High inflation assumption. Consider investing in equity for inflation-beating returns.</li>}
                {score >= 80 && <li>Great progress! You are on track for a comfortable retirement at age {retireAge}.</li>}
                <li>Review and rebalance portfolio annually. Shift to debt funds 5 years before retirement.</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
