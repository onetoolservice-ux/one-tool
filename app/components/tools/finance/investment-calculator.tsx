"use client";
import React, { useState, useEffect } from 'react';
import { TrendingUp, Calculator, PieChart as PieIcon, Briefcase, Landmark, DollarSign, Percent, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

export const InvestmentCalculator = ({ mode }: { mode: 'sip' | 'loan' | 'net-worth' | 'retirement' }) => {
  // STATE
  const [p, setP] = useState(mode === 'loan' ? 500000 : 5000);
  const [r, setR] = useState(mode === 'loan' ? 9 : 12);
  const [t, setT] = useState(mode === 'loan' ? 20 : 10);
  const [mounted, setMounted] = useState(false);
  
  // Net Worth State
  const [assets, setAssets] = useState(1500000);
  const [liabilities, setLiabilities] = useState(400000);

  useEffect(() => setMounted(true), []);

  // CALCULATIONS & CHART DATA GENERATION
  const generateChartData = () => {
    const data = [];
    for (let i = 0; i <= t; i++) {
      if (mode === 'sip') {
        const invested = p * 12 * i;
        const rate = r / 100;
        // FV = P × ({[1 + i]^n - 1} / i) × (1 + i)
        const value = i === 0 ? 0 : Math.round(p * ((Math.pow(1 + rate/12, i*12) - 1) / (rate/12)) * (1 + rate/12));
        data.push({ year: `Year ${i}`, Invested: invested, Value: value });
      } else if (mode === 'loan') {
        // Simple declining balance simulation for visual
        const totalPay = (p * r * Math.pow(1 + r/1200, t*12)) / (1200 * (Math.pow(1 + r/1200, t*12) - 1)) * 12 * t;
        const interest = totalPay - p;
        const yearInt = interest / t; 
        const yearPrin = p / t;
        const balance = p - (p/t)*i;
        data.push({ year: `Year ${i}`, Balance: Math.max(0, Math.round(balance)), Interest: Math.round(yearInt * i) });
      }
    }
    return data;
  };

  const calculate = () => {
    if (mode === 'net-worth') return assets - liabilities;
    if (mode === 'loan') {
      const emi = (p * r * Math.pow(1 + r/1200, t*12)) / (1200 * (Math.pow(1 + r/1200, t*12) - 1));
      return Math.round(emi || 0);
    }
    // SIP / Retirement
    const i = r / 1200;
    const n = t * 12;
    return Math.round(p * ((Math.pow(1 + i, n) - 1) / i) * (1 + i));
  };

  const finalValue = calculate();
  const chartData = generateChartData();

  const config = {
    'sip': { title: 'Smart SIP', icon: TrendingUp, labelP: 'Monthly Investment', labelR: 'Expected Return', labelT: 'Time Period', color: '#10b981' },
    'loan': { title: 'Smart Loan', icon: Calculator, labelP: 'Loan Amount', labelR: 'Interest Rate', labelT: 'Loan Tenure', color: '#f43f5e' },
    'retirement': { title: 'Smart Retirement', icon: Briefcase, labelP: 'Monthly Savings', labelR: 'Expected Growth', labelT: 'Years to Retire', color: '#8b5cf6' },
    'net-worth': { title: 'Smart Net Worth', icon: Landmark, color: '#3b82f6' }
  }[mode];

  const Icon = config.icon;

  if (mode === 'net-worth') {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-slate-900 border rounded-3xl shadow-sm mt-8">
         <h2 className="text-2xl font-bold mb-8 flex items-center gap-2"><Landmark className="text-blue-500"/> {config.title}</h2>
         <div className="space-y-6">
            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
               <label className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase">Total Assets</label>
               <input type="number" value={assets} onChange={e=>setAssets(+e.target.value)} className="w-full bg-transparent text-4xl font-black text-blue-900 dark:text-white outline-none mt-2"/>
               <p className="text-xs text-blue-600/60 mt-1">Cash, Investments, Property</p>
            </div>
            <div className="p-6 bg-rose-50 dark:bg-rose-900/20 rounded-2xl border border-rose-100 dark:border-rose-800">
               <label className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase">Total Liabilities</label>
               <input type="number" value={liabilities} onChange={e=>setLiabilities(+e.target.value)} className="w-full bg-transparent text-4xl font-black text-rose-900 dark:text-white outline-none mt-2"/>
               <p className="text-xs text-rose-600/60 mt-1">Loans, Credit Card Debt, Mortgages</p>
            </div>
            <div className="border-t pt-8 text-center">
               <p className="text-xs font-bold text-slate-400 uppercase mb-2">Your Net Worth</p>
               <h1 className="text-6xl font-black text-slate-900 dark:text-white">₹ {(assets - liabilities).toLocaleString('en-IN')}</h1>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-64px)] w-full overflow-hidden bg-slate-50 dark:bg-[#0B1120]">
       
       {/* LEFT: CONTROLS */}
       <div className="w-[400px] flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 shadow-xl flex-shrink-0">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
             <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
               <Icon className="text-teal-600"/> {config.title}
             </h2>
          </div>
          
          <div className="flex-1 p-6 space-y-8 overflow-y-auto custom-scrollbar">
             {/* Principal */}
             <div className="space-y-3">
                <div className="flex justify-between items-center">
                   <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><DollarSign size={12}/> {config.labelP}</label>
                   <input type="number" value={p} onChange={e=>setP(+e.target.value)} className="w-24 text-right text-sm font-bold bg-slate-100 dark:bg-slate-800 rounded p-1 outline-none"/>
                </div>
                <input type="range" min={mode==='loan'?10000:500} max={mode==='loan'?10000000:100000} step={500} value={p} onChange={e=>setP(+e.target.value)} className="w-full accent-teal-600"/>
             </div>

             {/* Rate */}
             <div className="space-y-3">
                <div className="flex justify-between items-center">
                   <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Percent size={12}/> {config.labelR}</label>
                   <span className="text-sm font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{r} %</span>
                </div>
                <input type="range" min="1" max="30" step="0.1" value={r} onChange={e=>setR(+e.target.value)} className="w-full accent-teal-600"/>
             </div>

             {/* Time */}
             <div className="space-y-3">
                <div className="flex justify-between items-center">
                   <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Calendar size={12}/> {config.labelT}</label>
                   <span className="text-sm font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{t} Years</span>
                </div>
                <input type="range" min="1" max="40" value={t} onChange={e=>setT(+e.target.value)} className="w-full accent-teal-600"/>
             </div>

             {/* Result Card */}
             <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-lg mt-8 text-center">
                <p className="text-xs font-bold uppercase opacity-60 mb-1">{mode === 'loan' ? 'Monthly EMI' : 'Future Value'}</p>
                <h1 className="text-4xl font-black">₹ {finalValue.toLocaleString('en-IN')}</h1>
                {mode !== 'loan' && (
                  <div className="mt-4 pt-4 border-t border-slate-700 grid grid-cols-2 text-xs">
                     <div><p className="opacity-60">Invested</p><p className="font-bold">₹ {(p * 12 * t).toLocaleString('en-IN')}</p></div>
                     <div><p className="opacity-60">Wealth Gained</p><p className="font-bold text-emerald-400">+ ₹ {(finalValue - (p * 12 * t)).toLocaleString('en-IN')}</p></div>
                  </div>
                )}
             </div>
          </div>
       </div>

       {/* RIGHT: CHARTS */}
       <div className="flex-1 bg-slate-50 dark:bg-black/20 p-8 flex flex-col justify-center items-center overflow-hidden">
          <div className="w-full h-[500px] bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative">
             <h3 className="absolute top-6 left-6 text-xs font-bold text-slate-400 uppercase">Growth Projection</h3>
             {mounted ? (
               <ResponsiveContainer width="100%" height="100%">
                  {mode === 'loan' ? (
                     <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="year" hide />
                        <YAxis hide />
                        <RechartsTooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)'}} />
                        <Legend />
                        <Bar dataKey="Balance" fill={config.color} radius={[4, 4, 0, 0]} />
                     </BarChart>
                  ) : (
                     <AreaChart data={chartData}>
                        <defs>
                           <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={config.color} stopOpacity={0.3}/>
                              <stop offset="95%" stopColor={config.color} stopOpacity={0}/>
                           </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="year" tick={{fontSize: 10}} minTickGap={30} axisLine={false} tickLine={false}/>
                        <YAxis tickFormatter={(val) => `₹${val/100000}L`} tick={{fontSize: 10}} axisLine={false} tickLine={false}/>
                        <RechartsTooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)'}} formatter={(v: number) => `₹ ${v.toLocaleString()}`} />
                        <Area type="monotone" dataKey="Value" stroke={config.color} strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                        <Area type="monotone" dataKey="Invested" stroke="#94a3b8" strokeWidth={2} fillOpacity={0} strokeDasharray="5 5" />
                     </AreaChart>
                  )}
               </ResponsiveContainer>
             ) : (
               <div className="h-full flex items-center justify-center text-slate-400 animate-pulse">Loading Charts...</div>
             )}
          </div>
       </div>
    </div>
  );
};