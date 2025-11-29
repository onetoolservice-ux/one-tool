"use client";
import React, { useState, useMemo } from "react";
import { TrendingUp, DollarSign, Calendar } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Toast from "@/app/shared/Toast";

export default function SmartSIP() {
  const [monthly, setMonthly] = useState(10000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);

  const { invested, gain, total, schedule } = useMemo(() => {
    const months = years * 12;
    const r = rate / 12 / 100;
    const total = monthly * ((Math.pow(1+r, months) - 1)/r) * (1+r);
    const invested = monthly * months;
    
    const schedule = [];
    let bal = 0;
    for(let i=1; i<=years; i++) {
        bal = monthly * ((Math.pow(1+r, i*12) - 1)/r) * (1+r);
        schedule.push({ year: i, value: Math.round(bal), invested: monthly*i*12 });
    }

    return { invested, gain: total - invested, total, schedule };
  }, [monthly, rate, years]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background dark:bg-[#0f172a] dark:bg-[#020617]/30 overflow-hidden font-sans">
      <Toast />
      <div className="bg-surface dark:bg-slate-800 dark:bg-surface/80 backdrop-blur-md backdrop-blur-md border-b px-6 py-3 flex items-center gap-3 shadow-lg shadow-slate-200/50 dark:shadow-none shrink-0 sticky top-0 z-50">
        <div className="p-2 rounded-lg bg-violet-600 text-white  "><TrendingUp size={22} /></div>
        <div><h1 className="text-lg font-extrabold text-main dark:text-slate-100 dark:text-slate-200">Smart SIP</h1><p className="text-xs text-muted dark:text-muted dark:text-muted dark:text-muted font-bold uppercase">Wealth Builder</p></div>
      </div>

      <div className="grid grid-cols-3 divide-x bg-surface dark:bg-slate-800 dark:bg-surface/80 backdrop-blur-md backdrop-blur-md border-b sticky top-[60px] z-40">
        <div className="p-4 pl-6"><div className="text-xs font-bold uppercase tracking-wide text-muted dark:text-muted dark:text-muted dark:text-muted mb-1">Total Invested</div><div className="text-xl font-bold text-main dark:text-slate-300">₹{invested.toLocaleString('en-IN', {maximumFractionDigits:0})}</div></div>
        <div className="p-4"><div className="text-xs font-bold uppercase tracking-wide text-muted dark:text-muted dark:text-muted dark:text-muted mb-1">Wealth Gained</div><div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">₹{gain.toLocaleString('en-IN', {maximumFractionDigits:0})}</div></div>
        <div className="p-4"><div className="text-xs font-bold uppercase tracking-wide text-muted dark:text-muted dark:text-muted dark:text-muted mb-1">Future Value</div><div className="text-xl font-bold text-violet-700">₹{total.toLocaleString('en-IN', {maximumFractionDigits:0})}</div></div>
      </div>

      <div className="flex-1 overflow-auto bg-surface dark:bg-slate-800 dark:bg-surface p-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6 bg-background dark:bg-[#0f172a] dark:bg-[#020617] p-6 rounded-xl border h-fit">
            <h3 className="font-bold text-main dark:text-slate-100 dark:text-slate-200">Investment Plan</h3>
            <div><label className="text-xs font-bold uppercase tracking-wide text-muted dark:text-muted dark:text-muted dark:text-muted">Monthly Investment</label><input type="number" className="w-full border p-2 rounded mt-1" value={monthly} onChange={e=>setMonthly(Number(e.target.value))}/></div>
            <div><label className="text-xs font-bold uppercase tracking-wide text-muted dark:text-muted dark:text-muted dark:text-muted">Expected Return (%)</label><input type="number" className="w-full border p-2 rounded mt-1" value={rate} onChange={e=>setRate(Number(e.target.value))}/></div>
            <div><label className="text-xs font-bold uppercase tracking-wide text-muted dark:text-muted dark:text-muted dark:text-muted">Time Period (Years)</label><input type="number" className="w-full border p-2 rounded mt-1" value={years} onChange={e=>setYears(Number(e.target.value))}/></div>
        </div>

        <div className="lg:col-span-3 h-[400px]">
            <h3 className="font-bold text-main dark:text-slate-100 dark:text-slate-200 mb-4">Wealth Growth Curve</h3>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={schedule}>
                    <XAxis dataKey="year" label={{ value: 'Years', position: 'insideBottom', offset: -5 }} />
                    <YAxis tickFormatter={(val)=>`${(val/100000).toFixed(0)}L`} />
                    <Tooltip formatter={(val:number)=>`₹${val.toLocaleString()}`} />
                    <Area type="monotone" dataKey="value" stroke="#7c3aed" fill="#ddd6fe" strokeWidth={2} name="Total Value" />
                    <Area type="monotone" dataKey="invested" stroke="#94a3b8" fill="#f1f5f9" strokeWidth={2} name="Invested" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
