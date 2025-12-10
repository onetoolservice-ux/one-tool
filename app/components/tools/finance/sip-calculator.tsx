"use client";
import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Percent, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const SipCalculator = () => {
  const [p, setP] = useState(5000);
  const [r, setR] = useState(12);
  const [t, setT] = useState(10);
  const [inflation, setInflation] = useState(false);
  const [data, setData] = useState<any[]>([]);

  const invested = p * 12 * t;
  const wealth = Math.round(p * ((Math.pow(1 + r/1200, t*12) - 1) / (r/1200)) * (1 + r/1200));
  const profit = wealth - invested;

  useEffect(() => {
    const chart = [];
    let currentVal = 0;
    let totalInv = 0;
    const monthlyRate = r / 1200;

    for (let i = 1; i <= t; i++) {
       // Compound for 12 months
       for(let m=0; m<12; m++) {
          currentVal = (currentVal + p) * (1 + monthlyRate);
          totalInv += p;
       }
       chart.push({
          year: `Yr ${i}`,
          Invested: totalInv,
          Value: Math.round(currentVal)
       });
    }
    setData(chart);
  }, [p, r, t]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-80px)] overflow-hidden p-4 bg-slate-50 dark:bg-[#0B1120]">
       
       {/* LEFT: INPUTS */}
       <div className="w-full lg:w-[400px] bg-white dark:bg-slate-900 border-r p-6 shadow-xl z-10">
          <h2 className="text-xl font-bold mb-8 flex items-center gap-2 text-emerald-600"><TrendingUp/> Smart SIP</h2>
          
          <div className="space-y-8">
             <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Monthly Investment</label>
                <input type="range" min="500" max="100000" step="500" value={p} onChange={e=>setP(+e.target.value)} className="w-full accent-emerald-500 mb-2"/>
                <input type="number" value={p} onChange={e=>setP(+e.target.value)} className="w-full p-2 border rounded-lg font-bold bg-slate-50"/>
             </div>

             <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Expected Return (%)</label>
                <input type="range" min="1" max="30" step="0.5" value={r} onChange={e=>setR(+e.target.value)} className="w-full accent-emerald-500 mb-2"/>
                <input type="number" value={r} onChange={e=>setR(+e.target.value)} className="w-full p-2 border rounded-lg font-bold bg-slate-50"/>
             </div>

             <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Time Period (Years)</label>
                <input type="range" min="1" max="40" value={t} onChange={e=>setT(+e.target.value)} className="w-full accent-emerald-500 mb-2"/>
                <input type="number" value={t} onChange={e=>setT(+e.target.value)} className="w-full p-2 border rounded-lg font-bold bg-slate-50"/>
             </div>
          </div>
       </div>

       {/* RIGHT: WEALTH CHART */}
       <div className="flex-1 p-8 flex flex-col">
          <div className="grid grid-cols-3 gap-4 mb-8">
             <div className="bg-white p-6 rounded-2xl border shadow-sm">
                <p className="text-xs uppercase font-bold text-slate-400">Invested</p>
                <h3 className="text-2xl font-black text-slate-900">₹ {invested.toLocaleString()}</h3>
             </div>
             <div className="bg-white p-6 rounded-2xl border shadow-sm">
                <p className="text-xs uppercase font-bold text-emerald-500">Total Profit</p>
                <h3 className="text-2xl font-black text-emerald-600">+ ₹ {profit.toLocaleString()}</h3>
             </div>
             <div className="bg-emerald-600 p-6 rounded-2xl border shadow-lg text-white">
                <p className="text-xs uppercase font-bold text-emerald-200">Future Value</p>
                <h3 className="text-3xl font-black">₹ {wealth.toLocaleString()}</h3>
             </div>
          </div>

          <div className="flex-1 bg-white p-6 rounded-3xl border shadow-sm relative">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                   <defs>
                      <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                         <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                   <XAxis dataKey="year" tick={{fontSize: 10}} axisLine={false} tickLine={false}/>
                   <YAxis hide/>
                   <Tooltip formatter={(v) => `₹ ${Number(v).toLocaleString()}`} contentStyle={{borderRadius:'10px', border:'none', boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}}/>
                   <Area type="monotone" dataKey="Value" stroke="#10b981" strokeWidth={3} fill="url(#colorVal)" />
                   <Area type="monotone" dataKey="Invested" stroke="#94a3b8" strokeWidth={2} fillOpacity={0} strokeDasharray="5 5" />
                </AreaChart>
             </ResponsiveContainer>
          </div>
       </div>
    </div>
  );
};