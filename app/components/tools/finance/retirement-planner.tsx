"use client";
import React, { useState, useMemo } from 'react';
import { Briefcase, Download, TrendingUp, AlertTriangle, CheckCircle, Shield } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, ReferenceLine
} from 'recharts';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const fmtCr = (n: number) => {
  if (Math.abs(n) >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (Math.abs(n) >= 1e5) return `₹${(n / 1e5).toFixed(1)} L`;
  return fmt(n);
};

type View = 'projection' | 'table' | 'withdrawal';

function KPI({ label, value, sub, color = '' }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-4 flex-1 min-w-0">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-xl font-black truncate ${color || 'text-slate-900 dark:text-white'}`}>{value}</p>
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

function ReadinessGauge({ score }: { score: number }) {
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : score >= 40 ? '#f97316' : '#f43f5e';
  const label = score >= 80 ? 'On Track' : score >= 60 ? 'Needs Attention' : score >= 40 ? 'Underfunded' : 'Critical';
  const rotation = -90 + (score / 100) * 180;
  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="80" viewBox="0 0 140 80">
        <path d="M 10 70 A 60 60 0 0 1 130 70" fill="none" stroke="#e2e8f0" strokeWidth="10" strokeLinecap="round"/>
        <path d="M 10 70 A 60 60 0 0 1 130 70" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${(score / 100) * 188.5} 188.5`}/>
        <g transform={`translate(70,70) rotate(${rotation})`}>
          <line x1="0" y1="0" x2="0" y2="-50" stroke="#334155" strokeWidth="3" strokeLinecap="round"/>
          <circle cx="0" cy="0" r="5" fill="#334155"/>
        </g>
        <text x="70" y="75" textAnchor="middle" fontSize="22" fontWeight="900" fill={color}>{score}%</text>
      </svg>
      <span className="text-xs font-bold mt-1" style={{ color }}>{label}</span>
    </div>
  );
}

export const RetirementPlanner = () => {
  const [view, setView] = useState<View>('projection');

  // Inputs
  const [currentAge, setCurrentAge] = useState(30);
  const [retireAge, setRetireAge] = useState(60);
  const [lifeExpectancy, setLifeExpectancy] = useState(85);
  const [currentSavings, setCurrentSavings] = useState(500000);
  const [monthlySip, setMonthlySip] = useState(25000);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [inflation, setInflation] = useState(6);
  const [monthlyExpense, setMonthlyExpense] = useState(50000);
  const [withdrawalRate, setWithdrawalRate] = useState(4); // % per year (4% rule)

  // NPS / pension
  const [npsMonthly, setNpsMonthly] = useState(5000);
  const [pensionIncome, setPensionIncome] = useState(0);

  // ── Calculations ──────────────────────────────────────────────────────────
  const { projData, kpis, score } = useMemo(() => {
    const yearsToRetire = retireAge - currentAge;
    const retirementDuration = lifeExpectancy - retireAge;
    const monthlyRate = expectedReturn / 1200;
    const inflationRate = inflation / 100;
    const npsReturnRate = 0.10; // ~10% NPS return assumption

    // Corpus from SIP
    let sipCorpus = 0;
    let totalSipInvested = 0;
    for (let m = 0; m < yearsToRetire * 12; m++) {
      sipCorpus = (sipCorpus + monthlySip) * (1 + monthlyRate);
      totalSipInvested += monthlySip;
    }

    // NPS corpus
    let npsCorpus = 0;
    for (let m = 0; m < yearsToRetire * 12; m++) {
      npsCorpus = (npsCorpus + npsMonthly) * (1 + npsReturnRate / 12);
    }
    // NPS: 60% lump sum + 40% annuity
    const npsLumpsum = npsCorpus * 0.6;
    const npsAnnualAnnuity = npsCorpus * 0.4 * 0.06; // ~6% annuity rate
    const npsMonthlyPension = npsAnnualAnnuity / 12;

    // Existing savings FV
    const existingFV = currentSavings * Math.pow(1 + expectedReturn / 100, yearsToRetire);

    const totalCorpus = Math.round(sipCorpus + existingFV + npsLumpsum);

    // Required corpus (inflation-adjusted expenses + 4% rule)
    const futureMonthlyExpense = monthlyExpense * Math.pow(1 + inflationRate, yearsToRetire);
    const futureAnnualExpense = futureMonthlyExpense * 12;
    const monthlyPassiveIncome = pensionIncome + npsMonthlyPension;
    const annualPassiveIncome = monthlyPassiveIncome * 12;
    const netAnnualExpense = Math.max(0, futureAnnualExpense - annualPassiveIncome);
    const requiredCorpus = Math.round(netAnnualExpense * (100 / withdrawalRate));

    const surplusDeficit = totalCorpus - requiredCorpus;

    // Monthly income from corpus at withdrawal rate
    const monthlyCorpusIncome = Math.round((totalCorpus * withdrawalRate / 100) / 12);

    // Readiness score
    const rawScore = totalCorpus > 0 ? Math.min(100, Math.round((totalCorpus / Math.max(1, requiredCorpus)) * 100)) : 0;

    // Year-by-year projection data
    const projData: { age: number; corpus: number; required: number; inflation: number }[] = [];
    let runningCorpus = currentSavings;
    let runningSip = monthlySip;
    let runningNps = npsMonthly;
    let npsAccum = 0;

    for (let y = 0; y <= yearsToRetire; y++) {
      const age = currentAge + y;
      const sipFV = runningSip * 12 * Math.pow(1 + expectedReturn / 100, yearsToRetire - y);
      const npsFV = runningNps * 12 * Math.pow(1 + npsReturnRate, yearsToRetire - y);
      const curAccum = currentSavings * Math.pow(1 + expectedReturn / 100, y);
      let sipAccum = 0;
      for (let m = 0; m < y * 12; m++) {
        sipAccum = (sipAccum + monthlySip) * (1 + monthlyRate);
      }
      let npsA = 0;
      for (let m = 0; m < y * 12; m++) {
        npsA = (npsA + npsMonthly) * (1 + npsReturnRate / 12);
      }
      projData.push({
        age,
        corpus: Math.round(curAccum + sipAccum + npsA * 0.6),
        required: Math.round(monthlyExpense * Math.pow(1 + inflationRate, y) * 12 * (100 / withdrawalRate)),
        inflation: Math.round(monthlyExpense * Math.pow(1 + inflationRate, y)),
      });
    }

    return {
      projData,
      kpis: {
        yearsToRetire,
        totalCorpus,
        requiredCorpus,
        surplusDeficit,
        existingFV: Math.round(existingFV),
        sipCorpus: Math.round(sipCorpus),
        npsLumpsum: Math.round(npsLumpsum),
        totalSipInvested,
        monthlyCorpusIncome,
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

  const VIEWS: { id: View; label: string }[] = [
    { id: 'projection', label: 'Corpus Growth' },
    { id: 'table', label: 'Year-by-Year' },
    { id: 'withdrawal', label: 'Withdrawal Plan' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 dark:bg-[#0B1120] overflow-hidden">
      {/* ── TOOLBAR ──────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex flex-wrap items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg"><Briefcase size={18} className="text-blue-600"/></div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Retirement Planner Pro</h2>
            <p className="text-[11px] text-slate-400">NPS · Inflation · 4% Rule · Readiness Score</p>
          </div>
        </div>
        <div className="flex-1"/>
        <button onClick={exportCsv} className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold transition-colors">
          <Download size={12}/> Export CSV
        </button>
      </div>

      {/* ── KPI ROW ──────────────────────────────────────────────────────────── */}
      <div className="flex gap-3 px-6 py-3 flex-shrink-0 flex-wrap">
        <KPI label="Projected Corpus" value={fmtCr(kpis.totalCorpus)} color="text-emerald-600" sub={`At age ${retireAge}`}/>
        <KPI label="Required Corpus" value={fmtCr(kpis.requiredCorpus)} sub={`${withdrawalRate}% withdrawal rule`}/>
        <KPI label="Surplus / Gap" value={fmtCr(kpis.surplusDeficit)}
          color={kpis.surplusDeficit >= 0 ? 'text-emerald-600' : 'text-rose-500'}
          sub={kpis.surplusDeficit >= 0 ? 'You are on track' : 'Increase SIP or returns'}/>
        <KPI label="Monthly Corpus Income" value={fmt(kpis.monthlyCorpusIncome)} color="text-blue-600" sub={`At ${withdrawalRate}% annual withdrawal`}/>
        <KPI label="Future Monthly Expense" value={fmt(kpis.futureMonthlyExpense)} sub={`Inflation-adj (${inflation}%)`}/>
      </div>

      {/* ── BODY ─────────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: Controls */}
        <div className="w-72 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto p-5 space-y-5">

          {/* Readiness gauge */}
          <div className="flex flex-col items-center py-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Retirement Readiness</p>
            <ReadinessGauge score={score}/>
          </div>

          {/* Age settings */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Timeline</p>
            <Slider label="Current Age" value={currentAge} min={18} max={65} step={1} onChange={setCurrentAge} display={`${currentAge} yrs`}/>
            <Slider label="Retirement Age" value={retireAge} min={40} max={80} step={1} onChange={setRetireAge} display={`${retireAge} yrs`}/>
            <Slider label="Life Expectancy" value={lifeExpectancy} min={60} max={100} step={1} onChange={setLifeExpectancy} display={`${lifeExpectancy} yrs`}/>
          </div>

          {/* Investments */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Investment</p>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Current Savings</label>
              <input type="number" value={currentSavings} onChange={e => setCurrentSavings(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-blue-400"/>
              <p className="text-[10px] text-slate-400 mt-0.5">{fmtCr(currentSavings)}</p>
            </div>
            <Slider label="Monthly SIP" value={monthlySip} min={0} max={200000} step={1000} onChange={setMonthlySip} display={fmt(monthlySip)}/>
            <Slider label="Expected Return" value={expectedReturn} min={4} max={20} step={0.5} onChange={setExpectedReturn} display={`${expectedReturn}% p.a.`}/>
          </div>

          {/* NPS / Pension */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5"><Shield size={10}/> NPS / Pension</p>
            <Slider label="Monthly NPS" value={npsMonthly} min={0} max={50000} step={500} onChange={setNpsMonthly} display={fmt(npsMonthly)}/>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Other Pension Income (monthly)</label>
              <input type="number" value={pensionIncome} onChange={e => setPensionIncome(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-blue-400" placeholder="0"/>
            </div>
          </div>

          {/* Lifestyle */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Lifestyle</p>
            <Slider label="Monthly Expense (today)" value={monthlyExpense} min={10000} max={500000} step={5000} onChange={setMonthlyExpense} display={fmt(monthlyExpense)}/>
            <Slider label="Inflation Rate" value={inflation} min={2} max={12} step={0.5} onChange={setInflation} display={`${inflation}% p.a.`}/>
            <Slider label="Withdrawal Rate" value={withdrawalRate} min={1} max={10} step={0.5} onChange={setWithdrawalRate} display={`${withdrawalRate}% (${withdrawalRate === 4 ? '4% Rule' : 'Custom'})`}/>
          </div>

          {/* Corpus breakdown */}
          <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Corpus Breakdown</p>
            {[
              { label: 'Existing Savings FV', value: kpis.existingFV, color: 'bg-blue-500' },
              { label: 'SIP Corpus', value: kpis.sipCorpus, color: 'bg-emerald-500' },
              { label: 'NPS Lumpsum (60%)', value: kpis.npsLumpsum, color: 'bg-violet-500' },
            ].map(row => (
              <div key={row.label} className="flex items-center gap-2 text-xs">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${row.color}`}/>
                <span className="text-slate-500 flex-1">{row.label}</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{fmtCr(row.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Charts */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* View tabs */}
          <div className="px-5 pt-4 pb-0 flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0">
            {VIEWS.map(v => (
              <button key={v.id} onClick={() => setView(v.id)}
                className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all -mb-px ${view === v.id ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                {v.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {view === 'projection' && (
              <div className="h-full min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={projData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="retCorpus" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="retReq" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" strokeOpacity={0.3}/>
                    <XAxis dataKey="age" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                      label={{ value: 'Age', position: 'insideBottom', offset: -2, fontSize: 10, fill: '#94a3b8' }}/>
                    <YAxis tickFormatter={v => fmtCr(v)} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={75}/>
                    <Tooltip formatter={(v, name) => [fmtCr(Number(v)), name === 'corpus' ? 'Projected Corpus' : 'Required Corpus']}
                      contentStyle={{ borderRadius: '10px', background: '#1e293b', border: 'none', fontSize: 12 }}
                      labelFormatter={v => `Age ${v}`}/>
                    <Legend formatter={v => v === 'corpus' ? 'Projected Corpus' : 'Required Corpus'}/>
                    <ReferenceLine x={retireAge} stroke="#6366f1" strokeDasharray="4 2" label={{ value: `Retire ${retireAge}`, position: 'top', fontSize: 10, fill: '#6366f1' }}/>
                    <Area type="monotone" dataKey="required" stroke="#f43f5e" strokeWidth={1.5} fill="url(#retReq)" strokeDasharray="5 5"/>
                    <Area type="monotone" dataKey="corpus" stroke="#10b981" strokeWidth={2.5} fill="url(#retCorpus)"/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {view === 'table' && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      {['Age', 'Accumulated Corpus', 'Required Corpus', 'Gap / Surplus', 'Monthly Expense (Future)'].map(h => (
                        <th key={h} className="text-left py-2.5 px-3 text-[10px] font-bold text-slate-400 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {projData.map((r, i) => {
                      const gap = r.corpus - r.required;
                      return (
                        <tr key={i} className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 ${r.age === retireAge ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}>
                          <td className="py-2 px-3 font-bold text-slate-700 dark:text-slate-300">
                            {r.age} {r.age === retireAge ? <span className="ml-1 text-[10px] text-blue-500 font-bold">RETIRE</span> : ''}
                          </td>
                          <td className="py-2 px-3 font-bold text-emerald-600 font-mono">{fmtCr(r.corpus)}</td>
                          <td className="py-2 px-3 text-slate-600 dark:text-slate-400 font-mono">{fmtCr(r.required)}</td>
                          <td className="py-2 px-3">
                            <span className={`font-bold font-mono ${gap >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                              {gap >= 0 ? '+' : ''}{fmtCr(gap)}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-500 font-mono">{fmt(r.inflation)}/mo</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {view === 'withdrawal' && (
              <div className="space-y-4 max-w-2xl">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Monthly Income at Retirement</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">From Corpus ({withdrawalRate}%)</span>
                        <span className="font-bold text-blue-600">{fmt(kpis.monthlyCorpusIncome)}</span>
                      </div>
                      {kpis.monthlyPassiveIncome > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">NPS/Pension</span>
                          <span className="font-bold text-violet-600">{fmt(kpis.monthlyPassiveIncome)}</span>
                        </div>
                      )}
                      <div className="h-px bg-slate-200 dark:bg-slate-700"/>
                      <div className="flex justify-between text-base font-black">
                        <span className="text-slate-700 dark:text-slate-200">Total Income</span>
                        <span className={`${(kpis.monthlyCorpusIncome + kpis.monthlyPassiveIncome) >= kpis.futureMonthlyExpense ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {fmt(kpis.monthlyCorpusIncome + kpis.monthlyPassiveIncome)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Expense Needed</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{fmt(kpis.futureMonthlyExpense)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Withdrawal Strategy</p>
                    <div className="space-y-2 text-xs text-slate-500">
                      <p>Retirement duration: <strong className="text-slate-700 dark:text-slate-200">{kpis.retirementDuration} years</strong></p>
                      <p>Annual withdrawal: <strong className="text-slate-700 dark:text-slate-200">{fmtCr(kpis.monthlyCorpusIncome * 12)}</strong></p>
                      <p>Corpus depletion check:
                        <strong className={`ml-1 ${kpis.surplusDeficit >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {kpis.surplusDeficit >= 0 ? 'Corpus sustains retirement' : 'May exhaust before life expectancy'}
                        </strong>
                      </p>
                    </div>
                    <div className="mt-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs">
                      <p className="font-bold text-slate-600 dark:text-slate-300 mb-1">4% Rule</p>
                      <p className="text-slate-400">Withdraw max 4% of corpus annually, adjusted for inflation. Historically sustains 30+ year retirements.</p>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-1.5">
                    {score >= 80 ? <CheckCircle size={12}/> : <AlertTriangle size={12}/>}
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
      </div>
    </div>
  );
};
