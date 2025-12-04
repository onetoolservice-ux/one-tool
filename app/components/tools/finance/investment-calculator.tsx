"use client";
import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Calendar, Percent, Target } from 'lucide-react';

export const InvestmentCalculator = ({ mode = 'sip' }: { mode?: 'sip' | 'lumpsum' }) => {
  const [monthly, setMonthly] = useState(5000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);

  const result = useMemo(() => {
    const months = years * 12;
    const r = rate / 100 / 12;
    const data = [];
    let totalInvested = 0;
    let currentValue = 0;

    for (let i = 0; i <= months; i++) {
      if (i > 0) {
        if (mode === 'sip') {
           currentValue = (currentValue + monthly) * (1 + r);
           totalInvested += monthly;
        } else {
           // Lumpsum logic (monthly just acts as initial)
           if (i===1) { currentValue = monthly; totalInvested = monthly; }
           currentValue = currentValue * (1 + r);
        }
      }
      
      if (i % 12 === 0) { // Only push yearly points for cleaner chart
        data.push({
          year: `Year ${i/12}`,
          Invested: Math.round(totalInvested),
          Value: Math.round(currentValue)
        });
      }
    }

    return { 
      invested: Math.round(totalInvested), 
      value: Math.round(currentValue), 
      profit: Math.round(currentValue - totalInvested),
      data 
    };
  }, [monthly, rate, years, mode]);

  const formatINR = (val: number) => val.toLocaleString('en-IN', { maximumFractionDigits: 0, style: 'currency', currency: 'INR' });

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-80px)] p-4">
       {/* LEFT: INPUTS */}
       <div className="w-full lg:w-1/3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-8">
          <div>
             <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">{mode === 'sip' ? 'Monthly Investment' : 'Initial Investment'}</label>
             <div className="relative">
                <input type="number" value={monthly} onChange={e => setMonthly(Number(e.target.value))} className="w-full text-3xl font-black bg-transparent outline-none text-indigo-600" />
             </div>
             <input type="range" min="500" max="100000" step="500" value={monthly} onChange={e => setMonthly(Number(e.target.value))} className="w-full h-2 bg-slate-100 rounded-full accent-indigo-600 mt-4" />
          </div>

          <div>
             <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Expected Return (Annual %)</label>
             <div className="relative">
                <input type="number" value={rate} onChange={e => setRate(Number(e.target.value))} className="w-full text-3xl font-black bg-transparent outline-none text-[#4a6b61]" />
             </div>
             <input type="range" min="1" max="30" step="0.5" value={rate} onChange={e => setRate(Number(e.target.value))} className="w-full h-2 bg-slate-100 rounded-full accent-emerald-600 mt-4" />
          </div>

          <div>
             <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Time Period (Years)</label>
             <div className="relative">
                <input type="number" value={years} onChange={e => setYears(Number(e.target.value))} className="w-full text-3xl font-black bg-transparent outline-none text-slate-800 dark:text-white" />
             </div>
             <input type="range" min="1" max="40" step="1" value={years} onChange={e => setYears(Number(e.target.value))} className="w-full h-2 bg-slate-100 rounded-full accent-slate-800 mt-4" />
          </div>
       </div>

       {/* RIGHT: RESULTS */}
       <div className="flex-1 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 flex flex-col">
          <div className="grid grid-cols-3 gap-4 mb-8">
             <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Invested</p>
                <p className="text-xl font-bold text-slate-700 dark:text-slate-300">{formatINR(result.invested)}</p>
             </div>
             <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Wealth Gained</p>
                <p className="text-xl font-bold text-[#638c80]">+{formatINR(result.profit)}</p>
             </div>
             <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Total Value</p>
                <p className="text-2xl font-black text-indigo-600">{formatINR(result.value)}</p>
             </div>
          </div>

          <div className="flex-1 w-full min-h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={result.data}>
                   <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                         <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                   <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                   <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} tickFormatter={(val) => `₹${val/1000}k`} />
                   <Tooltip formatter={(val:number) => formatINR(val)} />
                   <Area type="monotone" dataKey="Value" stroke="#4f46e5" strokeWidth={3} fill="url(#colorValue)" />
                   <Area type="monotone" dataKey="Invested" stroke="#94a3b8" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
                </AreaChart>
             </ResponsiveContainer>
          </div>
       </div>
    </div>
  );
};
