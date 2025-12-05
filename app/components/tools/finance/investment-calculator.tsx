"use client";
import React, { useState } from 'react';
import { TrendingUp, Calculator, DollarSign, Briefcase, Landmark } from 'lucide-react';

export const InvestmentCalculator = ({ mode }: { mode: 'sip' | 'loan' | 'net-worth' | 'retirement' }) => {
  const [p, setP] = useState(mode === 'loan' ? 500000 : 5000);
  const [r, setR] = useState(mode === 'loan' ? 8.5 : 12);
  const [t, setT] = useState(mode === 'loan' ? 20 : 10);
  
  // For Net Worth
  const [assets, setAssets] = useState(1000000);
  const [liabilities, setLiabilities] = useState(200000);

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

  const config = {
    'sip': { title: 'Smart SIP', icon: TrendingUp, labelP: 'Monthly Investment', labelR: 'Expected Return', labelT: 'Time Period' },
    'loan': { title: 'Smart Loan', icon: Calculator, labelP: 'Loan Amount', labelR: 'Interest Rate', labelT: 'Loan Tenure' },
    'retirement': { title: 'Smart Retirement', icon: Briefcase, labelP: 'Monthly Savings', labelR: 'Expected Growth', labelT: 'Years to Retire' },
    'net-worth': { title: 'Smart Net Worth', icon: Landmark }
  }[mode];

  const Icon = config.icon;

  if (mode === 'net-worth') {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-slate-900 border rounded-3xl shadow-sm">
         <h2 className="text-2xl font-bold mb-8 flex items-center gap-2"><Icon className="text-teal-600"/> {config.title}</h2>
         <div className="space-y-6">
            <div className="p-6 bg-emerald-50 rounded-2xl">
               <label className="text-xs font-bold text-emerald-700 uppercase">Total Assets (Cash, Property, Gold)</label>
               <input type="number" value={assets} onChange={e=>setAssets(+e.target.value)} className="w-full bg-transparent text-3xl font-black text-emerald-800 outline-none mt-2"/>
            </div>
            <div className="p-6 bg-rose-50 rounded-2xl">
               <label className="text-xs font-bold text-rose-700 uppercase">Total Liabilities (Loans, Debt)</label>
               <input type="number" value={liabilities} onChange={e=>setLiabilities(+e.target.value)} className="w-full bg-transparent text-3xl font-black text-rose-800 outline-none mt-2"/>
            </div>
            <div className="border-t pt-8 text-center">
               <p className="text-xs font-bold text-slate-400 uppercase mb-2">Your Net Worth</p>
               <h1 className="text-5xl font-black text-slate-900 dark:text-white">₹ {(assets - liabilities).toLocaleString()}</h1>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col md:flex-row gap-8">
       <div className="flex-1 bg-white dark:bg-slate-900 p-8 rounded-3xl border shadow-sm">
          <h2 className="text-xl font-bold mb-8 flex items-center gap-2"><Icon className="text-indigo-600"/> {config.title}</h2>
          <div className="space-y-8">
             <div>
                <label className="flex justify-between text-xs font-bold text-slate-500 uppercase mb-2"><span>{config.labelP}</span><span>{p.toLocaleString()}</span></label>
                <input type="range" min="500" max="10000000" step="500" value={p} onChange={e=>setP(+e.target.value)} className="w-full accent-indigo-600"/>
             </div>
             <div>
                <label className="flex justify-between text-xs font-bold text-slate-500 uppercase mb-2"><span>{config.labelR} (%)</span><span>{r}%</span></label>
                <input type="range" min="1" max="30" step="0.1" value={r} onChange={e=>setR(+e.target.value)} className="w-full accent-indigo-600"/>
             </div>
             <div>
                <label className="flex justify-between text-xs font-bold text-slate-500 uppercase mb-2"><span>{config.labelT} (Years)</span><span>{t} Yr</span></label>
                <input type="range" min="1" max="40" value={t} onChange={e=>setT(+e.target.value)} className="w-full accent-indigo-600"/>
             </div>
          </div>
       </div>
       
       <div className="w-full md:w-80 bg-indigo-600 text-white p-8 rounded-3xl flex flex-col justify-center items-center text-center shadow-xl shadow-indigo-500/30">
          <p className="text-indigo-200 font-bold uppercase text-xs mb-2">{mode === 'loan' ? 'Monthly EMI' : 'Future Value'}</p>
          <h1 className="text-4xl font-black mb-6">₹ {calculate().toLocaleString()}</h1>
          {mode !== 'loan' && (
            <div className="text-xs text-indigo-200 space-y-1">
               <p>Invested: ₹ {(p * 12 * t).toLocaleString()}</p>
               <p>Profit: ₹ {(calculate() - (p * 12 * t)).toLocaleString()}</p>
            </div>
          )}
       </div>
    </div>
  );
};
