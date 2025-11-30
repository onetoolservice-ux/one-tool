"use client";
import React, { useState, useMemo } from "react";
import { TrendingUp } from "lucide-react";

export default function SmartSIP() {
  const [monthly, setMonthly] = useState(5000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);

  const result = useMemo(() => {
    const i = rate / 100 / 12;
    const n = years * 12;
    const futureValue = monthly * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    const invested = monthly * n;
    return { total: Math.round(futureValue), invested: Math.round(invested), gain: Math.round(futureValue - invested) };
  }, [monthly, rate, years]);

  return (
    <div className="max-w-4xl mx-auto p-6">
       <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-main dark:text-white">SIP Calculator</h1>
        <p className="text-muted">Systematic Investment Plan projection.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-6 shadow-sm">
           <div><label className="font-bold text-sm mb-2 block">Monthly Investment</label><input type="number" value={monthly} onChange={e=>setMonthly(Number(e.target.value))} className="w-full p-3 border rounded-xl bg-slate-50 dark:bg-slate-900"/></div>
           <div><label className="font-bold text-sm mb-2 block">Expected Return (%)</label><input type="number" value={rate} onChange={e=>setRate(Number(e.target.value))} className="w-full p-3 border rounded-xl bg-slate-50 dark:bg-slate-900"/></div>
           <div><label className="font-bold text-sm mb-2 block">Time Period (Years)</label><input type="range" min="1" max="30" value={years} onChange={e=>setYears(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"/><div className="text-right font-bold text-indigo-600 mt-1">{years} Years</div></div>
        </div>

        <div className="bg-indigo-600 text-white p-8 rounded-2xl shadow-lg flex flex-col justify-center">
           <div className="mb-6">
             <div className="text-indigo-200 text-sm font-bold uppercase tracking-wider mb-1">Total Value</div>
             <div className="text-4xl font-black">₹{result.total.toLocaleString()}</div>
           </div>
           <div className="space-y-3 border-t border-indigo-500 pt-4">
             <div className="flex justify-between text-sm font-medium"><span className="text-indigo-200">Invested</span><span>₹{result.invested.toLocaleString()}</span></div>
             <div className="flex justify-between text-sm font-medium"><span className="text-emerald-300">Wealth Gained</span><span className="text-emerald-300">+₹{result.gain.toLocaleString()}</span></div>
           </div>
        </div>
      </div>
    </div>
  );
}
